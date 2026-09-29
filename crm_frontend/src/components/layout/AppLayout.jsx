import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  fetchCurrentUser,
  selectCurrentUser,
  selectPermissions,
} from "../../features/auth/authSlice";
import LayoutDashboard from "@mui/icons-material/Dashboard";
import Users from "@mui/icons-material/People";
import Building2 from "@mui/icons-material/Business";
import FileSearch from "@mui/icons-material/FindInPage";
import FileText from "@mui/icons-material/Description";
import Receipt from "@mui/icons-material/Receipt";
import FileOutput from "@mui/icons-material/UploadFile";
import ShoppingCart from "@mui/icons-material/ShoppingCart";
import CheckSquare from "@mui/icons-material/CheckBox";
import Settings from "@mui/icons-material/Settings";
import FileType from "@mui/icons-material/TextSnippet";
import UserCog from "@mui/icons-material/ManageAccounts";
import Shield from "@mui/icons-material/Shield";
import Sliders from "@mui/icons-material/Tune";
import Database from "@mui/icons-material/Storage";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import LogOut from "@mui/icons-material/Logout";
import Bell from "@mui/icons-material/Notifications";
import Search from "@mui/icons-material/Search";
import Menu from "@mui/icons-material/Menu";
import X from "@mui/icons-material/Close";
import FileMinus from "@mui/icons-material/InsertDriveFile";
import FilePlus from "@mui/icons-material/NoteAdd";
import CreditCard from "@mui/icons-material/CreditCard";
import RotateCcw from "@mui/icons-material/Replay";
import DollarSign from "@mui/icons-material/AttachMoney";
import BarChart2 from "@mui/icons-material/BarChart";
import Inbox from "@mui/icons-material/Inbox";
import Truck from "@mui/icons-material/LocalShipping";
import Package from "@mui/icons-material/Inventory2";
import TrendingUp from "@mui/icons-material/TrendingUp";
import Layers from "@mui/icons-material/Layers";
import api from "../../services/api";

// Icon mapping for module display
const ICON_MAP = {
  LayoutDashboard: LayoutDashboard,
  Users: Users,
  Building2: Building2,
  FileSearch: FileSearch,
  FileText: FileText,
  Receipt: Receipt,
  FileOutput: FileOutput,
  ShoppingCart: ShoppingCart,
  CheckSquare: CheckSquare,
  Settings: Settings,
  FileType: FileType,
  UserCog: UserCog,
  Shield: Shield,
  Sliders: Sliders,
  Database: Database,
  FileMinus: FileMinus,
  FilePlus: FilePlus,
  CreditCard: CreditCard,
  RotateCcw: RotateCcw,
  DollarSign: DollarSign,
  BarChart2: BarChart2,
  Inbox: Inbox,
  Truck: Truck,
  Package: Package,
  TrendingUp: TrendingUp,
  Layers: Layers,
};

// Module slugs to hide from the sidebar nav (still reachable by direct URL)
const HIDDEN_NAV_MODULES = ["invoices"];

// Fallback hardcoded sidebar in case API fails
const FALLBACK_NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  { label: "Customers", path: "/customers", icon: Users, module: "customers" },
  { label: "Vendors", path: "/vendors", icon: Building2, module: "vendors" },
  { label: "Settings", path: "/company", icon: Settings, module: "company" },
];

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);

  useEffect(() => {
    const handleClickOutside = (ev) => {
      if (userMenuRef.current && !userMenuRef.current.contains(ev.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(ev.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh permissions on app load — the login response is a snapshot taken
  // once; if an admin changes this user's role permissions afterward, this is
  // what picks the change up on the next page load/refresh.
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Fetch modules from API dynamically
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await api.get("/modules/?is_active=true&page_size=100");
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setModules(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error("Failed to load modules:", err);
        setModules([]);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  // Build navigation items from modules
  const navItems = useMemo(() => {
    if (modules.length === 0) return FALLBACK_NAV_ITEMS;

    return modules.map((module) => {
      const iconName = module.icon || "Package";
      const IconComponent = ICON_MAP[iconName] || Package;

      // Map slug to path
      const pathMap = {
        dashboard: "/dashboard",
        customers: "/customers",
        vendors: "/vendors",
        rfq: "/rfq",
        estimates: "/estimates",
        invoices: "/invoices",
        proforma_invoices: "/proforma-invoices",
        purchase_orders: "/purchase-orders",
        final_invoices: "/final-invoices",
        delivery_notes: "/delivery-notes",
        credit_notes: "/credit-notes",
        debit_notes: "/debit-notes",
        payments: "/payments",
        order_returns: "/order-returns",
        currencies: "/currencies",
        reports: "/reports",
        company: "/company",
        pdf_templates: "/pdf-templates",
        users: "/users",
        roles: "/roles",
        custom_fields: "/custom-fields",
        bulk_operations: "/bulk-operations",
        customer_pos: "/customer-pos",
        modules: "/modules",
      };

      return {
        label: module.name,
        path: pathMap[module.slug] || `/${module.slug}`,
        icon: IconComponent,
        module: module.slug,
        slug: module.slug,
      };
    });
  }, [modules]);

  const hasAccess = (moduleSlug) => {
    if (!moduleSlug) return true;
    if (user?.is_superuser) return true;
    return permissions?.[moduleSlug]?.includes("can_view");
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="sidebar-inner">
      {/* Logo */}
      <div className="sidebar-logo">
        {!collapsed && (
          <div className="logo-text">
            <span className="logo-main">CRM</span>
            <span className="logo-sub">Sales & Purchase</span>
          </div>
        )}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (!item) return <div key={idx} className="nav-divider" />;
          if (!hasAccess(item.module)) return null;
          if (HIDDEN_NAV_MODULES.includes(item.module)) return null;

          const active = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${active ? "active" : ""}`}
              title={collapsed ? item.label : ""}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} className="nav-icon" />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {(user.first_name?.[0] || user.email?.[0] || "U").toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-details">
                <span className="user-name">
                  {user.first_name || user.email}
                </span>
                <span className="user-role">
                  {user.is_superuser ? "Super Admin" : "User"}
                </span>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className={`sidebar desktop-sidebar`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`sidebar mobile-sidebar ${mobileOpen ? "open" : ""}`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="header-search">
            <Search size={16} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="header-actions">
            <div className="dropdown-wrap" ref={notifRef}>
              <button
                className="icon-btn"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserMenuOpen(false);
                }}
              >
                <Bell size={18} />
              </button>
              {notifOpen && (
                <div className="dropdown-panel notif-panel">
                  <div className="dropdown-header">Notifications</div>
                  <div className="dropdown-empty">No new notifications</div>
                </div>
              )}
            </div>
            <div className="dropdown-wrap" ref={userMenuRef}>
              <div
                className="header-user"
                onClick={() => {
                  setUserMenuOpen((v) => !v);
                  setNotifOpen(false);
                }}
              >
                <div className="user-avatar small">
                  {(
                    user?.first_name?.[0] ||
                    user?.email?.[0] ||
                    "U"
                  ).toUpperCase()}
                </div>
              </div>
              {userMenuOpen && (
                <div className="dropdown-panel user-panel">
                  <div className="dropdown-header">
                    <span className="user-panel-name">
                      {user?.first_name || user?.username || "User"}
                    </span>
                    <span className="user-panel-email">{user?.email}</span>
                  </div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">{children}</main>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --sidebar-w: 240px;
          --sidebar-collapsed: 64px;
          --header-h: 60px;
          --blue-dark: #1E3A5F;
          --blue: #2E86AB;
          --blue-light: #D6E4F0;
          --accent: #F18F01;
          --bg: #F5F7FA;
          --white: #ffffff;
          --border: #E2E8F0;
          --text: #2C3E50;
          --text-muted: #718096;
          --sidebar-bg: #1A2E4A;
          --sidebar-text: #CBD5E0;
          --sidebar-active: #2E86AB;
          --sidebar-hover: rgba(255,255,255,0.06);
          --radius: 8px;
          --shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
          --shadow-lg: 0 4px 16px rgba(0,0,0,0.12);
        }
        body { font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--text); }

        .app-layout { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: var(--sidebar-w);
          min-height: 100vh;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: width 0.25s ease;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
          overflow: hidden;
        }
        .app-layout.sidebar-collapsed .sidebar { width: var(--sidebar-collapsed); }
        .sidebar-inner { display: flex; flex-direction: column; height: 100%; }

        /* Logo */
        .sidebar-logo {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
          min-height: 64px;
        }
        .logo-text { display: flex; flex-direction: column; }
        .logo-main { font-size: 18px; font-weight: 800; color: white; letter-spacing: -0.5px; }
        .logo-sub { font-size: 10px; color: #64a0c8; text-transform: uppercase; letter-spacing: 0.5px; }
        .collapse-btn {
          background: rgba(255,255,255,0.08); border: none; color: var(--sidebar-text);
          width: 28px; height: 28px; border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .collapse-btn:hover { background: rgba(255,255,255,0.15); color: white; }

        /* Nav */
        .sidebar-nav { flex: 1; min-height: 0; padding: 12px 8px; overflow-y: auto; }
        .nav-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 8px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 6px; margin-bottom: 2px;
          color: var(--sidebar-text); text-decoration: none;
          transition: all 0.15s; white-space: nowrap; overflow: hidden;
          font-size: 13.5px; font-weight: 500;
        }
        .nav-item:hover { background: var(--sidebar-hover); color: white; }
        .nav-item.active { background: var(--sidebar-active); color: white; }
        .nav-icon { flex-shrink: 0; }
        .nav-label { overflow: hidden; }

        /* Footer */
        .sidebar-footer {
          padding: 12px 8px; border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; gap: 8px;
        }
        .user-info { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .user-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--sidebar-active); color: white;
          font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .user-avatar.small { width: 28px; height: 28px; background: var(--blue); font-size: 12px; }
        .user-details { display: flex; flex-direction: column; min-width: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 11px; color: var(--sidebar-text); }
        .logout-btn {
          background: none; border: none; color: var(--sidebar-text); cursor: pointer;
          padding: 6px; border-radius: 6px; display: flex; align-items: center;
          flex-shrink: 0;
        }
        .logout-btn:hover { background: rgba(255,255,255,0.08); color: #fc8181; }

        /* MAIN CONTENT */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-w);
          display: flex; flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.25s ease;
        }
        .app-layout.sidebar-collapsed .main-content { margin-left: var(--sidebar-collapsed); }

        /* HEADER */
        .top-header {
          position: sticky; top: 0; z-index: 50;
          height: var(--header-h);
          background: var(--white);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: 16px;
          padding: 0 24px;
          box-shadow: var(--shadow);
        }
        .mobile-menu-btn {
          display: none; background: none; border: none; cursor: pointer;
          color: var(--text); padding: 6px; border-radius: 6px;
        }
        .header-search {
          flex: 1; max-width: 400px;
          display: flex; align-items: center; gap: 8px;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: 8px; padding: 7px 12px;
          color: var(--text-muted);
        }
        .header-search input {
          border: none; background: none; outline: none; font-size: 13.5px;
          color: var(--text); width: 100%;
        }
        .header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        .icon-btn {
          background: none; border: none; cursor: pointer;
          color: var(--text-muted); padding: 8px; border-radius: 8px;
          display: flex; align-items: center;
        }
        .icon-btn:hover { background: var(--bg); color: var(--text); }

        .dropdown-wrap { position: relative; }
        .header-user { cursor: pointer; display: flex; align-items: center; border-radius: 8px; padding: 2px; }
        .header-user:hover { background: var(--bg); }
        .dropdown-panel {
          position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
          background: #fff; border: 1px solid #E2E8F0; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12); min-width: 220px; overflow: hidden;
        }
        .dropdown-header {
          padding: 12px 14px; border-bottom: 1px solid #E2E8F0;
          display: flex; flex-direction: column; gap: 2px;
        }
        .user-panel-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
        .user-panel-email { font-size: 12px; color: var(--text-muted); word-break: break-all; }
        .dropdown-empty { padding: 16px 14px; font-size: 13px; color: var(--text-muted); text-align: center; }
        .dropdown-item {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; background: none; border: none; cursor: pointer;
          font-size: 13.5px; font-weight: 600; color: #DC2626; text-align: left;
        }
        .dropdown-item:hover { background: #FEF2F2; }

        /* PAGE CONTENT */
        .page-content { flex: 1; padding: 24px; overflow-x: hidden; }

        /* Mobile sidebar */
        .mobile-sidebar { display: none; }
        .mobile-overlay { display: none; }

        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-sidebar {
            display: flex; position: fixed;
            transform: translateX(-100%); transition: transform 0.25s ease;
          }
          .mobile-sidebar.open { transform: translateX(0); }
          .mobile-overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 90;
          }
          .main-content { margin-left: 0 !important; }
          .mobile-menu-btn { display: flex; }
          .page-content { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
