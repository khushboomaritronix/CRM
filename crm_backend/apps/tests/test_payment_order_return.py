"""
Test suite for Payment and OrderReturn models
"""

import pytest
from django.core.exceptions import ValidationError
from decimal import Decimal
from apps.payments.models import Payment
from apps.order_returns.models import OrderReturn
from apps.customers.models import Customer
from apps.vendors.models import Vendor
from datetime import date


@pytest.fixture
def customer(db):
    """Create test customer"""
    return Customer.objects.create(
        name="Test Customer",
        email="customer@test.com",
        phone="9999999999"
    )


@pytest.fixture
def vendor(db):
    """Create test vendor"""
    return Vendor.objects.create(
        name="Test Vendor",
        vendor_code="VND001",
        email="vendor@test.com"
    )


class TestPaymentModel:
    """Test Payment model validation"""

    def test_payment_received_requires_customer(self, customer):
        """Payment type 'received' requires customer"""
        payment = Payment(
            payment_number="PAY001",
            payment_type="received",
            payment_date=date.today(),
            amount=Decimal("1000.00"),
            customer=customer
        )
        payment.full_clean()  # Should not raise
        assert payment.customer == customer

    def test_payment_received_cannot_have_vendor(self, customer, vendor):
        """Payment type 'received' should not have vendor"""
        payment = Payment(
            payment_number="PAY001",
            payment_type="received",
            payment_date=date.today(),
            amount=Decimal("1000.00"),
            customer=customer,
            vendor=vendor  # Should fail
        )
        with pytest.raises(ValidationError) as exc_info:
            payment.full_clean()
        assert "vendor" in exc_info.value.error_dict

    def test_payment_made_requires_vendor(self, vendor):
        """Payment type 'made' requires vendor"""
        payment = Payment(
            payment_number="PAY002",
            payment_type="made",
            payment_date=date.today(),
            amount=Decimal("500.00"),
            vendor=vendor
        )
        payment.full_clean()  # Should not raise
        assert payment.vendor == vendor

    def test_payment_made_cannot_have_customer(self, customer, vendor):
        """Payment type 'made' should not have customer"""
        payment = Payment(
            payment_number="PAY002",
            payment_type="made",
            payment_date=date.today(),
            amount=Decimal("500.00"),
            customer=customer,  # Should fail
            vendor=vendor
        )
        with pytest.raises(ValidationError) as exc_info:
            payment.full_clean()
        assert "customer" in exc_info.value.error_dict

    def test_payment_received_without_customer_fails(self):
        """Payment received without customer should fail"""
        payment = Payment(
            payment_number="PAY003",
            payment_type="received",
            payment_date=date.today(),
            amount=Decimal("1000.00")
        )
        with pytest.raises(ValidationError) as exc_info:
            payment.full_clean()
        assert "customer" in exc_info.value.error_dict

    def test_payment_made_without_vendor_fails(self):
        """Payment made without vendor should fail"""
        payment = Payment(
            payment_number="PAY004",
            payment_type="made",
            payment_date=date.today(),
            amount=Decimal("500.00")
        )
        with pytest.raises(ValidationError) as exc_info:
            payment.full_clean()
        assert "vendor" in exc_info.value.error_dict


class TestOrderReturnModel:
    """Test OrderReturn model validation"""

    def test_sales_return_requires_customer(self, customer):
        """Sales return requires customer"""
        order_return = OrderReturn(
            return_number="RET001",
            return_type="sales_return",
            date=date.today(),
            customer=customer
        )
        order_return.full_clean()  # Should not raise
        assert order_return.customer == customer

    def test_sales_return_cannot_have_vendor(self, customer, vendor):
        """Sales return should not have vendor"""
        order_return = OrderReturn(
            return_number="RET001",
            return_type="sales_return",
            date=date.today(),
            customer=customer,
            vendor=vendor  # Should fail
        )
        with pytest.raises(ValidationError) as exc_info:
            order_return.full_clean()
        assert "vendor" in exc_info.value.error_dict

    def test_purchase_return_requires_vendor(self, vendor):
        """Purchase return requires vendor"""
        order_return = OrderReturn(
            return_number="RET002",
            return_type="purchase_return",
            date=date.today(),
            vendor=vendor
        )
        order_return.full_clean()  # Should not raise
        assert order_return.vendor == vendor

    def test_purchase_return_cannot_have_customer(self, customer, vendor):
        """Purchase return should not have customer"""
        order_return = OrderReturn(
            return_number="RET002",
            return_type="purchase_return",
            date=date.today(),
            customer=customer,  # Should fail
            vendor=vendor
        )
        with pytest.raises(ValidationError) as exc_info:
            order_return.full_clean()
        assert "customer" in exc_info.value.error_dict
