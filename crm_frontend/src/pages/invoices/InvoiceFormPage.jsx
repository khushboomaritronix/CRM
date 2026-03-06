import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  createInvoices,
  updateInvoices,
  fetchOneInvoices,
  selectSelected,
  selectSubmitting,
} from "../../features/invoices/invoicesSlice";
import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
import api from "../../services/api";
import { Copy, ExternalLink } from "lucide-react";

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
const STATS = ["draft", "sent", "paid", "partial", "overdue", "cancelled"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

export default function InvoiceFormPage() {
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
    formState: { errors: e },
  } = useForm({ defaultValues: { currency: "INR", status: "draft" } });
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

  useEffect(() => {
    api
      .get("/customers/?page_size=200")
      .then((r) =>
        setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []),
      );
    if (isEdit) dispatch(fetchOneInvoices(id));
  }, [dispatch, id, isEdit]);

  // Auto-fetch billing/shipping address when customer selected
  useEffect(() => {
    if (watchedCustomer) {
      const c = customers.find((x) => String(x.id) === String(watchedCustomer));
      setSelectedCustomer(c || null);
    } else setSelectedCustomer(null);
  }, [watchedCustomer, customers]);

  useEffect(() => {
    if (isEdit && selected) {
      reset(selected);
      if (selected.items?.length > 0) setItems(selected.items);
      if (selected.discount_percent)
        setDiscount({ value: selected.discount_percent, type: "%" });
      else if (selected.discount_amount)
        setDiscount({ value: selected.discount_amount, type: "flat" });
      if (selected.adjustment) setAdjustment(selected.adjustment);
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (data) => {
    const discPercent = discount.type === "%" ? +discount.value : 0;
    const discAmount = discount.type === "flat" ? +discount.value : 0;
    const payload = {
      ...data,
      items,
      discount_percent: discPercent,
      discount_amount: discAmount,
      adjustment: +adjustment,
    };
    const res = isEdit
      ? await dispatch(updateInvoices({ id, data: payload }))
      : await dispatch(createInvoices(payload));
    if (!res.error) navigate("/invoices");
  };

  const copyToFinal = async () => {
    if (!finalNum.trim()) {
      alert("Enter a Final Invoice number.");
      return;
    }
    setCopying(true);
    try {
      const res = await api.post(`/invoices/${id}/copy-to-final/`, {
        final_number: finalNum,
      });
      navigate(`/final-invoices/${res.data.id}/edit`);
    } catch (err) {
      alert(
        err.response?.data?.detail || "Failed. Check the number is unique.",
      );
    } finally {
      setCopying(false);
    }
  };

  const showCopyBtn =
    isEdit && (currentStatus === "paid" || currentStatus === "partial");

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Invoice" : "New Invoice"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Invoices", path: "/invoices" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          showCopyBtn && (
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
          )
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
            <div style={{ fontSize: 13.5, color: "#6B7280", marginBottom: 16 }}>
              All items will be copied. You can adjust after.
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Invoice Details</div>
          <div style={G3}>
            <div>
              <label style={Ls}>
                Invoice Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...Is,
                  ...(e.invoice_number ? { borderColor: "#EF4444" } : {}),
                }}
                placeholder="e.g. INV-001"
                {...reg("invoice_number", { required: "Required" })}
              />
              {e.invoice_number && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.invoice_number.message}
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
              >
                <option value="">Select customer...</option>
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
                style={{ ...Is, ...(e.date ? { borderColor: "#EF4444" } : {}) }}
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
              <select style={Sl} {...reg("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
          currency={watch("currency") || "INR"}
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
            onClick={() => navigate("/invoices")}
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
                ? "Update Invoice"
                : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
