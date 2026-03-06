import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  createPdfTemplates,
  updatePdfTemplates,
  fetchOnePdfTemplates,
  selectSelected,
  selectSubmitting,
} from "../../features/pdfTemplates/pdfTemplatesSlice";
import PageHeader from "../../components/common/PageHeader";

const S = {
  card: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    padding: 24,
    marginBottom: 16,
  },
  sec: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2E86AB",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 5,
  },
  inp: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  sel: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    boxSizing: "border-box",
  },
  ta: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
    fontSize: 13,
    outline: "none",
    fontFamily: "monospace",
    resize: "vertical",
    boxSizing: "border-box",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    paddingBottom: 40,
  },
  btnC: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1.5px solid #E2E8F0",
    background: "#fff",
    color: "#374151",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  btnS: {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "#2E86AB",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
const MODULE_TYPES = [
  { v: "invoice", l: "Invoice" },
  { v: "estimate", l: "Estimate" },
  { v: "proforma", l: "Proforma Invoice" },
  { v: "purchase_order", l: "Purchase Order" },
  { v: "final_invoice", l: "Final Invoice" },
  { v: "rfq", l: "RFQ" },
];
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head><style>
  body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .company-name { font-size: 24px; font-weight: bold; color: #2E86AB; }
  .doc-title { font-size: 28px; font-weight: bold; color: #1E3A5F; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #F8FAFC; padding: 10px; text-align: left; font-size: 12px; }
  td { padding: 10px; border-bottom: 1px solid #EDF2F7; }
  .total { font-size: 18px; font-weight: bold; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="company-name">{{ company.name }}</div>
      <div>{{ company.address }}</div>
      <div>GSTIN: {{ company.gstin }}</div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">{{ doc_type }}</div>
      <div>#{{ obj.invoice_number or obj.estimate_number or obj.id }}</div>
      <div>Date: {{ obj.date }}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Amount</th></tr>
    </thead>
    <tbody>
      {% for item in items %}
      <tr>
        <td>{{ item.description }}</td>
        <td>{{ item.quantity }}</td>
        <td>{{ item.unit_price }}</td>
        <td>{{ item.tax_percent }}%</td>
        <td>{{ item.amount }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
  <div style="text-align:right">
    <div>Subtotal: {{ obj.subtotal }}</div>
    <div>Tax: {{ obj.tax_amount }}</div>
    <div class="total">Total: {{ obj.currency }} {{ obj.total }}</div>
  </div>
</body>
</html>`;

export default function PDFTemplateFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);
  const {
    register: reg,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors: errs },
  } = useForm({ defaultValues: { html_body: DEFAULT_HTML } });

  useEffect(() => {
    if (isEdit) dispatch(fetchOnePdfTemplates(id));
  }, [dispatch, id, isEdit]);
  useEffect(() => {
    if (isEdit && selected) reset(selected);
  }, [selected, isEdit, reset]);

  const onSubmit = async (data) => {
    const res = isEdit
      ? await dispatch(updatePdfTemplates({ id, data }))
      : await dispatch(createPdfTemplates(data));
    if (!res.error) navigate("/pdf-templates");
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit PDF Template" : "New PDF Template"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "PDF Templates", path: "/pdf-templates" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={S.card}>
          <div style={S.sec}>Template Settings</div>
          <div style={S.grid2}>
            <div>
              <label style={S.label}>
                Template Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...S.inp,
                  ...(errs.name ? { borderColor: "#EF4444" } : {}),
                }}
                {...reg("name", { required: "Name is required" })}
                placeholder="e.g. Default Invoice Template"
              />
              {errs.name && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {errs.name.message}
                </div>
              )}
            </div>
            <div>
              <label style={S.label}>
                Module Type <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                style={S.sel}
                {...reg("module_type", { required: "Module type is required" })}
              >
                <option value="">Select module...</option>
                {MODULE_TYPES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.l}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                id="is_default"
                {...reg("is_default")}
                style={{ width: 16, height: 16 }}
              />
              <label
                htmlFor="is_default"
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Set as default template for this module
              </label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                id="is_active"
                {...reg("is_active")}
                defaultChecked
                style={{ width: 16, height: 16 }}
              />
              <label
                htmlFor="is_active"
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                Active
              </label>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={S.sec}>HTML Template</div>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              Jinja2 syntax — use {"{{ obj.field }}"} and{" "}
              {"{% for item in items %}"}
            </span>
          </div>
          <textarea
            style={{ ...S.ta, minHeight: 400, fontSize: 12 }}
            {...reg("html_body")}
          />
        </div>
        <div style={S.footer}>
          <button
            type="button"
            style={S.btnC}
            onClick={() => navigate("/pdf-templates")}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ ...S.btnS, opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Update Template"
                : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
