import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchCustomerPos,
  deleteCustomerPos,
  selectList,
  selectLoading,
  selectPagination,
} from "../../features/customerPos/customerPosSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";
import { Plus, Search, Download, FileText, Eye } from "lucide-react";

const STATUS_COLORS = {
  received: "blue",
  processing: "yellow",
  fulfilled: "green",
  cancelled: "red",
};

export default function CustomerPOListPage() {
  const dispatch = useDispatch();
  const list = useSelector(selectList);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCustomerPos({ search, status: statusFilter, page }));
  }, [dispatch, search, statusFilter, page]);

  const columns = [
  {
    key: "po_number",
    label: "PO Number",
    render: (value, row) => (  // Now accepts (value, row)
      <span style={{ fontWeight: 700, color: "#1E3A5F" }}>{value}</span>
    ),
  },
  { 
    key: "customer_name", 
    label: "Customer",
    render: (value, row) => value || "—"
  },
  { 
    key: "date", 
    label: "Date",
    render: (value, row) => value || "—"
  },
  { 
    key: "due_date", 
    label: "Due Date", 
    render: (value, row) => value || "—"
  },
  {
    key: "amount",
    label: "Amount",
    render: (value, row) => (
      <span style={{ fontWeight: 600 }}>
        {row.currency || "INR"} {value ? (+value).toFixed(2) : '0.00'}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value, row) => {
      const color = STATUS_COLORS[value] || "gray";
      return <Badge color={color}>{value ? value.charAt(0).toUpperCase() + value.slice(1) : "—"}</Badge>;
    },
  },
  {
    key: "attachment",
    label: "File",
    render: (value, row) => {
      const attachmentUrl = value || row.attachment_url;
      
      if (!attachmentUrl) {
        return <span style={{ color: "#9CA3AF", fontSize: 12 }}>No file</span>;
      }

      return (
        <div style={{ display: "flex", gap: "8px" }}>
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 4,
              color: "#1E3A5F",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <Eye size={14} /> View
          </a>
          
          <a
            href={attachmentUrl}
            download={`PO-${row.po_number}.pdf`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 8px",
              background: "#2E86AB",
              border: "1px solid #1E6B8F",
              borderRadius: 4,
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <Download size={14} /> Download
          </a>
        </div>
      );
    },
  },
];

  return (
    <div>
      <PageHeader
        title="Customer POs"
        subtitle="Purchase orders received from customers"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Customer POs" },
        ]}
        actions={
          <Link
            to="/customer-pos/new"
            style={{
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
            }}
          >
            <Plus size={15} /> New Customer PO
          </Link>
        }
      />

      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          border: "1px solid #E2E8F0",
          padding: "14px 16px",
          marginBottom: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9CA3AF",
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search PO number, customer…"
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              border: "1.5px solid #E2E8F0",
              borderRadius: 7,
              fontSize: 13.5,
              outline: "none",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "8px 12px",
            border: "1.5px solid #E2E8F0",
            borderRadius: 7,
            fontSize: 13.5,
            outline: "none",
            background: "#fff",
            minWidth: 140,
          }}
        >
          <option value="">All Statuses</option>
          {["received", "processing", "fulfilled", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        onEdit={(id) => `/customer-pos/${id}/edit`}
        onDelete={(id) => dispatch(deleteCustomerPos(id))}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No customer POs found. Create your first one!"
      />
    </div>
  );
}
