# CRM Frontend — React + Redux

## 🚀 Quick Setup

### 1. Install dependencies
```bash
cd crm_frontend
npm install
```

### 2. Start development server
```bash
npm start
```

Runs at: http://localhost:3000

The app proxies API calls to http://localhost:8000 (Django backend).

## 📦 Key Dependencies
- React 18, React Router 6
- Redux Toolkit + React-Redux
- React Hook Form
- Axios (API calls)
- MUI Icons (@mui/icons-material)

## 🗂️ Project Structure
```
src/
  app/store.js              # Redux store
  features/                 # Redux slices (one per module)
  pages/                    # Page components
  components/
    common/                 # DataTable, PageHeader, DocLineItems, LoadingSpinner
    layout/AppLayout.jsx    # Sidebar + main layout
  routes/
    index.jsx               # Router setup
    moduleRoutes.jsx        # All page routes
  services/api.js           # Axios instance
```

## 🔐 Login
Default credentials (after running `python manage.py seed` on backend):
- Email: admin@crm.com
- Password: Admin@123
