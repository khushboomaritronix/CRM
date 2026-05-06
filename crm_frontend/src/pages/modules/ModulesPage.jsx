import React, { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

const AVAILABLE_ICONS = [
  "LayoutDashboard", "Users", "Building2", "FileSearch", "FileText", "Receipt", 
  "FileOutput", "ShoppingCart", "CheckSquare", "Settings", "FileType", "UserCog", 
  "Shield", "Sliders", "Database", "FileMinus", "FilePlus", "CreditCard", "RotateCcw", 
  "DollarSign", "BarChart2", "Inbox", "Truck", "Package", "TrendingUp", "Layers"
];

export default function ModulesPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    icon: "Package",
    description: "",
    is_active: true,
    order: 0,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get("/modules/?page_size=100");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setModules(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      alert("Error loading modules: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingModule(null);
    setForm({
      name: "",
      slug: "",
      icon: "Package",
      description: "",
      is_active: true,
      order: modules.length,
    });
    setShowForm(true);
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setForm(module);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingModule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await api.put(`/modules/${editingModule.id}/`, form);
        alert("Module updated successfully");
      } else {
        await api.post("/modules/", form);
        alert("Module created successfully");
      }
      fetchModules();
      handleCancel();
    } catch (err) {
      alert("Error saving module: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will remove from sidebar but not delete data.")) {
      try {
        await api.delete(`/modules/${id}/`);
        alert("Module deleted successfully");
        fetchModules();
      } catch (err) {
        alert("Error deleting module: " + err.message);
      }
    }
  };

  const handleToggleActive = async (module) => {
    try {
      await api.patch(`/modules/${module.id}/`, { is_active: !module.is_active });
      fetchModules();
    } catch (err) {
      alert("Error toggling module: " + err.message);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^\w_]/g, "");
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Modules"
        subtitle="Manage sidebar navigation modules"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Modules" },
        ]}
        actions={
          <button
            onClick={handleAddNew}
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
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> New Module
          </button>
        }
      />

      {showForm && (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            border: "1.5px solid #2E86AB",
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>
            {editingModule ? "Edit Module" : "Create New Module"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#374151", fontSize: 13 }}>
                  Module Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (!editingModule) {
                      setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }));
                    }
                  }}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                  placeholder="e.g., Invoices"
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#374151", fontSize: 13 }}>
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                  placeholder="e.g., invoices"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#374151", fontSize: 13 }}>
                  Icon
                </label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  {AVAILABLE_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#374151", fontSize: 13 }}>
                  Order (Display Position)
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, color: "#374151", fontSize: 13 }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
                placeholder="Module description..."
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ fontWeight: 600, color: "#374151" }}>Active (Show in Sidebar)</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 6,
                  background: "#fff",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: 6,
                  background: "#2E86AB",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {editingModule ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        {modules.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            No modules yet. Create one to add it to the sidebar.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>
                  Name
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>
                  Slug
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>
                  Icon
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>
                  Order
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => (
                <tr key={module.id} style={{ borderBottom: "1px solid #EDF2F7" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{module.name}</td>
                  <td style={{ padding: "12px 16px", color: "#718096" }}>
                    <code style={{ fontSize: 12, background: "#f0f0f0", padding: "2px 6px", borderRadius: 3 }}>
                      {module.slug}
                    </code>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#718096" }}>{module.icon || "Package"}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>{module.order}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span
                      style={{
                        background: module.is_active ? "#DCFCE7" : "#FEE2E2",
                        color: module.is_active ? "#166534" : "#991B1B",
                        padding: "4px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {module.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => handleToggleActive(module)}
                      title={module.is_active ? "Hide from sidebar" : "Show in sidebar"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginRight: 8,
                        color: module.is_active ? "#059669" : "#D1D5DB",
                      }}
                    >
                      {module.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleEdit(module)}
                      style={{
                        background: "#E3F2FD",
                        color: "#2E86AB",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        marginRight: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Edit size={14} style={{ display: "inline", marginRight: 4 }} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(module.id)}
                      style={{
                        background: "#FEE",
                        color: "#C33",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={14} style={{ display: "inline", marginRight: 4 }} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: "#F0F9FF", borderRadius: 8, borderLeft: "4px solid #2E86AB", fontSize: 13 }}>
        <p style={{ fontWeight: 600, marginBottom: 8 }}>💡 Tips:</p>
        <ul style={{ marginLeft: 20, lineHeight: 1.6 }}>
          <li>Create new modules to add them to the sidebar</li>
          <li>Use the order field to control position (lower = higher in sidebar)</li>
          <li>Toggle "Active" to show/hide from sidebar without deleting</li>
          <li>Changes appear in sidebar automatically after refresh</li>
          <li>Add permissions to control who can access each module</li>
        </ul>
      </div>
    </div>
  );
}
