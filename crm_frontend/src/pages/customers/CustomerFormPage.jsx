import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createCustomers, updateCustomers, fetchOneCustomers, selectSelected, selectSubmitting } from "../../features/customers/customersSlice";
import PageHeader from "../../components/common/PageHeader";
import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";
const FIELDS = [
  { section: "Basic Information", fields: [
    { name: "name", label: "Full Name *", required: true, colSpan: 2 },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone" },
    { name: "mobile", label: "Mobile" },
    { name: "company_name", label: "Company Name" },
    { name: "website", label: "Website", type: "url" },
  ]},
  { section: "Tax Information", fields: [
    { name: "gstin", label: "GSTIN" },
    { name: "pan", label: "PAN" },
    { name: "payment_terms", label: "Payment Terms" },
    { name: "credit_limit", label: "Credit Limit", type: "number" },
  ]},
  { section: "Billing Address", fields: [
    { name: "billing_address", label: "Address", type: "textarea", colSpan: 2 },
    { name: "billing_city", label: "City" },
    { name: "billing_state", label: "State" },
    { name: "billing_country", label: "Country" },
    { name: "billing_pincode", label: "Pincode" },
  ]},
  { section: "Shipping Address", fields: [
    { name: "shipping_address", label: "Address", type: "textarea", colSpan: 2 },
    { name: "shipping_city", label: "City" },
    { name: "shipping_state", label: "State" },
    { name: "shipping_country", label: "Country" },
    { name: "shipping_pincode", label: "Pincode" },
  ]},
  { section: "Notes", fields: [
    { name: "notes", label: "Notes / Remarks", type: "textarea", colSpan: 2 },
  ]},
];

export default function CustomerFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);

  // const { register, handleSubmit, reset, formState: { errors } } = useForm();
const { register, handleSubmit, reset, formState: { errors } } = useForm({
  defaultValues: {
    custom_field_values: {}
  }
});
  useEffect(() => {
    if (isEdit) {
      dispatch(fetchOneCustomers(id));
    }
  }, [dispatch, id, isEdit]);

  // useEffect(() => {
  //   if (isEdit && selected) reset(selected);
  // }, [selected, isEdit, reset]);
useEffect(() => {
  if (isEdit && selected) {
    reset({
      ...selected,
      custom_field_values: selected.custom_field_values || {}
    });
  }
}, [selected, isEdit, reset]);

  // const onSubmit = async (data) => {
  //   let result;
  //   if (isEdit) {
  //     result = await dispatch(updateCustomers({ id, data }));
  //   } else {
  //     result = await dispatch(createCustomers(data));
  //   }
  //   if (!result.error) {
  //     navigate("/customers");
  //   }
  // };
   const onSubmit = async (data) => {

  const { custom_field_values, ...rest } = data;

  const payload = {
    ...rest,
    custom_field_values: custom_field_values || {}
  };

  let result;

  if (isEdit) {
    result = await dispatch(updateCustomers({ id, data: payload }));
  } else {
    result = await dispatch(createCustomers(payload));
  }
    if (!result.error) {
      navigate("/customers");
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Customer" : "New Customer"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Customers", path: "/customers" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {FIELDS.map(({ section, fields }) => (
          <div key={section} style={styles.card}>
            <h3 style={styles.sectionTitle}>{section}</h3>
            <div style={styles.grid}>
              {fields.map((f) => (
                <div
                  key={f.name}
                  style={{ ...styles.fieldGroup, ...(f.colSpan === 2 ? styles.colSpan2 : {}) }}
                >
                  <label style={styles.label}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      style={styles.textarea}
                      {...register(f.name, { required: f.required ? `${f.label.replace(" *", "")} is required` : false })}
                      rows={3}
                    />
                  ) : (
                    <input
                      style={{ ...styles.input, ...(errors[f.name] ? styles.inputError : {}) }}
                      type={f.type || "text"}
                      {...register(f.name, { required: f.required ? `${f.label.replace(" *", "")} is required` : false })}
                    />
                  )}
                  {errors[f.name] && <span style={styles.fieldError}>{errors[f.name].message}</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={styles.card}>
  <h3 style={styles.sectionTitle}>Custom Fields</h3>

  <CustomFieldRenderer
    moduleSlug="customers"
    register={register}
    errors={errors}
    defaultValues={selected?.custom_field_values}
  />
</div>

        <div style={styles.formFooter}>
          <button type="button" style={styles.btnCancel} onClick={() => navigate("/customers")}>
            Cancel
          </button>
          <button type="submit" style={styles.btnSave} disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Update Customer" : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: { background: "white", borderRadius: 10, border: "1px solid #E2E8F0", padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#2E86AB", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 5 },
  colSpan2: { gridColumn: "1 / -1" },
  label: { fontSize: 13, fontWeight: 600, color: "#2D3748" },
  input: {
    padding: "10px 12px", borderRadius: 7, border: "1.5px solid #E2E8F0",
    fontSize: 13.5, outline: "none", fontFamily: "inherit",
  },
  inputError: { borderColor: "#FC8181" },
  textarea: {
    padding: "10px 12px", borderRadius: 7, border: "1.5px solid #E2E8F0",
    fontSize: 13.5, outline: "none", fontFamily: "inherit", resize: "vertical",
  },
  fieldError: { fontSize: 11.5, color: "#E53E3E" },
  formFooter: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 },
  btnCancel: {
    padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0",
    background: "white", color: "#4A5568", fontWeight: 600, fontSize: 14,
    cursor: "pointer",
  },
  btnSave: {
    padding: "10px 24px", borderRadius: 8, border: "none",
    background: "#2E86AB", color: "white", fontWeight: 700, fontSize: 14,
    cursor: "pointer",
  },
};
