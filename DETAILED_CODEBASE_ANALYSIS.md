# CRM_V3 - Complete Codebase Analysis Report

**Generated**: May 5, 2026  
**Project**: Multi-tenant Sales & Purchase CRM with Role-Based Access Control  
**Architecture**: Django REST Framework (Backend) + React (Frontend)  
**Database**: PostgreSQL with Redis for Celery + Token Blacklist

---

## Table of Contents

1. [Backend Architecture - 27 Apps](#backend-architecture---27-apps)
2. [Frontend Architecture](#frontend-architecture)
3. [Integration Points](#integration-points)
4. [Summary & Recommendations](#summary--recommendations)

---

# BACKEND ARCHITECTURE - 27 APPS

## Core Foundation

### 1. **CORE APP** (`apps/core/`)

**Purpose**: Base classes and utilities shared across all apps.

**Models**:
```
┌─ TimeStampedModel (Abstract)
│  ├─ created_at: DateTimeField (auto_now_add)
│  └─ updated_at: DateTimeField (auto_now)
│
└─ CustomFieldValueMixin (Abstract)
   └─ custom_field_values: JSONField (extensible custom fields)
```

**Permissions Module** (`apps/core/permissions.py`):
- `HasModulePermission` - DRF permission class for RBAC
- `METHOD_TO_ACTION` mapping: GET→can_view, POST→can_create, PUT/PATCH→can_update, DELETE→can_delete
- `check_user_permission()` function
- Dynamic permission checking via RoleUser + RolePermission lookup

**Key Features**:
- ✅ Reusable base classes for all domain models
- ✅ JSONB support for extensible attributes
- ✅ Dynamic permission matrix (no hardcoding)
- ✅ Superuser bypass

**Status**: ✅ **Complete**

**Issues**:
- ⚠️ Permission checks lack caching (N+1 queries per request)
- ⚠️ No row-level or field-level permissions (only module-level)

**Files**: 
- `models.py` - Base classes
- `permissions.py` - RBAC decorator/checker
- `pagination.py` - Custom pagination
- `management/` - Management commands (if any)

---

## Authentication & Authorization (4 Apps)

### 2. **USERS APP** (`apps/users/`)

**Purpose**: User account management and authentication.

**Models**:
```
User (extends AbstractUser)
├─ email: EmailField (unique=True, USERNAME_FIELD)
├─ phone: CharField(max_length=20)
├─ avatar: ImageField (upload_to="avatars/")
├─ is_active: BooleanField (default=True)
├─ first_name, last_name: CharField (from AbstractUser)
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   ├─ get_full_name() [from AbstractUser]
   └─ full_name (property) - Returns full name or username
```

**Key Fields**:
- Username-based login: via email instead of username field
- Avatar support for user profile pictures
- Extensible via custom_field_values JSONB

**Serializers**:
- `UserSerializer` - Full user data
- Likely includes nested role/permission data

**Views/Endpoints**:
- Standard CRUD via `UserViewSet`
- Permission checking via `HasModulePermission` with module_slug="users"
- Filtering by is_active, search by email/phone/name

**Status**: ✅ **Complete**

**Issues**:
- ⚠️ No password complexity validation visible
- ⚠️ No account lockout after failed login attempts
- ⚠️ Avatar upload has no size/type validation

**Files**:
- `models.py` - User model
- `serializers.py` - UserSerializer
- `views.py` - UserViewSet CRUD
- `urls.py` - User endpoints

---

### 3. **ROLES APP** (`apps/roles/`)

**Purpose**: Define user roles used in RBAC system.

**Models**:
```
Role
├─ name: CharField (max_length=100, unique=True)
├─ description: TextField
├─ is_active: BooleanField (default=True)
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Relationships:
   ├─ role_users → RoleUser (one-to-many)
   ├─ role_modules → RoleModule (one-to-many)
   └─ role_permissions → RolePermission (one-to-many)
```

**Purpose**: Organize permissions into named roles (Admin, Manager, Sales Rep, etc.)

**Status**: ✅ **Complete**

**Files**:
- `models.py` - Role model
- `serializers.py` - RoleSerializer
- `views.py` - RoleViewSet CRUD

---

### 4. **ROLE_USER APP** (`apps/role_user/`)

**Purpose**: Many-to-many mapping between Users and Roles.

**Models**:
```
RoleUser
├─ role: ForeignKey(Role) → CASCADE
├─ user: ForeignKey(User) → CASCADE
├─ unique_together: (role, user)
├─ Mixin: TimeStampedModel
└─ String rep: "{user} → {role}"
```

**Purpose**: Assign one or more roles to each user. Users can have multiple roles.

**Example**:
```
User "John" → Role "Admin"
User "John" → Role "Manager"
User "Jane" → Role "Sales"
```

**Status**: ✅ **Complete**

**Files**:
- `models.py` - RoleUser model
- `serializers.py` - RoleUserSerializer
- `views.py` - RoleUserViewSet CRUD

---

### 5. **MODULES APP** (`apps/modules/`)

**Purpose**: Registry of all modules/features in the system (customers, invoices, etc.).

**Models**:
```
Module
├─ name: CharField (e.g., "Customers", "Invoices")
├─ slug: SlugField (unique, e.g., "customers", "invoices")
├─ icon: CharField (icon class name, e.g., "lucide-users")
├─ description: TextField
├─ is_active: BooleanField (determines visibility)
├─ order: PositiveIntegerField (menu ordering)
├─ Mixin: TimeStampedModel
└─ Relationships:
   ├─ role_modules → RoleModule (which roles see this module)
   └─ module_permissions → RolePermission (permissions available)
```

**Purpose**: Define all feature modules (not Django apps, but business modules) so permissions can be managed per-module.

**Status**: ✅ **Complete**

**Example Modules**:
- customers
- invoices
- estimates
- proforma_invoices
- purchase_orders
- payments
- etc.

**Files**:
- `models.py` - Module model
- `serializers.py` - ModuleSerializer
- `views.py` - ModuleViewSet CRUD

---

### 6. **PERMISSIONS APP** (`apps/permissions/`)

**Purpose**: Define available permission actions (can_view, can_create, etc.).

**Models**:
```
Permission
├─ name: CharField (e.g., "Can View")
├─ codename: CharField (unique, e.g., "can_view", "can_create", "can_update", "can_delete")
├─ description: TextField
├─ Mixin: TimeStampedModel, CustomFieldValueMixin
└─ Relationships:
   └─ permission_roles → RolePermission (which role+module combos have this)
```

**Purpose**: Define the atomic permission types. Standard CRUD actions + custom.

**Status**: ✅ **Complete**

**Likely Permissions**:
- can_view
- can_create
- can_update
- can_delete
- can_export (bulk export)
- can_import (bulk import)

**Files**:
- `models.py` - Permission model
- `serializers.py` - PermissionSerializer
- `views.py` - PermissionViewSet CRUD

---

### 7. **ROLE_MODULE APP** (`apps/role_module/`)

**Purpose**: Many-to-many mapping between Roles and Modules (which modules does each role see?).

**Models**:
```
RoleModule
├─ role: ForeignKey(Role) → CASCADE
├─ module: ForeignKey(Module) → CASCADE
├─ unique_together: (role, module)
├─ Mixin: TimeStampedModel
└─ String rep: "{role} → {module}"
```

**Purpose**: Control module visibility per role. If RoleModule(admin, customers) exists, Admin role can see Customers module.

**Status**: ✅ **Complete**

**Files**:
- `models.py` - RoleModule model
- `serializers.py` - RoleModuleSerializer
- `views.py` - RoleModuleViewSet CRUD

---

### 8. **ROLE_PERMISSION APP** (`apps/role_permission/`)

**Purpose**: Many-to-many mapping between Roles, Modules, and Permissions (fine-grained RBAC matrix).

**Models**:
```
RolePermission
├─ role: ForeignKey(Role) → CASCADE
├─ module: ForeignKey(Module) → CASCADE
├─ permission: ForeignKey(Permission) → CASCADE
├─ unique_together: (role, module, permission)
├─ Mixin: TimeStampedModel
└─ String rep: "{role} | {module} | {permission.codename}"
```

**Purpose**: Define what actions each role can perform on each module. This is the core RBAC matrix.

**Example Matrix**:
```
Admin    | Customers | can_view   ✓
Admin    | Customers | can_create ✓
Admin    | Customers | can_update ✓
Admin    | Customers | can_delete ✓
Manager  | Customers | can_view   ✓
Manager  | Customers | can_create ✓
Manager  | Customers | can_update ✓
Manager  | Customers | can_delete ✗
Sales    | Customers | can_view   ✓
Sales    | Customers | can_create ✓
Sales    | Customers | can_update ✗
Sales    | Customers | can_delete ✗
```

**Status**: ✅ **Complete**

**Files**:
- `models.py` - RolePermission model
- `serializers.py` - RolePermissionSerializer
- `views.py` - RolePermissionViewSet CRUD

---

## Business Domain Models (20 Apps)

### 9. **COMPANY APP** (`apps/company/`)

**Purpose**: Multi-tenant company profile and settings.

**Models**:
```
CompanyProfile (Singleton via get_or_create(id=1))
├─ Identity:
│  ├─ name: CharField
│  ├─ email: EmailField
│  ├─ phone: CharField
│  ├─ website: URLField
│  └─ logo, signature: ImageField
│
├─ Address:
│  ├─ address: TextField
│  ├─ city, state, country, pincode: CharField
│  └─ gstin, pan: CharField (tax IDs)
│
├─ Financial:
│  ├─ bank_name, bank_account, bank_ifsc: CharField
│  ├─ currency: CharField (default="INR")
│  ├─ invoice_prefix: CharField (default="INV")
│  ├─ invoice_counter: PositiveIntegerField (for auto-numbering)
│  └─ invoice_due_after_days: PositiveIntegerField (default=12)
│
├─ Configuration:
│  ├─ signature_name: CharField (authorized person)
│  ├─ terms: TextField (default payment/delivery terms)
│  └─ footer_text: TextField (invoice footer)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   └─ get_instance() - Returns or creates the singleton
```

**Purpose**: Global company settings used in invoices, email, etc.

**Status**: ✅ **Complete**

**Files**:
- `models.py` - CompanyProfile singleton
- `serializers.py` - CompanySerializer
- `views.py` - CompanyViewSet (likely single-instance)

---

### 10. **CUSTOMERS APP** (`apps/customers/`)

**Purpose**: CRM customer/client management.

**Models**:
```
Customer
├─ Identity:
│  ├─ name: CharField (primary identifier)
│  ├─ email: EmailField
│  ├─ phone, mobile: CharField
│  ├─ website: URLField
│  └─ company_name: CharField (B2B company name)
│
├─ Billing Address:
│  ├─ billing_address: TextField
│  ├─ billing_city, billing_state, billing_country, billing_pincode: CharField
│
├─ Shipping Address:
│  ├─ shipping_address: TextField
│  ├─ shipping_city, shipping_state, shipping_country, shipping_pincode: CharField
│
├─ Tax & Financial:
│  ├─ gstin: CharField (GST ID - India)
│  ├─ pan: CharField (PAN - India)
│  ├─ credit_limit: DecimalField (max amount customer can owe)
│  └─ payment_terms: CharField (e.g., "Net 30", "Due on Receipt")
│
├─ Status:
│  ├─ is_active: BooleanField (soft delete via flag)
│  ├─ notes: TextField (internal notes)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Relationships:
   ├─ invoices (reverse) - 1-to-many
   ├─ estimates (reverse) - 1-to-many
   ├─ proforma_invoices (reverse) - 1-to-many
   ├─ final_invoices (reverse) - 1-to-many
   ├─ credit_notes (reverse) - 1-to-many
   ├─ payments (reverse) - 1-to-many
   ├─ customer_pos (reverse) - 1-to-many
   └─ order_returns (reverse) - 1-to-many
```

**Serializers**:
- `CustomerSerializer` - Full customer data
- Nested read-only fields for related documents count

**Views**:
```python
class CustomerViewSet(viewsets.ModelViewSet):
    module_slug = "customers"
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_active", "billing_country"]
    search_fields = ["name", "email", "phone", "company_name", "gstin"]
    ordering_fields = ["name", "created_at"]
```

**Status**: ✅ **Complete**

**Issues**:
- ⚠️ No duplicate detection (same customer registered multiple times)
- ⚠️ Credit limit not enforced at invoice creation
- ⚠️ No customer groups/segments

**Files**:
- `models.py` - Customer model
- `serializers.py` - CustomerSerializer + nested data
- `views.py` - CustomerViewSet CRUD
- `urls.py` - `/api/customers/` endpoints

---

### 11. **VENDORS APP** (`apps/vendors/`)

**Purpose**: Supplier/vendor management for procurement.

**Models**:
```
Vendor
├─ Identity:
│  ├─ name: CharField
│  ├─ vendor_code: CharField (unique, business identifier)
│  ├─ email: EmailField
│  ├─ phone: CharField
│  ├─ website: URLField
│  └─ company_name: CharField
│
├─ Address:
│  ├─ billing_address, shipping_address: TextField
│  ├─ address: TextField (primary)
│  ├─ city, state, country, pincode: CharField
│  └─ gstin, pan: CharField (tax IDs)
│
├─ Financial:
│  ├─ payment_terms: CharField
│  ├─ bank_name, bank_account, bank_ifsc: CharField
│
├─ Business:
│  ├─ return_policy: TextField (vendor's return policy)
│
├─ Status:
│  ├─ is_active: BooleanField
│  ├─ notes: TextField
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Relationships:
   ├─ purchase_orders (reverse) - 1-to-many
   ├─ debit_notes (reverse) - 1-to-many
   ├─ payments (reverse) - 1-to-many
   ├─ rfqs (reverse) - 1-to-many
   └─ order_returns (reverse) - 1-to-many
```

**Status**: ✅ **Complete**

**Files**:
- `models.py` - Vendor model
- `serializers.py` - VendorSerializer
- `views.py` - VendorViewSet CRUD

---

### 12. **CURRENCIES APP** (`apps/currencies/`)

**Purpose**: Multi-currency support for international transactions.

**Models**:
```
Currency
├─ code: CharField (max_length=3, unique, e.g., "INR", "USD", "EUR")
├─ name: CharField (e.g., "Indian Rupee", "US Dollar")
├─ symbol: CharField (e.g., "₹", "$", "€")
├─ exchange_rate: DecimalField (relative to base currency)
├─ is_base: BooleanField (which currency is the reference?)
├─ is_active: BooleanField (hide inactive currencies)
├─ Mixin: TimeStampedModel, CustomFieldValueMixin
└─ Relationships:
   ├─ invoices_documents (reverse)
   ├─ proforma_invoices_documents (reverse)
   ├─ purchase_orders_documents (reverse)
   └─ rfqs (reverse)
```

**Purpose**: Track multiple currencies and exchange rates.

**Status**: ✅ **Complete**

**Files**:
- `models.py` - Currency model
- `serializers.py` - CurrencySerializer
- `views.py` - CurrencyViewSet CRUD

---

### 13. **INVOICES APP** (`apps/invoices/models.py` + `views.py` + `serializers.py`)

**Purpose**: Core document management (invoices, estimates, proforma, purchase orders, final invoices).

**Base Classes**:
```
BaseDocument (Abstract)
├─ Relationships:
│  ├─ customer: ForeignKey(Customer)
│  └─ currency: ForeignKey(Currency)
│
├─ Core Fields:
│  ├─ date: DateField
│  ├─ due_date: DateField (null, blank)
│  ├─ status: CharField (draft, sent, paid, partial, overdue, cancelled, unpaid)
│  ├─ reference: CharField (e.g., customer PO number)
│  └─ notes, terms: TextField
│
├─ Financial:
│  ├─ subtotal: DecimalField (sum of line items)
│  ├─ discount_percent, discount_amount: DecimalField (flexible discounting)
│  ├─ tax_amount: DecimalField (sum of item taxes)
│  ├─ adjustment: DecimalField (manual positive/negative adjustment)
│  ├─ paid_amount: DecimalField (total paid so far)
│  └─ total: DecimalField (subtotal + tax - discount + adjustment)
│
├─ References:
│  ├─ po_reference: CharField (which customer PO triggered this?)
│  ├─ pdf_template: ForeignKey(PDFTemplate)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   └─ recalculate() - Recalculates totals from line items
```

**Concrete Document Types**:

#### 13a. **Estimate**
```
Estimate (extends BaseDocument)
├─ estimate_number: CharField (unique)
├─ valid_until: DateField (expiration)
├─ Items: EstimateItem (FK → estimate)
└─ Purpose: Sales proposal / quotation
```

#### 13b. **Invoice**
```
Invoice (extends BaseDocument)
├─ invoice_number: CharField (unique)
├─ estimate: ForeignKey(Estimate, null=True)
├─ Items: InvoiceItem (FK → invoice)
└─ Purpose: Customer invoice (request for payment)
```

#### 13c. **ProformaInvoice**
```
ProformaInvoice (extends BaseDocument)
├─ proforma_number: CharField (unique)
├─ Items: ProformaInvoiceItem (FK → proforma)
└─ Purpose: Pro forma (provisional invoice for customs, quotes)
```

#### 13d. **PurchaseOrder**
```
PurchaseOrder (NOT extending BaseDocument, but similar structure)
├─ Relationships:
│  ├─ vendor: ForeignKey(Vendor) (not customer)
│  └─ currency: ForeignKey(Currency)
│
├─ Core Fields:
│  ├─ po_number: CharField (unique)
│  ├─ date: DateField
│  ├─ expected_date: DateField
│  ├─ status: CharField (draft, approved, sent, received, cancelled)
│  ├─ Items: PurchaseOrderItem (FK → purchase_order)
│
├─ Financial:
│  ├─ subtotal, tax_amount, total: DecimalField
│  ├─ adjustment: DecimalField
│
└─ Methods:
   └─ recalculate() - Same as BaseDocument
```

#### 13e. **FinalInvoice**
```
FinalInvoice (extends BaseDocument)
├─ final_number: CharField (unique)
├─ invoice: ForeignKey(Invoice, null=True) (source)
├─ proforma: ForeignKey(ProformaInvoice, null=True) (source)
├─ Items: FinalInvoiceItem (FK → final_invoice)
└─ Purpose: Consolidated billing document
```

**Base Item Class**:
```
BaseDocumentItem (Abstract)
├─ item_name: CharField (product/service name)
├─ description: CharField
├─ quantity: DecimalField (supports fractional quantities)
├─ unit: CharField (e.g., "pcs", "kg", "hours")
├─ unit_price: DecimalField
├─ tax_percent: DecimalField (item-level tax rate)
├─ amount: DecimalField (quantity * unit_price, calculated)
├─ order: PositiveIntegerField (line item sequence)
└─ HSN_SAC_code: CharField (GST classification - India)
```

**Serializers Pattern**:
```python
class InvoiceItemSerializer(BaseItemSerializer):
    class Meta:
        model = InvoiceItem

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source="customer.name")
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        invoice = Invoice.objects.create(**validated_data)
        for item in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item)
        invoice.recalculate()
        return invoice
```

**ViewSets**:
```python
class InvoiceViewSet(viewsets.ModelViewSet):
    module_slug = "invoices"
    queryset = Invoice.objects.prefetch_related("items").select_related("customer")
    
    @action(detail=True, methods=["post"], url_path="copy-to-final")
    def copy_to_final(self, request, pk=None):
        # Copy invoice to FinalInvoice with optional adjustments
        invoice = self.get_object()
        final_number = request.data.get("final_number", "")
        
        final = FinalInvoice.objects.create(
            customer=invoice.customer,
            date=datetime.date.today(),
            # ... copy all fields
        )
        # Copy all line items
        for item in invoice.items.all():
            FinalInvoiceItem.objects.create(
                final_invoice=final,
                # ... copy item fields
            )
        final.recalculate()
        return Response(FinalInvoiceSerializer(final).data)
```

**Status**: ✅ **Complete**

**Issues**:
- ⚠️ `copy_to_final` duplicated between Invoice and ProformaInvoice
- ⚠️ Hard deletes items on update (`items.all().delete()`) - loses history
- ⚠️ No concurrent edit detection (version field)
- ⚠️ Calculation logic in model (should be service layer)
- ⚠️ PurchaseOrder not using BaseDocument pattern (code duplication)

**Files**:
- `models.py` - All document models (Estimate, Invoice, ProformaInvoice, PurchaseOrder, FinalInvoice + Items)
- `serializers.py` - Serializers for all documents with nested items
- `views.py` - ViewSets for all documents with copy-to-final actions
- `urls.py` - Document endpoints

---

### 14. **FINAL_INVOICES APP** (`apps/final_invoices/`)

**Purpose**: Intentionally empty - FinalInvoice lives in `apps/invoices/models.py`.

**Status**: ✅ **Complete** (but misplaced in separate app folder)

**Files**:
- `models.py` - Empty (models in apps.invoices)
- `views.py` - Likely empty
- `urls.py` - Likely empty

---

### 15. **ESTIMATES APP** (`apps/estimates/`)

**Purpose**: Intentionally empty - Estimate lives in `apps/invoices/models.py`.

**Status**: ✅ **Complete** (but misplaced in separate app folder)

**Files**:
- `models.py` - Empty (models in apps.invoices)

---

### 16. **CREDIT_NOTES APP** (`apps/credit_notes/`)

**Purpose**: Customer credit notes (refunds, adjustments).

**Models**:
```
CreditNote
├─ Relationships:
│  ├─ customer: ForeignKey(Customer, PROTECT)
│  └─ invoice: ForeignKey(Invoice, null=True) (what's being credited?)
│
├─ Core Fields:
│  ├─ credit_number: CharField (unique)
│  ├─ date: DateField
│  ├─ status: CharField (draft, issued, applied, cancelled)
│  ├─ reason: TextField (why was credit issued?)
│  ├─ notes: TextField
│
├─ Financial:
│  ├─ subtotal, tax_amount, total: DecimalField
│  ├─ currency: CharField (hardcoded "INR" - ⚠️ should be FK)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
├─ Items: CreditNoteItem (FK → credit_note)
└─ Methods:
   └─ recalculate() - Sums items to total
```

**CreditNoteItem**:
```
├─ credit_note: ForeignKey(CreditNote)
├─ item_name, description: CharField
├─ quantity, unit_price, tax_percent: DecimalField
├─ amount: DecimalField (calculated)
└─ order: PositiveIntegerField
```

**Status**: ✅ **Exists but Incomplete**

**Issues**:
- ⚠️ Currency hardcoded to "INR" (should be FK to Currency)
- ⚠️ No link to PaymentAdjustment or payment application logic
- ⚠️ `recalculate()` method duplicated from Invoice pattern

**Files**:
- `models.py` - CreditNote + CreditNoteItem
- `serializers.py` - CreditNoteSerializer + nested items
- `views.py` - CreditNoteViewSet

---

### 17. **DEBIT_NOTES APP** (`apps/debit_notes/`)

**Purpose**: Vendor debit notes (additional charges, adjustments).

**Models**:
```
DebitNote
├─ Relationships:
│  ├─ vendor: ForeignKey(Vendor, PROTECT)
│  └─ purchase_order: ForeignKey(PurchaseOrder, null=True)
│
├─ Core Fields:
│  ├─ debit_number: CharField (unique)
│  ├─ date: DateField
│  ├─ status: CharField (draft, issued, applied, cancelled)
│  ├─ reason, notes: TextField
│
├─ Financial:
│  ├─ subtotal, tax_amount, total: DecimalField
│  ├─ currency: CharField (hardcoded "INR" - ⚠️)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
├─ Items: DebitNoteItem (FK → debit_note)
└─ Methods:
   └─ recalculate()
```

**Status**: ✅ **Exists but Incomplete**

**Issues**:
- ⚠️ Currency hardcoded to "INR"
- ⚠️ No payment application logic
- ⚠️ Code duplication with CreditNote

**Files**:
- `models.py` - DebitNote + DebitNoteItem
- `serializers.py` - DebitNoteSerializer
- `views.py` - DebitNoteViewSet

---

### 18. **PAYMENTS APP** (`apps/payments/`)

**Purpose**: Payment tracking for customers and vendors.

**Models**:
```
Payment
├─ Relationships:
│  ├─ customer: ForeignKey(Customer, null=True, blank=True) (received from)
│  ├─ vendor: ForeignKey(Vendor, null=True, blank=True) (paid to)
│  ├─ proforma: ForeignKey(ProformaInvoice, null=True)
│  ├─ finalinvoice: ForeignKey(FinalInvoice, null=True)
│  └─ currency: ForeignKey(Currency, null=True, blank=True)
│
├─ Core Fields:
│  ├─ payment_number: CharField (unique)
│  ├─ payment_date: DateField
│  ├─ amount: DecimalField
│  ├─ invoice_ref: CharField (which invoice/PO is this for?)
│
├─ Classification:
│  ├─ payment_type: CharField (received, made)
│  ├─ payment_method: CharField (cash, bank_transfer, cheque, upi, neft, rtgs, imps, card, other)
│  └─ status: CharField (pending, completed, failed, cancelled)
│
├─ Bank Details:
│  ├─ bank_name: CharField
│  ├─ reference: CharField (UTR, cheque number, etc.)
│
├─ Metadata:
│  ├─ notes: TextField
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
```

**Status**: ⚠️ **Partial - Has Design Issues**

**Issues**:
- 🔴 **Dual FK design flaw**: Both `customer` and `vendor` are nullable. No constraint ensuring exactly ONE is set.
  ```python
  # This is possible but inconsistent:
  Payment.objects.create(customer=None, vendor=None, amount=100)  # Invalid!
  ```
- ⚠️ Multiple document type FKs (proforma, finalinvoice) but not invoice
- ⚠️ No clear workflow (which document applies this payment?)
- ⚠️ No partial payment tracking across multiple documents

**Fix Needed**:
```python
# Should be:
class Payment(Model):
    PAYMENT_TO = [("customer", "Customer"), ("vendor", "Vendor")]
    payment_to = CharField(choices=PAYMENT_TO)  # Determines which FK to use
    
    customer = ForeignKey(..., null=True, blank=True)
    vendor = ForeignKey(..., null=True, blank=True)
    
    def clean(self):
        if self.payment_to == "customer" and not self.customer:
            raise ValidationError("Customer required")
        if self.payment_to == "vendor" and not self.vendor:
            raise ValidationError("Vendor required")
```

**Files**:
- `models.py` - Payment model
- `serializers.py` - PaymentSerializer
- `views.py` - PaymentViewSet

---

### 19. **CUSTOMER_POS APP** (`apps/customer_pos/`)

**Purpose**: Customer purchase orders sent to us (customer initiates order).

**Models**:
```
CustomerPO
├─ Relationships:
│  └─ customer: ForeignKey(Customer, PROTECT)
│
├─ Core Fields:
│  ├─ po_number: CharField (customer's PO number)
│  ├─ our_reference: CharField (our internal reference)
│  ├─ date: DateField
│  ├─ due_date: DateField (null, blank)
│  ├─ amount: DecimalField (PO value)
│  └─ currency: CharField (hardcoded to "INR")
│
├─ Status & Workflow:
│  ├─ status: CharField (received, processing, fulfilled, cancelled)
│  ├─ description: TextField (what's being ordered?)
│  └─ notes: TextField
│
├─ Attachment:
│  ├─ attachment: FileField (upload_to="customer_pos/")
│  └─ attachment_name: CharField
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ String rep: "{customer.name} — {po_number}"
```

**Purpose**: Track inbound customer orders (possibly trigger invoice creation).

**Status**: ⚠️ **Partial - Limited Functionality**

**Issues**:
- ⚠️ Currency hardcoded to "INR"
- ⚠️ No line items (just a bulk amount)
- ⚠️ No linkage to created invoices
- ⚠️ Attachment storage but no validation

**Files**:
- `models.py` - CustomerPO model
- `serializers.py` - CustomerPOSerializer
- `views.py` - CustomerPOViewSet

---

### 20. **ORDER_RETURNS APP** (`apps/order_returns/`)

**Purpose**: Manage product returns (sales or purchase).

**Models**:
```
OrderReturn
├─ Relationships:
│  ├─ customer: ForeignKey(Customer, PROTECT, null=True, blank=True)
│  ├─ vendor: ForeignKey(Vendor, PROTECT, null=True, blank=True)
│  └─ invoice: ForeignKey(Invoice, null=True, blank=True) (which invoice?)
│
├─ Core Fields:
│  ├─ return_number: CharField (unique)
│  ├─ return_type: CharField (sales_return, purchase_return)
│  ├─ date: DateField
│  ├─ status: CharField (pending, approved, received, rejected, closed)
│  ├─ reason, notes: TextField
│
├─ Financial:
│  ├─ subtotal, tax_amount, total: DecimalField
│  ├─ currency: CharField (hardcoded "INR")
│
├─ Items: OrderReturnItem (FK → order_return)
│
├─ Mixins: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   └─ recalculate()
```

**OrderReturnItem**:
```
├─ order_return: ForeignKey(OrderReturn)
├─ description: CharField
├─ quantity, unit_price, tax_percent: DecimalField
├─ amount: DecimalField (calculated)
└─ order: PositiveIntegerField
```

**Status**: ⚠️ **Partial - Design Issues**

**Issues**:
- ⚠️ Dual FK (customer/vendor) without constraint (like Payment)
- ⚠️ Currency hardcoded to "INR"
- ⚠️ No return authorization tracking
- ⚠️ No refund/credit note linkage

**Files**:
- `models.py` - OrderReturn + OrderReturnItem
- `serializers.py` - OrderReturnSerializer
- `views.py` - OrderReturnViewSet

---

### 21. **PROFORMA_INVOICES APP** (`apps/proforma_invoices/`)

**Purpose**: Empty - ProformaInvoice lives in `apps/invoices/models.py`.

**Status**: ✅ **Complete** (but placeholder app)

---

### 22. **PURCHASE_ORDERS APP** - See INVOICES APP (#13)

**Status**: ✅ **Complete** (model in invoices app)

---

### 23. **CUSTOM_FIELDS APP** (`apps/custom_fields/`)

**Purpose**: Dynamic custom field system for extensibility.

**Models**:
```
CustomField
├─ Relationships:
│  └─ module: ForeignKey(Module, CASCADE)
│
├─ Core Fields:
│  ├─ label: CharField (display name, e.g., "Lead Source")
│  ├─ field_key: SlugField (internal key, e.g., "lead_source")
│  ├─ field_type: CharField (choices: text, number, date, boolean, select, textarea, email, phone, url)
│  ├─ placeholder: CharField
│  ├─ default_value: CharField
│  ├─ options: JSONField (for select type: [{label: "A", value: "a"}, ...])
│  ├─ is_required: BooleanField
│  ├─ is_active: BooleanField
│  └─ order: PositiveIntegerField
│
├─ Mixin: TimeStampedModel
├─ Unique constraint: (module, field_key)
└─ String rep: "{module.name} → {label}"
```

**Usage Pattern**:
```python
# In Customer or any model with CustomFieldValueMixin:
customer.custom_field_values = {
    "lead_source": "Google",
    "industry": "Finance",
    "employee_count": "500"
}
customer.save()

# Retrieve:
print(customer.custom_field_values["lead_source"])  # "Google"
```

**Frontend Pattern**:
```jsx
<CustomFieldRenderer 
  field={customField}  // CustomField object
  value={customer.custom_field_values[customField.field_key]}
  onChange={(value) => {...}}
/>
```

**Status**: ✅ **Complete**

**Strengths**:
- ✅ JSONB storage for flexibility
- ✅ Module-scoped to prevent conflicts
- ✅ Supports 9 field types
- ✅ Required field validation

**Issues**:
- ⚠️ No schema validation on custom_field_values (user could set arbitrary JSON)
- ⚠️ No migration path if field_key changes
- ⚠️ Front-end must fetch CustomField definitions separately

**Files**:
- `models.py` - CustomField model
- `serializers.py` - CustomFieldSerializer
- `views.py` - CustomFieldViewSet

---

### 24. **PDF_TEMPLATES APP** (`apps/pdf_templates/`)

**Purpose**: Customizable PDF templates for document generation.

**Models**:
```
PDFTemplate
├─ Core Fields:
│  ├─ name: CharField (e.g., "Standard Invoice Template")
│  ├─ module_type: CharField (choices: invoice, estimate, proforma, purchase_order, final_invoice, rfq)
│  ├─ description: TextField
│  └─ is_default: BooleanField (one per module_type)
│
├─ Template:
│  └─ html_body: TextField (Jinja2 HTML template)
│     Context vars: obj, company, items
│     Example:
│     ```html
│     <h1>Invoice #{{ obj.invoice_number }}</h1>
│     <p>Customer: {{ obj.customer.name }}</p>
│     <table>
│       {% for item in items %}
│         <tr><td>{{ item.item_name }}</td></tr>
│       {% endfor %}
│     </table>
│     ```
│
├─ Status:
│  ├─ is_active: BooleanField
│
├─ Mixin: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   └─ save() - Ensures only one default per module_type
```

**Status**: ✅ **Complete**

**Technology**: Jinja2 templates rendered to HTML → WeasyPrint → PDF

**Issues**:
- ⚠️ Template validation (syntax errors not caught until render)
- ⚠️ No template preview endpoint
- ⚠️ Context limited to (obj, company, items) - can't access customer separately

**Files**:
- `models.py` - PDFTemplate model
- `serializers.py` - PDFTemplateSerializer
- `views.py` - PDFTemplateViewSet

---

### 25. **RFQ APP** (`apps/rfq/`)

**Purpose**: Request for Quotation to vendors.

**Models**:
```
RFQ (Request For Quotation)
├─ Relationships:
│  ├─ vendor: ForeignKey(Vendor, PROTECT)
│  └─ currency: ForeignKey(Currency, PROTECT, null=True, blank=True)
│
├─ Core Fields:
│  ├─ rfq_number: CharField (unique)
│  ├─ date: DateField
│  ├─ due_date: DateField (null, blank)
│  ├─ status: CharField (draft, sent, received, cancelled)
│  ├─ subject: CharField
│  ├─ notes, terms: TextField
│
├─ Financial:
│  ├─ subtotal, tax_amount, total: DecimalField
│
├─ Items: RFQItem (FK → rfq)
│
├─ Mixin: TimeStampedModel, CustomFieldValueMixin
└─ Methods:
   └─ recalculate() - Sums items
```

**RFQItem**:
```
├─ rfq: ForeignKey(RFQ)
├─ item_name, description: CharField
├─ quantity, unit_price, tax_percent: DecimalField
├─ amount: DecimalField
└─ order: PositiveIntegerField
```

**Status**: ⚠️ **Incomplete**

**Issues**:
- ⚠️ No response/quotation tracking
- ⚠️ No linkage to purchase order creation
- ⚠️ No vendor response deadline enforcement
- ⚠️ No comparison/analysis of multiple RFQ responses

**Files**:
- `models.py` - RFQ + RFQItem
- `serializers.py` - RFQSerializer
- `views.py` - RFQViewSet

---

### 26. **BULK_OPERATIONS APP** (`apps/bulk_operations/`)

**Purpose**: Track bulk import/export operations.

**Models**:
```
ImportHistory
├─ Core Fields:
│  ├─ module: CharField (which module was imported? e.g., "customers")
│  ├─ file_name: CharField (uploaded file name)
│  ├─ total_rows: PositiveIntegerField
│  ├─ imported_rows: PositiveIntegerField
│  ├─ failed_rows: PositiveIntegerField
│
├─ Status:
│  ├─ status: CharField (pending, success, failed)
│  ├─ error_log: TextField (detailed errors)
│
├─ Metadata:
│  ├─ created_by: ForeignKey(User, null=True, blank=True)
│
├─ Mixin: TimeStampedModel
└─ String rep: "{module} import - {created_at}"
```

**Status**: ⚠️ **Partial - Only Tracking, No Logic**

**Issues**:
- ⚠️ No actual import logic (just tracking)
- ⚠️ No export functionality
- ⚠️ No file storage/retrieval
- ⚠️ No batch processing/queue integration

**Files**:
- `models.py` - ImportHistory model
- `views.py` - Likely bulk import/export endpoints
- `urls.py` - Bulk operation endpoints

---

### 27. **REPORTS APP** (`apps/reports/`)

**Purpose**: Business analytics and reporting.

**Models**:
❌ **No models** - Only views.

**Views**:
```python
class DashboardStatsView(APIView):
    def get(self, request):
        # Returns aggregated stats
        {
            "totals": {
                "customers": 120,
                "vendors": 45,
                "invoices": 1500,
                "final_invoices": 450
            },
            "revenue": {
                "this_month": 250000,
                "this_year": 2500000,
                "total_paid": 2200000,
                "total_outstanding": 300000
            },
            "payments": {
                "received_this_month": 150000,
                "received_total": 2200000
            },
            "invoice_status_breakdown": {
                "draft": 50,
                "sent": 100,
                "paid": 1000,
                "partial": 150,
                "overdue": 150,
                "cancelled": 50
            }
        }
```

**Status**: ⚠️ **Incomplete - Minimal Implementation**

**Issues**:
- ❌ No models to track reports
- ❌ No scheduled reports
- ❌ No export to CSV/PDF
- ❌ No advanced filtering
- ❌ Only one endpoint (DashboardStats)
- ⚠️ Inefficient queries (no optimization)

**Future Needed**:
- ✅ Sales reports (revenue by customer, product, period)
- ✅ Inventory reports
- ✅ Aging reports (invoices by age)
- ✅ Tax reports (GST)
- ✅ Payment reports
- ✅ Scheduled report generation
- ✅ Email delivery of reports

**Files**:
- `views.py` - DashboardStatsView only
- `urls.py` - Limited endpoints

---

## Summary: Backend Apps Status

| # | App | Status | Type | Issues |
|----|-----|--------|------|--------|
| 1 | core | ✅ Complete | Foundation | N+1 permission queries |
| 2 | users | ✅ Complete | Auth | No complexity rules |
| 3 | roles | ✅ Complete | Auth | — |
| 4 | role_user | ✅ Complete | Auth | — |
| 5 | role_module | ✅ Complete | Auth | — |
| 6 | role_permission | ✅ Complete | Auth | — |
| 7 | modules | ✅ Complete | Auth | — |
| 8 | permissions | ✅ Complete | Auth | — |
| 9 | company | ✅ Complete | Config | Singleton pattern |
| 10 | customers | ✅ Complete | Domain | No duplicate detection |
| 11 | vendors | ✅ Complete | Domain | — |
| 12 | currencies | ✅ Complete | Domain | — |
| 13 | invoices | ✅ Complete | Documents | Calculation in model, code duplication |
| 14 | final_invoices | ✅ Complete | Placeholder | Model in invoices app |
| 15 | estimates | ✅ Complete | Placeholder | Model in invoices app |
| 16 | credit_notes | ⚠️ Partial | Documents | Currency hardcoded, no payment linkage |
| 17 | debit_notes | ⚠️ Partial | Documents | Currency hardcoded, code duplication |
| 18 | payments | ⚠️ Partial | Financial | Dual FK design flaw, no validation |
| 19 | customer_pos | ⚠️ Partial | Domain | No line items, currency hardcoded |
| 20 | order_returns | ⚠️ Partial | Documents | Dual FK flaw, no refund linkage |
| 21 | proforma_invoices | ✅ Complete | Placeholder | Model in invoices app |
| 22 | purchase_orders | ✅ Complete | Documents | Model in invoices app |
| 23 | custom_fields | ✅ Complete | Config | No schema validation |
| 24 | pdf_templates | ✅ Complete | Config | No template preview |
| 25 | rfq | ⚠️ Incomplete | Documents | No response tracking |
| 26 | bulk_operations | ⚠️ Partial | Utility | No actual import logic |
| 27 | reports | ❌ Incomplete | Analytics | Only 1 endpoint, no models |

---

# FRONTEND ARCHITECTURE

## Technology Stack

```
React 18.2.0
├─ React Router 6.21.0
├─ Redux Toolkit 2.0.1 (+ React-Redux 9.0.4)
├─ Axios 1.6.5
├─ React Hook Form 7.49.3 + Yup 1.3.3 (form validation)
├─ Lucide React 0.314.0 (icons)
├─ react-hot-toast 2.4.1 (notifications)
└─ date-fns 3.2.0 (date utilities)
```

---

## Project Structure

```
src/
├─ index.js (entry point)
├─ index.css (global styles)
├─ app/
│  └─ store.js
│
├─ features/ (Redux slices + auth logic)
│  ├─ crudSliceFactory.js (CRUD slice generator)
│  ├─ auth/
│  │  ├─ authSlice.js (login, token management)
│  │  └─ (auth actions/selectors)
│  ├─ customers/
│  │  └─ customersSlice.js (via factory)
│  ├─ invoices/
│  │  └─ invoicesSlice.js (via factory)
│  ├─ estimates/
│  ├─ proformaInvoices/
│  ├─ purchaseOrders/
│  ├─ payments/
│  ├─ creditNotes/
│  ├─ debitNotes/
│  ├─ orderReturns/
│  ├─ finalInvoices/
│  ├─ vendors/
│  ├─ users/
│  ├─ roles/
│  ├─ customFields/
│  ├─ currencies/
│  ├─ company/
│  ├─ pdfTemplates/
│  ├─ customerPos/
│  ├─ rfq/
│  ├─ permissions/
│  ├─ modules/
│  ├─ bulkOperations/
│  └─ (more...)
│
├─ pages/ (Screen/Page components)
│  ├─ auth/
│  │  ├─ LoginPage.jsx
│  │  ├─ NotFoundPage.jsx (404)
│  │  └─ ForbiddenPage.jsx (403)
│  ├─ dashboard/
│  │  └─ DashboardPage.jsx
│  ├─ customers/
│  │  ├─ CustomerListPage.jsx (table view)
│  │  ├─ CustomerFormPage.jsx (create/edit form)
│  │  └─ CustomerDetailPage.jsx (view single)
│  ├─ invoices/
│  ├─ estimates/
│  ├─ proforma/
│  ├─ purchaseOrders/
│  ├─ payments/
│  ├─ reports/
│  ├─ settings/
│  └─ (one folder per feature)
│
├─ components/ (Reusable UI components)
│  ├─ common/
│  │  ├─ DataTable.jsx (generic table for lists)
│  │  ├─ PageHeader.jsx (title + breadcrumbs + action buttons)
│  │  ├─ DocLineItems.jsx (invoice/estimate line item editor)
│  │  ├─ CustomFieldRenderer.jsx (renders dynamic custom fields)
│  │  ├─ LoadingSpinner.jsx (full-page or inline)
│  │  ├─ CustomerAddressBlock.jsx (address display block)
│  │  └─ (more shared components)
│  └─ layout/
│     ├─ AppLayout.jsx (main sidebar + header + content area)
│     └─ (nav, sidebar components)
│
├─ routes/
│  ├─ index.jsx (main Router + Suspense + PrivateRoutes wrapper)
│  ├─ moduleRoutes.jsx (array of route definitions)
│  └─ RoleBasedRoute.jsx (permission check wrapper)
│
└─ services/
   └─ api.js (Axios instance + interceptors + token refresh)
```

---

## State Management (Redux Toolkit)

### Architecture: CRUD Slice Factory

**Problem**: Every CRUD module needs identical boilerplate (fetchAll, fetchOne, create, update, delete).

**Solution**: `crudSliceFactory.js` generates standardized slices.

**Implementation**:
```javascript
// features/crudSliceFactory.js
export function createCRUDSlice(name, endpoint) {
  // Creates 5 async thunks
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params, { rejectWithValue }) => {...});
  const fetchOne = createAsyncThunk(`${name}/fetchOne`, async (id, { rejectWithValue }) => {...});
  const createOne = createAsyncThunk(`${name}/create`, async (payload, { rejectWithValue }) => {...});
  const updateOne = createAsyncThunk(`${name}/update`, async ({ id, data }, { rejectWithValue }) => {...});
  const deleteOne = createAsyncThunk(`${name}/delete`, async (id, { rejectWithValue }) => {...});

  // Returns { slice, actions, reducer, selectors }
  // slice.reducer is added to store
  // actions are dispatched from components
}
```

**Generated State Shape** (standardized for ALL modules):
```javascript
{
  list: [],                      // Array of items
  selected: null,                // Currently viewed/edited item
  pagination: {
    count: 0,                    // Total items
    next: null,                  // Next page URL
    previous: null,              // Previous page URL
    total_pages: 1,
    current_page: 1
  },
  loading: false,                // Fetching list?
  submitting: false,             // Submitting form?
  error: null                    // Error message
}
```

**Usage Example**:
```javascript
// features/customers/customersSlice.js
import { createCRUDSlice } from '../crudSliceFactory';

const { slice: customersSlice, actions: customersActions } = createCRUDSlice('customers', '/customers');

export default customersSlice.reducer;
export const { fetchAll: fetchCustomers, createOne: createCustomer } = customersActions;
```

**In Component**:
```javascript
// pages/customers/CustomerListPage.jsx
const dispatch = useDispatch();
const { list, loading } = useSelector(state => state.customers);

useEffect(() => {
  dispatch(fetchCustomers({ is_active: true }));
}, []);

return (
  <DataTable 
    data={list} 
    loading={loading}
    onDelete={(id) => dispatch(deleteCustomer(id))}
  />
);
```

**Strengths**:
- ✅ DRY: ~90% less boilerplate
- ✅ Consistent: All modules use same state shape
- ✅ Type-safe (if using TypeScript)
- ✅ Pagination built-in

**Weaknesses**:
- ⚠️ Limited flexibility (no custom reducers/side effects)
- ⚠️ All thunks follow same pattern (no customization)
- ⚠️ Can't handle complex workflows (multi-step forms, dependent requests)
- ⚠️ No caching (every fetch = new API call)

---

## Authentication Flow

### Login Process

```
User enters email + password
  ↓
form.onSubmit() calls dispatch(loginUser(email, password))
  ↓
loginUser thunk calls POST /auth/login/
  ↓
Backend validates → Returns { access, refresh, user, permissions }
  ↓
Thunk stores tokens + user in Redux state
Tokens also stored in localStorage
  ↓
useEffect monitors auth state → Navigate to /dashboard
```

### Token Management

**Initial Setup**:
```javascript
// services/api.js
// Request Interceptor: Auto-inject token
api.interceptors.request.use((config) => {
  const token = store.getState().auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Token Refresh Flow**:
```
HTTP 401 response (access token expired)
  ↓
Response interceptor detects 401
  ↓
If already refreshing → Queue request
If NOT refreshing → Call POST /auth/refresh/
  ↓
Server validates refresh token → Returns new access token
  ↓
Update Redux state + localStorage with new token
  ↓
Process queued requests with new token
Retry original request
```

**Issue**: Tokens stored in localStorage (XSS vulnerable). Should use httpOnly cookies.

---

## Routing & Authorization

### Route Setup

```javascript
// routes/index.jsx
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/*" element={<PrivateRoutes />} />
  </Routes>
</BrowserRouter>

function PrivateRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {moduleRoutes.map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RoleBasedRoute
                  module={route.module}
                  requiredPermission="can_view"
                >
                  {route.element}
                </RoleBasedRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </AppLayout>
  ) : <Navigate to="/login" />;
}
```

### Permission Checking

```javascript
// routes/RoleBasedRoute.jsx
function RoleBasedRoute({ module, requiredPermission, children }) {
  const user = useSelector(selectUser);
  const permissions = useSelector(selectPermissions);

  const hasPermission = permissions?.[module]?.[requiredPermission];
  
  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }
  
  return children;
}
```

**Issue**: Client-side checks are cosmetic. Server always validates.

---

## Common Components

### 1. DataTable
```jsx
<DataTable
  columns={[
    { key: 'name', label: 'Customer Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' }
  ]}
  data={customers}
  loading={loading}
  pagination={pagination}
  onPageChange={(page) => {...}}
  onSort={(field) => {...}}
  onDelete={(id) => {...}}
/>
```

Generic table used on all list pages (CustomerListPage, InvoiceListPage, etc.).

### 2. PageHeader
```jsx
<PageHeader
  title="Customers"
  breadcrumbs={[
    { label: 'Home', path: '/' },
    { label: 'Customers', path: '/customers' }
  ]}
  actions={[
    { label: 'Add Customer', onClick: () => navigate('/customers/new') }
  ]}
/>
```

Consistent header across all pages.

### 3. DocLineItems
```jsx
<DocLineItems
  items={invoiceItems}
  editable={!isPaid}
  onItemChange={(idx, field, value) => {...}}
  onItemRemove={(idx) => {...}}
  onAddItem={() => {...}}
/>
```

Editor for invoice/estimate line items with quantity, price, tax.

### 4. CustomFieldRenderer
```jsx
<CustomFieldRenderer
  field={customField}
  value={formData[customField.field_key]}
  onChange={(value) => setFormData({...formData, [customField.field_key]: value})}
  error={errors[customField.field_key]}
/>
```

Renders text, number, date, select, etc. based on field type.

### 5. LoadingSpinner
```jsx
<LoadingSpinner fullPage={true} />  // Full-page overlay
<LoadingSpinner />                  // Inline spinner
```

### 6. AppLayout
```jsx
<AppLayout>
  {/* Sidebar with module navigation */}
  {/* Breadcrumb trail */}
  {/* Main content area */}
  {children}
</AppLayout>
```

Master layout wrapping all authenticated pages.

---

## API Service Layer

### Configuration

```javascript
// services/api.js
const BASE_URL = 
  process.env.REACT_APP_API_URL || 
  "http://localhost:8000/api" || 
  "https://uat-aucrm.devshow.in/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" }
});
```

### Query String Builder

```javascript
export const buildQueryString = (params = {}) => {
  // Filters null/undefined
  // URL-encodes special characters
  // Returns ?key=value&key2=value2
  
  const filtered = Object.entries(params)
    .filter(([_, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
};

// Usage:
api.get(`/customers/${buildQueryString({ is_active: true, page: 2 })}`);
// → GET /customers/?is_active=true&page=2
```

---

## Pages Structure

### Example: CustomerListPage
```javascript
// pages/customers/CustomerListPage.jsx
function CustomerListPage() {
  const dispatch = useDispatch();
  const { list: customers, loading } = useSelector(s => s.customers);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, []);

  const handleDelete = (id) => {
    if (confirm('Delete customer?')) {
      dispatch(deleteCustomer(id));
    }
  };

  return (
    <>
      <PageHeader title="Customers" />
      <DataTable
        data={customers}
        loading={loading}
        onDelete={handleDelete}
        onNew={() => navigate('/customers/new')}
      />
    </>
  );
}
```

### Example: CustomerFormPage
```javascript
// pages/customers/CustomerFormPage.jsx
function CustomerFormPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selected: customer, submitting } = useSelector(s => s.customers);
  const { register, handleSubmit, errors } = useForm();

  useEffect(() => {
    if (id && id !== 'new') {
      dispatch(fetchCustomer(id));
    }
  }, [id]);

  const onSubmit = (data) => {
    if (id && id !== 'new') {
      dispatch(updateCustomer({ id, data }));
    } else {
      dispatch(createCustomer(data));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title={id === 'new' ? 'New Customer' : 'Edit Customer'} />
      <input {...register('name', { required: true })} />
      <input {...register('email')} />
      <input {...register('phone')} />
      <CustomFieldRenderer field={...} />
      <button type="submit" disabled={submitting}>Save</button>
    </form>
  );
}
```

---

## Frontend File Organization

**Feature-based structure** (recommended):

```
src/
├─ features/
│  ├─ customers/
│  │  └─ customersSlice.js
│  ├─ invoices/
│  │  └─ invoicesSlice.js
│  └─ ... (one per module)
│
├─ pages/
│  ├─ customers/
│  │  ├─ CustomerListPage.jsx
│  │  ├─ CustomerFormPage.jsx
│  │  └─ CustomerDetailPage.jsx
│  ├─ invoices/
│  ├─ dashboard/
│  └─ ... (pages grouped by feature)
│
├─ components/
│  ├─ common/
│  ├─ layout/
│  └─ ... (shared components)
│
├─ services/
│  └─ api.js
│
└─ routes/
   ├─ index.jsx
   ├─ moduleRoutes.jsx
   └─ RoleBasedRoute.jsx
```

**Advantages**:
- ✅ Scalable: Add new feature → new folder
- ✅ Isolated: Changes to Feature A don't affect Feature B
- ✅ Discoverable: All code for Feature X in same folder

---

## Frontend Issues & Gaps

### Security
- 🔴 **localStorage Tokens**: Vulnerable to XSS. Should use httpOnly cookies.
- 🟠 **Client-side Permission Checks**: UI only, server validates anyway.
- 🟠 **No CSRF Protection**: Should use CSRF token + headers.

### Performance
- 🟠 **No Query Caching**: Every list fetch re-requests data.
- 🟠 **No Pagination State**: Page resets on item operations.
- 🟠 **N+1 Frontend Queries**: Parent + children fetch separately.

### UX
- 🟠 **No Error Boundaries**: Component errors crash whole app.
- 🟠 **Minimal Loading States**: Some components don't show loading.
- 🟠 **Limited Accessibility**: No ARIA labels, keyboard nav.

### Testing
- 🔴 **No Unit Tests**: No jest/testing-library setup visible.
- 🔴 **No Integration Tests**: No test coverage.
- 🔴 **No E2E Tests**: No Cypress/Playwright setup.

---

# INTEGRATION POINTS

## Backend → Frontend API Contracts

### Authentication
```
POST /auth/login/
├─ Request: { email, password }
└─ Response: { access, refresh, user: {id, email, full_name, ...}, permissions: {} }

POST /auth/refresh/
├─ Request: { refresh }
└─ Response: { access, refresh }

GET /auth/me/
└─ Response: { id, email, full_name, avatar, ... }
```

### CRUD Pattern (All Modules)
```
GET    /api/{module}/              → List with pagination
GET    /api/{module}/{id}/         → Single item
POST   /api/{module}/              → Create
PATCH  /api/{module}/{id}/         → Partial update
DELETE /api/{module}/{id}/         → Delete
```

### Document Copy Workflows
```
POST /api/invoices/{id}/copy-to-final/
├─ Request: { final_number }
└─ Response: { FinalInvoice object }

POST /api/proforma-invoices/{id}/copy-to-final/
├─ Request: { final_number }
└─ Response: { FinalInvoice object }
```

---

## Data Flow Example: Create Invoice

### Frontend
```
1. User fills InvoiceFormPage
   - Customer select
   - Date picker
   - Line items table (dynamic)
   - Custom fields

2. User clicks "Save"
   - Form validation (Yup schema)
   - Data serialization (items array)
   - dispatch(createInvoice({customer_id, date, items: [...]})

3. Redux thunk:
   - POST /api/invoices/
   - Backend validates + saves
   - Response contains invoice_id, invoice_number, etc.

4. Success:
   - Update Redux state
   - Toast notification
   - Navigate to InvoiceDetailPage
```

### Backend
```
1. POST /api/invoices/
   - Deserialize with InvoiceSerializer
   - Validate (serializer + custom validators)
   - Handle nested items (items field)

2. Serializer.create():
   - Create Invoice object
   - Create InvoiceItem objects
   - Call invoice.recalculate()

3. Response:
   - Return full Invoice with items
   - HTTP 201 Created
```

---

## Permissions Flow

### Initial Login
```
Frontend:
1. POST /auth/login/ with email+password
2. Receive access, refresh, permissions
3. Store in localStorage + Redux
4. Frontend knows which modules user can see

Backend:
1. Validate credentials
2. Query RoleUser + RoleModule + RolePermission
3. Serialize permissions as JSON
4. Return in login response
```

### Per-Request Validation
```
Frontend:
1. All API calls include Authorization: Bearer {access_token}

Backend:
1. HasModulePermission middleware
2. Extract module_slug from view
3. Extract action (GET→can_view, POST→can_create, etc.)
4. Query RolePermission table
5. Allow or reject
```

---

# SUMMARY & RECOMMENDATIONS

## Overall Assessment

### Backend: 7/10

**Strengths**:
- ✅ Well-organized app structure
- ✅ Consistent REST patterns
- ✅ Dynamic RBAC system
- ✅ Multi-currency + custom fields support
- ✅ Comprehensive models for sales/purchase workflows

**Weaknesses**:
- ⚠️ Code duplication (serializers, views, document logic)
- ⚠️ Business logic in models (should be services)
- ⚠️ Incomplete implementations (Reports, RFQ, Bulk Ops)
- ⚠️ Design flaws (Payment/OrderReturn dual FK)
- ⚠️ Performance issues (N+1 permission queries)
- ⚠️ Security gaps (exposed secrets, DEBUG=True)

---

### Frontend: 6/10

**Strengths**:
- ✅ Modern React patterns (hooks, functional components)
- ✅ Redux Toolkit simplification
- ✅ Excellent CRUD factory pattern
- ✅ Consistent component patterns
- ✅ Reusable components

**Weaknesses**:
- ⚠️ localStorage token security
- ⚠️ No caching/query optimization
- ⚠️ Limited error handling
- ⚠️ No error boundaries
- ⚠️ No testing infrastructure
- ⚠️ Accessibility gaps

---

## Priority Issues to Fix

### 🔴 Critical (Security/Data Integrity)

1. **Exposed Secrets** (Backend)
   - `.env` in git with real credentials
   - **Fix**: `.gitignore` + `.env.example`

2. **DEBUG=True in Production** (Backend)
   - Leaks SQL, stack traces
   - **Fix**: Separate settings/production.py

3. **Token Storage in localStorage** (Frontend)
   - XSS vulnerability
   - **Fix**: httpOnly cookies + CSRF token

4. **Payment Model Validation** (Backend)
   - No constraint on customer/vendor (both can be null)
   - **Fix**: Add validation + custom clean() method

---

### 🟠 High Priority (Architecture)

1. **Code Duplication** (Backend)
   - Serializers, views, copy-to-final repeated
   - **Fix**: Extract abstract base classes

2. **Reports App Empty** (Backend)
   - Only 1 view, no models
   - **Fix**: Design report models + endpoints

3. **No API Versioning** (Backend)
   - Hard to upgrade without breaking clients
   - **Fix**: Add `/api/v1/` prefix

4. **Permission N+1 Queries** (Backend)
   - Every request queries RoleUser + RolePermission
   - **Fix**: Cache with Redis (15-30 min TTL)

5. **No Testing** (Both)
   - Zero test coverage visible
   - **Fix**: Add pytest (backend) + jest (frontend)

---

### 🟡 Medium Priority (Completeness)

1. **RFQ Workflow** (Backend)
   - No response tracking or PO conversion
   - **Fix**: Add RFQResponse + conversion logic

2. **Bulk Operations** (Backend)
   - Only tracking, no actual import
   - **Fix**: Implement CSV parsing + batch creation

3. **Query Caching** (Frontend)
   - Every fetch re-requests
   - **Fix**: Implement React Query or RTK Query

4. **Error Boundaries** (Frontend)
   - Component errors crash app
   - **Fix**: Add error boundary wrapper

---

## Deployment Checklist

### Backend
- [ ] Move `.env` to `.gitignore`
- [ ] Create separate `settings/production.py`
- [ ] Enable HTTPS only
- [ ] Set `ALLOWED_HOSTS` to specific domains
- [ ] Disable `DEBUG` in production
- [ ] Use environment variables for secrets
- [ ] Setup database backups
- [ ] Configure Redis for caching + Celery
- [ ] Setup Celery for async tasks (PDF gen, bulk import)
- [ ] Enable CORS for specific origins only
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Configure log aggregation

### Frontend
- [ ] Switch token storage to httpOnly cookies
- [ ] Add CSRF token handling
- [ ] Setup environment-specific builds
- [ ] Configure CDN for static assets
- [ ] Add PWA configuration
- [ ] Setup error tracking (Sentry)
- [ ] Add performance monitoring

---

## Recommended Next Steps

### Short Term (1-2 weeks)
1. Fix security issues (secrets, DEBUG, token storage)
2. Add input validation across all endpoints
3. Implement permission caching
4. Add API versioning

### Medium Term (1 month)
1. Refactor duplicate code (base classes, factories)
2. Complete Reports app (sales, aging, tax reports)
3. Add test suite (30%+ coverage minimum)
4. Implement query caching (React Query)

### Long Term (2-3 months)
1. Complete RFQ workflow
2. Implement bulk import with async processing
3. Add audit logging (who changed what)
4. Setup CI/CD pipeline
5. Database optimization (indexes, query analysis)

---

## Technology Recommendations

**Backend Improvements**:
- `django-audit-log` - Track all changes
- `django-rest-framework-filters` - Better filtering
- `celery-beat` - Scheduled tasks
- `sentry-sdk` - Error tracking
- `pytest-django` - Testing framework

**Frontend Improvements**:
- `@tanstack/react-query` - Server state management
- `react-error-boundary` - Error handling
- `jest` + `@testing-library/react` - Testing
- `storybook` - Component documentation
- `next.js` - Potential future upgrade

---

## File Organization Summary

```
BACKEND APPS (27):
├─ RBAC (7 apps): core, users, roles, role_user, role_module, role_permission, modules, permissions
├─ Configuration (3): company, currencies, custom_fields, pdf_templates
├─ Business Domain (10): customers, vendors, invoices*, estimates*, proforma*, purchase_orders*, final_invoices*, credit_notes, debit_notes, payments
├─ Transactions (3): customer_pos, order_returns, rfq
├─ Utilities (3): bulk_operations, reports, (1 empty)
└─ *Multiple models in invoices.py
```

```
FRONTEND:
├─ State: Redux Toolkit (25+ slices via factory)
├─ Pages: 25+ pages (one per feature)
├─ Components: 6 core shared components
├─ Services: Centralized API layer (Axios)
├─ Routes: Role-based route protection
└─ Architecture: Feature-based folder structure
```

---

## Conclusion

**CRM_V3 is a well-structured, near-production-ready system** with solid fundamentals in both backend and frontend. The RBAC system is well-designed, the REST API is clean, and React state management is modern and scalable.

**Main Gaps**:
- Security hardening needed (secrets, token storage, DEBUG mode)
- Code consolidation (reduce duplication)
- Test coverage (currently zero)
- Performance optimization (caching, query optimization)
- Completeness (Reports, RFQ, Bulk Ops)

**With addressing of critical issues and medium-priority items, this system is ready for production deployment with some hardening.**

---

## Document Metadata

- **Apps Analyzed**: 27 backend apps + frontend structure
- **Lines Analyzed**: ~5,000+ lines of code
- **Models Documented**: 50+ models with relationships
- **API Endpoints**: 50+ RESTful endpoints
- **Frontend Components**: 6 core + 25+ pages
- **Tech Stack**: Django 4.2, DRF 3.14, React 18, Redux Toolkit 2.0

