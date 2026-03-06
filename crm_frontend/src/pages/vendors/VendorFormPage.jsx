// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createVendors,
//   updateVendors,
//   fetchOneVendors,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/vendors/vendorsSlice";
// import PageHeader from "../../components/common/PageHeader";

// const S = {
//   card: {
//     background: "#fff",
//     borderRadius: 10,
//     border: "1px solid #E2E8F0",
//     padding: 24,
//     marginBottom: 16,
//   },
//   sec: {
//     fontSize: 12,
//     fontWeight: 700,
//     color: "#2E86AB",
//     marginBottom: 14,
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//   },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
//   grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
//   full: { gridColumn: "1/-1" },
//   label: {
//     display: "block",
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#374151",
//     marginBottom: 5,
//   },
//   input: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1.5px solid #E2E8F0",
//     borderRadius: 7,
//     fontSize: 13.5,
//     outline: "none",
//     fontFamily: "inherit",
//     boxSizing: "border-box",
//   },
//   select: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1.5px solid #E2E8F0",
//     borderRadius: 7,
//     fontSize: 13.5,
//     outline: "none",
//     fontFamily: "inherit",
//     background: "#fff",
//     boxSizing: "border-box",
//   },
//   textarea: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1.5px solid #E2E8F0",
//     borderRadius: 7,
//     fontSize: 13.5,
//     outline: "none",
//     fontFamily: "inherit",
//     resize: "vertical",
//     boxSizing: "border-box",
//   },
//   errInput: { borderColor: "#EF4444" },
//   err: { fontSize: 11.5, color: "#DC2626", marginTop: 3 },
//   footer: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: 10,
//     marginTop: 8,
//     paddingBottom: 40,
//   },
//   cancel: {
//     padding: "10px 20px",
//     borderRadius: 8,
//     border: "1.5px solid #E2E8F0",
//     background: "#fff",
//     color: "#374151",
//     fontWeight: 600,
//     fontSize: 14,
//     cursor: "pointer",
//   },
//   save: {
//     padding: "10px 24px",
//     borderRadius: 8,
//     border: "none",
//     background: "#2E86AB",
//     color: "#fff",
//     fontWeight: 700,
//     fontSize: 14,
//     cursor: "pointer",
//   },
//   badge: (c) => ({
//     display: "inline-flex",
//     alignItems: "center",
//     padding: "2px 8px",
//     borderRadius: 20,
//     fontSize: 11.5,
//     fontWeight: 600,
//     whiteSpace: "nowrap",
//     ...badgeColors[c || "gray"],
//   }),
// };
// const badgeColors = {
//   green: {
//     background: "#F0FFF4",
//     color: "#276749",
//     border: "1px solid #9AE6B4",
//   },
//   red: { background: "#FFF5F5", color: "#9B2C2C", border: "1px solid #FEB2B2" },
//   blue: {
//     background: "#EBF8FF",
//     color: "#2C5282",
//     border: "1px solid #90CDF4",
//   },
//   yellow: {
//     background: "#FFFFF0",
//     color: "#744210",
//     border: "1px solid #FAF089",
//   },
//   gray: {
//     background: "#F7FAFC",
//     color: "#4A5568",
//     border: "1px solid #E2E8F0",
//   },
//   orange: {
//     background: "#FFFAF0",
//     color: "#7B341E",
//     border: "1px solid #FBBF24",
//   },
//   purple: {
//     background: "#FAF5FF",
//     color: "#553C9A",
//     border: "1px solid #D6BCFA",
//   },
// };
// const statusColor = {
//   draft: "gray",
//   sent: "blue",
//   paid: "green",
//   partial: "yellow",
//   overdue: "red",
//   cancelled: "red",
//   received: "green",
//   approved: "green",
// };
// const Field = ({
//   label,
//   name,
//   reg,
//   errs,
//   type = "text",
//   required = false,
//   full = false,
//   opts = [],
// }) => (
//   <div style={full ? S.full : {}}>
//     <label style={S.label}>
//       {label}
//       {required && <span style={{ color: "#EF4444" }}> *</span>}
//     </label>
//     {type === "textarea" ? (
//       <textarea
//         style={S.textarea}
//         rows={3}
//         {...reg(name, { required: required ? label + " is required" : false })}
//       />
//     ) : type === "select" ? (
//       <select
//         style={S.select}
//         {...reg(name, { required: required ? label + " is required" : false })}
//       >
//         <option value="">Select...</option>
//         {opts.map((o) => (
//           <option key={o.value || o} value={o.value || o}>
//             {o.label || o}
//           </option>
//         ))}
//       </select>
//     ) : (
//       <input
//         style={{ ...S.input, ...(errs[name] ? S.errInput : {}) }}
//         type={type}
//         {...reg(name, { required: required ? label + " is required" : false })}
//       />
//     )}
//     {errs[name] && <div style={S.err}>{errs[name].message}</div>}
//   </div>
// );

// export default function VendorFormPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = !!id;
//   const selected = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const {
//     register: reg,
//     handleSubmit,
//     reset,
//     formState: { errors: errs },
//   } = useForm();
//   useEffect(() => {
//     if (isEdit) dispatch(fetchOneVendors(id));
//   }, [dispatch, id, isEdit]);
//   useEffect(() => {
//     if (isEdit && selected) reset(selected);
//   }, [selected, isEdit, reset]);
//   const onSubmit = async (data) => {
//     const res = isEdit
//       ? await dispatch(updateVendors({ id, data }))
//       : await dispatch(createVendors(data));
//     if (!res.error) navigate("/vendors");
//   };
//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Vendor" : "New Vendor"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Vendors", path: "/vendors" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//       />
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={S.card}>
//           <div style={S.sec}>Basic Information</div>
//           <div style={S.grid2}>
//             <Field
//               label="Vendor Name"
//               name="name"
//               reg={reg}
//               errs={errs}
//               required
//             />
//             <Field
//               label="Company Name"
//               name="company_name"
//               reg={reg}
//               errs={errs}
//             />
//             <Field
//               label="Email"
//               name="email"
//               type="email"
//               reg={reg}
//               errs={errs}
//             />
//             <Field label="Phone" name="phone" reg={reg} errs={errs} />
//             <Field
//               label="Payment Terms"
//               name="payment_terms"
//               reg={reg}
//               errs={errs}
//             />
//           </div>
//         </div>
//         <div style={S.card}>
//           <div style={S.sec}>Tax & Compliance</div>
//           <div style={S.grid2}>
//             <Field label="GSTIN" name="gstin" reg={reg} errs={errs} />
//             <Field label="PAN" name="pan" reg={reg} errs={errs} />
//           </div>
//         </div>
//         <div style={S.card}>
//           <div style={S.sec}>Address</div>
//           <div style={S.grid2}>
//             <Field
//               label="Address"
//               name="address"
//               type="textarea"
//               reg={reg}
//               errs={errs}
//               full
//             />
//             <Field label="City" name="city" reg={reg} errs={errs} />
//             <Field label="State" name="state" reg={reg} errs={errs} />
//             <Field label="Country" name="country" reg={reg} errs={errs} />
//             <Field label="Pincode" name="pincode" reg={reg} errs={errs} />
//           </div>
//         </div>
//         <div style={S.card}>
//           <div style={S.sec}>Bank Details</div>
//           <div style={S.grid2}>
//             <Field label="Bank Name" name="bank_name" reg={reg} errs={errs} />
//             <Field
//               label="Account Number"
//               name="bank_account"
//               reg={reg}
//               errs={errs}
//             />
//             <Field label="IFSC Code" name="bank_ifsc" reg={reg} errs={errs} />
//           </div>
//         </div>
//         <div style={S.card}>
//           <div style={S.sec}>Notes</div>
//           <Field
//             label="Notes"
//             name="notes"
//             type="textarea"
//             reg={reg}
//             errs={errs}
//             full
//           />
//         </div>
//         <div style={S.footer}>
//           <button
//             type="button"
//             style={S.cancel}
//             onClick={() => navigate("/vendors")}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             style={{ ...S.save, opacity: submitting ? 0.7 : 1 }}
//             disabled={submitting}
//           >
//             {submitting
//               ? "Saving..."
//               : isEdit
//                 ? "Update Vendor"
//                 : "Create Vendor"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createVendors, updateVendors, fetchOneVendors, selectSelected, selectSubmitting } from "../../features/vendors/vendorsSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const S = {
  card: { background:"#fff", borderRadius:10, border:"1px solid #E2E8F0", padding:24, marginBottom:16 },
  sec: { fontSize:12, fontWeight:700, color:"#2E86AB", marginBottom:14, textTransform:"uppercase", letterSpacing:0.8 },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  grid3: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 },
  full: { gridColumn:"1/-1" },
  label: { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:5 },
  input: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", boxSizing:"border-box" },
  select: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", background:"#fff", boxSizing:"border-box" },
  textarea: { width:"100%", padding:"9px 12px", border:"1.5px solid #E2E8F0", borderRadius:7, fontSize:13.5, outline:"none", fontFamily:"inherit", resize:"vertical", boxSizing:"border-box" },
  errInput: { borderColor:"#EF4444" },
  err: { fontSize:11.5, color:"#DC2626", marginTop:3 },
  footer: { display:"flex", justifyContent:"flex-end", gap:10, marginTop:8, paddingBottom:40 },
  cancel: { padding:"10px 20px", borderRadius:8, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontWeight:600, fontSize:14, cursor:"pointer" },
  save: { padding:"10px 24px", borderRadius:8, border:"none", background:"#2E86AB", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" },
  helpText: { fontSize: 11, color: "#718096", marginTop: 2, fontStyle: "italic" },
  requiredStar: { color: "#EF4444", marginLeft: 2 }
};

const Field = ({label, name, reg, errs, type="text", required=false, full=false, opts=[], placeholder=""}) => (
  <div style={full ? S.full : {}}>
    <label style={S.label}>
      {label}
      {required && <span style={S.requiredStar}>*</span>}
    </label>
    {type === "textarea" ? (
      <textarea 
        style={{...S.textarea, ...(errs[name] ? S.errInput : {})}} 
        rows={3} 
        placeholder={placeholder}
        {...reg(name, {required: required ? `${label} is required` : false})} 
      />
    ) : type === "select" ? (
      <select 
        style={{...S.select, ...(errs[name] ? S.errInput : {})}} 
        {...reg(name, {required: required ? `${label} is required` : false})}
      >
        <option value="">Select {label}</option>
        {opts.map(o => (
          <option key={o.value || o} value={o.value || o}>
            {o.label || o}
          </option>
        ))}
      </select>
    ) : (
      <input 
        style={{...S.input, ...(errs[name] ? S.errInput : {})}} 
        type={type} 
        placeholder={placeholder}
        {...reg(name, {required: required ? `${label} is required` : false})} 
      />
    )}
    {errs[name] && <div style={S.err}>{errs[name].message}</div>}
  </div>
);

// Custom Field Component - Now using custom_field_values only
const CustomField = ({ field, register, errors, defaultValue }) => {
  // Use custom_field_values exclusively (no custom_fields)
  const fieldName = `custom_field_values.${field.field_key}`;
  
  // Parse options if they're stored as JSON
  const options = Array.isArray(field.options) ? field.options : [];
  
  // Determine placeholder
  const placeholder = field.placeholder || `Enter ${field.label.toLowerCase()}`;
  
  // Skip if this field_key conflicts with existing model fields
  const reservedFields = ['id', 'name', 'vendor_code', 'website', 'billing_address', 
    'shipping_address', 'return_policy', 'email', 'phone', 'company_name', 'address', 
    'city', 'state', 'country', 'pincode', 'gstin', 'pan', 'payment_terms', 
    'bank_name', 'bank_account', 'bank_ifsc', 'is_active', 'notes', 'created_at', 
    'updated_at', 'custom_field_values'];
  
  if (reservedFields.includes(field.field_key)) {
    console.warn(`Skipping custom field with reserved key: ${field.field_key}`);
    return null;
  }

  // Render based on field type
  const renderField = () => {
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea 
            style={{...S.textarea, ...(errors[fieldName] ? S.errInput : {})}}
            rows={3}
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false 
            })}
          />
        );
      
      case 'select':
        return (
          <select 
            style={{...S.select, ...(errors[fieldName] ? S.errInput : {})}}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false 
            })}
          >
            <option value="">Select {field.label}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input 
              type="checkbox"
              defaultChecked={defaultValue === true || defaultValue === "true" || defaultValue === 1}
              {...register(fieldName)}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: "#4A5568" }}>Yes</span>
          </div>
        );
      
      case 'number':
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="number"
            step="any"
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false,
              valueAsNumber: true
            })}
          />
        );
      
      case 'date':
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="date"
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false 
            })}
          />
        );
      
      case 'email':
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="email"
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
        );
      
      case 'phone':
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="tel"
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false 
            })}
          />
        );
      
      case 'url':
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="url"
            placeholder="https://example.com"
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false,
              pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
                message: "Invalid URL format"
              }
            })}
          />
        );
      
      default: // text
        return (
          <input 
            style={{...S.input, ...(errors[fieldName] ? S.errInput : {})}}
            type="text"
            placeholder={placeholder}
            defaultValue={defaultValue}
            {...register(fieldName, { 
              required: field.is_required ? `${field.label} is required` : false 
            })}
          />
        );
    }
  };

  return (
    <div>
      <label style={S.label}>
        {field.label}
        {field.is_required && <span style={S.requiredStar}>*</span>}
        <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4, fontWeight: "normal" }}>
          ({field.field_type})
        </span>
      </label>
      {renderField()}
      {field.placeholder && !field.is_required && (
        <div style={S.helpText}>e.g., {field.placeholder}</div>
      )}
      {errors[fieldName] && (
        <div style={S.err}>{errors[fieldName].message}</div>
      )}
    </div>
  );
};

export default function VendorFormPage() {
  const dispatch = useDispatch(); 
  const navigate = useNavigate(); 
  const { id } = useParams();
  const isEdit = !!id; 
  const selected = useSelector(selectSelected); 
  const submitting = useSelector(selectSubmitting);
  const [customFields, setCustomFields] = useState([]);
  const [loadingCustomFields, setLoadingCustomFields] = useState(false);
  const [vendorModule, setVendorModule] = useState(null);
  
  const { register, handleSubmit, reset, watch, formState: { errors: errs } } = useForm({
    defaultValues: {
      custom_field_values: {} // Initialize custom_field_values
    }
  });

  // Watch form values for debugging
  const formValues = watch();
  console.log("Current form values:", formValues);

  // Fetch modules and get vendor module ID
  useEffect(() => {
    const fetchVendorModule = async () => {
      try {
        const response = await api.get("/modules/");
        const modules = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || [];
        
        // Find vendor module
        const module = modules.find(m => 
          m.slug === "vendors" || 
          m.name?.toLowerCase() === "vendors" ||
          m.slug === "vendor" ||
          m.name?.toLowerCase() === "vendor"
        );
        
        if (module) {
          console.log("Found vendor module:", module);
          setVendorModule(module);
        } else {
          console.warn("Vendor module not found");
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    fetchVendorModule();
  }, []);

  // Fetch custom fields when we have the vendor module
  useEffect(() => {
    const fetchCustomFields = async () => {
      if (!vendorModule) return;
      
      setLoadingCustomFields(true);
      try {
        console.log("Fetching custom fields for module:", vendorModule.id);
        const response = await api.get(`/custom-fields/?module=${vendorModule.id}&is_active=true`);
        const fields = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || [];
        
        console.log("Fetched custom fields:", fields);
        
        // Filter out fields with reserved keys
        const reservedFields = ['id', 'name', 'vendor_code', 'website', 'billing_address', 
          'shipping_address', 'return_policy', 'email', 'phone', 'company_name', 'address', 
          'city', 'state', 'country', 'pincode', 'gstin', 'pan', 'payment_terms', 
          'bank_name', 'bank_account', 'bank_ifsc', 'is_active', 'notes', 'created_at', 
          'updated_at', 'custom_field_values'];
        
        const validFields = fields.filter(f => !reservedFields.includes(f.field_key));
        
        if (validFields.length !== fields.length) {
          console.warn('Filtered out reserved custom fields:', 
            fields.filter(f => reservedFields.includes(f.field_key)).map(f => f.field_key));
        }
        
        // Sort by order field
        validFields.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCustomFields(validFields);
      } catch (error) {
        console.error("Error fetching custom fields:", error);
      } finally {
        setLoadingCustomFields(false);
      }
    };

    fetchCustomFields();
  }, [vendorModule]);

  // Fetch vendor data if editing
  useEffect(() => { 
    if (isEdit) {
      console.log("Fetching vendor data for edit:", id);
      dispatch(fetchOneVendors(id)); 
    }
  }, [dispatch, id, isEdit]);

  // Reset form with vendor data - IMPORTANT: Only use custom_field_values
  useEffect(() => { 
    if (isEdit && selected) {
      console.log("Resetting form with selected vendor:", selected);
      
      // Extract only custom_field_values (ignore any custom_fields property)
      const { custom_field_values, ...regularFields } = selected;
      
      // Make sure we're only using custom_field_values
      reset({
        ...regularFields,
        custom_field_values: custom_field_values || {} // Use only custom_field_values
      });
    } else if (!isEdit) {
      // Reset to empty for new vendor
      reset({
        custom_field_values: {}
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    
    // IMPORTANT: Extract ONLY custom_field_values, ignore any custom_fields that might exist
    const { custom_field_values, ...regularData } = data;
    
    // Prepare payload with ONLY custom_field_values (no custom_fields property)
    const payload = {
      ...regularData,
      custom_field_values: custom_field_values || {} // Use only custom_field_values
    };
    
    // Remove any stray custom_fields property if it exists
    if (payload.custom_fields) {
      delete payload.custom_fields;
    }
    
    console.log("Submitting payload (should only have custom_field_values):", payload);
    
    try {
      const res = isEdit 
        ? await dispatch(updateVendors({ id, data: payload })) 
        : await dispatch(createVendors(payload));
      
      console.log("Submission response:", res);
      
      if (!res.error) navigate("/vendors");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div>
      <PageHeader 
        title={isEdit ? "Edit Vendor" : "New Vendor"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Vendors", path: "/vendors" },
          { label: isEdit ? "Edit" : "New" }
        ]} 
      />
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Regular form sections - same as before */}
        <div style={S.card}>
          <div style={S.sec}>Basic Information</div>
          <div style={S.grid2}>
            <Field 
              label="Vendor Name" 
              name="name" 
              reg={register} 
              errs={errs} 
              required 
              placeholder="Enter vendor name"
            />
            <Field 
              label="Vendor Code" 
              name="vendor_code" 
              reg={register} 
              errs={errs} 
              placeholder="Auto-generated if blank"
            />
            <Field 
              label="Company Name" 
              name="company_name" 
              reg={register} 
              errs={errs} 
              placeholder="Enter company name"
            />
            <Field 
              label="Website" 
              name="website" 
              type="url" 
              reg={register} 
              errs={errs} 
              placeholder="https://example.com"
            />
            <Field 
              label="Email" 
              name="email" 
              type="email" 
              reg={register} 
              errs={errs} 
              placeholder="vendor@example.com"
            />
            <Field 
              label="Phone" 
              name="phone" 
              reg={register} 
              errs={errs} 
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Address Information</div>
          <div style={S.grid2}>
            <Field 
              label="Address" 
              name="address" 
              type="textarea" 
              reg={register} 
              errs={errs} 
              full 
              placeholder="Street address"
            />
            <Field 
              label="Billing Address" 
              name="billing_address" 
              type="textarea" 
              reg={register} 
              errs={errs} 
              placeholder="Billing address (if different)"
            />
            <Field 
              label="Shipping Address" 
              name="shipping_address" 
              type="textarea" 
              reg={register} 
              errs={errs} 
              placeholder="Shipping address (if different)"
            />
            <Field 
              label="City" 
              name="city" 
              reg={register} 
              errs={errs} 
              placeholder="Mumbai"
            />
            <Field 
              label="State" 
              name="state" 
              reg={register} 
              errs={errs} 
              placeholder="Maharashtra"
            />
            <Field 
              label="Country" 
              name="country" 
              reg={register} 
              errs={errs} 
              placeholder="India"
            />
            <Field 
              label="Pincode" 
              name="pincode" 
              reg={register} 
              errs={errs} 
              placeholder="400001"
            />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Tax & Compliance</div>
          <div style={S.grid2}>
            <Field 
              label="GSTIN" 
              name="gstin" 
              reg={register} 
              errs={errs} 
              placeholder="22AAAAA0000A1Z5"
            />
            <Field 
              label="PAN" 
              name="pan" 
              reg={register} 
              errs={errs} 
              placeholder="ABCDE1234F"
            />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Payment & Banking</div>
          <div style={S.grid2}>
            <Field 
              label="Payment Terms" 
              name="payment_terms" 
              reg={register} 
              errs={errs} 
              placeholder="Net 30"
            />
            <Field 
              label="Bank Name" 
              name="bank_name" 
              reg={register} 
              errs={errs} 
              placeholder="State Bank of India"
            />
            <Field 
              label="Account Number" 
              name="bank_account" 
              reg={register} 
              errs={errs} 
              placeholder="12345678901"
            />
            <Field 
              label="IFSC Code" 
              name="bank_ifsc" 
              reg={register} 
              errs={errs} 
              placeholder="SBIN0001234"
            />
          </div>
        </div>

        <div style={S.card}>
          <div style={S.sec}>Additional Information</div>
          <div style={S.grid2}>
            <Field 
              label="Return Policy" 
              name="return_policy" 
              type="textarea" 
              reg={register} 
              errs={errs} 
              placeholder="Return policy details..."
            />
            <Field 
              label="Notes" 
              name="notes" 
              type="textarea" 
              reg={register} 
              errs={errs} 
              placeholder="Additional notes about this vendor..."
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input 
                type="checkbox"
                id="is_active"
                defaultChecked={true}
                {...register("is_active")}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="is_active" style={{ fontSize: 13, color: "#4A5568" }}>
                Active Vendor
              </label>
            </div>
          </div>
        </div>

        {/* Custom Fields Section */}
        {customFields.length > 0 && (
          <div style={S.card}>
            <div style={S.sec}>
              Custom Fields
              {vendorModule && (
                <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8, fontWeight: "normal" }}>
                  ({vendorModule.name})
                </span>
              )}
            </div>
            
            {loadingCustomFields ? (
              <div style={{ textAlign: "center", padding: 20, color: "#9CA3AF" }}>
                Loading custom fields...
              </div>
            ) : (
              <div style={S.grid2}>
                {customFields.map((field) => (
                  <CustomField 
                    key={field.id}
                    field={field}
                    register={register}
                    errors={errs}
                    defaultValue={selected?.custom_field_values?.[field.field_key]}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div style={S.footer}>
          <button type="button" style={S.cancel} onClick={() => navigate("/vendors")}>
            Cancel
          </button>
          <button 
            type="submit" 
            style={{...S.save, opacity: submitting ? 0.7 : 1}} 
            disabled={submitting}
          >
            {submitting ? "Saving..." : isEdit ? "Update Vendor" : "Create Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}