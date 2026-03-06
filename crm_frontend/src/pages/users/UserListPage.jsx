import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Mail, Search } from "lucide-react";
import { fetchUsers, deleteUsers, selectList, selectLoading, selectPagination } from "../../features/users/usersSlice";
import PageHeader from "../../components/common/PageHeader";
import DataTable, { Badge } from "../../components/common/DataTable";

/**
 * Safely get role display name from any shape the backend might return:
 *   {id, name}         ← new clean format
 *   {role__id, role__name}  ← old values() format
 *   "Admin"            ← plain string fallback
 */
function roleName(r) {
  if (!r) return "";
  if (typeof r === "string") return r;
  // object — try name first, then role__name
  return String(r.name || r.role__name || "");
}

function roleKey(r, idx) {
  if (!r) return idx;
  if (typeof r === "string") return r;
  return r.id || r.role__id || idx;
}

export default function UserListPage() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const list        = useSelector(selectList);
  const loading     = useSelector(selectLoading);
  const pagination  = useSelector(selectPagination);
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ search, page }));
  }, [dispatch, search, page]);

  const columns = [
    {
      key: "email", label: "User",
      render: (v, row) => (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:"#2E86AB", color:"#fff",
            fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {(row.first_name || v || "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:600, color:"#1E3A5F", fontSize:14 }}>
              {row.full_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
            </div>
            <div style={{ fontSize:12, color:"#6B7280" }}>{v}</div>
          </div>
        </div>
      ),
    },
    { key:"phone", label:"Phone", render: v => v || "—" },
    {
      key: "roles", label: "Roles",
      render: v => {
        if (!v || !Array.isArray(v) || v.length === 0) {
          return <span style={{ color:"#9CA3AF", fontSize:12 }}>No role</span>;
        }
        return (
          <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
            {v.map((r, i) => (
              <span key={roleKey(r, i)}
                style={{ display:"inline-block", padding:"2px 8px", background:"#EBF8FF",
                  color:"#2C5282", borderRadius:20, fontSize:11.5, fontWeight:600 }}>
                {roleName(r)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "is_staff", label: "Type",
      render: (v, row) =>
        row.is_superuser ? <Badge color="purple">Super Admin</Badge>
          : v ? <Badge color="blue">Staff</Badge>
          : <Badge color="gray">User</Badge>,
    },
    {
      key: "is_active", label: "Status",
      render: v => <Badge color={v ? "green" : "red"}>{v ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "created_at", label: "Joined",
      render: v => v ? new Date(v).toLocaleDateString() : "—",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${pagination.count || 0} users`}
        breadcrumbs={[{ label:"Dashboard", path:"/dashboard" }, { label:"Users" }]}
        actions={
          <Link to="/users/new"
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px",
              background:"#2E86AB", color:"#fff", borderRadius:8, fontWeight:600, fontSize:13.5, textDecoration:"none" }}>
            <Plus size={14} /> New User
          </Link>
        }
      />

      <div style={{ background:"#EBF8FF", border:"1px solid #90CDF4", borderRadius:8,
        padding:"10px 14px", marginBottom:14, fontSize:13, color:"#2C5282",
        display:"flex", alignItems:"center", gap:8 }}>
        <Mail size={14} />
        When a new user is created, their login password is automatically emailed to them.
      </div>

      <div style={{ marginBottom:14, position:"relative", maxWidth:400 }}>
        <Search size={14} style={{ position:"absolute", left:10, top:"50%",
          transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }} />
        <input
          style={{ width:"100%", padding:"9px 13px 9px 32px", border:"1.5px solid #E2E8F0",
            borderRadius:8, fontSize:14, outline:"none", boxSizing:"border-box" }}
          placeholder="Search by name, email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        pagination={pagination}
        onPageChange={setPage}
        emptyMessage="No users found."
        actions={row => (
          <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }}>
            <button onClick={() => navigate(`/users/${row.id}/edit`)}
              style={{ background:"none", border:"1px solid #E2E8F0", borderRadius:6,
                width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Pencil size={13} />
            </button>
            <button
              onClick={() => window.confirm(`Delete user "${row.email}"?`) && dispatch(deleteUsers(row.id))}
              style={{ background:"none", border:"1px solid #FEB2B2", borderRadius:6,
                width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#E53E3E" }}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      />
    </div>
  );
}
