// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { createCreditNotes, updateCreditNotes, fetchOneCreditNotes, selectSelected, selectSubmitting } from "../../features/creditNotes/creditNotesSlice";
// import PageHeader from "../../components/common/PageHeader";
// import DataTable from "../../components/common/DataTable";
// import DocLineItems from "../../components/common/DocLineItems";
// import api from "../../services/api";

// const Cs={background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:22,marginBottom:14};
// const Ss={fontSize:11.5,fontWeight:700,color:"#2E86AB",marginBottom:13,textTransform:"uppercase",letterSpacing:0.8};
// const G2s={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
// const Ls={display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4};
// const Is={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
// const Sl={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",background:"#fff",boxSizing:"border-box"};
// const Ta={width:"100%",padding:"9px 12px",border:"1.5px solid #E2E8F0",borderRadius:7,fontSize:13.5,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"};

// export default function CreditNoteFormPage() {
//   const dispatch=useDispatch(); const navigate=useNavigate(); const{id}=useParams();
//   const isEdit=!!id; const selected=useSelector(selectSelected); const submitting=useSelector(selectSubmitting);
//   const{register:reg,handleSubmit,reset,watch,formState:{errors:e}}=useForm({defaultValues:{currency:"INR",status:"draft"}});
//   const[parties,setParties]=useState([]);
//   const[items,setItems]=useState([{description:"",quantity:1,unit:"",unit_price:0,tax_percent:0,amount:"0.00"}]);

//   useEffect(()=>{
//     api.get("/customers/?page_size=200").then(r=>setParties(Array.isArray(r.data)?r.data:r.data.results||[]));
//     if(isEdit)dispatch(fetchOneCreditNotes(id));
//   },[dispatch,id,isEdit]);

//   useEffect(()=>{
//     if(isEdit&&selected){
//       reset(selected);
//       if(selected.items?.length>0)setItems(selected.items);
//     }
//   },[selected,isEdit,reset]);

//   const onSubmit=async(data)=>{
//     const payload={...data,items};
//     const res=isEdit?await dispatch(updateCreditNotes({id,data:payload})):await dispatch(createCreditNotes(payload));
//     if(!res.error)navigate("/credit-notes");
//   };

//   return(
//     <div>
//       <PageHeader title={isEdit?"Edit Credit Note":"New Credit Note"}
//         breadcrumbs={[{label:"Dashboard",path:"/dashboard"},{label:"Credit Note",path:"/credit-notes"},{label:isEdit?"Edit":"New"}]}/>
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Details</div>
//           <div style={G2s}>
//             <div>
//               <label style={Ls}>Number <span style={{color:"#EF4444"}}>*</span></label>
//               <input style={{...Is,...(e.credit_number?{borderColor:"#EF4444"}:{})}} placeholder="e.g. CN-001" {...reg("credit_number",{required:"Number is required"})}/>
//               {e.credit_number&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.credit_number.message}</div>}
//             </div>
//             <div>
//               <label style={Ls}>Customer <span style={{color:"#EF4444"}}>*</span></label>
//               <select style={Sl} {...reg("customer",{required:"Customer is required"})}>
//                 <option value="">Select Customer...</option>
//                 {parties.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
//               </select>
//               {e.customer&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.customer.message}</div>}
//             </div>
//             <div><label style={Ls}>Date <span style={{color:"#EF4444"}}>*</span></label>
//               <input type="date" style={{...Is,...(e.date?{borderColor:"#EF4444"}:{})}} {...reg("date",{required:"Date is required"})}/>
//               {e.date&&<div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>{e.date.message}</div>}
//             </div>
//             <div><label style={Ls}>Status</label>
//               <select style={Sl} {...reg("status")}>
//                 <option value="draft">Draft</option><option value="issued">Issued</option><option value="applied">Applied</option><option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//             <div><label style={Ls}>Currency</label>
//               <select style={Sl} {...reg("currency")}>
//                 {["INR","USD","EUR","GBP","AED"].map(c=><option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>

//           </div>
//         </div>

//         <DocLineItems items={items} setItems={setItems} currency={watch("currency")||"INR"}/>

//         <div style={Cs}>
//           <div style={Ss}>Notes & Reason</div>
//           <div style={G2s}>
//             <div><label style={Ls}>Reason</label><textarea rows={2} style={Ta} {...reg("reason")}/></div>
//             <div><label style={Ls}>Notes</label><textarea rows={2} style={Ta} {...reg("notes")}/></div>
//           </div>
//         </div>
//         <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:36}}>
//           <button type="button" style={{padding:"10px 20px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#fff",color:"#374151",fontWeight:600,fontSize:14,cursor:"pointer"}} onClick={()=>navigate("/credit-notes")}>Cancel</button>
//           <button type="submit" style={{...{padding:"10px 24px",borderRadius:8,border:"none",background:"#2E86AB",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer"},opacity:submitting?.7:1}} disabled={submitting}>
//             {submitting?"Saving...":isEdit?"Update Credit Note":"Create Credit Note"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createCreditNotes,
//   updateCreditNotes,
//   fetchOneCreditNotes,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/creditNotes/creditNotesSlice";
// import PageHeader from "../../components/common/PageHeader";
// import DataTable from "../../components/common/DataTable";
// import DocLineItems from "../../components/common/DocLineItems";
// import api from "../../services/api";
// import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";
// const Cs = {
//   background: "#fff",
//   borderRadius: 10,
//   border: "1px solid #E2E8F0",
//   padding: 22,
//   marginBottom: 14,
// };
// const Ss = {
//   fontSize: 11.5,
//   fontWeight: 700,
//   color: "#2E86AB",
//   marginBottom: 13,
//   textTransform: "uppercase",
//   letterSpacing: 0.8,
// };
// const G2s = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
// const Ls = {
//   display: "block",
//   fontSize: 13,
//   fontWeight: 600,
//   color: "#374151",
//   marginBottom: 4,
// };
// const Is = {
//   width: "100%",
//   padding: "9px 12px",
//   border: "1.5px solid #E2E8F0",
//   borderRadius: 7,
//   fontSize: 13.5,
//   outline: "none",
//   fontFamily: "inherit",
//   boxSizing: "border-box",
// };
// const Sl = {
//   width: "100%",
//   padding: "9px 12px",
//   border: "1.5px solid #E2E8F0",
//   borderRadius: 7,
//   fontSize: 13.5,
//   outline: "none",
//   fontFamily: "inherit",
//   background: "#fff",
//   boxSizing: "border-box",
// };
// const Ta = {
//   width: "100%",
//   padding: "9px 12px",
//   border: "1.5px solid #E2E8F0",
//   borderRadius: 7,
//   fontSize: 13.5,
//   outline: "none",
//   fontFamily: "inherit",
//   resize: "vertical",
//   boxSizing: "border-box",
// };
// const errStyle = { fontSize: 11.5, color: "#DC2626", marginTop: 3 };
// const requiredStar = { color: "#EF4444", marginLeft: 2 };
// const helpText = {
//   fontSize: 11,
//   color: "#718096",
//   marginTop: 2,
//   fontStyle: "italic",
// };

// // Custom Field Component
// const CustomField = ({ field, register, errors, defaultValue }) => {
//   const fieldName = `custom_field_values.${field.field_key}`;

//   // Parse options if they're stored as JSON
//   const options = Array.isArray(field.options) ? field.options : [];

//   // Determine placeholder
//   const placeholder = field.placeholder || `Enter ${field.label.toLowerCase()}`;

//   // Skip if this field_key conflicts with existing model fields
//   const reservedFields = [
//     "id",
//     "credit_number",
//     "customer",
//     "date",
//     "status",
//     "currency",
//     "reason",
//     "notes",
//     "items",
//     "created_at",
//     "updated_at",
//     "custom_field_values",
//     "total_amount",
//     "subtotal",
//     "tax_total",
//   ];

//   if (reservedFields.includes(field.field_key)) {
//     console.warn(`Skipping custom field with reserved key: ${field.field_key}`);
//     return null;
//   }

//   // Render based on field type
//   const renderField = () => {
//     switch (field.field_type) {
//       case "textarea":
//         return (
//           <textarea
//             style={{
//               ...Ta,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             rows={3}
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//             })}
//           />
//         );

//       case "select":
//         return (
//           <select
//             style={{
//               ...Sl,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
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

//       case "boolean":
//         return (
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <input
//               type="checkbox"
//               defaultChecked={
//                 defaultValue === true ||
//                 defaultValue === "true" ||
//                 defaultValue === 1
//               }
//               {...register(fieldName)}
//               style={{ width: 16, height: 16, cursor: "pointer" }}
//             />
//             <span style={{ fontSize: 13, color: "#4A5568" }}>Yes</span>
//           </div>
//         );

//       case "number":
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="number"
//             step="any"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//               valueAsNumber: true,
//             })}
//           />
//         );

//       case "date":
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="date"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//             })}
//           />
//         );

//       case "email":
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="email"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: "Invalid email address",
//               },
//             })}
//           />
//         );

//       case "phone":
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="tel"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//             })}
//           />
//         );

//       case "url":
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="url"
//             placeholder="https://example.com"
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//               pattern: {
//                 value:
//                   /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i,
//                 message: "Invalid URL format",
//               },
//             })}
//           />
//         );

//       default: // text
//         return (
//           <input
//             style={{
//               ...Is,
//               ...(errors[fieldName] ? { borderColor: "#EF4444" } : {}),
//             }}
//             type="text"
//             placeholder={placeholder}
//             defaultValue={defaultValue}
//             {...register(fieldName, {
//               required: field.is_required
//                 ? `${field.label} is required`
//                 : false,
//             })}
//           />
//         );
//     }
//   };

//   return (
//     <div>
//       <label style={Ls}>
//         {field.label}
//         {field.is_required && <span style={requiredStar}>*</span>}
//         <span
//           style={{
//             fontSize: 11,
//             color: "#9CA3AF",
//             marginLeft: 4,
//             fontWeight: "normal",
//           }}
//         >
//           ({field.field_type})
//         </span>
//       </label>
//       {renderField()}
//       {field.placeholder && !field.is_required && (
//         <div style={helpText}>e.g., {field.placeholder}</div>
//       )}
//       {errors[fieldName] && (
//         <div style={errStyle}>{errors[fieldName].message}</div>
//       )}
//     </div>
//   );
// };

// export default function CreditNoteFormPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = !!id;
//   const selected = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const [parties, setParties] = useState([]);
//   const [items, setItems] = useState([
//     {
//       description: "",
//       quantity: 1,
//       unit: "",
//       unit_price: 0,
//       tax_percent: 0,
//       amount: "0.00",
//     },
//   ]);
//   // const [customFields, setCustomFields] = useState([]);
//   // const [loadingCustomFields, setLoadingCustomFields] = useState(false);
//   // const [creditNoteModule, setCreditNoteModule] = useState(null);

//   const {
//     register: reg,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors: e },
//   } = useForm({
//     defaultValues: {
//       currency: "INR",
//       status: "draft",
//       custom_field_values: {}, // Initialize custom_field_values
//     },
//   });

//   // Watch form values for debugging
//   const formValues = watch();
//   console.log("Current form values:", formValues);

//   // Fetch modules and get credit note module ID
//   useEffect(() => {
//     const fetchCreditNoteModule = async () => {
//       try {
//         const response = await api.get("/modules/");
//         const modules = Array.isArray(response.data)
//           ? response.data
//           : response.data?.results || [];

//         // Find credit note module
//         const module = modules.find(
//           (m) =>
//             m.slug === "credit_notes" ||
//             m.name?.toLowerCase() === "credit notes" ||
//             m.slug === "credit-note" ||
//             m.name?.toLowerCase() === "credit note",
//         );

//         if (module) {
//           console.log("Found credit note module:", module);
//           setCreditNoteModule(module);
//         } else {
//           console.warn("Credit note module not found");
//         }
//       } catch (error) {
//         console.error("Error fetching modules:", error);
//       }
//     };

//     fetchCreditNoteModule();
//   }, []);

//   // Fetch custom fields when we have the credit note module
//   useEffect(() => {
//     const fetchCustomFields = async () => {
//       if (!creditNoteModule) return;

//       setLoadingCustomFields(true);
//       try {
//         console.log("Fetching custom fields for module:", creditNoteModule.id);
//         const response = await api.get(
//           `/custom-fields/?module=${creditNoteModule.id}&is_active=true`,
//         );
//         const fields = Array.isArray(response.data)
//           ? response.data
//           : response.data?.results || [];

//         console.log("Fetched custom fields:", fields);

//         // Filter out fields with reserved keys
//         const reservedFields = [
//           "id",
//           "credit_number",
//           "customer",
//           "date",
//           "status",
//           "currency",
//           "reason",
//           "notes",
//           "items",
//           "created_at",
//           "updated_at",
//           "custom_field_values",
//           "total_amount",
//           "subtotal",
//           "tax_total",
//         ];

//         const validFields = fields.filter(
//           (f) => !reservedFields.includes(f.field_key),
//         );

//         if (validFields.length !== fields.length) {
//           console.warn(
//             "Filtered out reserved custom fields:",
//             fields
//               .filter((f) => reservedFields.includes(f.field_key))
//               .map((f) => f.field_key),
//           );
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
//   }, [creditNoteModule]);

//   useEffect(() => {
//     api
//       .get("/customers/?page_size=200")
//       .then((r) =>
//         setParties(Array.isArray(r.data) ? r.data : r.data.results || []),
//       );
//     if (isEdit) dispatch(fetchOneCreditNotes(id));
//   }, [dispatch, id, isEdit]);

//   useEffect(() => {
//     if (isEdit && selected) {
//       console.log("Resetting form with selected credit note:", selected);

//       // Extract only custom_field_values (ignore any custom_fields property)
//       const {
//         custom_field_values,
//         items: selectedItems,
//         ...regularFields
//       } = selected;

//       reset({
//         ...regularFields,
//         custom_field_values: custom_field_values || {}, // Use only custom_field_values
//       });

//       if (selectedItems?.length > 0) setItems(selectedItems);
//     }
//   }, [selected, isEdit, reset]);

//   const onSubmit = async (data) => {
//     console.log("Form submitted with data:", data);

//     // Extract ONLY custom_field_values, ignore any custom_fields that might exist
//     const { custom_field_values, ...regularData } = data;

//     // Prepare payload with ONLY custom_field_values
//     const payload = {
//       ...regularData,
//       items,
//       custom_field_values: custom_field_values || {}, // Use only custom_field_values
//     };

//     // Remove any stray custom_fields property if it exists
//     if (payload.custom_fields) {
//       delete payload.custom_fields;
//     }

//     console.log("Submitting payload:", payload);

//     const res = isEdit
//       ? await dispatch(updateCreditNotes({ id, data: payload }))
//       : await dispatch(createCreditNotes(payload));

//     if (!res.error) navigate("/credit-notes");
//   };

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Credit Note" : "New Credit Note"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Credit Note", path: "/credit-notes" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//       />
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Details</div>
//           <div style={G2s}>
//             <div>
//               <label style={Ls}>
//                 Number <span style={requiredStar}>*</span>
//               </label>
//               <input
//                 style={{
//                   ...Is,
//                   ...(e.credit_number ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 placeholder="e.g. CN-001"
//                 {...reg("credit_number", { required: "Number is required" })}
//               />
//               {e.credit_number && (
//                 <div style={errStyle}>{e.credit_number.message}</div>
//               )}
//             </div>
//             <div>
//               <label style={Ls}>
//                 Customer <span style={requiredStar}>*</span>
//               </label>
//               <select
//                 style={Sl}
//                 {...reg("customer", { required: "Customer is required" })}
//               >
//                 <option value="">Select Customer...</option>
//                 {parties.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//               {e.customer && <div style={errStyle}>{e.customer.message}</div>}
//             </div>
//             <div>
//               <label style={Ls}>
//                 Date <span style={requiredStar}>*</span>
//               </label>
//               <input
//                 type="date"
//                 style={{ ...Is, ...(e.date ? { borderColor: "#EF4444" } : {}) }}
//                 {...reg("date", { required: "Date is required" })}
//               />
//               {e.date && <div style={errStyle}>{e.date.message}</div>}
//             </div>
//             <div>
//               <label style={Ls}>Status</label>
//               <select style={Sl} {...reg("status")}>
//                 <option value="draft">Draft</option>
//                 <option value="issued">Issued</option>
//                 <option value="applied">Applied</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//             <div>
//               <label style={Ls}>Currency</label>
//               <select style={Sl} {...reg("currency")}>
//                 {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <DocLineItems
//           items={items}
//           setItems={setItems}
//           currency={watch("currency") || "INR"}
//         />

//         {/* Custom Fields Section */}
//         {/* {customFields.length > 0 && (
//           <div style={Cs}>
//             <div style={Ss}>
//               Custom Fields
//               {creditNoteModule && (
//                 <span
//                   style={{
//                     fontSize: 11,
//                     color: "#9CA3AF",
//                     marginLeft: 8,
//                     fontWeight: "normal",
//                   }}
//                 >
//                   ({creditNoteModule.name})
//                 </span>
//               )}
//             </div>

//             {loadingCustomFields ? (
//               <div
//                 style={{ textAlign: "center", padding: 20, color: "#9CA3AF" }}
//               >
//                 Loading custom fields...
//               </div>
//             ) : (
//               <div style={G2s}>
//                 {customFields.map((field) => (
//                   <CustomField
//                     key={field.id}
//                     field={field}
//                     register={reg}
//                     errors={e}
//                     defaultValue={
//                       selected?.custom_field_values?.[field.field_key]
//                     }
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         )} */}

//         <div style={Cs}>
//           <div style={Ss}>Notes & Reason</div>
//           <div style={G2s}>
//             <div>
//               <label style={Ls}>Reason</label>
//               <textarea rows={2} style={Ta} {...reg("reason")} />
//             </div>
//             <div>
//               <label style={Ls}>Notes</label>
//               <textarea rows={2} style={Ta} {...reg("notes")} />
//             </div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             gap: 10,
//             paddingBottom: 36,
//           }}
//         >
//           <button
//             type="button"
//             style={{
//               padding: "10px 20px",
//               borderRadius: 8,
//               border: "1.5px solid #E2E8F0",
//               background: "#fff",
//               color: "#374151",
//               fontWeight: 600,
//               fontSize: 14,
//               cursor: "pointer",
//             }}
//             onClick={() => navigate("/credit-notes")}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             style={{
//               ...{
//                 padding: "10px 24px",
//                 borderRadius: 8,
//                 border: "none",
//                 background: "#2E86AB",
//                 color: "#fff",
//                 fontWeight: 700,
//                 fontSize: 14,
//                 cursor: "pointer",
//               },
//               opacity: submitting ? 0.7 : 1,
//             }}
//             disabled={submitting}
//           >
//             {submitting
//               ? "Saving..."
//               : isEdit
//                 ? "Update Credit Note"
//                 : "Create Credit Note"}
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
import {
  createCreditNotes,
  updateCreditNotes,
  fetchOneCreditNotes,
  selectSelected,
  selectSubmitting,
} from "../../features/creditNotes/creditNotesSlice";

import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";
import api from "../../services/api";

const Cs = {
  background: "#fff",
  borderRadius: 10,
  border: "1px solid #E2E8F0",
  padding: 22,
  marginBottom: 14,
};

const Ss = {
  fontSize: 11.5,
  fontWeight: 700,
  color: "#2E86AB",
  marginBottom: 13,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const G2s = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

const Ls = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 4,
};

const Is = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 7,
  fontSize: 13.5,
};

const Sl = { ...Is, background: "#fff" };
const Ta = { ...Is, resize: "vertical" };

export default function CreditNoteFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);

  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([
    {
      item_name: "",
      description: "",
      quantity: 1,
      unit: "",
      unit_price: 0,
      tax_percent: 0,
      amount: "0.00",
    },
  ]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currency: "INR",
      status: "draft",
      custom_field_values: {},
    },
  });

  /*
  ==========================
  FETCH CUSTOMERS
  ==========================
  */

  useEffect(() => {
    api
      .get("/customers/?page_size=200")
      .then((res) =>
        setCustomers(Array.isArray(res.data) ? res.data : res.data.results || [])
      );

    if (isEdit) dispatch(fetchOneCreditNotes(id));
  }, [dispatch, id, isEdit]);

  /*
  ==========================
  RESET FORM WHEN EDIT
  ==========================
  */

  useEffect(() => {
    if (isEdit && selected) {
      const { custom_field_values, items: selectedItems, ...rest } = selected;

      reset({
        ...rest,
        custom_field_values: custom_field_values || {},
      });

      if (selectedItems?.length) setItems(selectedItems);
    }
  }, [selected, isEdit, reset]);

  /*
  ==========================
  SUBMIT FORM
  ==========================
  */

  const onSubmit = async (data) => {
    const { custom_field_values, ...rest } = data;

    const payload = {
      ...rest,
      items,
      custom_field_values: custom_field_values || {},
    };

    const res = isEdit
      ? await dispatch(updateCreditNotes({ id, data: payload }))
      : await dispatch(createCreditNotes(payload));

    if (!res.error) navigate("/credit-notes");
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Credit Note" : "New Credit Note"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Credit Notes", path: "/credit-notes" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ================= DETAILS ================= */}

        <div style={Cs}>
          <div style={Ss}>Details</div>

          <div style={G2s}>
            <div>
              <label style={Ls}>Credit Number *</label>
              <input
                style={Is}
                placeholder="e.g. CN-001"
                {...register("credit_number", { required: "Required" })}
              />
              {errors.credit_number && (
                <div style={{ color: "red", fontSize: 12 }}>
                  {errors.credit_number.message}
                </div>
              )}
            </div>

            <div>
              <label style={Ls}>Customer *</label>

              <select
                style={Sl}
                {...register("customer", { required: "Required" })}
              >
                <option value="">Select customer...</option>

                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={Ls}>Date *</label>

              <input
                type="date"
                style={Is}
                {...register("date", { required: "Required" })}
              />
            </div>

            <div>
              <label style={Ls}>Status</label>

              <select style={Sl} {...register("status")}>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="applied">Applied</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={Ls}>Currency</label>

              <select style={Sl} {...register("currency")}>
                {["INR", "USD", "EUR", "GBP", "AED"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================= LINE ITEMS ================= */}

        <DocLineItems
          items={items}
          setItems={setItems}
          currency={watch("currency") || "INR"}
        />

       

        {/* ================= NOTES ================= */}

        <div style={Cs}>
          <div style={Ss}>Notes</div>

          <div style={G2s}>
            <div>
              <label style={Ls}>Reason</label>
              <textarea rows={2} style={Ta} {...register("reason")} />
            </div>

            <div>
              <label style={Ls}>Notes</label>
              <textarea rows={2} style={Ta} {...register("notes")} />
            </div>
          </div>
        </div>
         {/* ================= CUSTOM FIELDS ================= */}

        <CustomFieldRenderer
          moduleSlug="credit_notes"
          register={register}
          errors={errors}
          defaultValues={selected?.custom_field_values}
        />

        {/* ================= ACTION BUTTONS ================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingBottom: 36,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/credit-notes")}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1.5px solid #E2E8F0",
              background: "#fff",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#2E86AB",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {submitting
              ? "Saving..."
              : isEdit
              ? "Update Credit Note"
              : "Create Credit Note"}
          </button>
        </div>
      </form>
    </div>
  );
}