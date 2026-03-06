import React, { useState } from "react";
import api from "../../services/api";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/change-password/", {
        old_password: form.old_password,
        new_password: form.new_password,
      });

      alert("Password changed successfully");

      setForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      onClose();
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Error changing password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Change Password</h3>

      <form onSubmit={handleSubmit}>
  <div style={styles.formGroup}>
    <label style={styles.label}>Old Password</label>
    <input
      style={styles.input}
      type="password"
      value={form.old_password}
      onChange={(e) =>
        setForm({ ...form, old_password: e.target.value })
      }
      required
    />
  </div>

  <div style={styles.formGroup}>
    <label style={styles.label}>New Password</label>
    <input
      style={styles.input}
      type="password"
      value={form.new_password}
      onChange={(e) =>
        setForm({ ...form, new_password: e.target.value })
      }
      required
    />
  </div>

  <div style={styles.formGroup}>
    <label style={styles.label}>Confirm Password</label>
    <input
      style={styles.input}
      type="password"
      value={form.confirm_password}
      onChange={(e) =>
        setForm({ ...form, confirm_password: e.target.value })
      }
      required
    />
  </div>

  <div style={styles.actions}>
    <button style={styles.cancelBtn} type="button" onClick={onClose}>
      Cancel
    </button>

    <button style={styles.updateBtn} type="submit" disabled={loading}>
      {loading ? "Updating..." : "Update Password"}
    </button>
  </div>
</form>
      </div>
    </div>
  );
}

const styles = {
  /* Overlay */
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },

  /* Modal */
  modal: {
    background: "#ffffff",
    padding: "26px",
    borderRadius: "10px",
    width: "380px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
  },

  /* Form */
  formGroup: {
    marginBottom: "14px",
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "5px",
    color: "#475467",
  },

  input: {
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #D0D5DD",
    fontSize: "13px",
    outline: "none",
  },

  /* Button container */
  actions: {
    marginTop: 18,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },

  /* Cancel button */
  cancelBtn: {
    padding: "7px 14px",
    borderRadius: "6px",
    border: "1px solid #D0D5DD",
    background: "#F2F4F7",
    fontSize: "13px",
    cursor: "pointer",
  },

  /* Update button */
  updateBtn: {
    padding: "7px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#1F7A63",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },

  /* Password row in profile */
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