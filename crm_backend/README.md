# CRM Backend — Django REST API

Full-stack CRM with Role-Based Access Control (RBAC), document management, and reporting.

## 🚀 Quick Setup

### 1. Prerequisites
- Python 3.10+
- PostgreSQL 14+
- pip

### 2. Install dependencies
```bash
cd crm_backend
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — at minimum set DB_NAME, DB_USER, DB_PASSWORD
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE crm_db;
```

### 5. Run migrations
```bash
python manage.py migrate
```

### 6. Seed initial data
```bash
python manage.py seed
# Creates: permissions, modules, currencies, Administrator role, superuser
# Default login: admin@crm.com / Admin@123
```

### 7. Start server
```bash
python manage.py runserver
```

API runs at: http://127.0.0.1:8000/api/

## 📋 Modules

| Module | Endpoint |
|--------|----------|
| Auth (JWT) | /api/auth/ |
| Customers | /api/customers/ |
| Vendors | /api/vendors/ |
| RFQ | /api/rfq/ |
| Estimates | /api/estimates/ |
| Invoices | /api/invoices/ |
| Proforma Invoices | /api/proforma-invoices/ |
| Purchase Orders | /api/purchase-orders/ |
| Final Invoices | /api/final-invoices/ |
| Credit Notes | /api/credit-notes/ |
| Debit Notes | /api/debit-notes/ |
| Payments | /api/payments/ |
| Order Returns | /api/order-returns/ |
| Currencies | /api/currencies/ |
| Reports | /api/reports/ |
| Company Settings | /api/company/ |
| PDF Templates | /api/pdf-templates/ |
| Custom Fields | /api/custom-fields/ |
| Bulk Operations | /api/bulk/ |
| Roles | /api/roles/ |
| Users | /api/auth/users/ |

## 🔑 Copy Invoice to Final Invoice
- `POST /api/invoices/{id}/copy-to-final/` with `{"final_number": "FIN-001"}`
- `POST /api/proforma-invoices/{id}/copy-to-final/` with `{"final_number": "FIN-001"}`

## 📧 Email Setup
New user credentials are sent by email. If SMTP fails, credentials print to console.
For Gmail, use an **App Password** (not your regular password).

## 🌐 API Docs
Visit http://127.0.0.1:8000/api/docs/ for Swagger UI (when DEBUG=True)
