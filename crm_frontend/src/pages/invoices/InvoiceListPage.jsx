import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FileDown } from "lucide-react";
import {
  fetchInvoices,
  deleteInvoices,
  selectList,
  selectLoading,
  selectPagination,
} from "../../features/invoices/invoicesSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import api from "../../services/api";

const SC = {
  draft: "gray",
  sent: "blue",
  paid: "green",
  partial: "yellow",
  overdue: "red",
  cancelled: "red",
  received: "green",
  approved: "green",
};
const BC = {
  green: {
    background: "#F0FFF4",
    color: "#276749",
    border: "1px solid #9AE6B4",
  },
  red: { background: "#FFF5F5", color: "#9B2C2C", border: "1px solid #FEB2B2" },
  blue: {
    background: "#EBF8FF",
    color: "#2C5282",
    border: "1px solid #90CDF4",
  },
  yellow: {
    background: "#FFFFF0",
    color: "#744210",
    border: "1px solid #FAF089",
  },
  gray: {
    background: "#F7FAFC",
    color: "#4A5568",
    border: "1px solid #E2E8F0",
  },
  orange: {
    background: "#FFFAF0",
    color: "#7B341E",
    border: "1px solid #FBBF24",
  },
};
const Bdg = ({ color = "gray", children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: 11.5,
      fontWeight: 600,
      ...BC[color],
    }}
  >
    {children}
  </span>
);
const STATS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "unpaid", label: "Unpaid" },
];
const btnPri = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 16px",
  background: "#2E86AB",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 13.5,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
};
const iBtn = (extra = {}) => ({
  background: "none",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  width: 30,
  height: 30,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ...extra,
});

export default function InvoiceListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const list = useSelector(selectList);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    dispatch(fetchInvoices({ search, status, page }));
  }, [dispatch, search, status, page]);
  const del = (id, n) => {
    if (!window.confirm(`Delete "${n || id}"?`)) return;
    dispatch(deleteInvoices(id));
  };
  const pdf = async (id) => {
    try {
      const r = await api.get(`/pdf-templates/generate/invoice/${id}/`, {
        responseType: "blob",
      });
      window.open(URL.createObjectURL(r.data), "_blank");
    } catch {
      alert("PDF failed. Make sure a PDF template is configured.");
    }
  };
  const columns = [
    {
      key: "invoice_number",
      label: "Number",
      sortable: true,
      render: (v, row) => (
        <Link
          to={`/invoices/${row.id}/edit`}
          style={{ color: "#2E86AB", fontWeight: 700, textDecoration: "none" }}
        >
          {v || `#${row.id}`}
        </Link>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (v, row) => row.customer_name || row.vendor_name || "—",
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "due_date",
      label: "Due",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "total",
      label: "Total",
      render: (v, row) => (
        <span style={{ fontWeight: 700 }}>
          {row.currency || "INR"}{" "}
          {parseFloat(v || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <Bdg color={SC[v] || "gray"}>
          {v ? v[0].toUpperCase() + v.slice(1) : "—"}
        </Bdg>
      ),
    },
  ];
  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${pagination.count} records`}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Invoices" },
        ]}
        actions={
          <Link to="/invoices/new" style={btnPri}>
            <Plus size={14} /> New Invoice
          </Link>
        }
      />
      <div
        style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
      >
        <input
          style={{
            maxWidth: 360,
            padding: "9px 13px",
            border: "1.5px solid #E2E8F0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            width: "100%",
          }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1.5px solid #E2E8F0",
            borderRadius: 8,
            fontSize: 14,
            background: "#fff",
            outline: "none",
          }}
        >
          <option value="">All Status</option>
          {STATS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No records found."
        actions={(row) => (
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <button
              onClick={() => pdf(row.id)}
              title="PDF"
              style={iBtn({ color: "#6B7280" })}
            >
              <FileDown size={13} />
            </button>
            <button
              onClick={() => navigate(`/invoices/${row.id}/edit`)}
              style={iBtn()}
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => del(row.id, row.invoice_number)}
              style={iBtn({ border: "1px solid #FEB2B2", color: "#E53E3E" })}
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
