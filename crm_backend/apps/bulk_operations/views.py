import csv
import io
from django.http import HttpResponse
from rest_framework import views, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from .models import ImportHistory
from rest_framework import serializers


class ImportHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportHistory
        fields = "__all__"


class ImportHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ImportHistory.objects.all()
    serializer_class = ImportHistorySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["module", "status"]


def get_module_config(module):
    """Return (Model, field_names) for a given module slug."""
    configs = {
        "customers": {
            "model_path": "apps.customers.models",
            "model_name": "Customer",
            "fields": ["name", "email", "phone", "company_name", "billing_address",
                       "billing_city", "billing_country", "gstin", "pan", "is_active"],
        },
        "vendors": {
            "model_path": "apps.vendors.models",
            "model_name": "Vendor",
            "fields": ["name", "email", "phone", "company_name", "address",
                       "city", "country", "gstin", "pan", "is_active"],
        },
    }
    return configs.get(module)


class BulkImportView(views.APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, module):
        config = get_module_config(module)
        if not config:
            return Response({"detail": f"Module '{module}' not supported for import."},
                            status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        import importlib
        mod = importlib.import_module(config["model_path"])
        Model = getattr(mod, config["model_name"])

        history = ImportHistory.objects.create(
            module=module,
            file_name=file.name,
            created_by=request.user,
            status="pending",
        )

        try:
            decoded = file.read().decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(decoded))
            total = imported = failed = 0
            errors = []

            for row in reader:
                total += 1
                try:
                    data = {k: v for k, v in row.items() if k in config["fields"]}
                    if "is_active" in data:
                        data["is_active"] = data["is_active"].lower() in ("1", "true", "yes")
                    Model.objects.update_or_create(
                        email=data.get("email", ""),
                        defaults=data,
                    ) if data.get("email") else Model.objects.create(**data)
                    imported += 1
                except Exception as e:
                    failed += 1
                    errors.append(f"Row {total}: {str(e)}")

            history.total_rows = total
            history.imported_rows = imported
            history.failed_rows = failed
            history.status = "success" if failed == 0 else "failed"
            history.error_log = "\n".join(errors)
            history.save()

            return Response({
                "total": total,
                "imported": imported,
                "failed": failed,
                "errors": errors[:20],
                "import_id": history.id,
            })
        except Exception as e:
            history.status = "failed"
            history.error_log = str(e)
            history.save()
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BulkExportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, module):
        config = get_module_config(module)
        if not config:
            return Response({"detail": f"Module '{module}' not supported for export."},
                            status=status.HTTP_400_BAD_REQUEST)

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
