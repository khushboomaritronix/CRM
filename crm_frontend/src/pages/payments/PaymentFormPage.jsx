// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createPayments,
//   updatePayments,
//   fetchOnePayments,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/payments/paymentsSlice";
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";

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
// const METHODS = [
//   ["bank_transfer", "Bank Transfer"],
//   ["cash", "Cash"],
//   ["cheque", "Cheque"],
//   ["upi", "UPI"],
//   ["neft", "NEFT"],
//   ["rtgs", "RTGS"],
//   ["imps", "IMPS"],
//   ["card", "Card"],
//   ["other", "Other"],
// ];

// export default function PaymentFormPage() {
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
//       payment_type: "received",
//       payment_method: "bank_transfer",
//       currency: "INR",
//       status: "completed",
//     },
//   });
//   const [customers, setCustomers] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const paymentType = watch("payment_type");

//   useEffect(() => {
//     api
//       .get("/customers/?page_size=200")
//       .then((r) =>
//         setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []),
//       );
//     api
//       .get("/vendors/?page_size=200")
//       .then((r) =>
//         setVendors(Array.isArray(r.data) ? r.data : r.data.results || []),
//       );
//     if (isEdit) dispatch(fetchOnePayments(id));
//   }, [dispatch, id, isEdit]);
//   useEffect(() => {
//     if (isEdit && selected) reset(selected);
//   }, [selected, isEdit, reset]);

//   const onSubmit = async (data) => {
//     const res = isEdit
//       ? await dispatch(updatePayments({ id, data }))
//       : await dispatch(createPayments(data));
//     if (!res.error) navigate("/payments");
//   };

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Payment" : "Record Payment"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Payments", path: "/payments" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//       />
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Payment Details</div>
//           <div style={G2}>
//             <div>
//               <label style={Ls}>
//                 Payment Number <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 style={{
//                   ...Is,
//                   ...(e.payment_number ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 placeholder="e.g. PAY-001"
//                 {...reg("payment_number", { required: "Required" })}
//               />
//               {e.payment_number && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.payment_number.message}
//                 </div>
//               )}
//             </div>
//             <div>
//               <label style={Ls}>
//                 Payment Type <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <select style={Sl} {...reg("payment_type", { required: true })}>
//                 <option value="received">💰 Received (from customer)</option>
//                 <option value="made">📤 Made (to vendor)</option>
//               </select>
//             </div>
//             <div>
//               <label style={Ls}>
//                 Date <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 type="date"
//                 style={{
//                   ...Is,
//                   ...(e.payment_date ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 {...reg("payment_date", { required: "Required" })}
//               />
//               {e.payment_date && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.payment_date.message}
//                 </div>
//               )}
//             </div>
//             <div>
//               <label style={Ls}>
//                 Amount <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 style={{
//                   ...Is,
//                   ...(e.amount ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 {...reg("amount", {
//                   required: "Required",
//                   min: { value: 0.01, message: "Must be > 0" },
//                 })}
//               />
//               {e.amount && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.amount.message}
//                 </div>
//               )}
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
//             <div>
//               <label style={Ls}>Payment Method</label>
//               <select style={Sl} {...reg("payment_method")}>
//                 {METHODS.map(([v, l]) => (
//                   <option key={v} value={v}>
//                     {l}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label style={Ls}>
//                 {paymentType === "received" ? "Customer" : "Vendor"}
//               </label>
//               {paymentType === "received" ? (
//                 <select style={Sl} {...reg("customer")}>
//                   <option value="">Select customer...</option>
//                   {customers.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name}
//                     </option>
//                   ))}
//                 </select>
//               ) : (
//                 <select style={Sl} {...reg("vendor")}>
//                   <option value="">Select vendor...</option>
//                   {vendors.map((v) => (
//                     <option key={v.id} value={v.id}>
//                       {v.name}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>
//             <div>
//               <label style={Ls}>Invoice / PO Reference</label>
//               <input
//                 style={Is}
//                 placeholder="e.g. INV-00001"
//                 {...reg("invoice_ref")}
//               />
//             </div>
//             <div>
//               <label style={Ls}>UTR / Cheque / Transaction Ref</label>
//               <input
//                 style={Is}
//                 placeholder="Bank reference number"
//                 {...reg("reference")}
//               />
//             </div>
//             <div>
//               <label style={Ls}>Bank Name</label>
//               <input style={Is} {...reg("bank_name")} />
//             </div>
//             <div>
//               <label style={Ls}>Status</label>
//               <select style={Sl} {...reg("status")}>
//                 <option value="completed">✅ Completed</option>
//                 <option value="pending">⏳ Pending</option>
//                 <option value="failed">❌ Failed</option>
//                 <option value="cancelled">🚫 Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>
//         <div style={Cs}>
//           <div style={Ss}>Notes</div>
//           <textarea
//             rows={3}
//             style={Ta}
//             placeholder="Additional notes..."
//             {...reg("notes")}
//           />
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
//             onClick={() => navigate("/payments")}
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
//                 ? "Update Payment"
//                 : "Record Payment"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }


// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createPayments,
//   updatePayments,
//   fetchOnePayments,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/payments/paymentsSlice";
// import PageHeader from "../../components/common/PageHeader";
// import api from "../../services/api";

// const Cs={background:"#fff",borderRadius:10,border:"1px solid #E2E8F0",padding:22,marginBottom:14};
// const Ss={fontSize:11.5,fontWeight:700,color:"#2E86AB",marginBottom:13,textTransform:"uppercase",letterSpacing:0.8};
// const G2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:14};
// const Ls={display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4};

// const Is={
//   width:"100%",
//   padding:"9px 12px",
//   border:"1.5px solid #E2E8F0",
//   borderRadius:7,
//   fontSize:13.5,
//   outline:"none",
// };

// const Sl={...Is,background:"#fff"};

// const Ta={...Is,resize:"vertical"};

// const METHODS=[
// ["bank_transfer","Bank Transfer"],
// ["cash","Cash"],
// ["cheque","Cheque"],
// ["upi","UPI"],
// ["neft","NEFT"],
// ["rtgs","RTGS"],
// ["imps","IMPS"],
// ["card","Card"],
// ["other","Other"],
// ];

// export default function PaymentFormPage(){

// const dispatch=useDispatch();
// const navigate=useNavigate();
// const location=useLocation();
// const {id}=useParams();

// const isEdit=!!id;

// const selected=useSelector(selectSelected);
// const submitting=useSelector(selectSubmitting);

// const query=new URLSearchParams(location.search);
// const proformaId=query.get("proforma");

// const{
// register:reg,
// handleSubmit,
// reset,
// watch,
// formState:{errors:e}
// }=useForm({
// defaultValues:{
// payment_type:"received",
// payment_method:"bank_transfer",
// currency:"",
// status:"completed"
// }
// });

// const [customers,setCustomers]=useState([]);
// const [vendors,setVendors]=useState([]);
// const [currencies,setCurrencies]=useState([]);

// const paymentType=watch("payment_type");

// useEffect(()=>{

// api.get("/customers/?page_size=200")
// .then(r=>setCustomers(Array.isArray(r.data)?r.data:r.data.results||[]));

// api.get("/vendors/?page_size=200")
// .then(r=>setVendors(Array.isArray(r.data)?r.data:r.data.results||[]));

// api.get("/currencies/?is_active=true")
// .then(res=>{
// const data=Array.isArray(res.data)?res.data:res.data.results||[];
// setCurrencies(data);
// });

// if(isEdit)dispatch(fetchOnePayments(id));

// },[dispatch,id,isEdit]);

// useEffect(()=>{
// if(isEdit && selected){
// reset(selected);
// }
// },[selected,isEdit,reset]);

// /* Auto fill from Proforma */

// useEffect(()=>{

// if(proformaId){

// api.get(`/proforma-invoices/${proformaId}/`)
// .then(res=>{

// const pi=res.data;

// reset({
// payment_type:"received",
// customer:pi.customer,
// amount:pi.total - pi.paid_amount,
// invoice_ref:pi.proforma_number,
// currency:pi.currency,
// status:"completed"
// });

// });

// }

// },[proformaId,reset]);

// const onSubmit=async(data)=>{

// if(proformaId){
// data.proforma=proformaId;
// }

// const res=isEdit
// ?await dispatch(updatePayments({id,data}))
// :await dispatch(createPayments(data));

// if(!res.error)navigate("/payments");

// };

// return(

// <div>

// <PageHeader
// title={isEdit?"Edit Payment":"Record Payment"}
// breadcrumbs={[
// {label:"Dashboard",path:"/dashboard"},
// {label:"Payments",path:"/payments"},
// {label:isEdit?"Edit":"New"},
// ]}
// />

// <form onSubmit={handleSubmit(onSubmit)}>

// <div style={Cs}>

// <div style={Ss}>Payment Details</div>

// <div style={G2}>

// <div>
// <label style={Ls}>
// Payment Number <span style={{color:"#EF4444"}}>*</span>
// </label>

// <input
// style={{...Is,...(e.payment_number?{borderColor:"#EF4444"}:{})}}
// placeholder="e.g. PAY-001"
// {...reg("payment_number",{required:"Required"})}
// />

// {e.payment_number &&
// <div style={{fontSize:11.5,color:"#DC2626",marginTop:3}}>
// {e.payment_number.message}
// </div>
// }

// </div>

// <div>

// <label style={Ls}>
// Payment Type <span style={{color:"#EF4444"}}>*</span>
// </label>

// <select style={Sl} {...reg("payment_type",{required:true})}>
// <option value="received">💰 Received (from customer)</option>
// <option value="made">📤 Made (to vendor)</option>
// </select>

// </div>

// <div>

// <label style={Ls}>
// Date <span style={{color:"#EF4444"}}>*</span>
// </label>

// <input
// type="date"
// style={{...Is,...(e.payment_date?{borderColor:"#EF4444"}:{})}}
// {...reg("payment_date",{required:"Required"})}
// />

// </div>

// <div>

// <label style={Ls}>
// Amount <span style={{color:"#EF4444"}}>*</span>
// </label>

// <input
// type="number"
// step="0.01"
// min="0.01"
// style={{...Is,...(e.amount?{borderColor:"#EF4444"}:{})}}
// {...reg("amount",{required:"Required"})}
// />

// </div>

// <div>

// <label style={Ls}>Currency</label>

// <select style={Sl} {...reg("currency")}>

// <option value="">Select Currency</option>

// {currencies.map(c=>(
// <option key={c.id} value={c.id}>
// {c.code} ({c.symbol})
// </option>
// ))}

// </select>

// </div>

// <div>

// <label style={Ls}>Payment Method</label>

// <select style={Sl} {...reg("payment_method")}>

// {METHODS.map(([v,l])=>(
// <option key={v} value={v}>{l}</option>
// ))}

// </select>

// </div>

// <div>

// <label style={Ls}>
// {paymentType==="received"?"Customer":"Vendor"}
// </label>

// {paymentType==="received"?

// <select style={Sl} {...reg("customer")}>

// <option value="">Select customer...</option>

// {customers.map(c=>(
// <option key={c.id} value={c.id}>
// {c.name}
// </option>
// ))}

// </select>

// :

// <select style={Sl} {...reg("vendor")}>

// <option value="">Select vendor...</option>

// {vendors.map(v=>(
// <option key={v.id} value={v.id}>
// {v.name}
// </option>
// ))}

// </select>

// }

// </div>

// <div>

// <label style={Ls}>Invoice / PO Reference</label>

// <input
// style={Is}
// placeholder="e.g. PI-001"
// {...reg("invoice_ref")}
// />

// </div>

// <div>

// <label style={Ls}>UTR / Transaction Ref</label>

// <input
// style={Is}
// {...reg("reference")}
// />

// </div>

// <div>

// <label style={Ls}>Bank Name</label>

// <input style={Is} {...reg("bank_name")} />

// </div>

// <div>

// <label style={Ls}>Status</label>

// <select style={Sl} {...reg("status")}>

// <option value="completed">Completed</option>
// <option value="pending">Pending</option>
// <option value="failed">Failed</option>
// <option value="cancelled">Cancelled</option>

// </select>

// </div>

// </div>
// </div>

// <div style={Cs}>

// <div style={Ss}>Notes</div>

// <textarea
// rows={3}
// style={Ta}
// placeholder="Additional notes..."
// {...reg("notes")}
// />

// </div>

// <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingBottom:36}}>

// <button
// type="button"
// style={{padding:"10px 20px",borderRadius:8,border:"1.5px solid #E2E8F0",background:"#fff"}}
// onClick={()=>navigate("/payments")}
// >
// Cancel
// </button>

// <button
// type="submit"
// style={{padding:"10px 24px",borderRadius:8,border:"none",background:"#2E86AB",color:"#fff"}}
// disabled={submitting}
// >

// {submitting
// ?"Saving..."
// :isEdit
// ?"Update Payment"
// :"Record Payment"}

// </button>

// </div>

// </form>

// </div>

// );

// }


import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  createPayments,
  updatePayments,
  fetchOnePayments,
  selectSelected,
  selectSubmitting,
} from "../../features/payments/paymentsSlice";
import PageHeader from "../../components/common/PageHeader";
import api from "../../services/api";

const Cs = { background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0", padding: 22, marginBottom: 14 };
const Ss = { fontSize: 11.5, fontWeight: 700, color: "#2E86AB", marginBottom: 13, textTransform: "uppercase", letterSpacing: 0.8 };
const G2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };
const Ls = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 };

const Is = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 7,
  fontSize: 13.5,
  outline: "none",
};

const Sl = { ...Is, background: "#fff" };
const Ta = { ...Is, resize: "vertical" };

const METHODS = [
  ["bank_transfer", "Bank Transfer"],
  ["cash", "Cash"],
  ["cheque", "Cheque"],
  ["upi", "UPI"],
  ["neft", "NEFT"],
  ["rtgs", "RTGS"],
  ["imps", "IMPS"],
  ["card", "Card"],
  ["other", "Other"],
];

export default function PaymentFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEdit = !!id;

  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);

  const query = new URLSearchParams(location.search);
  const proformaId = query.get("proforma");
  const finalId = query.get("final");   // 👈 new

  const {
    register: reg,
    handleSubmit,
    reset,
    watch,
    formState: { errors: e },
  } = useForm({
    defaultValues: {
      payment_type: "received",
      payment_method: "bank_transfer",
      currency: "",
      status: "completed",
    },
  });

  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const paymentType = watch("payment_type");

  // Fetch customers, vendors, currencies
  useEffect(() => {
    api.get("/customers/?page_size=200")
      .then(r => setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []));

    api.get("/vendors/?page_size=200")
      .then(r => setVendors(Array.isArray(r.data) ? r.data : r.data.results || []));

    api.get("/currencies/?is_active=true")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setCurrencies(data);
      });

    if (isEdit) dispatch(fetchOnePayments(id));
  }, [dispatch, id, isEdit]);

  // Reset form when editing an existing payment
  useEffect(() => {
    if (isEdit && selected) {
      reset(selected);
    }
  }, [selected, isEdit, reset]);

  // Auto-fill from proforma or final invoice when query param is present
  useEffect(() => {
    if (proformaId) {
      api.get(`/proforma-invoices/${proformaId}/`).then(res => {
        const pi = res.data;
        reset({
          payment_type: "received",
          customer: pi.customer,
          amount: pi.total - pi.paid_amount,
          invoice_ref: pi.proforma_number,
          currency: pi.currency,
          status: "completed",
        });
      });
    } else if (finalId) {
      api.get(`/final-invoices/${finalId}/`).then(res => {
        const fi = res.data;
        reset({
          payment_type: "received",
          customer: fi.customer,
          amount: fi.total - fi.paid_amount,
          invoice_ref: fi.final_number,
          currency: fi.currency,
          status: "completed",
        });
      });
    }
  }, [proformaId, finalId, reset]);

  const onSubmit = async (data) => {
    // Attach the correct invoice ID based on query param
    if (proformaId) {
      data.proforma = proformaId;
    } else if (finalId) {
      data.finalinvoice = finalId;   // 👈 matches the model field name
    }

    const res = isEdit
      ? await dispatch(updatePayments({ id, data }))
      : await dispatch(createPayments(data));

    if (!res.error) navigate("/payments");
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Payment" : "Record Payment"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Payments", path: "/payments" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Payment Details</div>
          <div style={G2}>
            <div>
              <label style={Ls}>
                Payment Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{ ...Is, ...(e.payment_number ? { borderColor: "#EF4444" } : {}) }}
                placeholder="e.g. PAY-001"
                {...reg("payment_number", { required: "Required" })}
              />
              {e.payment_number && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.payment_number.message}
                </div>
              )}
            </div>

            <div>
              <label style={Ls}>
                Payment Type <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select style={Sl} {...reg("payment_type", { required: true })}>
                <option value="received">💰 Received (from customer)</option>
                <option value="made">📤 Made (to vendor)</option>
              </select>
            </div>

            <div>
              <label style={Ls}>
                Date <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                style={{ ...Is, ...(e.payment_date ? { borderColor: "#EF4444" } : {}) }}
                {...reg("payment_date", { required: "Required" })}
              />
            </div>

            <div>
              <label style={Ls}>
                Amount <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                style={{ ...Is, ...(e.amount ? { borderColor: "#EF4444" } : {}) }}
                {...reg("amount", { required: "Required" })}
              />
            </div>

            <div>
              <label style={Ls}>Currency</label>
              <select style={Sl} {...reg("currency")}>
                <option value="">Select Currency</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={Ls}>Payment Method</label>
              <select style={Sl} {...reg("payment_method")}>
                {METHODS.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={Ls}>
                {paymentType === "received" ? "Customer" : "Vendor"}
              </label>
              {paymentType === "received" ? (
                <select style={Sl} {...reg("customer")}>
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <select style={Sl} {...reg("vendor")}>
                  <option value="">Select vendor...</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={Ls}>Invoice / PO Reference</label>
              <input
                style={Is}
                placeholder="e.g. PI-001"
                {...reg("invoice_ref")}
              />
            </div>

            <div>
              <label style={Ls}>UTR / Transaction Ref</label>
              <input style={Is} {...reg("reference")} />
            </div>

            <div>
              <label style={Ls}>Bank Name</label>
              <input style={Is} {...reg("bank_name")} />
            </div>

            <div>
              <label style={Ls}>Status</label>
              <select style={Sl} {...reg("status")}>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div style={Cs}>
          <div style={Ss}>Notes</div>
          <textarea
            rows={3}
            style={Ta}
            placeholder="Additional notes..."
            {...reg("notes")}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingBottom: 36 }}>
          <button
            type="button"
            style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff" }}
            onClick={() => navigate("/payments")}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#2E86AB", color: "#fff" }}
            disabled={submitting}
          >
            {submitting ? "Saving..." : isEdit ? "Update Payment" : "Record Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}