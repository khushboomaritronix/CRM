// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createProformaInvoices,
//   updateProformaInvoices,
//   fetchOneProformaInvoices,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/proformaInvoices/proformaInvoicesSlice";
// import PageHeader from "../../components/common/PageHeader";
// import DocLineItems from "../../components/common/DocLineItems";
// import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
// import api from "../../services/api";
// import { Copy, ExternalLink } from "lucide-react";
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
// const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
// const G3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };
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
// const Sl = { ...Is, background: "#fff" };
// const Ta = { ...Is, resize: "vertical" };
// const STATS = [
//   "draft",
//   "sent",
//   "paid",
//   "partial",
//   "overdue",
//   "cancelled",
//   "unpaid",
// ];
// // const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

// export default function ProformaFormPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = !!id;
//   const selected = useSelector(selectSelected);
//   const [currencies, setCurrencies] = useState([]);
//   const submitting = useSelector(selectSubmitting);
//   const {
//     register: reg,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors: e },
//   } = useForm({ defaultValues: { currency: "", status: "draft" ,custom_field_values: {},} });
//   const [customers, setCustomers] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [items, setItems] = useState([
//     {
//       item_name: "",
//       description: "",
//       quantity: 1,
//       unit: "",
//       unit_price: 0,
//       tax_percent: 0,
//       amount: "0.00",
//     },
//   ]);
//   const [discount, setDiscount] = useState({ value: 0, type: "%" });
//   const [adjustment, setAdjustment] = useState(0);
//   const [copyModal, setCopyModal] = useState(false);
//   const [finalNum, setFinalNum] = useState("");
//   const [copying, setCopying] = useState(false);
//   const currentStatus = watch("status");
//   const watchedCustomer = watch("customer");

//   useEffect(() => {
//     api
//       .get("/customers/?page_size=200")
//       .then((r) =>
//         setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []),
//       );
//     if (isEdit) dispatch(fetchOneProformaInvoices(id));
//   }, [dispatch, id, isEdit]);
// useEffect(() => {
//   api.get("/currencies/?is_active=true").then((res) => {
//     const data = Array.isArray(res.data)
//       ? res.data
//       : res.data.results || [];

//     setCurrencies(data);
//   });
// }, []);
//   useEffect(() => {
//     if (watchedCustomer) {
//       const c = customers.find((x) => String(x.id) === String(watchedCustomer));
//       setSelectedCustomer(c || null);
//     } else setSelectedCustomer(null);
//   }, [watchedCustomer, customers]);
  

//   // useEffect(() => {
//   //   if (isEdit && selected) {
//   //     reset(selected);
//   //     if (selected.items?.length > 0) setItems(selected.items);
//   //     if (selected.discount_percent)
//   //       setDiscount({ value: selected.discount_percent, type: "%" });
//   //     else if (selected.discount_amount)
//   //       setDiscount({ value: selected.discount_amount, type: "flat" });
//   //     if (selected.adjustment) setAdjustment(selected.adjustment);
//   //   }
//   // }, [selected, isEdit, reset]);
//   useEffect(() => {
//   if (isEdit && selected) {
//     reset({
//       ...selected,
//       custom_field_values: selected.custom_field_values || {},
//     });

//     if (selected.items?.length > 0) setItems(selected.items);

//     if (selected.discount_percent)
//       setDiscount({ value: selected.discount_percent, type: "%" });
//     else if (selected.discount_amount)
//       setDiscount({ value: selected.discount_amount, type: "flat" });

//     if (selected.adjustment) setAdjustment(selected.adjustment);
//   }
// }, [selected, isEdit, reset]);
// const currencyId = watch("currency");

// const currencyObj = currencies.find(
//   (c) => String(c.id) === String(currencyId)
// );

// const currencyCode = currencyObj?.code || "INR";


//   // const onSubmit = async (data) => {
//   //   const discPercent = discount.type === "%" ? +discount.value : 0;
//   //   const discAmount = discount.type === "flat" ? +discount.value : 0;
//   //   const payload = {
//   //     ...data,
//   //     items,
//   //     discount_percent: discPercent,
//   //     discount_amount: discAmount,
//   //     adjustment: +adjustment,
//   //   };
//   //   const res = isEdit
//   //     ? await dispatch(updateProformaInvoices({ id, data: payload }))
//   //     : await dispatch(createProformaInvoices(payload));
//   //   if (!res.error) navigate("/proforma-invoices");
//   // };
//   const onSubmit = async (data) => {
//   const discPercent = discount.type === "%" ? +discount.value : 0;
//   const discAmount = discount.type === "flat" ? +discount.value : 0;

//   const { custom_field_values, ...rest } = data;

//   const payload = {
//     ...rest,
//     items,
//     discount_percent: discPercent,
//     discount_amount: discAmount,
//     adjustment: +adjustment,
//     custom_field_values: custom_field_values || {},
//   };

//   const res = isEdit
//     ? await dispatch(updateProformaInvoices({ id, data: payload }))
//     : await dispatch(createProformaInvoices(payload));

//   if (!res.error) navigate("/proforma-invoices");
// };

//   const copyToFinal = async () => {
//     if (!finalNum.trim()) {
//       alert("Enter a Final Invoice number.");
//       return;
//     }
//     setCopying(true);
//     try {
//       const res = await api.post(`/proforma-invoices/${id}/copy-to-final/`, {
//         final_number: finalNum,
//       });
//       navigate(`/final-invoices/${res.data.id}/edit`);
//     } catch (err) {
//       alert(err.response?.data?.detail || "Failed.");
//     } finally {
//       setCopying(false);
//     }
//   };

//   const showCopyBtn =
//     isEdit && (currentStatus === "paid" || currentStatus === "partial");

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Proforma Invoice" : "New Proforma Invoice"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Proforma", path: "/proforma-invoices" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//         actions={
//           showCopyBtn && (
//             <button
//               onClick={() => setCopyModal(true)}
//               style={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: 6,
//                 padding: "9px 16px",
//                 background: "#059669",
//                 color: "#fff",
//                 borderRadius: 8,
//                 fontWeight: 600,
//                 fontSize: 13.5,
//                 border: "none",
//                 cursor: "pointer",
//               }}
//             >
//               <Copy size={14} /> Copy to Final Invoice
//             </button>
//           )
//         }
//       />

//       {copyModal && (
//         <div
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,0.4)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: 12,
//               padding: 28,
//               width: 420,
//               boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
//             }}
//           >
//             <div
//               style={{
//                 fontWeight: 800,
//                 fontSize: 16,
//                 color: "#1E3A5F",
//                 marginBottom: 8,
//               }}
//             >
//               Copy to Final Invoice
//             </div>
//             <label style={Ls}>
//               Final Invoice Number <span style={{ color: "#EF4444" }}>*</span>
//             </label>
//             <input
//               style={{ ...Is, marginBottom: 16 }}
//               placeholder="e.g. FIN-001"
//               value={finalNum}
//               onChange={(ev) => setFinalNum(ev.target.value)}
//             />
//             <div
//               style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
//             >
//               <button
//                 onClick={() => setCopyModal(false)}
//                 style={{
//                   padding: "9px 18px",
//                   borderRadius: 8,
//                   border: "1.5px solid #E2E8F0",
//                   background: "#fff",
//                   fontWeight: 600,
//                   fontSize: 14,
//                   cursor: "pointer",
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={copyToFinal}
//                 disabled={copying}
//                 style={{
//                   padding: "9px 20px",
//                   borderRadius: 8,
//                   border: "none",
//                   background: "#059669",
//                   color: "#fff",
//                   fontWeight: 700,
//                   fontSize: 14,
//                   cursor: "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                 }}
//               >
//                 <ExternalLink size={14} />
//                 {copying ? "Copying..." : "Copy & Open"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Proforma Invoice Details</div>
//           <div style={G3}>
//             <div>
//               <label style={Ls}>
//                 Proforma Number <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 style={{
//                   ...Is,
//                   ...(e.proforma_number ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 placeholder="e.g. PI-001"
//                 {...reg("proforma_number", { required: "Required" })}
//               />
//             </div>
//             <div>
//               <label style={Ls}>
//                 Customer <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <select
//                 style={{
//                   ...Sl,
//                   ...(e.customer ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 {...reg("customer", { required: "Required" })}
//               >
//                 <option value="">Select customer...</option>
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label style={Ls}>Customer PO Ref</label>
//               <input
//                 style={Is}
//                 placeholder="Customer PO number"
//                 {...reg("po_reference")}
//               />
//             </div>
//             <div>
//               <label style={Ls}>
//                 Date <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 type="date"
//                 style={Is}
//                 {...reg("date", { required: "Required" })}
//               />
//             </div>
//             <div>
//               <label style={Ls}>Due Date</label>
//               <input type="date" style={Is} {...reg("due_date")} />
//             </div>
//             <div>
//               <label style={Ls}>Status</label>
//               <select style={Sl} {...reg("status")}>
//                 {STATS.map((s) => (
//                   <option key={s} value={s}>
//                     {s[0].toUpperCase() + s.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label style={Ls}>Currency</label>
//               {/* <select style={Sl} {...reg("currency")}>
//                 {CURRENCIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select> */}
//               <select style={Sl} {...reg("currency", { required: "Currency required" })}>
//   <option value="">Select Currency</option>

//   {currencies.map((c) => (
//     <option key={c.id} value={c.id}>
//       {c.code} ({c.symbol})
//     </option>
//   ))}
// </select>
//             </div>
//             <div>
//               <label style={Ls}>Reference</label>
//               <input style={Is} placeholder="Optional" {...reg("reference")} />
//             </div>
//           </div>
//           <CustomerAddressBlock customer={selectedCustomer} />
//         </div>

//         <DocLineItems
//           items={items}
//           setItems={setItems}
//           currency={currencyCode}
//           discount={discount}
//           setDiscount={setDiscount}
//           adjustment={adjustment}
//           setAdjustment={setAdjustment}
          
//         />

//         <div style={Cs}>
//           <div style={Ss}>Notes & Terms</div>
//           <div style={G2}>
//             <div>
//               <label style={Ls}>Notes</label>
//               <textarea rows={2} style={Ta} {...reg("notes")} />
//             </div>
//             <div>
//               <label style={Ls}>Terms & Conditions</label>
//               <textarea rows={2} style={Ta} {...reg("terms")} />
//             </div>
//           </div>
//         </div>
//         <div style={Cs}>
//   <div style={Ss}>Custom Fields</div>

//   <CustomFieldRenderer
//     moduleSlug="proforma_invoices"
//     register={reg}
//     errors={e}
//     defaultValues={selected?.custom_field_values}
//   />
// </div>
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
//             onClick={() => navigate("/proforma-invoices")}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             style={{
//               padding: "10px 24px",
//               borderRadius: 8,
//               border: "none",
//               background: "#2E86AB",
//               color: "#fff",
//               fontWeight: 700,
//               fontSize: 14,
//               cursor: "pointer",
//               opacity: submitting ? 0.7 : 1,
//             }}
//             disabled={submitting}
//           >
//             {submitting
//               ? "Saving..."
//               : isEdit
//                 ? "Update Proforma"
//                 : "Create Proforma"}
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
//   createProformaInvoices,
//   updateProformaInvoices,
//   fetchOneProformaInvoices,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/proformaInvoices/proformaInvoicesSlice";
// import PageHeader from "../../components/common/PageHeader";
// import DocLineItems from "../../components/common/DocLineItems";
// import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
// import api from "../../services/api";
// import { Copy, ExternalLink } from "lucide-react";
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

// const G3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };
// const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

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
// };

// const Sl = { ...Is, background: "#fff" };
// const Ta = { ...Is, resize: "vertical" };

// export default function ProformaFormPage() {
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
//     watch,
//     formState: { errors: e },
//   } = useForm({
//     defaultValues: {
//       currency: "",
//       status: "draft",
//       custom_field_values: {},
//     },
//   });

//   const [customers, setCustomers] = useState([]);
//   const [currencies, setCurrencies] = useState([]);
//   const [items, setItems] = useState([
//     {
//       item_name: "",
//       description: "",
//       quantity: 1,
//       unit: "",
//       unit_price: 0,
//       tax_percent: 0,
//       amount: "0.00",
//     },
//   ]);

//   const [discount, setDiscount] = useState({ value: 0, type: "%" });
//   const [adjustment, setAdjustment] = useState(0);

//   const [copyModal, setCopyModal] = useState(false);
//   const [finalNum, setFinalNum] = useState("");
//   const [copying, setCopying] = useState(false);

//   const watchedCustomer = watch("customer");
//   const currencyId = watch("currency");

//   const currencyObj = currencies.find(
//     (c) => String(c.id) === String(currencyId)
//   );

//   const currencyCode = currencyObj?.code || "INR";

//   const total = parseFloat(selected?.total || 0);
//   const paid = parseFloat(selected?.paid_amount || 0);
//   const balance = total - paid;

//   useEffect(() => {
//     api.get("/customers/?page_size=200").then((r) => {
//       setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []);
//     });

//     api.get("/currencies/?is_active=true").then((res) => {
//       const data = Array.isArray(res.data)
//         ? res.data
//         : res.data.results || [];
//       setCurrencies(data);
//     });

//     if (isEdit) dispatch(fetchOneProformaInvoices(id));
//   }, [dispatch, id, isEdit]);

//   useEffect(() => {
//     if (isEdit && selected) {
//       reset({
//         ...selected,
//         custom_field_values: selected.custom_field_values || {},
//       });

//       if (selected.items?.length > 0) setItems(selected.items);

//       if (selected.discount_percent)
//         setDiscount({ value: selected.discount_percent, type: "%" });

//       if (selected.adjustment) setAdjustment(selected.adjustment);
//     }
//   }, [selected, isEdit, reset]);

//   const onSubmit = async (data) => {
//     const payload = {
//       ...data,
//       items,
//       discount_percent: discount.value,
//       adjustment,
//     };

//     const res = isEdit
//       ? await dispatch(updateProformaInvoices({ id, data: payload }))
//       : await dispatch(createProformaInvoices(payload));

//     if (!res.error) navigate("/proforma-invoices");
//   };

//   const receivePayment = () => {
//     navigate(`/payments/new?proforma=${id}`);
//   };

//   const copyToFinal = async () => {
//     if (!finalNum.trim()) {
//       alert("Enter Final Invoice number");
//       return;
//     }

//     setCopying(true);

//     try {
//       const res = await api.post(
//         `/proforma-invoices/${id}/copy-to-final/`,
//         { final_number: finalNum }
//       );

//       navigate(`/final-invoices/${res.data.id}/edit`);
//     } catch {
//       alert("Copy failed");
//     } finally {
//       setCopying(false);
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Proforma Invoice" : "New Proforma Invoice"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Proforma", path: "/proforma-invoices" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//         actions={
//           isEdit && (
//             <div style={{ display: "flex", gap: 8 }}>
//               {balance > 0 && (
//                 <button
//                   onClick={receivePayment}
//                   style={{
//                     padding: "9px 16px",
//                     background: "#2563EB",
//                     color: "#fff",
//                     borderRadius: 8,
//                     border: "none",
//                     cursor: "pointer",
//                   }}
//                 >
//                   💰 Receive Payment
//                 </button>
//               )}

//               <button
//                 onClick={() => setCopyModal(true)}
//                 style={{
//                   padding: "9px 16px",
//                   background: "#059669",
//                   color: "#fff",
//                   borderRadius: 8,
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//               >
//                 <Copy size={14} /> Copy to Final
//               </button>
//             </div>
//           )
//         }
//       />

//       {isEdit && (
//         <div style={Cs}>
//           <div style={Ss}>Payment Summary</div>

//           <div style={{ display: "flex", gap: 40 }}>
//             <div>
//               <div>Total</div>
//               <b>
//                 {currencyCode} {total.toLocaleString()}
//               </b>
//             </div>

//             <div>
//               <div>Paid</div>
//               <b style={{ color: "#059669" }}>
//                 {currencyCode} {paid.toLocaleString()}
//               </b>
//             </div>

//             <div>
//               <div>Balance</div>
//               <b style={{ color: "#DC2626" }}>
//                 {currencyCode} {balance.toLocaleString()}
//               </b>
//             </div>
//           </div>
//         </div>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Proforma Details</div>

//           <div style={G3}>
//             <div>
//               <label style={Ls}>Proforma Number</label>
//               <input style={Is} {...reg("proforma_number")} />
//             </div>

//             <div>
//               <label style={Ls}>Customer</label>
//               <select style={Sl} {...reg("customer")}>
//                 <option value="">Select</option>
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label style={Ls}>Date</label>
//               <input type="date" style={Is} {...reg("date")} />
//             </div>

//             <div>
//               <label style={Ls}>Currency</label>
//               <select style={Sl} {...reg("currency")}>
//                 <option value="">Select</option>

//                 {currencies.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.code} ({c.symbol})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <CustomerAddressBlock />
//         </div>

//         <DocLineItems
//           items={items}
//           setItems={setItems}
//           currency={currencyCode}
//           discount={discount}
//           setDiscount={setDiscount}
//           adjustment={adjustment}
//           setAdjustment={setAdjustment}
//         />

//         <div style={Cs}>
//           <div style={Ss}>Custom Fields</div>

//           <CustomFieldRenderer
//             moduleSlug="proforma_invoices"
//             register={reg}
//             errors={e}
//             defaultValues={selected?.custom_field_values}
//           />
//         </div>

//         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
//           <button type="button" onClick={() => navigate("/proforma-invoices")}>
//             Cancel
//           </button>

//           <button type="submit" disabled={submitting}>
//             {submitting
//               ? "Saving..."
//               : isEdit
//               ? "Update Proforma"
//               : "Create Proforma"}
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
  createProformaInvoices,
  updateProformaInvoices,
  fetchOneProformaInvoices,
  selectSelected,
  selectSubmitting,
} from "../../features/proformaInvoices/proformaInvoicesSlice";
import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
import api from "../../services/api";
import { Copy, ExternalLink,CreditCard } from "lucide-react";
import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";

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
const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const G3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 };
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
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
const Sl = { ...Is, background: "#fff" };
const Ta = { ...Is, resize: "vertical" };
const STATS = [
  "draft",
  "sent",
  "paid",
  "partial",
  "overdue",
  "cancelled",
  "unpaid",
];

export default function ProformaFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const selected = useSelector(selectSelected);
  const [currencies, setCurrencies] = useState([]);
  const submitting = useSelector(selectSubmitting);
  const {
    register: reg,
    handleSubmit,
    reset,
    watch,
    formState: { errors: e },
  } = useForm({
    defaultValues: {
      currency: "",
      status: "draft",
      custom_field_values: {},
    },
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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
  const [discount, setDiscount] = useState({ value: 0, type: "%" });
  const [adjustment, setAdjustment] = useState(0);
  const [copyModal, setCopyModal] = useState(false);
  const [finalNum, setFinalNum] = useState("");
  const [copying, setCopying] = useState(false);
  const currentStatus = watch("status");
  const watchedCustomer = watch("customer");

  // Fetch customers and currencies
  useEffect(() => {
    api
      .get("/customers/?page_size=200")
      .then((r) =>
        setCustomers(Array.isArray(r.data) ? r.data : r.data.results || [])
      );
  }, []);

  useEffect(() => {
    api.get("/currencies/?is_active=true").then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setCurrencies(data);
    });
  }, []);

  // Fetch invoice if editing
  useEffect(() => {
    if (isEdit) dispatch(fetchOneProformaInvoices(id));
  }, [dispatch, id, isEdit]);

  // Reset form when selected invoice changes
  useEffect(() => {
    if (isEdit && selected) {
      reset({
        ...selected,
        custom_field_values: selected.custom_field_values || {},
      });

      if (selected.items?.length > 0) setItems(selected.items);

      if (selected.discount_percent)
        setDiscount({ value: selected.discount_percent, type: "%" });
      else if (selected.discount_amount)
        setDiscount({ value: selected.discount_amount, type: "flat" });

      if (selected.adjustment) setAdjustment(selected.adjustment);
    }
  }, [selected, isEdit, reset]);

  // Update selected customer when watchedCustomer changes
  useEffect(() => {
    if (watchedCustomer) {
      const c = customers.find((x) => String(x.id) === String(watchedCustomer));
      setSelectedCustomer(c || null);
    } else setSelectedCustomer(null);
  }, [watchedCustomer, customers]);

  const currencyId = watch("currency");
  const currencyObj = currencies.find(
    (c) => String(c.id) === String(currencyId)
  );
  const currencyCode = currencyObj?.code || "INR";

  // Use fallback values to avoid NaN
  const total = parseFloat(selected?.total) || 0;
  const paid = parseFloat(selected?.paid_amount) || 0;
  const balance = total - paid;

  const onSubmit = async (data) => {
    const discPercent = discount.type === "%" ? +discount.value : 0;
    const discAmount = discount.type === "flat" ? +discount.value : 0;

    const { custom_field_values, ...rest } = data;

    const payload = {
      ...rest,
      items,
      discount_percent: discPercent,
      discount_amount: discAmount,
      adjustment: +adjustment,
      custom_field_values: custom_field_values || {},
    };

    const res = isEdit
      ? await dispatch(updateProformaInvoices({ id, data: payload }))
      : await dispatch(createProformaInvoices(payload));

    if (!res.error) navigate("/proforma-invoices");
  };

  const receivePayment = () => {
    navigate(`/payments/new?proforma=${id}`);
  };

  const copyToFinal = async () => {
    if (!finalNum.trim()) {
      alert("Enter a Final Invoice number.");
      return;
    }
    setCopying(true);
    try {
      const res = await api.post(`/proforma-invoices/${id}/copy-to-final/`, {
        final_number: finalNum,
      });
      navigate(`/final-invoices/${res.data.id}/edit`);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed.");
    } finally {
      setCopying(false);
    }
  };

  const showCopyBtn =
    isEdit && (currentStatus === "paid" || currentStatus === "partial");

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Proforma Invoice" : "New Proforma Invoice"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Proforma", path: "/proforma-invoices" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            {isEdit && balance > 0 && (
             <button
  onClick={receivePayment}
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 16px",
    background: "#2563EB",
    color: "#fff",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 13.5,
    border: "none",
    cursor: "pointer",
  }}
>
  <CreditCard size={16} /> Receive Payment
</button>
            )}
            {showCopyBtn && (
              <button
                onClick={() => setCopyModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 16px",
                  background: "#059669",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13.5,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Copy size={14} /> Copy to Final Invoice
              </button>
            )}
          </div>
        }
      />

      {copyModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 28,
              width: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "#1E3A5F",
                marginBottom: 8,
              }}
            >
              Copy to Final Invoice
            </div>
            <label style={Ls}>
              Final Invoice Number <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              style={{ ...Is, marginBottom: 16 }}
              placeholder="e.g. FIN-001"
              value={finalNum}
              onChange={(ev) => setFinalNum(ev.target.value)}
            />
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setCopyModal(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1.5px solid #E2E8F0",
                  background: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={copyToFinal}
                disabled={copying}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#059669",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ExternalLink size={14} />
                {copying ? "Copying..." : "Copy & Open"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEdit && (
        <div style={Cs}>
          <div style={Ss}>Payment Summary</div>

          <div style={{ display: "flex", gap: 40 }}>
            <div>
              <div>Total</div>
              <b>
                {currencyCode} {total.toLocaleString()}
              </b>
            </div>
            <div>
              <div>Paid</div>
              <b style={{ color: "#059669" }}>
                {currencyCode} {paid.toLocaleString()}
              </b>
            </div>
            <div>
              <div>Balance</div>
              <b style={{ color: "#DC2626" }}>
                {currencyCode} {balance.toLocaleString()}
              </b>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Proforma Invoice Details</div>
          <div style={G3}>
            <div>
              <label style={Ls}>
                Proforma Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...Is,
                  ...(e.proforma_number ? { borderColor: "#EF4444" } : {}),
                }}
                placeholder="e.g. PI-001"
                {...reg("proforma_number", { required: "Required" })}
              />
            </div>
            <div>
              <label style={Ls}>
                Customer <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                style={{
                  ...Sl,
                  ...(e.customer ? { borderColor: "#EF4444" } : {}),
                }}
                {...reg("customer", { required: "Required" })}
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
              <label style={Ls}>Customer PO Ref</label>
              <input
                style={Is}
                placeholder="Customer PO number"
                {...reg("po_reference")}
              />
            </div>
            <div>
              <label style={Ls}>
                Date <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                style={Is}
                {...reg("date", { required: "Required" })}
              />
            </div>
            <div>
              <label style={Ls}>Due Date</label>
              <input type="date" style={Is} {...reg("due_date")} />
            </div>
            <div>
              <label style={Ls}>Status</label>
              <select style={Sl} {...reg("status")}>
                {STATS.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={Ls}>Currency</label>
              <select
                style={Sl}
                {...reg("currency", { required: "Currency required" })}
              >
                <option value="">Select Currency</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={Ls}>Reference</label>
              <input style={Is} placeholder="Optional" {...reg("reference")} />
            </div>
          </div>
          <CustomerAddressBlock customer={selectedCustomer} />
        </div>

        <DocLineItems
          items={items}
          setItems={setItems}
          currency={currencyCode}
          discount={discount}
          setDiscount={setDiscount}
          adjustment={adjustment}
          setAdjustment={setAdjustment}
        />

        <div style={Cs}>
          <div style={Ss}>Notes & Terms</div>
          <div style={G2}>
            <div>
              <label style={Ls}>Notes</label>
              <textarea rows={2} style={Ta} {...reg("notes")} />
            </div>
            <div>
              <label style={Ls}>Terms & Conditions</label>
              <textarea rows={2} style={Ta} {...reg("terms")} />
            </div>
          </div>
        </div>

        <div style={Cs}>
          <div style={Ss}>Custom Fields</div>
          <CustomFieldRenderer
            moduleSlug="proforma_invoices"
            register={reg}
            errors={e}
            defaultValues={selected?.custom_field_values}
          />
        </div>

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
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1.5px solid #E2E8F0",
              background: "#fff",
              color: "#374151",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
            onClick={() => navigate("/proforma-invoices")}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "#2E86AB",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : isEdit
                ? "Update Proforma"
                : "Create Proforma"}
          </button>
        </div>
      </form>
    </div>
  );
}
