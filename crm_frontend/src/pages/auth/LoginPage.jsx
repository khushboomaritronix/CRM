import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from "../../features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const onSubmit = async (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.brandLogo}>CRM</div>
          <h1 style={styles.brandTitle}>Sales & Purchase</h1>
          <p style={styles.brandSub}>Manage your entire business workflow in one place</p>
          <div style={styles.features}>
            {["Dynamic Role Permissions", "Multi-module Invoicing", "PDF Generation", "Bulk Import/Export"].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - form */}
        <div style={styles.rightPanel}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Sign in</h2>
            <p style={styles.formSub}>Enter your credentials to access the CRM</p>

            {error && (
              <div style={styles.errorBox}>
                <span>⚠</span> {typeof error === "string" ? error : "Invalid credentials"}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                  type="email"
                  placeholder="admin@crm.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                  })}
                />
                {errors.email && <span style={styles.fieldError}>{errors.email.message}</span>}
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={{ ...styles.input, ...(errors.password ? styles.inputError : {}) }}
                  type="password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && <span style={styles.fieldError}>{errors.password.message}</span>}
              </div>

              <button
                type="submit"
                style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <p style={styles.hint}>
              Your password is emailed to you when your account is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #1E3A5F 0%, #0d1f35 100%)",
    padding: "24px",
  },
  card: {
    display: "flex", maxWidth: 900, width: "100%", borderRadius: 16,
    overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    minHeight: 520,
  },
  leftPanel: {
    flex: 1, background: "linear-gradient(160deg, #2E86AB, #1E3A5F)",
    padding: "48px 40px", display: "flex", flexDirection: "column",
    justifyContent: "center",
  },
  brandLogo: {
    fontSize: 48, fontWeight: 900, color: "white", letterSpacing: -2,
    fontFamily: "Georgia, serif", marginBottom: 8,
  },
  brandTitle: { fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 12 },
  brandSub: { fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 32 },
  features: { display: "flex", flexDirection: "column", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: 14 },
  featureDot: { width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#7FDEAE", flexShrink: 0 },
  rightPanel: {
    flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
  },
  formContainer: { width: "100%", maxWidth: 360 },
  formTitle: { fontSize: 26, fontWeight: 800, color: "#1E3A5F", marginBottom: 6 },
  formSub: { fontSize: 14, color: "#718096", marginBottom: 28 },
  errorBox: {
    background: "#FFF5F5", border: "1px solid #FC8181", borderRadius: 8,
    padding: "12px 16px", color: "#C53030", fontSize: 13.5, marginBottom: 20,
    display: "flex", alignItems: "center", gap: 8,
  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#2D3748" },
  input: {
    padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    fontSize: 14, outline: "none", transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  inputError: { borderColor: "#FC8181" },
  fieldError: { fontSize: 12, color: "#E53E3E" },
  submitBtn: {
    padding: "13px", borderRadius: 8, background: "#2E86AB",
    color: "white", fontWeight: 700, fontSize: 15, border: "none",
    cursor: "pointer", transition: "background 0.2s", marginTop: 4,
  },
  submitBtnLoading: { background: "#a0c4d8", cursor: "not-allowed" },
  hint: { fontSize: 12, color: "#A0AEC0", textAlign: "center", marginTop: 24, lineHeight: 1.6 },
};
