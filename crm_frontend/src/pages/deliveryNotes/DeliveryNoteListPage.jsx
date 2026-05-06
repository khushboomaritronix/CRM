import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function DeliveryNoteListPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  const fetchDeliveryNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/delivery-notes/?page_size=20");
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setNotes(data);
      if (res.data.count) {
        setPagination({ current: 1, total: Math.ceil(res.data.count / 20) });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await api.delete(`/delivery-notes/${id}/`);
        setNotes(notes.filter((n) => n.id !== id));
      } catch (err) {
        alert("Error deleting delivery note: " + err.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "#999999",
      confirmed: "#0066cc",
      in_transit: "#ff9900",
      delivered: "#00cc00",
      partially_received: "#ffcc00",
      cancelled: "#cc0000",
    };
    return colors[status] || "#999999";
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Delivery Notes"
        subtitle="Track shipments to customers"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Delivery Notes" },
        ]}
        actions={
          <Link
            to="/delivery-notes/new"
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
              textDecoration: "none",
            }}
          >
            <Plus size={16} /> New Delivery Note
          </Link>
        }
      />

      {error && (
        <div
          style={{
            padding: 12,
            background: "#FEE",
            color: "#C33",
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {notes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            color: "#999",
            background: "#f9f9f9",
            borderRadius: 8,
          }}
        >
          No delivery notes found. Create one to get started.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#374151",
                  }}
                >
                  Delivery #
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>
                  Customer
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>
                  Status
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>
                  Items
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>
                  Date
                </th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#374151" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr
                  key={note.id}
                  style={{
                    borderBottom: "1px solid #EDF2F7",
                    background: "#fff",
                    "&:hover": { background: "#FAFAFA" },
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{note.delivery_number}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {note.customer_name || `Customer ${note.customer}`}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: getStatusColor(note.status),
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {note.status?.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {note.delivered_items || 0} / {note.total_items || 0}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {new Date(note.delivery_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <Link
                      to={`/delivery-notes/${note.id}/edit`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        background: "#E3F2FD",
                        color: "#2E86AB",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        textDecoration: "none",
                        marginRight: 6,
                        fontSize: 12,
                      }}
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        background: "#FEE",
                        color: "#C33",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 12,
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
