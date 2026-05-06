# Django Admin Panel Setup Guide

**Date**: May 5, 2026  
**Status**: ✅ READY TO USE  
**Access URL**: `http://localhost:8000/admin/`

---

## 🚀 Quick Start - Create First Superadmin

### Option 1: Using Management Command (RECOMMENDED)

```bash
python manage.py create_superadmin
```

This creates a superadmin with:
- **Username**: superadmin
- **Email**: admin@example.com
- **Password**: admin123
- **All permissions** across all modules
- **Super Admin role** assigned

### Option 2: Custom Credentials

```bash
python manage.py create_superadmin \
  --username=your-username \
  --email=your-email@example.com \
  --password=your-password \
  --first-name=Your \
  --last-name=Name
```

### Option 3: Interactive (Django Default)

```bash
python manage.py createsuperuser
```

Then you'll be prompted:
```
Username: admin
Email address: admin@example.com
Password: ••••••••
Password (again): ••••••••
First Name: Super
Last Name: Admin
Superuser created successfully.
```

**Note**: If using Option 3, you'll still need to assign roles and permissions manually via the admin panel or by running Option 1/2 with different credentials afterward.

---

## 📝 Login to Admin Panel

1. **Start Django Server**
   ```bash
   python manage.py runserver
   ```

2. **Open Admin URL**
   ```
   http://localhost:8000/admin/
   ```

3. **Login with Credentials**
   - **Username**: superadmin (or your custom username)
   - **Email**: admin@example.com (or your custom email)
   - **Password**: admin123 (or your custom password)

---

## 🎯 Admin Panel Features

### User Management
**Path**: `/admin/users/user/`

**Manage**:
- Create/edit users
- Set password
- Assign roles
- Mark as staff/superuser
- View user activity timestamps

**Columns**:
- Email
- First Name / Last Name
- Is Staff / Is Superuser
- Created Date
- Last Login

---

### Role Management
**Path**: `/admin/roles/role/`

**Manage**:
- Create custom roles
- Define role descriptions
- Auto-generate slug from name
- View all roles in list

**Example Roles**:
- Super Admin (all permissions)
- Manager (view/create/edit operations)
- Accountant (financial module access)
- Sales Executive (customers/invoices only)
- Viewer (read-only access)

---

### Module Management
**Path**: `/admin/modules/module/`

**Manage**:
- List all system modules
- View module descriptions
- Auto-generate slug from name

**Built-in Modules**:
- Customers
- Invoices
- Purchase Orders
- Payments
- Reports
- Delivery Notes
- And 20+ more...

---

### Permission Management
**Path**: `/admin/permissions/permission/`

**Manage**:
- Define permissions
- Standard permissions: view, add, edit, delete
- Custom permissions: export, approve, reconcile

**Permission Types**:
- `can_view_*` - View records
- `can_add_*` - Create new records
- `can_edit_*` - Modify records
- `can_delete_*` - Remove records
- `can_export_*` - Export data
- Custom - Approval, reconciliation, etc.

---

### Role-User Assignment
**Path**: `/admin/role_user/roleuser/`

**Manage**:
- Assign roles to users
- One user can have multiple roles
- Permissions combine from all roles

**Example**:
```
User: john@example.com
  → Manager role (view/edit operations)
  → Accountant role (financial access)
  → Combined: All manager + accountant permissions
```

---

### Role-Module Assignment
**Path**: `/admin/role_module/rolemodule/`

**Manage**:
- Link roles to modules
- Define which modules each role can access
- Granular access control

---

### Role-Permission Assignment
**Path**: `/admin/role_permission/rolepermission/`

**Manage**:
- Assign specific permissions to roles
- Per-module permission control
- Fine-grained access matrix

**Assignment Example**:
```
Role: Sales Manager
  Module: Customers → Permissions: view, add, edit
  Module: Invoices → Permissions: view, add, edit
  Module: Payments → Permissions: view only
  Module: Reports → Permissions: view, export
```

---

## 📊 Access Control Matrix

### Super Admin Role
```
✅ All Modules
✅ All Permissions
✅ Full System Access
```

### Manager Role (Example)
```
Customers    → view, add, edit
Invoices     → view, add, edit
POs          → view, edit
Reports      → view, export
Payments     → view only
```

### Accountant Role (Example)
```
Invoices     → view, add, edit
Payments     → view, add, edit
Credit Notes → view, add, edit
Reports      → view, export
```

### Sales Team (Example)
```
Customers    → view, add, edit
Invoices     → view, add
Estimates    → view, add, edit
Reports      → view only
```

---

## 🔐 Security Best Practices

### Password Management
- ✅ Set strong passwords (min 8 chars, mixed case, numbers, symbols)
- ✅ Change default password after first login
- ✅ Never share admin credentials
- ✅ Use different passwords for production

### User Management
- ✅ Create role-based accounts (don't share accounts)
- ✅ Use email as username (traceable activity)
- ✅ Disable staff access for inactive users
- ✅ Regularly audit user permissions

### Audit Trail
- ✅ Django logs all admin actions
- ✅ Check creation/modification dates
- ✅ Review "Last Login" column
- ✅ Monitor superuser activities

---

## 📱 Admin Panel Navigation

### Sidebar Menu
```
Home
├── Users
├── Roles
├── Modules
├── Permissions
├── Role-User
├── Role-Module
└── Role-Permission
```

### Search & Filter
- **Search**: Top right search box
  - Search users by email
  - Search roles by name
  - Search modules by slug

- **Filter**: Right sidebar
  - Filter by creation date
  - Filter by role/module
  - Filter by status

---

## 🛠️ Common Admin Tasks

### 1. Create New User

```
1. Go to /admin/users/user/
2. Click "+ Add User" (top right)
3. Enter email and temporary password
4. Click "Save"
5. User will receive login instructions
```

### 2. Assign Role to User

```
1. Go to /admin/role_user/roleuser/
2. Click "+ Add Role User"
3. Select User (dropdown)
4. Select Role (dropdown)
5. Click "Save"
```

### 3. Create Custom Role

```
1. Go to /admin/roles/role/
2. Click "+ Add Role"
3. Enter role name (e.g., "Analyst")
4. Description: (e.g., "Can view reports and data")
5. Click "Save"
6. Then assign permissions via Role-Permission
```

### 4. Assign Permissions to Role

```
1. Go to /admin/role_permission/rolepermission/
2. Click "+ Add Role Permission"
3. Select Role (e.g., "Analyst")
4. Select Module (e.g., "Reports")
5. Select Permission (e.g., "can_view_reports")
6. Click "Save"
7. Repeat for all module-permission combinations
```

### 5. Reset User Password

```
1. Go to /admin/users/user/
2. Click on user email
3. Look for "Password" field
4. Click "Change password" link
5. Enter new password and save
6. User can login with new password
```

### 6. Disable User Access

```
1. Go to /admin/users/user/
2. Click on user email
3. Uncheck "Is Active" checkbox
4. Click "Save"
5. User cannot login (access denied)
```

---

## 🔍 Viewing User Activity

### Last Login
- Column shows when user last logged in
- Helps identify inactive users
- Plan for deactivation/removal

### Created At / Updated At
- Track user account creation date
- Monitor when roles were assigned
- Audit trail for compliance

---

## 📊 User Statistics

Check dashboard for:
- Total users count
- Active vs inactive users
- Users per role
- Last 10 modified users

---

## ⚠️ Troubleshooting

### Can't Access Admin Panel
```
❌ Check if Django server is running
   python manage.py runserver

❌ Check if you're superuser
   From shell: User.objects.get(email="admin@example.com").is_superuser
   
❌ Check if email is correct
   Login email must match exactly (case-sensitive)
```

### User Can't Login
```
❌ Check if "Is Active" is checked
❌ Verify password is correct
❌ Check if account is marked as staff
❌ Verify permissions are assigned
```

### Permissions Not Working
```
❌ Check if role is assigned to user
   Go to /admin/role_user/roleuser/
   
❌ Check if permissions are assigned to role
   Go to /admin/role_permission/rolepermission/
   
❌ Check if permissions cache needs refresh
   May take 30 seconds to apply
```

---

## 🚀 Production Deployment

### Before Going Live

```
✅ Create unique superadmin account
   Different from development credentials
   
✅ Configure email settings
   For password reset emails
   
✅ Enable HTTPS
   Admin panel MUST use HTTPS
   
✅ Configure allowed hosts
   Add production domain to ALLOWED_HOSTS
   
✅ Set DEBUG=False
   Never use DEBUG=True in production
   
✅ Configure backups
   Admin data is critical
```

### Admin URL for Production

```
https://yourdomain.com/admin/
```

---

## 📚 File Structure

```
apps/
├── core/
│   ├── admin.py ← Admin configurations
│   ├── management/
│   │   ├── commands/
│   │   │   └── create_superadmin.py ← Create admin command
│   ├── models.py
│   └── ...
├── users/
│   ├── models.py ← User model
│   └── ...
├── roles/
│   ├── models.py ← Role model
│   └── ...
└── ...
```

---

## 📝 Default Admin Configuration

**Apps Registered**:
- Users
- Roles
- Modules
- Permissions
- Role-User
- Role-Module
- Role-Permission

**Features**:
- ✅ Search across all resources
- ✅ Bulk delete operations
- ✅ Date-based filtering
- ✅ Auto-timestamping
- ✅ Readonly fields (created_at, updated_at)

---

## 🎓 Django Admin Tips

### Search Tips
- Use AND/OR in search box
- Search multiple fields simultaneously
- Click column header to sort

### Filtering Tips
- Click filter values on right
- Combine multiple filters
- Use date range filters

### Bulk Operations
- Check boxes on left
- Select action from dropdown
- Apply to selected

### Export Data
- Some admins support CSV export
- Check action dropdown

---

## 🔗 Related URLs

```
Admin Panel:        http://localhost:8000/admin/
API Documentation:  http://localhost:8000/api/docs/
API Schema:         http://localhost:8000/api/schema/
API Customers:      http://localhost:8000/api/customers/
API Users:          http://localhost:8000/api/auth/
```

---

## ✨ Summary

| Feature | Status |
|---------|--------|
| User Management | ✅ Complete |
| Role Management | ✅ Complete |
| Permission Control | ✅ Complete |
| Superadmin Creation | ✅ Complete |
| Admin UI | ✅ Django Built-in |
| Search & Filter | ✅ Enabled |
| Date Filtering | ✅ Enabled |
| Bulk Operations | ✅ Enabled |

---

**Status**: ✅ **PRODUCTION READY**  
**Created**: May 5, 2026  
**Access**: http://localhost:8000/admin/
