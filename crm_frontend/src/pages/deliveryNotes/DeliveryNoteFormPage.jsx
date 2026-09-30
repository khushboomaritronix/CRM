import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ArrowLeft from "@mui/icons-material/ArrowBack"; // was lucide ArrowLeft

export default function DeliveryNoteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [form, setForm] = useState({
    delivery_number: "",
    customer: "",
    currency: "",
    delivery_date: new Date().toISOString().split("T")[0],
    status: "draft",
    total_items: 0,
    delivered_items: 0,
    notes: "",
  });

  useEffect(() => {
    fetchCustomersAndCurrencies();
    if (id) fetchDeliveryNote();
  }, [id]);

  const fetchCustomersAndCurrencies = async () => {
    try {
      const [custRes, currRes] = await Promise.all([
        api.get("/customers/?page_size=100"),
        api.get("/currencies/?page_size=100"),
      ]);
      setCustomers(Array.isArray(custRes.data) ? custRes.data : custRes.data.results || []);
      setCurrencies(Array.isArray(currRes.data) ? currRes.data : currRes.data.results || []);
    } catch (err) {
      alert("Error loading data: " + err.message);
    }
  };

  const fetchDeliveryNote = async () => {
    try {
      const res = await api.get(`/delivery-notes/${id}/`);
      setForm(res.data);
    } catch (err) {
      alert("Error loading delivery note: " + err.message);
      navigate("/delivery-notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (id) {
        await api.put(`/delivery-notes/${id}/`, form);
        alert("Delivery note updated successfully");
      } else {
        await api.post("/delivery-notes/", form);
        alert("Delivery note created successfully");
      }
      navigate("/delivery-notes");
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={id ? "Edit Delivery Note" : "New Delivery Note"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Delivery Notes", path: "/delivery-notes" },
          { label: id ? "Edit" : "New" },
        ]}
        actions={
          <button
            onClick={() => navigate("/delivery-notes")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              border: "1.5px solid #E2E8F0",
              borderRadius: 8,
              color: "#374151",
              fontWeight: 600,
              fontSize: 13.5,
              cursor: "pointer",
              background: "#fff",
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        }
      />

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 8,
          border: "1px solid #E2E8F0",
          padding: 24,
          maxWidth: 800,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
            Delivery Number *
          </label>
          <input
            type="text"
            value={form.delivery_number}
            onChange={(e) => setForm({ ...form, delivery_number: e.target.value })}
            placeholder="DN-2026-001"
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
            Customer *
          </label>
          <select
            value={form.customer}
            onChange={(e) => {
              const custId = e.target.value;
              const cust = customers.find((c) => String(c.id) === custId);
              setForm({ ...form, customer: custId, currency: cust?.currency || form.currency });
            }}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
            Currency
          </label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="">Select Currency</option>
            {currencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
              Delivery Date *
            </label>
            <input
              type="date"
              value={form.delivery_date}
              onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="partially_received">Partially Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
              Total Items
            </label>
            <input
              type="number"
              value={form.total_items}
              onChange={(e) => setForm({ ...form, total_items: parseInt(e.target.value) || 0 })}
              min="0"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
              Delivered Items
            </label>
            <input
              type="number"
              value={form.delivered_items}
              onChange={(e) => setForm({ ...form, delivered_items: parseInt(e.target.value) || 0 })}
              min="0"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#374151" }}>
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows="4"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #E2E8F0",
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate("/delivery-notes")}
            style={{
              padding: "10px 20px",
              border: "1.5px solid #E2E8F0",
              borderRadius: 6,
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 20px",
              border: "none",
              borderRadius: 6,
              background: "#2E86AB",
              color: "#fff",
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Saving..." : id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
