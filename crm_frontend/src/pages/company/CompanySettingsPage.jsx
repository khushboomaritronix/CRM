// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import {
//   fetchOneCompany,  // Change from selectList/updateCompany
//   updateCompany,
//   selectSelected,   // Use selectSelected instead of selectList
//   selectSubmitting,
// } from "../../features/company/companySlice";
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";
// import { Camera, CheckCircle } from "lucide-react";

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
//   label: {
//     display: "block",
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#374151",
//     marginBottom: 5,
//   },
//   inp: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1.5px solid #E2E8F0",
//     borderRadius: 7,
//     fontSize: 13.5,
//     outline: "none",
//     fontFamily: "inherit",
//     boxSizing: "border-box",
//   },
//   ta: {
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
//   footer: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: 10,
//     paddingBottom: 40,
//     marginTop: 4,
//   },
//   btnS: {
//     padding: "10px 24px",
//     borderRadius: 8,
//     border: "none",
//     background: "#2E86AB",
//     color: "#fff",
//     fontWeight: 700,
//     fontSize: 14,
//     cursor: "pointer",
//   },
// };

// const F = ({ label, name, reg, type = "text", ph = "" }) => (
//   <div>
//     <label style={S.label}>{label}</label>
//     {type === "textarea" ? (
//       <textarea placeholder={ph} rows={3} style={S.ta} {...reg(name)} />
//     ) : (
//       <input type={type} placeholder={ph} style={S.inp} {...reg(name)} />
//     )}
//   </div>
// );

// export default function CompanySettingsPage() {
//   const dispatch = useDispatch();
//   const selected = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const { register: reg, handleSubmit, reset } = useForm();
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [logoFile, setLogoFile] = useState(null);
//   const [saved, setSaved] = useState(false);
//   const logoRef = useRef();
//  const company = selected; 

//  useEffect(() => {
//   // Fetch the company with ID 1 (singleton)
//   dispatch(fetchOneCompany(1));
// }, [dispatch]);
//   useEffect(() => {
//   if (company) {
//     reset(company);
//     if (company.logo)
//       setLogoPreview(
//         company.logo.startsWith("http")
//           ? company.logo
//           : `http://localhost:8000${company.logo}`,
//       );
//   }
// }, [company, reset]);

//   const onLogoChange = (ev) => {
//     const file = ev.target.files?.[0];
//     if (!file) return;
//     setLogoFile(file);
//     setLogoPreview(URL.createObjectURL(file));
//   };

//  const onSubmit = async (data) => {
//   const fd = new FormData();
//   Object.entries(data).forEach(([k, v]) => {
//     if (v !== null && v !== undefined && v !== "") fd.append(k, v);
//   });
//   if (logoFile) fd.append("logo", logoFile);

//   try {
//     // Always use ID 1 since it's a singleton
//     await api.patch(`/company/1/`, fd, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
    
//     // Refresh the data
//     dispatch(fetchOneCompany(1));
//     setSaved(true);
//     setTimeout(() => setSaved(false), 3000);
//   } catch (err) {
//     alert(
//       "Failed to save: " +
//         (err.response?.data?.detail ||
//           JSON.stringify(err.response?.data) ||
//           err.message),
//     );
//   }
// };

//   return (
//     <div>
//       <PageHeader
//         title="Company Settings"
//         subtitle="Your business profile and branding"
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Company Settings" },
//         ]}
//       />

//       {saved && (
//         <div
//           style={{
//             background: "#F0FFF4",
//             border: "1px solid #9AE6B4",
//             borderRadius: 10,
//             padding: "12px 16px",
//             marginBottom: 14,
//             fontSize: 13.5,
//             color: "#276749",
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <CheckCircle size={16} /> Company settings saved successfully!
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)}>
//         {/* Logo Upload */}
//         <div style={S.card}>
//           <div style={S.sec}>Company Logo</div>
//           <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
//             <div
//               style={{ position: "relative", cursor: "pointer" }}
//               onClick={() => logoRef.current?.click()}
//             >
//               {logoPreview ? (
//                 <img
//                   src={logoPreview}
//                   alt="Logo"
//                   style={{
//                     width: 100,
//                     height: 100,
//                     objectFit: "contain",
//                     border: "2px solid #E2E8F0",
//                     borderRadius: 10,
//                     background: "#F8FAFC",
//                     padding: 4,
//                   }}
//                 />
//               ) : (
//                 <div
//                   style={{
//                     width: 100,
//                     height: 100,
//                     border: "2px dashed #CBD5E0",
//                     borderRadius: 10,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: "#F8FAFC",
//                     color: "#94A3B8",
//                     gap: 6,
//                   }}
//                 >
//                   <Camera size={24} />
//                   <span style={{ fontSize: 11, fontWeight: 600 }}>
//                     Upload Logo
//                   </span>
//                 </div>
//               )}
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: 4,
//                   right: 4,
//                   background: "#2E86AB",
//                   borderRadius: "50%",
//                   width: 24,
//                   height: 24,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Camera size={12} color="#fff" />
//               </div>
//               <input
//                 ref={logoRef}
//                 type="file"
//                 accept="image/*"
//                 style={{ display: "none" }}
//                 onChange={onLogoChange}
//               />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: 13.5,
//                   fontWeight: 600,
//                   color: "#374151",
//                   marginBottom: 4,
//                 }}
//               >
//                 Upload your company logo
//               </div>
//               <div style={{ fontSize: 12.5, color: "#6B7280" }}>
//                 PNG or JPG recommended. Max 2MB. Will appear on all PDF
//                 documents.
//               </div>
//               {logoPreview && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setLogoPreview(null);
//                     setLogoFile(null);
//                   }}
//                   style={{
//                     marginTop: 8,
//                     fontSize: 12,
//                     color: "#EF4444",
//                     background: "none",
//                     border: "none",
//                     cursor: "pointer",
//                     padding: 0,
//                   }}
//                 >
//                   Remove logo
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Business Information</div>
//           <div style={S.grid2}>
//             <F
//               label="Company Name"
//               name="name"
//               reg={reg}
//               ph="Your company name"
//             />
//             <F label="Email" name="email" type="email" reg={reg} />
//             <F label="Phone" name="phone" reg={reg} />
//             <F label="Website" name="website" reg={reg} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Tax & Compliance</div>
//           <div style={S.grid2}>
//             <F label="GSTIN" name="gstin" reg={reg} />
//             <F label="PAN" name="pan" reg={reg} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Address</div>
//           <div style={S.grid2}>
//             <div style={{ gridColumn: "1/-1" }}>
//               <F label="Address" name="address" type="textarea" reg={reg} />
//             </div>
//             <F label="City" name="city" reg={reg} />
//             <F label="State" name="state" reg={reg} />
//             <F label="Country" name="country" reg={reg} />
//             <F label="Pincode" name="pincode" reg={reg} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Bank Details</div>
//           <div style={S.grid2}>
//             <F label="Bank Name" name="bank_name" reg={reg} />
//             <F label="Account Number" name="bank_account" reg={reg} />
//             <F label="IFSC Code" name="bank_ifsc" reg={reg} />
//             <F
//               label="Account Type"
//               name="bank_account_type"
//               reg={reg}
//               ph="Current / Savings"
//             />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Invoice Settings</div>
//           <div style={S.grid2}>
//             <F label="Default Currency" name="currency" reg={reg} ph="INR" />
//             <F
//               label="Invoice Prefix"
//               name="invoice_prefix"
//               reg={reg}
//               ph="INV"
//             />
//             <div style={{ gridColumn: "1/-1" }}>
//               <F
//                 label="Terms & Conditions"
//                 name="terms"
//                 type="textarea"
//                 reg={reg}
//               />
//             </div>
//             <div style={{ gridColumn: "1/-1" }}>
//               <F
//                 label="Footer Text"
//                 name="footer_text"
//                 type="textarea"
//                 reg={reg}
//               />
//             </div>
//           </div>
//         </div>

//         <div style={S.footer}>
//           <button
//             type="submit"
//             style={{ ...S.btnS, opacity: submitting ? 0.7 : 1 }}
//             disabled={submitting}
//           >
//             {submitting ? "Saving..." : "Save Company Settings"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useForm } from "react-hook-form";
// import {
//   fetchOneCompany,
//   updateCompany,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/company/companySlice";
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";
// import { Camera, CheckCircle } from "lucide-react";

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
//   label: {
//     display: "block",
//     fontSize: 13,
//     fontWeight: 600,
//     color: "#374151",
//     marginBottom: 5,
//   },
//   inp: {
//     width: "100%",
//     padding: "9px 12px",
//     border: "1.5px solid #E2E8F0",
//     borderRadius: 7,
//     fontSize: 13.5,
//     outline: "none",
//     fontFamily: "inherit",
//     boxSizing: "border-box",
//   },
//   ta: {
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
//   footer: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: 10,
//     paddingBottom: 40,
//     marginTop: 4,
//   },
//   btnS: {
//     padding: "10px 24px",
//     borderRadius: 8,
//     border: "none",
//     background: "#2E86AB",
//     color: "#fff",
//     fontWeight: 700,
//     fontSize: 14,
//     cursor: "pointer",
//   },
//   requiredStar: { color: "#EF4444", marginLeft: 2 },
//   helpText: { fontSize: 11, color: "#718096", marginTop: 2, fontStyle: "italic" },
//   errStyle: { fontSize: 11.5, color: "#DC2626", marginTop: 3 },
// };

// const F = ({ label, name, reg, type = "text", ph = "", required = false, errors = {} }) => (
//   <div>
//     <label style={S.label}>
//       {label}
//       {required && <span style={S.requiredStar}>*</span>}
//     </label>
//     {type === "textarea" ? (
//       <textarea 
//         placeholder={ph} 
//         rows={3} 
//         style={{...S.ta, ...(errors[name] ? {borderColor:"#EF4444"} : {})}} 
//         {...reg(name, {required: required ? `${label} is required` : false})} 
//       />
//     ) : (
//       <input 
//         type={type} 
//         placeholder={ph} 
//         style={{...S.inp, ...(errors[name] ? {borderColor:"#EF4444"} : {})}} 
//         {...reg(name, {required: required ? `${label} is required` : false})} 
//       />
//     )}
//     {errors[name] && <div style={S.errStyle}>{errors[name].message}</div>}
//   </div>
// );

// // Custom Field Component
// const CustomField = ({ field, register, errors, defaultValue }) => {
//   const fieldName = `custom_field_values.${field.field_key}`;
  
//   // Parse options if they're stored as JSON
//   const options = Array.isArray(field.options) ? field.options : [];
  
//   // Determine placeholder
//   const placeholder = field.placeholder || `Enter ${field.label.toLowerCase()}`;
  
//   // Skip if this field_key conflicts with existing model fields
//   const reservedFields = [
//     'id', 'name', 'email', 'phone', 'website', 'gstin', 'pan', 
//     'address', 'city', 'state', 'country', 'pincode', 
//     'bank_name', 'bank_account', 'bank_ifsc', 'bank_account_type',
//     'currency', 'invoice_prefix', 'terms', 'footer_text', 'logo',
//     'created_at', 'updated_at', 'custom_field_values'
//   ];
  
//   if (reservedFields.includes(field.field_key)) {
//     console.warn(`Skipping custom field with reserved key: ${field.field_key}`);
//     return null;
//   }

//   // Render based on field type
//   const renderField = () => {
//     switch (field.field_type) {
//       case 'textarea':
//         return (
//           <textarea 
//             style={{...S.ta, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             rows={3}
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false 
//             })}
//           />
//         );
      
//       case 'select':
//         return (
//           <select 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false 
//             })}
//           >
//             <option value="">Select {field.label}</option>
//             {options.map((opt, idx) => (
//               <option key={idx} value={opt.value || opt}>
//                 {opt.label || opt}
//               </option>
//             ))}
//           </select>
//         );
      
//       case 'boolean':
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <input 
//               type="checkbox"
//               defaultChecked={defaultValue === true || defaultValue === "true" || defaultValue === 1}
//               {...register(fieldName)}
//               style={{ width: 16, height: 16, cursor: "pointer" }}
//             />
//             <span style={{ fontSize: 13, color: "#4A5568" }}>Yes</span>
//           </div>
//         );
      
//       case 'number':
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="number"
//             step="any"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false,
//               valueAsNumber: true
//             })}
//           />
//         );
      
//       case 'date':
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="date"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false 
//             })}
//           />
//         );
      
//       case 'email':
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="email"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false,
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: "Invalid email address"
//               }
//             })}
//           />
//         );
      
//       case 'phone':
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="tel"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false 
//             })}
//           />
//         );
      
//       case 'url':
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="url"
//             placeholder="https://example.com"
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false,
//               pattern: {
//                 value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
//                 message: "Invalid URL format"
//               }
//             })}
//           />
//         );
      
//       default: // text
//         return (
//           <input 
//             style={{...S.inp, ...(errors[fieldName] ? {borderColor:"#EF4444"} : {})}}
//             type="text"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, { 
//               required: field.is_required ? `${field.label} is required` : false 
//             })}
//           />
//         );
//     }
//   };

//   return (
//     <div>
//       <label style={S.label}>
//         {field.label}
//         {field.is_required && <span style={S.requiredStar}>*</span>}
//         <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 4, fontWeight: "normal" }}>
//           ({field.field_type})
//         </span>
//       </label>
//       {renderField()}
//       {field.placeholder && !field.is_required && (
//         <div style={S.helpText}>e.g., {field.placeholder}</div>
//       )}
//       {errors[fieldName] && (
//         <div style={S.errStyle}>{errors[fieldName].message}</div>
//       )}
//     </div>
//   );
// };

// export default function CompanySettingsPage() {
//   const dispatch = useDispatch();
//   const selected = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const { register: reg, handleSubmit, reset, watch, formState: { errors: e } } = useForm({
//     defaultValues: {
//       custom_field_values: {} // Initialize custom_field_values
//     }
//   });
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [logoFile, setLogoFile] = useState(null);
//   const [saved, setSaved] = useState(false);
//   const [customFields, setCustomFields] = useState([]);
//   const [loadingCustomFields, setLoadingCustomFields] = useState(false);
//   const [companyModule, setCompanyModule] = useState(null);
//   const logoRef = useRef();
//   const company = selected; 

//   // Watch form values for debugging
//   const formValues = watch();
//   console.log("Current form values:", formValues);

//   // Fetch modules and get company module ID
//   useEffect(() => {
//     const fetchCompanyModule = async () => {
//       try {
//         const response = await api.get("/modules/");
//         const modules = Array.isArray(response.data) 
//           ? response.data 
//           : response.data?.results || [];
        
//         // Find company module
//         const module = modules.find(m => 
//           m.slug === "company" || 
//           m.name?.toLowerCase() === "company" ||
//           m.slug === "company_settings" ||
//           m.name?.toLowerCase() === "company settings"
//         );
        
//         if (module) {
//           console.log("Found company module:", module);
//           setCompanyModule(module);
//         } else {
//           console.warn("Company module not found");
//         }
//       } catch (error) {
//         console.error("Error fetching modules:", error);
//       }
//     };

//     fetchCompanyModule();
//   }, []);

//   // Fetch custom fields when we have the company module
//   useEffect(() => {
//     const fetchCustomFields = async () => {
//       if (!companyModule) return;
      
//       setLoadingCustomFields(true);
//       try {
//         console.log("Fetching custom fields for module:", companyModule.id);
//         const response = await api.get(`/custom-fields/?module=${companyModule.id}&is_active=true`);
//         const fields = Array.isArray(response.data) 
//           ? response.data 
//           : response.data?.results || [];
        
//         console.log("Fetched custom fields:", fields);
        
//         // Filter out fields with reserved keys
//         const reservedFields = [
//           'id', 'name', 'email', 'phone', 'website', 'gstin', 'pan', 
//           'address', 'city', 'state', 'country', 'pincode', 
//           'bank_name', 'bank_account', 'bank_ifsc', 'bank_account_type',
//           'currency', 'invoice_prefix', 'terms', 'footer_text', 'logo',
//           'created_at', 'updated_at', 'custom_field_values'
//         ];
        
//         const validFields = fields.filter(f => !reservedFields.includes(f.field_key));
        
//         if (validFields.length !== fields.length) {
//           console.warn('Filtered out reserved custom fields:', 
//             fields.filter(f => reservedFields.includes(f.field_key)).map(f => f.field_key));
//         }
        
//         // Sort by order field
//         validFields.sort((a, b) => (a.order || 0) - (b.order || 0));
//         setCustomFields(validFields);
//       } catch (error) {
//         console.error("Error fetching custom fields:", error);
//       } finally {
//         setLoadingCustomFields(false);
//       }
//     };

//     fetchCustomFields();
//   }, [companyModule]);

//   useEffect(() => {
//     // Fetch the company with ID 1 (singleton)
//     dispatch(fetchOneCompany(1));
//   }, [dispatch]);

//   useEffect(() => {
//     if (company) {
//       console.log("Resetting form with company data:", company);
      
//       // Extract only custom_field_values (ignore any custom_fields property)
//       const { custom_field_values, ...regularFields } = company;
      
//       reset({
//         ...regularFields,
//         custom_field_values: custom_field_values || {} // Use only custom_field_values
//       });
      
//       if (company.logo) {
//         setLogoPreview(
//           company.logo.startsWith("http")
//             ? company.logo
//             : `http://localhost:8000${company.logo}`,
//         );
//       }
//     }
//   }, [company, reset]);

//   const onLogoChange = (ev) => {
//     const file = ev.target.files?.[0];
//     if (!file) return;
//     setLogoFile(file);
//     setLogoPreview(URL.createObjectURL(file));
//   };

//   const onSubmit = async (data) => {
//     console.log("Form submitted with data:", data);
    
//     // Extract ONLY custom_field_values, ignore any custom_fields that might exist
//     const { custom_field_values, ...regularData } = data;
    
//     const fd = new FormData();
    
//     // Add regular fields
//     Object.entries(regularData).forEach(([k, v]) => {
//       if (v !== null && v !== undefined && v !== "") fd.append(k, v);
//     });
    
//     // Add custom field values as JSON string
//     if (custom_field_values && Object.keys(custom_field_values).length > 0) {
//       fd.append("custom_field_values", JSON.stringify(custom_field_values));
//     }
    
//     // Add logo if changed
//     if (logoFile) fd.append("logo", logoFile);

//     console.log("Submitting FormData with custom_field_values:", custom_field_values);

//     try {
//       // Always use ID 1 since it's a singleton
//       await api.patch(`/company/1/`, fd, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       // Refresh the data
//       dispatch(fetchOneCompany(1));
//       setSaved(true);
//       setTimeout(() => setSaved(false), 3000);
//     } catch (err) {
//       alert(
//         "Failed to save: " +
//           (err.response?.data?.detail ||
//             JSON.stringify(err.response?.data) ||
//             err.message),
//       );
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Company Settings"
//         subtitle="Your business profile and branding"
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Company Settings" },
//         ]}
//       />

//       {saved && (
//         <div
//           style={{
//             background: "#F0FFF4",
//             border: "1px solid #9AE6B4",
//             borderRadius: 10,
//             padding: "12px 16px",
//             marginBottom: 14,
//             fontSize: 13.5,
//             color: "#276749",
//             display: "flex",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <CheckCircle size={16} /> Company settings saved successfully!
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)}>
//         {/* Logo Upload */}
//         <div style={S.card}>
//           <div style={S.sec}>Company Logo</div>
//           <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
//             <div
//               style={{ position: "relative", cursor: "pointer" }}
//               onClick={() => logoRef.current?.click()}
//             >
//               {logoPreview ? (
//                 <img
//                   src={logoPreview}
//                   alt="Logo"
//                   style={{
//                     width: 100,
//                     height: 100,
//                     objectFit: "contain",
//                     border: "2px solid #E2E8F0",
//                     borderRadius: 10,
//                     background: "#F8FAFC",
//                     padding: 4,
//                   }}
//                 />
//               ) : (
//                 <div
//                   style={{
//                     width: 100,
//                     height: 100,
//                     border: "2px dashed #CBD5E0",
//                     borderRadius: 10,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: "#F8FAFC",
//                     color: "#94A3B8",
//                     gap: 6,
//                   }}
//                 >
//                   <Camera size={24} />
//                   <span style={{ fontSize: 11, fontWeight: 600 }}>
//                     Upload Logo
//                   </span>
//                 </div>
//               )}
//               <div
//                 style={{
//                   position: "absolute",
//                   bottom: 4,
//                   right: 4,
//                   background: "#2E86AB",
//                   borderRadius: "50%",
//                   width: 24,
//                   height: 24,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Camera size={12} color="#fff" />
//               </div>
//               <input
//                 ref={logoRef}
//                 type="file"
//                 accept="image/*"
//                 style={{ display: "none" }}
//                 onChange={onLogoChange}
//               />
//             </div>
//             <div>
//               <div
//                 style={{
//                   fontSize: 13.5,
//                   fontWeight: 600,
//                   color: "#374151",
//                   marginBottom: 4,
//                 }}
//               >
//                 Upload your company logo
//               </div>
//               <div style={{ fontSize: 12.5, color: "#6B7280" }}>
//                 PNG or JPG recommended. Max 2MB. Will appear on all PDF
//                 documents.
//               </div>
//               {logoPreview && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setLogoPreview(null);
//                     setLogoFile(null);
//                   }}
//                   style={{
//                     marginTop: 8,
//                     fontSize: 12,
//                     color: "#EF4444",
//                     background: "none",
//                     border: "none",
//                     cursor: "pointer",
//                     padding: 0,
//                   }}
//                 >
//                   Remove logo
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Business Information</div>
//           <div style={S.grid2}>
//             <F
//               label="Company Name"
//               name="name"
//               reg={reg}
//               ph="Your company name"
//               required
//               errors={e}
//             />
//             <F label="Email" name="email" type="email" reg={reg} errors={e} />
//             <F label="Phone" name="phone" reg={reg} errors={e} />
//             <F label="Website" name="website" reg={reg} errors={e} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Tax & Compliance</div>
//           <div style={S.grid2}>
//             <F label="GSTIN" name="gstin" reg={reg} errors={e} />
//             <F label="PAN" name="pan" reg={reg} errors={e} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Address</div>
//           <div style={S.grid2}>
//             <div style={{ gridColumn: "1/-1" }}>
//               <F label="Address" name="address" type="textarea" reg={reg} errors={e} />
//             </div>
//             <F label="City" name="city" reg={reg} errors={e} />
//             <F label="State" name="state" reg={reg} errors={e} />
//             <F label="Country" name="country" reg={reg} errors={e} />
//             <F label="Pincode" name="pincode" reg={reg} errors={e} />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Bank Details</div>
//           <div style={S.grid2}>
//             <F label="Bank Name" name="bank_name" reg={reg} errors={e} />
//             <F label="Account Number" name="bank_account" reg={reg} errors={e} />
//             <F label="IFSC Code" name="bank_ifsc" reg={reg} errors={e} />
//             <F
//               label="Account Type"
//               name="bank_account_type"
//               reg={reg}
//               ph="Current / Savings"
//               errors={e}
//             />
//           </div>
//         </div>

//         <div style={S.card}>
//           <div style={S.sec}>Invoice Settings</div>
//           <div style={S.grid2}>
//             <F label="Default Currency" name="currency" reg={reg} ph="INR" errors={e} />
//             <F
//               label="Invoice Prefix"
//               name="invoice_prefix"
//               reg={reg}
//               ph="INV"
//               errors={e}
//             />
//             <div style={{ gridColumn: "1/-1" }}>
//               <F
//                 label="Terms & Conditions"
//                 name="terms"
//                 type="textarea"
//                 reg={reg}
//                 errors={e}
//               />
//             </div>
//             <div style={{ gridColumn: "1/-1" }}>
//               <F
//                 label="Footer Text"
//                 name="footer_text"
//                 type="textarea"
//                 reg={reg}
//                 errors={e}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Custom Fields Section */}
//         {customFields.length > 0 && (
//           <div style={S.card}>
//             <div style={S.sec}>
//               Custom Fields
//               {companyModule && (
//                 <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8, fontWeight: "normal" }}>
//                   ({companyModule.name})
//                 </span>
//               )}
//             </div>
            
//             {loadingCustomFields ? (
//               <div style={{ textAlign: "center", padding: 20, color: "#9CA3AF" }}>
//                 Loading custom fields...
//               </div>
//             ) : (
//               <div style={S.grid2}>
//                 {customFields.map((field) => (
//                   <CustomField 
//                     key={field.id}
//                     field={field}
//                     register={reg}
//                     errors={e}
//                     defaultValue={company?.custom_field_values?.[field.field_key]}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div style={S.footer}>
//           <button
//             type="submit"
//             style={{ ...S.btnS, opacity: submitting ? 0.7 : 1 }}
//             disabled={submitting}
//           >
//             {submitting ? "Saving..." : "Save Company Settings"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  fetchOneCompany,
  selectSelected,
  selectSubmitting,
} from "../../features/company/companySlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";
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
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { fontSize: 13, fontWeight: 600, marginBottom: 5 },
  inp: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
  },
  ta: {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #E2E8F0",
    borderRadius: 7,
  },
  footer: { display: "flex", justifyContent: "flex-end" },
  btn: {
    padding: "10px 24px",
    borderRadius: 8,
    background: "#2E86AB",
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  imagePreview: {
    marginTop: 12,
    maxWidth: 200,
    maxHeight: 80,
    objectFit: "contain",
    border: "1px solid #ddd",
    borderRadius: 4,
    padding: 4,
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
  },
};

const F = ({ label, name, reg, type = "text", error }) => (
  <div>
    <label style={S.label}>{label}</label>
    {type === "textarea" ? (
      <textarea {...reg(name)} rows={3} style={S.ta} />
    ) : (
      <input type={type} {...reg(name)} style={S.inp} />
    )}
    {error && <div style={S.error}>{error}</div>}
  </div>
);

export default function CompanySettingsPage() {
  const dispatch = useDispatch();
  const company = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { custom_field_values: {} },
  });

  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const logoRef = useRef();
  const sigRef = useRef();

  useEffect(() => {
    dispatch(fetchOneCompany(1));
  }, [dispatch]);

  // Reset form with company data, explicitly removing logo and signature fields
  // useEffect(() => {
  //   if (company) {
  //     // Destructure to exclude logo and signature (they are not form fields)
  //     const { logo, signature, ...rest } = company;
  //     reset(rest);
  //     // Set previews from existing images (if the API provides URLs)
  //     if (company.logo?.url) setLogoPreview(company.logo.url);
  //     if (company.signature?.url) setSignaturePreview(company.signature.url);
  //   }
  // }, [company, reset]);
//   useEffect(() => {
//   if (company) {
//     // Exclude logo and signature from the form (they are not text fields)
//     const { logo, signature, ...rest } = company;
//     reset(rest);
    
//     // Set previews from the URL strings (if they exist)
//     if (logo) setLogoPreview(logo);
//     if (signature) setSignaturePreview(signature);
//   }
// }, [company, reset]);

useEffect(() => {
  if (company) {
    const { logo, signature, ...rest } = company;

    reset({
      ...rest,
      custom_field_values: company.custom_field_values || {},
    });

    if (logo) setLogoPreview(logo);
    if (signature) setSignaturePreview(signature);
  }
}, [company, reset]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setSignaturePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

const onSubmit = async (data) => {
  setSaved(false);
  setSaveError(null);

  // 1. Remove any accidental logo/signature keys from the form data
  const cleanedData = { ...data };
  delete cleanedData.logo;
  delete cleanedData.signature;

  // 2. Build FormData
  const fd = new FormData();
  

  // Append primitive fields
  // Object.entries(cleanedData).forEach(([k, v]) => {
  //   if (v === null || v === undefined || v === "") return;
  //   if (typeof v === "object") return; // skip nested objects
  //   fd.append(k, v);
  // });

  Object.entries(cleanedData).forEach(([k, v]) => {

  if (k === "custom_field_values") {
    fd.append("custom_field_values", JSON.stringify(v || {}));
    return;
  }

  if (v === null || v === undefined || v === "") return;

  fd.append(k, v);
});

  // 3. Append files only if they are valid File objects
  if (logoFile && logoFile instanceof File) {
    console.log(`✅ Logo: ${logoFile.name} (${logoFile.size} bytes)`);
    fd.append("logo", logoFile);
  } else {
    console.log("❌ No valid logo file");
  }

  if (signatureFile && signatureFile instanceof File) {
    console.log(`✅ Signature: ${signatureFile.name} (${signatureFile.size} bytes)`);
    fd.append("signature", signatureFile);
  } else {
    console.log("❌ No valid signature file");
  }

  // 4. Debug: log all FormData entries
  console.log("📦 FormData being sent:");
  for (let [key, val] of fd.entries()) {
    console.log(key, val instanceof File ? `${val.name} (size: ${val.size})` : val);
  }

  try {
    // 5. Explicitly set Content-Type header
    const response = await api.patch("/company/1/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("✅ Success:", response.data);
    setSaved(true);
    dispatch(fetchOneCompany(1));
    // Clear file inputs
    if (logoRef.current) logoRef.current.value = "";
    if (sigRef.current) sigRef.current.value = "";
    setLogoFile(null);
    setSignatureFile(null);
    setTimeout(() => setSaved(false), 3000);
  } catch (err) {
    console.error("❌ Error response:", err.response?.data);
    setSaveError(err.response?.data?.message || "Failed to save settings");
  }
};

  return (
    <div>
      <PageHeader title="Company Settings" />

      {saved && (
        <div style={{ color: "green", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <CheckCircle size={16} /> Saved successfully
        </div>
      )}

      {saveError && (
        <div style={{ color: "#d32f2f", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={16} /> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* LOGO */}
        <div style={S.card}>
          <div style={S.sec}>Company Logo</div>
          <input
            ref={logoRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
        {logoPreview && <img src={logoPreview} alt="Logo preview" style={S.imagePreview} />}
        </div>

        {/* SIGNATURE */}
        <div style={S.card}>
          <div style={S.sec}>Authorized Signature</div>
          <input
            ref={sigRef}
            type="file"
            accept="image/*"
            onChange={handleSignatureChange}
          />
         {signaturePreview && <img src={signaturePreview} alt="Signature preview" style={S.imagePreview} />}
          
          <F label="Signature Name" name="signature_name" reg={register} error={errors.signature_name?.message} />
        </div>

        {/* BUSINESS */}
        <div style={S.card}>
          <div style={S.sec}>Business Info</div>
          <div style={S.grid2}>
            <F label="Company Name" name="name" reg={register} error={errors.name?.message} />
            <F label="Email" name="email" reg={register} error={errors.email?.message} />
            <F label="Phone" name="phone" reg={register} error={errors.phone?.message} />
            <F label="Website" name="website" reg={register} error={errors.website?.message} />
            <F label="GSTIN" name="gstin" reg={register} error={errors.gstin?.message} />
          </div>
          <div style={S.grid2}>
            <F label="Address" name="address" reg={register} error={errors.address?.message} />
            <F label="City" name="city" reg={register} error={errors.city?.message} />
            <F label="State" name="state" reg={register} error={errors.state?.message} />
            <F label="Pincode" name="pincode" reg={register} error={errors.pincode?.message} />
            <F label="Country" name="country" reg={register} error={errors.country?.message} />
          </div>
        </div>

        {/* BANK */}
        <div style={S.card}>
          <div style={S.sec}>Bank Details</div>
          <div style={S.grid2}>
            <F label="Bank Name" name="bank_name" reg={register} error={errors.bank_name?.message} />
            <F label="Account Number" name="bank_account" reg={register} error={errors.bank_account?.message} />
            <F label="IFSC" name="bank_ifsc" reg={register} error={errors.bank_ifsc?.message} />
          </div>
        </div>

        {/* INVOICE */}
        <div style={S.card}>
          <div style={S.sec}>Invoice Settings</div>
          <div style={S.grid2}>
            <F label="Currency" name="currency" reg={register} error={errors.currency?.message} />
            <F label="Invoice Prefix" name="invoice_prefix" reg={register} error={errors.invoice_prefix?.message} />
            <F
              label="Invoice Due Days"
              name="invoice_due_after_days"
              type="number"
              reg={register}
              error={errors.invoice_due_after_days?.message}
            />
            {/* <F
              label="Financial Year Start"
              name="financial_year_start"
              type="date"
              reg={register}
              error={errors.financial_year_start?.message}
            /> */}
          </div>
          <F label="Terms URL" name="terms" type="textarea" reg={register} error={errors.terms?.message} />
          <F
            label="Footer Text"
            name="footer_text"
            type="textarea"
            reg={register}
            error={errors.footer_text?.message}
          />
        </div>
      <div style={S.card}>
  <div style={S.sec}>Custom Fields</div>

  <CustomFieldRenderer
    moduleSlug="company"
    register={register}
    errors={errors}
    defaultValues={company?.custom_field_values}
  />
</div>


        <div style={S.footer}>
          <button
            type="submit"
            style={{ ...S.btn, ...(submitting && S.btnDisabled) }}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}