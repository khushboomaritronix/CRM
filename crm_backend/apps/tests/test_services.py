"""
Test suite for services layer
"""

import pytest
from decimal import Decimal
from datetime import date
from apps.core.services import (
    DocumentCalculationService,
    DocumentCopyService,
    PaymentService,
    PermissionCacheService,
)
from apps.invoices.models import Invoice, InvoiceItem, FinalInvoice
from apps.customers.models import Customer
from apps.currencies.models import Currency
from apps.payments.models import Payment
from apps.users.models import User
from django.core.cache import cache


@pytest.fixture
def customer(db):
    """Create test customer"""
    return Customer.objects.create(
        name="Test Customer",
        email="customer@test.com"
    )


@pytest.fixture
def currency(db):
    """Create test currency"""
    return Currency.objects.create(
        code="INR",
        name="Indian Rupee",
        symbol="₹",
        exchange_rate=Decimal("1.0"),
        is_base=True
    )


@pytest.fixture
def invoice(db, customer, currency):
    """Create test invoice"""
    return Invoice.objects.create(
        invoice_number="INV001",
        customer=customer,
        currency=currency,
        date=date.today(),
        status="draft"
    )


class TestDocumentCalculationService:
    """Test document calculation service"""

    def test_calculate_document_totals_basic(self, invoice):
        """Test calculating document totals from items"""
        # Add items
        InvoiceItem.objects.create(
            invoice=invoice,
            item_name="Product 1",
            quantity=Decimal("2"),
            unit_price=Decimal("100.00"),
            tax_percent=Decimal("10"),
            order=1
        )
        InvoiceItem.objects.create(
            invoice=invoice,
            item_name="Product 2",
            quantity=Decimal("3"),
            unit_price=Decimal("50.00"),
            tax_percent=Decimal("5"),
            order=2
        )
        
        # Calculate
        result = DocumentCalculationService.calculate_document_totals(invoice)
        
        # Verify
        assert result["subtotal"] == Decimal("350.00")  # (2*100) + (3*50)
        assert result["tax_amount"] == Decimal("32.50")  # (200*0.1) + (150*0.05)
        assert result["total"] == Decimal("382.50")  # 350 + 32.50

    def test_recalculate_document_saves_changes(self, invoice):
        """Test recalculate saves changes to database"""
        InvoiceItem.objects.create(
            invoice=invoice,
            item_name="Product",
            quantity=Decimal("1"),
            unit_price=Decimal("1000.00"),
            tax_percent=Decimal("18"),
            order=1
        )
        
        # Recalculate
        DocumentCalculationService.recalculate_document(invoice)
        
        # Verify saved
        invoice.refresh_from_db()
        assert invoice.subtotal == Decimal("1000.00")
        assert invoice.tax_amount == Decimal("180.00")
        assert invoice.total == Decimal("1180.00")


class TestPaymentService:
    """Test payment service"""

    def test_create_payment_validates_type(self, customer, vendor):
        """Test payment creation validates type constraints"""
        # Should succeed
        payment = PaymentService.create_payment(
            payment_number="PAY001",
            payment_type="received",
            amount=Decimal("1000"),
            payment_date=date.today(),
            customer=customer
        )
        assert payment.customer == customer
        assert payment.vendor is None

    def test_create_payment_fails_without_customer(self):
        """Test payment creation fails without required customer"""
        with pytest.raises(Exception):
            PaymentService.create_payment(
                payment_number="PAY002",
                payment_type="received",
                amount=Decimal("500"),
                payment_date=date.today()
                # Missing customer for 'received' type
            )


class TestPermissionCacheService:
    """Test permission caching"""

    def test_cache_key_generation(self, db):
        """Test cache key generation"""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass"
        )
        
        cache_key = PermissionCacheService.get_cache_key(user.id)
        assert cache_key.startswith("user_permissions:")
        assert str(user.id) in cache_key

    def test_clear_user_permissions(self, db):
        """Test clearing user permissions from cache"""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass"
        )
        
        # Set cache
        cache_key = PermissionCacheService.get_cache_key(user.id)
        cache.set(cache_key, {"test": "value"}, 3600)
        assert cache.get(cache_key) == {"test": "value"}
        
        # Clear
        PermissionCacheService.clear_user_permissions(user.id)
        assert cache.get(cache_key) is None

    def test_superuser_has_all_permissions(self, db):
        """Test superuser always has permissions"""
        superuser = User.objects.create_user(
            email="admin@example.com",
            password="adminpass",
            is_superuser=True
        )
        
        from apps.core.permissions import check_user_permission
        
        # Superuser has all permissions
        assert check_user_permission(superuser, "any_module", "any_action")
