import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Plus from "@mui/icons-material/Add"; // was lucide Plus
import Pencil from "@mui/icons-material/Edit"; // was lucide Pencil
import Trash2 from "@mui/icons-material/Delete"; // was lucide Trash2
import Download from "@mui/icons-material/Download";
import Upload from "@mui/icons-material/Upload";
import {
  fetchCustomers,
  deleteCustomers,
  selectList,
  selectLoading,
  selectPagination,
} from "../../features/customers/customersSlice";
import { selectHasPermission } from "../../features/auth/authSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";
import api from "../../services/api";

export default function CustomerListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customers = useSelector(selectList);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const canCreate = useSelector(selectHasPermission("customers", "can_create"));
  const canUpdate = useSelector(selectHasPermission("customers", "can_update"));
  const canDelete = useSelector(selectHasPermission("customers", "can_delete"));
  const canExport = useSelector(selectHasPermission("customers", "can_export"));

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCustomers({ search, page }));
  }, [dispatch, search, page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`))
      return;
    dispatch(deleteCustomers(id));
  };

  const handleExport = async () => {
    const res = await api.get("/bulk/export/customers/", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers_export.csv";
    a.click();
  };

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (v, row) => (
        <Link to={`/customers/${row.id}`} style={styles.nameLink}>
          {v}
        </Link>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "company_name", label: "Company" },
    { key: "gstin", label: "GSTIN", render: (v) => v || "—" },
    {
      key: "is_active",
      label: "Status",
      render: (v) => (
        <Badge color={v ? "green" : "gray"}>{v ? "Active" : "Inactive"}</Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (v) => new Date(v).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${pagination.count} total customers`}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Customers" },
        ]}
        actions={
          <div style={styles.headerActions}>
            {canExport && (
              <button onClick={handleExport} style={styles.btnSecondary}>
                <Download size={15} /> Export
              </button>
            )}
            <Link to="/bulk-operations" style={styles.btnSecondary}>
              <Upload size={15} /> Import
            </Link>
            {canCreate && (
              <Link to="/customers/new" style={styles.btnPrimary}>
                <Plus size={15} /> New Customer
              </Link>
            )}
          </div>
        }
      />

      {/* Search bar */}
      <div style={styles.searchBar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by name, email, phone, company, GSTIN..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No customers found. Add your first customer!"
        actions={(row) => (
          <div style={styles.rowActions}>
            {canUpdate && (
              <button
                style={styles.btnIcon}
                onClick={() => navigate(`/customers/${row.id}/edit`)}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
            )}
            {canDelete && (
              <button
                style={{ ...styles.btnIcon, color: "#E53E3E" }}
                onClick={() => handleDelete(row.id, row.name)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}

const styles = {
  headerActions: { display: "flex", gap: 8, alignItems: "center" },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    background: "#2E86AB",
    color: "white",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13.5,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    background: "white",
    color: "#2D3748",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13.5,
    textDecoration: "none",
    border: "1px solid #E2E8F0",
    cursor: "pointer",
  },
  searchBar: { marginBottom: 16 },
  searchInput: {
    width: "100%",
    maxWidth: 480,
    padding: "10px 14px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  },
  nameLink: { color: "#2E86AB", fontWeight: 600, textDecoration: "none" },
  rowActions: { display: "flex", gap: 4, justifyContent: "flex-end" },
  btnIcon: {
    background: "none",
    border: "1px solid #E2E8F0",
    borderRadius: 6,
    width: 30,
    height: 30,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4A5568",
  },
};
