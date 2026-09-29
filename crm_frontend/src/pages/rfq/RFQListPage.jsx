import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import FileDown from "@mui/icons-material/FileDownload"; // was lucide FileDown
import {
  fetchRfq,
  deleteRfq,
  selectList,
  selectLoading,
  selectPagination,
} from "../../features/rfq/rfqSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";
import api from "../../services/api";

const SC = { draft: "gray", sent: "blue", received: "green", cancelled: "red" };
const Bdg = ({ color = "gray", children }) => {
  const BC = {
    green: {
      background: "#F0FFF4",
      color: "#276749",
      border: "1px solid #9AE6B4",
    },
    red: {
      background: "#FFF5F5",
      color: "#9B2C2C",
      border: "1px solid #FEB2B2",
    },
    blue: {
      background: "#EBF8FF",
      color: "#2C5282",
      border: "1px solid #90CDF4",
    },
    gray: {
      background: "#F7FAFC",
      color: "#4A5568",
      border: "1px solid #E2E8F0",
    },
  };
  return (
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
};
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
const iconBtn = (extra = {}) => ({
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

export default function RFQListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const list = useSelector(selectList);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const canCreate = useSelector(selectHasPermission("rfq", "can_create"));
  const canUpdate = useSelector(selectHasPermission("rfq", "can_update"));
  const canDelete = useSelector(selectHasPermission("rfq", "can_delete"));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    dispatch(fetchRfq({ search, status, page }));
  }, [dispatch, search, status, page]);
  const del = (id, n) => {
    if (!window.confirm(`Delete "${n}"?`)) return;
    dispatch(deleteRfq(id));
  };
  const pdf = async (id) => {
    try {
      const r = await api.get(`/pdf-templates/generate/rfq/${id}/`, {
        responseType: "blob",
      });
      window.open(URL.createObjectURL(r.data), "_blank");
    } catch {
      alert("PDF failed. Make sure a PDF template is configured.");
    }
  };

  const columns = [
    {
      key: "rfq_number",
      label: "RFQ #",
      sortable: true,
      render: (v, row) => (
        <Link
          to={`/rfq/${row.id}/edit`}
          style={{ color: "#2E86AB", fontWeight: 700, textDecoration: "none" }}
        >
          {v || `#${row.id}`}
        </Link>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (v, row) => row.vendor_name || "—",
    },
    {
      key: "date",
      label: "Date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
    },
    {
      key: "total",
      label: "Total",
      render: (v, row) => (
        <span style={{ fontWeight: 700 }}>
          {/* INR{" "} */}
          {row.currency_symbol || row.currency_code || "INR"}{" "}
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
        title="RFQ"
        subtitle={`${pagination.count} records`}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "RFQ" },
        ]}
        actions={
          canCreate && (
            <Link to="/rfq/new" style={btnPri}>
              <Plus size={14} /> New RFQ
            </Link>
          )
        }
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
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
          placeholder="Search by RFQ#, vendor..."
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
          {["draft", "sent", "received", "cancelled"].map((s) => (
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
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No RFQs found."
        actions={(row) => (
          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
            <button
              onClick={() => pdf(row.id)}
              title="PDF"
              style={iconBtn({ color: "#6B7280" })}
            >
              <FileDown size={13} />
            </button>
            {canUpdate && (
              <button
                onClick={() => navigate(`/rfq/${row.id}/edit`)}
                style={iconBtn()}
              >
                <Pencil size={13} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => del(row.id, row.rfq_number)}
                style={iconBtn({ border: "1px solid #FEB2B2", color: "#E53E3E" })}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
