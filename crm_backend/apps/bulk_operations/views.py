import csv
import io
from django.http import HttpResponse
from django.db import transaction
from rest_framework import views, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from django_filters.rest_framework import DjangoFilterBackend
from apps.core.permissions import HasModulePermission
from apps.core.services import BulkImportService
from .models import ImportHistory
from rest_framework import serializers


class ImportHistorySerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source="created_by.email", read_only=True)
    
    class Meta:
        model = ImportHistory
        fields = "__all__"


class ImportHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportHistory.objects.all()
    serializer_class = ImportHistorySerializer
    permission_classes = [HasModulePermission]
    module_slug = "bulk_operations"
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["module", "status"]
    ordering_fields = ["created_at", "status"]
    ordering = ["-created_at"]


def get_module_config(module):
    """Return field configuration for a given module slug."""
    configs = {
        "customers": {
            "model_path": "apps.customers.models",
            "model_name": "Customer",
            "fields": ["name", "email", "phone", "company_name", "billing_address",
                       "shipping_address", "billing_city", "shipping_city",
                       "billing_country", "shipping_country", "gstin", "pan", "is_active"],
            "required_fields": ["name", "email"],
        },
        "vendors": {
            "model_path": "apps.vendors.models",
            "model_name": "Vendor",
            "fields": ["name", "email", "phone", "company_name", "address",
                       "city", "country", "gstin", "pan", "bank_name", "bank_account", "is_active"],
            "required_fields": ["name", "email"],
        },
        "products": {
            "model_path": "apps.invoices.models",
            "model_name": "Product",
            "fields": ["name", "description", "sku", "unit", "unit_price", "tax_percent", "is_active"],
            "required_fields": ["name", "unit_price"],
        },
    }
    return configs.get(module)


class BulkImportView(views.APIView):
    """Handle bulk CSV imports with validation and error tracking"""
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, module):
        """Import data from CSV file"""
        config = get_module_config(module)
        if not config:
            return Response(
                {"detail": f"Module '{module}' not supported for import."},
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "No file provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create import history record
        history = ImportHistory.objects.create(
            module=module,
            file_name=file.name,
            created_by=request.user,
            status="pending",
        )

        try:
            import importlib
            mod = importlib.import_module(config["model_path"])
            Model = getattr(mod, config["model_name"])

            # Read CSV
            decoded = file.read().decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(decoded))
            
            if not reader.fieldnames:
                raise ValueError("CSV file is empty or invalid")
            
            total = imported = failed = 0
            errors = []
            objects_to_create = []

            # Process each row
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                total += 1
                
                try:
                    # Validate required fields
                    missing_fields = [
                        f for f in config["required_fields"]
                        if not row.get(f, "").strip()
                    ]
                    
                    if missing_fields:
                        raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
                    
                    # Extract and clean data
                    data = {}
                    for field in config["fields"]:
                        value = row.get(field, "").strip()
                        
                        if not value:
                            continue
                        
                        # Special handling for boolean fields
                        if field == "is_active":
                            data[field] = value.lower() in ("1", "true", "yes", "y")
                        # Special handling for numeric fields
                        elif field in ["unit_price", "tax_percent", "quantity"]:
                            try:
                                data[field] = float(value)
                            except ValueError:
                                raise ValueError(f"Invalid number for {field}: {value}")
                        else:
                            data[field] = value
                    
                    # Check for duplicate email/unique fields
                    lookup_field = "email" if "email" in data else "name"
                    
                    # Try to create object (will validate model constraints)
                    try:
                        # Use update_or_create to handle duplicates
                        obj, created = Model.objects.update_or_create(
                            **{lookup_field: data.get(lookup_field)},
                            defaults={k: v for k, v in data.items() if k != lookup_field}
                        )
                        imported += 1
                    except Exception as create_error:
                        raise ValueError(f"Database error: {str(create_error)}")
                    
                except Exception as e:
                    failed += 1
                    errors.append(f"Row {row_num}: {str(e)}")
            
            # Update history with results
            history.total_rows = total
            history.imported_rows = imported
            history.failed_rows = failed
            history.status = "success" if failed == 0 else "partial" if imported > 0 else "failed"
            history.error_log = "\n".join(errors) if errors else ""
            history.save()

            return Response({
                "status": history.status,
                "total_rows": total,
                "imported_rows": imported,
                "failed_rows": failed,
                "errors": errors[:50],  # Return first 50 errors
                "import_id": history.id,
                "message": f"Imported {imported}/{total} records successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            history.status = "failed"
            history.error_log = str(e)
            history.save()
            
            return Response(
                {
                    "detail": str(e),
                    "import_id": history.id,
                },
                status=status.HTTP_400_BAD_REQUEST
            )


class BulkExportView(views.APIView):
    """Export data to CSV file"""
    
    permission_classes = [IsAuthenticated]

    def get(self, request, module):
        config = get_module_config(module)
        if not config:
            return Response(
                {"detail": f"Module '{module}' not supported for export."},
                status=status.HTTP_400_BAD_REQUEST
            )

        import importlib
        mod = importlib.import_module(config["model_path"])
        Model = getattr(mod, config["model_name"])

        # Get queryset
        queryset = Model.objects.values_list(*config["fields"])
        
        # Create CSV response
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{module}_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(config["fields"])  # Header row
        
        for row in queryset:
            writer.writerow(row)
        
        return response


class BulkExportTemplateView(views.APIView):
    """Get CSV template for a module"""
    
    permission_classes = [IsAuthenticated]

    def get(self, request, module):
        config = get_module_config(module)
        if not config:
            return Response(
                {"detail": f"Module '{module}' not supported."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create CSV template with example data
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{module}_template.csv"'
        
        writer = csv.writer(response)
        writer.writerow(config["fields"])  # Header row
        
        # Add example row based on module
        if module == "customers":
            writer.writerow([
                "Example Customer",
                "customer@example.com",
                "1234567890",
                "Example Company",
                "123 Main St",
                "456 Shipping St",
                "New York",
                "Los Angeles",
                "United States",
                "United States",
                "07AABDC1234A2Z5",
                "ABCDE1234F",
                "true"
            ])
        elif module == "vendors":
            writer.writerow([
                "Example Vendor",
                "vendor@example.com",
                "9876543210",
                "Vendor Company",
                "789 Industrial Ave",
                "Industrial City",
                "United Kingdom",
                "UK123456789",
                "UK098765",
                "Example Bank",
                "1234567890",
                "true"
            ])
        elif module == "products":
            writer.writerow([
                "Example Product",
                "Product description here",
                "SKU001",
                "pieces",
                "100.00",
                "18",
                "true"
            ])
        
        return response

        import importlib
        mod = importlib.import_module(config["model_path"])
        Model = getattr(mod, config["model_name"])
        fields = config["fields"]

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()

        for obj in Model.objects.all().values(*fields):
            writer.writerow(obj)

        fmt = request.query_params.get("format", "csv")
        response = HttpResponse(output.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{module}_export.csv"'
        return response


class BulkTemplateDownloadView(views.APIView):
    """Download a CSV template for a given module."""
    permission_classes = [IsAuthenticated]

    def get(self, request, module):
        config = get_module_config(module)
        if not config:
            return Response({"detail": "Module not found."}, status=status.HTTP_400_BAD_REQUEST)

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=config["fields"])
        writer.writeheader()
        # Write sample row
        writer.writerow({f: f"sample_{f}" for f in config["fields"]})

        response = HttpResponse(output.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{module}_template.csv"'
        return response
