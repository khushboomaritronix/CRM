// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import {
//   createFinalInvoices,
//   updateFinalInvoices,
//   fetchOneFinalInvoices,
//   selectSelected,
//   selectSubmitting,
// } from "../../features/finalInvoices/finalInvoicesSlice";
// import PageHeader from "../../components/common/PageHeader";
// import DocLineItems from "../../components/common/DocLineItems";
// import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
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
// const STATS = ["draft", "sent", "paid", "partial", "overdue", "cancelled","unpaid"];
// // const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

// export default function FinalInvoiceFormPage() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const isEdit = !!id;
//   const selected = useSelector(selectSelected);
//   const submitting = useSelector(selectSubmitting);
//   const [currencies, setCurrencies] = useState([]);
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
//   const watchedCustomer = watch("customer");

//   useEffect(() => {
//     api
//       .get("/customers/?page_size=200")
//       .then((r) =>
//         setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []),
//       );
//     if (isEdit) dispatch(fetchOneFinalInvoices(id));
//   }, [dispatch, id, isEdit]);
//   useEffect(() => {
//   api.get("/currencies/?is_active=true").then((r) => {
//     setCurrencies(Array.isArray(r.data) ? r.data : r.data.results || []);
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
//   //     ? await dispatch(updateFinalInvoices({ id, data: payload }))
//   //     : await dispatch(createFinalInvoices(payload));
//   //   if (!res.error) navigate("/final-invoices");
//   // };
// const currencyId = watch("currency");

// const currencyObj = currencies.find(
//   (c) => String(c.id) === String(currencyId)
// );

// const currencyCode = currencyObj?.code || "INR";
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
//     ? await dispatch(updateFinalInvoices({ id, data: payload }))
//     : await dispatch(createFinalInvoices(payload));

//   if (!res.error) navigate("/final-invoices");
// };

//   return (
//     <div>
//       <PageHeader
//         title={isEdit ? "Edit Final Invoice" : "New Final Invoice"}
//         breadcrumbs={[
//           { label: "Dashboard", path: "/dashboard" },
//           { label: "Final Invoice", path: "/final-invoices" },
//           { label: isEdit ? "Edit" : "New" },
//         ]}
//       />
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div style={Cs}>
//           <div style={Ss}>Final Invoice Details</div>
//           <div style={G3}>
//             <div>
//               <label style={Ls}>
//                 Final Invoice Number <span style={{ color: "#EF4444" }}>*</span>
//               </label>
//               <input
//                 style={{
//                   ...Is,
//                   ...(e.final_number ? { borderColor: "#EF4444" } : {}),
//                 }}
//                 placeholder="e.g. FIN-001"
//                 {...reg("final_number", { required: "Required" })}
//               />
//               {e.final_number && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.final_number.message}
//                 </div>
//               )}
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
//                 <option value="">Select Customer...</option>
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               {e.customer && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.customer.message}
//                 </div>
//               )}
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
//               {e.date && (
//                 <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
//                   {e.date.message}
//                 </div>
//               )}
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
//               <select style={Sl} {...reg("currency")}>
//   <option value="">Select Currency...</option>

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
//           // currency={watch("currency") || "INR"}
//           currency={currencyCode}
//           discount={discount}
//           setDiscount={setDiscount}
//           adjustment={adjustment}
//           setAdjustment={setAdjustment}
//           showHSN={true}
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
//     moduleSlug="final_invoices"
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
//             onClick={() => navigate("/final-invoices")}
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
//                 ? "Update Final Invoice"
//                 : "Create Final Invoice"}
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
  createFinalInvoices,
  updateFinalInvoices,
  fetchOneFinalInvoices,
  selectSelected,
  selectSubmitting,
} from "../../features/finalInvoices/finalInvoicesSlice";
import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
import api from "../../services/api";
import CustomFieldRenderer from "../../components/common/CustomFieldRenderer";
import CreditCard from "@mui/icons-material/CreditCard"; // Import the icon

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
const STATS = ["draft", "sent", "paid", "partial", "overdue", "cancelled", "unpaid"];

export default function FinalInvoiceFormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const selected = useSelector(selectSelected);
  const submitting = useSelector(selectSubmitting);
  const [currencies, setCurrencies] = useState([]);
  const {
    register: reg,
    handleSubmit,
    reset,
    watch,
    setValue,
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
  const watchedCustomer = watch("customer");

  // Fetch customers and invoice (if editing)
  useEffect(() => {
    api
      .get("/customers/?page_size=200")
      .then((r) =>
        setCustomers(Array.isArray(r.data) ? r.data : r.data.results || [])
      );
    if (isEdit) dispatch(fetchOneFinalInvoices(id));
  }, [dispatch, id, isEdit]);

  // Fetch currencies
  useEffect(() => {
    api.get("/currencies/?is_active=true").then((r) => {
      setCurrencies(Array.isArray(r.data) ? r.data : r.data.results || []);
    });
  }, []);

  // Update selected customer when watchedCustomer changes
  useEffect(() => {
    if (watchedCustomer) {
      const c = customers.find((x) => String(x.id) === String(watchedCustomer));
      setSelectedCustomer(c || null);
    } else setSelectedCustomer(null);
  }, [watchedCustomer, customers]);

  // Reset form when selected invoice changes (edit mode)
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

  const currencyId = watch("currency");
  const currencyObj = currencies.find(
    (c) => String(c.id) === String(currencyId)
  );
  const currencyCode = currencyObj?.code || "INR";

  // Calculate totals for payment summary
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
      ? await dispatch(updateFinalInvoices({ id, data: payload }))
      : await dispatch(createFinalInvoices(payload));

    if (!res.error) navigate("/final-invoices");
  };

  const receivePayment = () => {
    navigate(`/payments/new?final=${id}`);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Final Invoice" : "New Final Invoice"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Final Invoice", path: "/final-invoices" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          // Show "Receive Payment" button only when editing and balance > 0
          isEdit && balance > 0 ? (
            <div style={{ display: "flex", gap: "8px" }}>
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
            </div>
          ) : null
        }
      />

      {/* Payment Summary (only in edit mode) */}
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
          <div style={Ss}>Final Invoice Details</div>
          <div style={G3}>
            <div>
              <label style={Ls}>
                Final Invoice Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...Is,
                  ...(e.final_number ? { borderColor: "#EF4444" } : {}),
                }}
                placeholder="e.g. FIN-001"
                {...reg("final_number", { required: "Required" })}
              />
              {e.final_number && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.final_number.message}
                </div>
              )}
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
                onChange={(ev) => {
                  reg("customer").onChange(ev);
                  const cust = customers.find((c) => String(c.id) === ev.target.value);
                  if (cust?.currency) setValue("currency", cust.currency);
                }}
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {e.customer && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.customer.message}
                </div>
              )}
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
              {e.date && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.date.message}
                </div>
              )}
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
              <select style={Sl} {...reg("currency")}>
                <option value="">Select Currency...</option>
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
          showHSN={true}
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

        <CustomFieldRenderer
          moduleSlug="final_invoices"
          register={reg}
          errors={e}
          defaultValues={selected?.custom_field_values}
        />

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
            onClick={() => navigate("/final-invoices")}
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
                ? "Update Final Invoice"
                : "Create Final Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}