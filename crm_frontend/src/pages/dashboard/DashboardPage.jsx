import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  Users,
  Building2,
  Receipt,
  ShoppingCart,
  FileText,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

import ChangePasswordModal from "../../pages/auth/ChangePasswordModal";

const STAT_CARDS = [
  {
    key: "customers",
    label: "Customers",
    icon: Users,
    color: "#2E86AB",
    path: "/customers",
    endpoint: "/customers/?page_size=1",
  },
  {
    key: "vendors",
    label: "Vendors",
    icon: Building2,
    color: "#805AD5",
    path: "/vendors",
    endpoint: "/vendors/?page_size=1",
  },
  // { key: "invoices", label: "Invoices", icon: Receipt, color: "#38A169", path: "/invoices", endpoint: "/invoices/?page_size=1" },
  {
    key: "purchase_orders",
    label: "Purchase Orders",
    icon: ShoppingCart,
    color: "#DD6B20",
    path: "/purchase-orders",
    endpoint: "/purchase-orders/?page_size=1",
  },
  {
    key: "estimates",
    label: "Estimates",
    icon: FileText,
    color: "#3182CE",
    path: "/estimates",
    endpoint: "/estimates/?page_size=1",
  },
];

const QUICK_LINKS = [
  // { label: "New Invoice", path: "/invoices/new", color: "#38A169" },
  { label: "New Customer", path: "/customers/new", color: "#2E86AB" },
  { label: "New PO", path: "/purchase-orders/new", color: "#DD6B20" },
  { label: "New RFQ", path: "/rfq/new", color: "#805AD5" },
  { label: "New Estimate", path: "/estimates/new", color: "#3182CE" },
  { label: "Bulk Import", path: "/bulk-operations", color: "#718096" },
];

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const [showPasswordModal, setShowPasswordModal] = useState(false);
  useEffect(() => {
    const fetchStats = async () => {
      const results = {};
      await Promise.all(
        STAT_CARDS.map(async (card) => {
          try {
            const { data } = await api.get(card.endpoint);
            results[card.key] = data.count || 0;
          } catch {
            results[card.key] = "—";
          }
        }),
      );
      setStats(results);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Welcome banner */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.bannerTitle}>
            {greeting}, {user?.first_name || "there"} 👋
          </h1>
          <p style={styles.bannerSub}>
            Here's what's happening with your business today.
          </p>
        </div>
        <div style={styles.bannerIcon}>
          <TrendingUp size={48} color="rgba(255,255,255,0.3)" />
        </div>
      </div>

      {/* Stats grid */}
      <div style={styles.statsGrid}>
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} to={card.path} style={styles.statCard}>
              <div
                style={{
                  ...styles.statIcon,
                  background: card.color + "18",
                  color: card.color,
                }}
              >
                <Icon size={22} />
              </div>
              <div style={styles.statContent}>
                <div style={styles.statValue}>
                  {loading ? "..." : (stats[card.key] ?? 0)}
                </div>
                <div style={styles.statLabel}>{card.label}</div>
              </div>
              <ArrowRight
                size={16}
                style={{ color: "#A0AEC0", marginLeft: "auto" }}
              />
            </Link>
          );
        })}
      </div>

      {/* Quick links */}
      {user?.is_superuser && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Quick Actions</h3>
          <div style={styles.quickGrid}>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{ ...styles.quickLink, borderColor: link.color }}
              >
                <span style={{ color: link.color, fontWeight: 700 }}>+</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info cards */}
      <div style={styles.infoGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>System Overview</h3>
          <div style={styles.infoList}>
            {user?.is_superuser && (
              <InfoRow
                label="Role"
                value={user?.is_superuser ? "Super Administrator" : "User"}
              />
            )}
               <InfoRow label="Name" value={user ? `${user.first_name} ${user.last_name}` : "N/A"} />
            <InfoRow label="Email" value={user?.email || "N/A"} />
         

            <InfoRow
              label="Joined"
              value={
                user?.date_joined
                  ? new Date(user.date_joined).toLocaleDateString()
                  : "N/A"
              }
            />
            <InfoRow
              label="Phone"
              value={user?.phone ? user.phone : "Not provided"}
            />
   <div style={styles.passwordRow}>
  <InfoRow label="Password" value="" />

  <button
    onClick={() => setShowPasswordModal(true)}
    style={styles.changePasswordBtn}
  >
    Change Password
  </button>

  <ChangePasswordModal
    isOpen={showPasswordModal}
    onClose={() => setShowPasswordModal(false)}
  />
</div>

            {/* <InfoRow label="Account Status" value="Active" positive />
            <InfoRow label="Modules" value="15 modules configured" /> */}
          </div>
        </div>
        {/* <div style={styles.card}>
          <h3 style={styles.cardTitle}>Module Access</h3>
          <div style={styles.infoList}>
            {[
              "Customers",
              "Vendors",
              "RFQ",
              "Estimates",
              "Invoices",
              "Purchase Orders",
            ].map((m) => (
              <InfoRow key={m} label={m} value="Full Access" positive />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}

function InfoRow({ label, value, positive }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #EDF2F7",
      }}
    >
      <span style={{ fontSize: 13.5, color: "#718096" }}>{label}</span>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: positive ? "#38A169" : "#2D3748",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const styles = {
  banner: {
    background: "linear-gradient(135deg, #1E3A5F, #2E86AB)",
    borderRadius: 12,
    padding: "28px 32px",
    marginBottom: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "white",
    marginBottom: 4,
  },
  bannerSub: { fontSize: 14, color: "rgba(255,255,255,0.75)" },
  bannerIcon: { flexShrink: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    textDecoration: "none",
    transition: "box-shadow 0.2s, transform 0.2s",
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 24, fontWeight: 800, color: "#1E3A5F" },
  statLabel: { fontSize: 12.5, color: "#718096", marginTop: 2 },
  card: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    padding: "20px 24px",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#2D3748",
    marginBottom: 16,
  },
  quickGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  quickLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    border: "1.5px solid",
    background: "white",
    fontSize: 13,
    fontWeight: 600,
    color: "#2D3748",
    textDecoration: "none",
  },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  infoList: {},

    passwordRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  /* Change password button */
  changePasswordBtn: {
    background: "#1F7A63",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12.5px",
    cursor: "pointer",
  },
};
