"""
Services layer for CRM - Business logic extracted from models

This module contains all business logic operations that were previously
scattered across models. Using services makes the code:
- More testable (can mock dependencies)
- More reusable (can call from signals, tasks, etc.)
- More maintainable (single place for logic)
"""

from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError


class DocumentCalculationService:
    """Calculate totals for all document types (Invoice, Estimate, etc.)"""

    @staticmethod
    def calculate_document_totals(document):
        """
        Calculate subtotal, tax, discount, and total for a document.
        
        Args:
            document: Invoice, Estimate, ProformaInvoice, FinalInvoice, or PurchaseOrder instance
        
        Returns:
            dict with calculated values {subtotal, tax_amount, discount_amount, total}
        """
        if document.discount_percent and document.discount_amount:
            raise ValidationError(
                "Set either discount_percent or discount_amount, not both."
            )

        from decimal import ROUND_HALF_UP
        TWOPLACES = Decimal("0.01")

        def money(value):
            return Decimal(value).quantize(TWOPLACES, rounding=ROUND_HALF_UP)

        subtotal = Decimal(0)
        tax = Decimal(0)

        # Sum all items
        for item in document.items.all():
            item_amount = money(item.quantity * item.unit_price)
            subtotal += item_amount
            tax += money(item_amount * (item.tax_percent / 100))

        # Apply discount
        if document.discount_percent:
            discount_amount = money(subtotal * (document.discount_percent / 100))
        else:
            discount_amount = document.discount_amount
        
        # Calculate total
        total = subtotal + tax - discount_amount + document.adjustment
        
        return {
            "subtotal": subtotal,
            "tax_amount": tax,
            "discount_amount": discount_amount,
            "total": total,
        }

    @staticmethod
    @transaction.atomic
    def recalculate_document(document):
        """
        Recalculate and save document totals from items.
        Atomic operation - all or nothing.
        """
        for item in document.items.all():
            item.amount = item.quantity * item.unit_price
            item.save(update_fields=["amount"])
        
        calculations = DocumentCalculationService.calculate_document_totals(document)
        document.subtotal = calculations["subtotal"]
        document.tax_amount = calculations["tax_amount"]
        document.discount_amount = calculations["discount_amount"]
        document.total = calculations["total"]
        document.save(update_fields=["subtotal", "tax_amount", "discount_amount", "total"])
        
        return document


class DocumentCopyService:
    """Handle copying documents to final/other formats"""

    @staticmethod
    @transaction.atomic
    def copy_invoice_to_final(invoice, final_number=None):
        """
        Copy an Invoice to a FinalInvoice.
        Creates new FinalInvoice with same details and line items.
        
        Args:
            invoice: Invoice instance to copy
            final_number: Optional specific number for final invoice
        
        Returns:
            Created FinalInvoice instance
        """
        from apps.invoices.models import FinalInvoice, FinalInvoiceItem
        
        if not final_number:
            # Auto-generate if not provided
            final_number = f"FINAL-{invoice.invoice_number}"
        
        final_invoice = FinalInvoice.objects.create(
            final_number=final_number,
            customer=invoice.customer,
            date=invoice.date,
            due_date=invoice.due_date,
            currency=invoice.currency,
            status="draft",
            reference=invoice.reference,
            notes=invoice.notes,
            terms=invoice.terms,
            subtotal=invoice.subtotal,
            discount_percent=invoice.discount_percent,
            discount_amount=invoice.discount_amount,
            tax_amount=invoice.tax_amount,
            total=invoice.total,
            paid_amount=0,
            po_reference=invoice.po_reference,
            adjustment=invoice.adjustment,
            pdf_template=invoice.pdf_template,
            custom_field_values=invoice.custom_field_values.copy() if invoice.custom_field_values else {},
        )
        
        # Copy all items
        for item in invoice.items.all():
            FinalInvoiceItem.objects.create(
                final_invoice=final_invoice,
                item_name=item.item_name,
                description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                amount=item.amount,
                order=item.order,
                HSN_SAC_code=item.HSN_SAC_code,
            )
        
        return final_invoice

    @staticmethod
    @transaction.atomic
    def copy_proforma_to_final(proforma, final_number=None):
        """
        Copy a ProformaInvoice to a FinalInvoice.
        """
        from apps.invoices.models import FinalInvoice, FinalInvoiceItem
        
        if not final_number:
            final_number = f"FINAL-{proforma.proforma_number}"
        
        final_invoice = FinalInvoice.objects.create(
            final_number=final_number,
            customer=proforma.customer,
            date=proforma.date,
            due_date=proforma.due_date,
            currency=proforma.currency,
            status="draft",
            reference=proforma.reference,
            notes=proforma.notes,
            terms=proforma.terms,
            subtotal=proforma.subtotal,
            discount_percent=proforma.discount_percent,
            discount_amount=proforma.discount_amount,
            tax_amount=proforma.tax_amount,
            total=proforma.total,
            paid_amount=0,
            po_reference=proforma.po_reference,
            adjustment=proforma.adjustment,
            pdf_template=proforma.pdf_template,
            custom_field_values=proforma.custom_field_values.copy() if proforma.custom_field_values else {},
        )
        
        for item in proforma.items.all():
            FinalInvoiceItem.objects.create(
                final_invoice=final_invoice,
                item_name=item.item_name,
                description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                tax_percent=item.tax_percent,
                amount=item.amount,
                order=item.order,
                HSN_SAC_code=item.HSN_SAC_code,
            )
        
        return final_invoice


class PaymentService:
    """Handle payment-related operations"""

    @staticmethod
    def validate_payment(payment):
        """
        Validate payment consistency.
        Ensures payment_type matches customer/vendor assignment.
        
        Args:
            payment: Payment instance
        
        Raises:
            ValidationError if invalid
        """
        errors = {}
        
        if payment.payment_type == "received":
            if not payment.customer:
                errors["customer"] = "Customer is required for received payments"
            if payment.vendor:
                errors["vendor"] = "Vendor should not be set for received payments"
        elif payment.payment_type == "made":
            if not payment.vendor:
                errors["vendor"] = "Vendor is required for made payments"
            if payment.customer:
                errors["customer"] = "Customer should not be set for made payments"
        
        if errors:
            raise ValidationError(errors)

    @staticmethod
    @transaction.atomic
    def create_payment(payment_number, payment_type, amount, payment_date, 
                       customer=None, vendor=None, **kwargs):
        """
        Create a payment with validation.
        
        Args:
            payment_number: Unique payment identifier
            payment_type: 'received' or 'made'
            amount: Payment amount
            payment_date: Date of payment
            customer: Customer object (for received payments)
            vendor: Vendor object (for made payments)
            **kwargs: Additional fields (bank_name, reference, notes, etc.)
        
        Returns:
            Created Payment instance
        
        Raises:
            ValidationError if invalid
        """
        from apps.payments.models import Payment
        
        payment = Payment(
            payment_number=payment_number,
            payment_type=payment_type,
            amount=amount,
            payment_date=payment_date,
            customer=customer,
            vendor=vendor,
            **kwargs
        )
        
        PaymentService.validate_payment(payment)
        payment.save()
        
        return payment


class PermissionCacheService:
    """Handle permission caching with Redis"""

    CACHE_TIMEOUT = 60 * 30  # 30 minutes
    CACHE_KEY_PREFIX = "user_permissions"

    @staticmethod
    def get_cache_key(user_id):
        """Get Redis cache key for a user's permissions"""
        return f"{PermissionCacheService.CACHE_KEY_PREFIX}:{user_id}"

    @staticmethod
    def get_user_permissions(user, cache=None):
        """
        Get user's permissions from cache or database.
        
        Args:
            user: User instance
            cache: Optional cache object (default: Django cache)
        
        Returns:
            dict of permissions {module_slug: {permission_codename: True/False}}
        """
        if cache is None:
            from django.core.cache import cache
        
        cache_key = PermissionCacheService.get_cache_key(user.id)
        permissions = cache.get(cache_key)
        
        if permissions is not None:
            return permissions
        
        # Build permissions from database
        permissions = PermissionCacheService._build_user_permissions(user)
        cache.set(cache_key, permissions, PermissionCacheService.CACHE_TIMEOUT)
        
        return permissions

    @staticmethod
    def _build_user_permissions(user):
        """Build permission matrix from database"""
        from apps.role_user.models import RoleUser
        from apps.role_permission.models import RolePermission
        
        permissions = {}
        
        if user.is_superuser:
            # Superuser has all permissions
            return permissions  # Return empty - superuser check bypasses this
        
        # Get all roles for this user
        user_roles = RoleUser.objects.filter(user=user).values_list("role_id", flat=True)
        
        # Get all permissions for those roles
        role_perms = RolePermission.objects.filter(
            role_id__in=user_roles
        ).select_related("module", "permission")
        
        # Build nested dict: module -> permission -> True
        for perm in role_perms:
            module_slug = perm.module.slug
            perm_codename = perm.permission.codename
            
            if module_slug not in permissions:
                permissions[module_slug] = {}
            
            permissions[module_slug][perm_codename] = True
        
        return permissions

    @staticmethod
    def clear_user_permissions(user_id):
        """Clear cached permissions for a user"""
        from django.core.cache import cache
        
        cache_key = PermissionCacheService.get_cache_key(user_id)
        cache.delete(cache_key)

    @staticmethod
    def clear_all_permissions():
        """Clear all cached permissions (call when permissions are updated globally)"""
        from django.core.cache import cache
        
        cache.delete_pattern(f"{PermissionCacheService.CACHE_KEY_PREFIX}:*")


class BulkImportService:
    """Handle bulk data imports from CSV"""

    @staticmethod
    def import_customers_from_csv(csv_file, user):
        """
        Import customers from CSV file.
        
        Expected CSV columns: name, email, phone, company_name, billing_address, etc.
        
        Args:
            csv_file: Uploaded file object
            user: User performing the import
        
        Returns:
            dict with {total: int, created: int, failed: int, errors: []}
        """
        import csv
        from apps.customers.models import Customer
        from apps.bulk_operations.models import ImportHistory
        
        results = {"total": 0, "created": 0, "failed": 0, "errors": []}
        
        try:
            # Read CSV
            reader = csv.DictReader(csv_file)
            customers_to_create = []
            
            for row_num, row in enumerate(reader, start=2):  # Start at 2 (headers are row 1)
                try:
                    customer = Customer(
                        name=row.get("name", "").strip(),
                        email=row.get("email", "").strip(),
                        phone=row.get("phone", "").strip(),
                        company_name=row.get("company_name", "").strip(),
                        billing_address=row.get("billing_address", "").strip(),
                        shipping_address=row.get("shipping_address", "").strip(),
                        is_active=row.get("is_active", "true").lower() == "true",
                    )
                    customer.full_clean()
                    customers_to_create.append(customer)
                    results["total"] += 1
                    
                except Exception as e:
                    results["total"] += 1
                    results["failed"] += 1
                    results["errors"].append(f"Row {row_num}: {str(e)}")
            
            # Bulk create
            if customers_to_create:
                Customer.objects.bulk_create(customers_to_create)
                results["created"] = len(customers_to_create)
            
            # Log import
            ImportHistory.objects.create(
                module="customers",
                file_name=csv_file.name,
                total_rows=results["total"],
                imported_rows=results["created"],
                failed_rows=results["failed"],
                status="success" if results["failed"] == 0 else "partial",
                error_log="\n".join(results["errors"]),
                created_by=user,
            )
            
        except Exception as e:
            results["errors"].append(f"Import failed: {str(e)}")
            ImportHistory.objects.create(
                module="customers",
                file_name=csv_file.name,
                total_rows=0,
                imported_rows=0,
                failed_rows=0,
                status="failed",
                error_log=str(e),
                created_by=user,
            )
        
        return results


class RFQService:
    """Handle RFQ workflow operations"""

    @staticmethod
    @transaction.atomic
    def convert_response_to_purchase_order(rfq_response, po_number=None):
        """
        Convert an accepted RFQ response to a Purchase Order.
        
        Args:
            rfq_response: RFQResponse instance to convert
            po_number: Optional specific PO number (auto-generated if not provided)
        
        Returns:
            Created PurchaseOrder instance
        
        Raises:
            ValidationError if response cannot be converted
        """
        from apps.invoices.models import PurchaseOrder, PurchaseOrderItem
        from django.utils import timezone
        
        # Validation
        if rfq_response.status != "accepted":
            raise ValidationError({
                "status": f"Only accepted responses can be converted to PO. Current status: {rfq_response.status}"
            })
        
        if rfq_response.converted_to_po_number:
            raise ValidationError({
                "converted_to_po_number": f"Already converted to PO: {rfq_response.converted_to_po_number}"
            })
        
        # Auto-generate PO number if not provided
        if not po_number:
            po_number = f"PO-{rfq_response.rfq.rfq_number}"
        
        # Create PO
        po = PurchaseOrder.objects.create(
            po_number=po_number,
            vendor=rfq_response.vendor,
            currency=rfq_response.rfq.currency,
            date=timezone.now().date(),
            expected_date=rfq_response.response_date,
            status="draft",
            notes=f"Converted from RFQ {rfq_response.rfq.rfq_number}. Vendor Response: {rfq_response.notes}",
            terms=rfq_response.rfq.terms,
            subtotal=rfq_response.subtotal,
            tax_amount=rfq_response.tax_amount,
            total=rfq_response.total,
        )
        
        # Copy line items from response
        for response_item in rfq_response.items.all():
            PurchaseOrderItem.objects.create(
                purchase_order=po,
                item_name=response_item.rfq_item.item_name,
                description=response_item.rfq_item.description,
                quantity=response_item.quantity,
                unit=response_item.rfq_item.unit,
                unit_price=response_item.unit_price,
                tax_percent=response_item.tax_percent,
                amount=response_item.amount,
                order=response_item.order,
            )
        
        # Update response tracking
        rfq_response.converted_to_po_number = po_number
        rfq_response.accepted_at = timezone.now()
        rfq_response.save(update_fields=["converted_to_po_number", "accepted_at"])
        
        return po

    @staticmethod
    def accept_rfq_response(rfq_response):
        """
        Accept an RFQ response (mark as accepted without converting to PO yet).
        Can be converted to PO later via convert_response_to_purchase_order.
        
        Args:
            rfq_response: RFQResponse instance to accept
        
        Raises:
            ValidationError if cannot accept
        """
        from django.utils import timezone
        
        if rfq_response.status not in ["pending", "responded"]:
            raise ValidationError({
                "status": f"Cannot accept response in {rfq_response.status} status"
            })
        
        rfq_response.status = "accepted"
        rfq_response.accepted_at = timezone.now()
        rfq_response.save(update_fields=["status", "accepted_at"])

    @staticmethod
    def reject_rfq_response(rfq_response, reason=""):
        """
        Reject an RFQ response.
        
        Args:
            rfq_response: RFQResponse instance to reject
            reason: Optional reason for rejection
        """
        if rfq_response.status == "accepted":
            raise ValidationError({
                "status": "Cannot reject an already accepted response"
            })
        
        rfq_response.status = "rejected"
        rfq_response.notes = f"{rfq_response.notes}\n\nRejection reason: {reason}".strip()
        rfq_response.save(update_fields=["status", "notes"])

    @staticmethod
    def calculate_response_totals(rfq_response):
        """
        Calculate totals from response items.
        
        Args:
            rfq_response: RFQResponse instance
        
        Returns:
            dict with {subtotal, tax_amount, total}
        """
        subtotal = Decimal(0)
        tax = Decimal(0)
        
        for item in rfq_response.items.all():
            subtotal += item.amount
            tax += item.amount * (item.tax_percent / 100)
        
        return {
            "subtotal": subtotal,
            "tax_amount": tax,
            "total": subtotal + tax,
        }
