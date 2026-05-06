# Management Commands

This directory contains custom Django management commands for the CRM system initialization and operations.

## Available Commands

### 1. create_superadmin

Create the first superadmin user with all system permissions.

**Usage:**
```bash
# Using defaults (username: superadmin, email: admin@example.com, password: admin123)
python manage.py create_superadmin

# Using custom credentials
python manage.py create_superadmin \
  --username=admin \
  --email=superadmin@company.com \
  --password=SecurePassword123! \
  --first-name=John \
  --last-name=Doe
```

**Options:**
- `--username` (default: superadmin) - Superadmin username
- `--email` (default: admin@example.com) - Superadmin email address
- `--password` (default: admin123) - Superadmin password
- `--first-name` (default: Super) - First name
- `--last-name` (default: Admin) - Last name

**What it does:**
1. Creates Django superuser account
2. Creates/fetches "super_admin" Role
3. Assigns ALL modules and permissions to role
4. Links user to role via RoleUser
5. Outputs login credentials and access points

**Output Example:**
```
✅ Superuser created successfully!
   Username: superadmin
   Email: admin@example.com
   Password: admin123
   Name: Super Admin

✅ Super Admin role created!
✅ Assigned 154 permissions to Super Admin role!
✅ Super Admin role assigned to user!

============================================================
🎉 SUPERADMIN SETUP COMPLETE!
============================================================

📝 You can now login with:
   Username: superadmin
   Email: admin@example.com
   Password: admin123

🌐 Access points:
   Admin Panel: http://localhost:8000/admin/
   API Docs: http://localhost:8000/api/docs/
   API Schema: http://localhost:8000/api/schema/

💡 Tip: Change password after first login!
============================================================
```

**Error Handling:**
- ✅ Checks if user already exists
- ✅ Prevents duplicate superadmin creation
- ✅ Handles role creation idempotently
- ✅ Validates all module/permission assignments

---

## Post-Setup Steps

After running `create_superadmin`:

1. **Access Admin Panel**
   ```
   http://localhost:8000/admin/
   ```

2. **Login with provided credentials**

3. **Change password** (recommended)
   - Go to Account Settings (top right)
   - Change password to something secure
   - Logout and test new password

4. **Create additional users**
   - Go to Users section
   - Add new users and assign roles

5. **Test API Access**
   ```bash
   curl -X GET http://localhost:8000/api/customers/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## Command Reference

### View all available commands
```bash
python manage.py help
```

### Get help for specific command
```bash
python manage.py help create_superadmin
```

---

## Implementation Details

### Database Transactions
- All operations use Django transactions
- Atomic: Either all succeed or all fail
- No partial/corrupted state

### RBAC Integration
The command integrates with the Role-Based Access Control system:

```
User
  ↓
RoleUser (user → role)
  ↓
Role (Super Admin)
  ↓
RolePermission (role → module → permission)
  ↓
Permissions (view, add, edit, delete, export, etc.)
```

### Permission Assignment
- Assigns ALL permissions from ALL modules
- Covers: view, add, edit, delete, custom actions
- Ensures superadmin has complete system access

---

## Troubleshooting

### "User with email 'xxx' already exists!"
The superadmin already exists with that email. Either:
- Use different email with `--email` flag
- Use different username with `--username` flag
- Delete existing user: `python manage.py shell`
  ```python
  from apps.users.models import User
  User.objects.get(email='xxx').delete()
  ```

### "User with username 'xxx' already exists!"
The username is already taken. Use different username:
```bash
python manage.py create_superadmin --username=admin2
```

### Command hangs or is slow
- Usually due to many modules/permissions
- System is assigning all permissions (can take 5-10 seconds)
- This is normal, let it complete

### Can't login after creation
- Verify email/password in terminal output
- Check if Django server is running
- Try accessing http://localhost:8000/admin/
- Check browser console for errors

---

## Best Practices

✅ **DO:**
- Run this command once for initial setup
- Use custom credentials in production
- Change password after first login
- Document admin credentials securely
- Create additional users for different roles

❌ **DON'T:**
- Don't use default credentials in production
- Don't run command multiple times (already exists check)
- Don't share superadmin credentials
- Don't use superadmin for everyday operations

---

## Related Documentation

- [Admin Panel Setup Guide](../ADMIN_PANEL_SETUP.md)
- [RBAC System Documentation](../../docs/RBAC_SYSTEM.md)
- [User Management Guide](../../docs/USER_MANAGEMENT.md)
