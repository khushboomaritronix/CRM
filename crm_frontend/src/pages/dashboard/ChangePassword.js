// this code not used anymore
import React, { useState } from "react";
import api from "../../services/api";

export default function ChangePassword() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
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
    <div style={{ maxWidth: "450px", margin: "40px auto" }}>
      <h3>Change Password</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Old Password</label>
          <input
            type="password"
            value={form.old_password}
            onChange={(e) =>
              setForm({ ...form, old_password: e.target.value })
            }
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>New Password</label>
          <input
            type="password"
            value={form.new_password}
            onChange={(e) =>
              setForm({ ...form, new_password: e.target.value })
            }
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={form.confirm_password}
            onChange={(e) =>
              setForm({ ...form, confirm_password: e.target.value })
            }
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}