import React, { useEffect, useState } from "react";
import api from "../../services/api";

const styles = {
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 4 },
  input: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
  },
  textarea: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
  },
};

export default function CustomFieldRenderer({
  moduleSlug,
  register,
  errors,
  defaultValues = {},
}) {
  const [module, setModule] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch module
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await api.get("/modules/");
        const modules = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        const m = modules.find(
          (mod) =>
            mod.slug === moduleSlug ||
            mod.name?.toLowerCase() === moduleSlug
        );

        if (m) setModule(m);
      } catch (err) {
        console.error("Module fetch error", err);
      }
    };

    fetchModule();
  }, [moduleSlug]);

  // Fetch custom fields
  useEffect(() => {
    const fetchFields = async () => {
      if (!module) return;

      setLoading(true);

      try {
        const res = await api.get(
          `/custom-fields/?module=${module.id}&is_active=true`
        );

        const f = Array.isArray(res.data)
          ? res.data
          : res.data?.results || [];

        setFields(f);
      } catch (err) {
        console.error("Custom fields error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [module]);

  const renderField = (field) => {
    const name = `custom_field_values.${field.field_key}`;
    const defaultValue = defaultValues[field.field_key];

    switch (field.field_type) {
      case "textarea":
        return (
          <textarea
            {...register(name)}
            defaultValue={defaultValue}
            rows={3}
            style={styles.textarea}
          />
        );

      case "select":
        return (
          <select {...register(name)} defaultValue={defaultValue} style={styles.input}>
            <option value="">Select</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            {...register(name)}
            defaultValue={defaultValue}
            style={styles.input}
          />
        );

      case "date":
        return (
          <input
            type="date"
            {...register(name)}
            defaultValue={defaultValue}
            style={styles.input}
          />
        );

      case "boolean":
        return (
          <input
            type="checkbox"
            {...register(name)}
            defaultChecked={defaultValue}
          />
        );

      default:
        return (
          <input
            type="text"
            {...register(name)}
            defaultValue={defaultValue}
            style={styles.input}
          />
        );
    }
  };

  if (loading) return <div>Loading custom fields...</div>;
  if (!fields.length) return null;

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
        Custom Fields
      </div>

      <div style={styles.grid}>
        {fields.map((field) => (
          <div key={field.id}>
            <label style={styles.label}>
              {field.label}
              {field.is_required && <span style={{ color: "red" }}> *</span>}
            </label>

            {renderField(field)}

            {errors?.[`custom_field_values.${field.field_key}`] && (
              <div style={{ color: "red", fontSize: 12 }}>
                {errors[`custom_field_values.${field.field_key}`]?.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}