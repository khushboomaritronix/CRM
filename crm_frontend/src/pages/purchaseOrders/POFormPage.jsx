import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  createPurchaseOrders,
  updatePurchaseOrders,
  fetchOnePurchaseOrders,
  selectSelected,
  selectSubmitting,
} from "../../features/purchaseOrders/purchaseOrdersSlice";
import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import api from "../../services/api";
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
const STATS = ["draft", "approved", "sent", "received", "cancelled"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

export default function POFormPage() {
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
  } = useForm({ defaultValues: { currency: "INR", status: "draft",custom_field_values: {}, } });
  const [vendors, setVendors] = useState([]);
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

  useEffect(() => {
    api
      .get("/vendors/?page_size=200")
      .then((r) =>
        setVendors(Array.isArray(r.data) ? r.data : r.data.results || []),
      );
    if (isEdit) dispatch(fetchOnePurchaseOrders(id));
  }, [dispatch, id, isEdit]);

  // useEffect(() => {
  //   if (isEdit && selected) {
  //     reset(selected);
  //     if (selected.items?.length > 0) setItems(selected.items);
  //     if (selected.discount_percent)
  //       setDiscount({ value: selected.discount_percent, type: "%" });
  //     if (selected.adjustment) setAdjustment(selected.adjustment);
  //   }
  // }, [selected, isEdit, reset]);
  useEffect(() => {
  if (isEdit && selected) {
    reset({
      ...selected,
      custom_field_values: selected.custom_field_values || {},
    });

    if (selected.items?.length > 0) setItems(selected.items);

    if (selected.discount_percent)
      setDiscount({ value: selected.discount_percent, type: "%" });

    if (selected.adjustment) setAdjustment(selected.adjustment);
  }
}, [selected, isEdit, reset]);

  // const onSubmit = async (data) => {
  //   const discPercent = discount.type === "%" ? +discount.value : 0;
  //   const discAmount = discount.type === "flat" ? +discount.value : 0;
  //   const res = isEdit
  //     ? await dispatch(
  //         updatePurchaseOrders({
  //           id,
  //           data: {
  //             ...data,
  //             items,
  //             discount_percent: discPercent,
  //             discount_amount: discAmount,
  //             adjustment: +adjustment,
  //           },
  //         }),
  //       )
  //     : await dispatch(
  //         createPurchaseOrders({
  //           ...data,
  //           items,
  //           discount_percent: discPercent,
  //           discount_amount: discAmount,
  //           adjustment: +adjustment,
  //         }),
  //       );
  //   if (!res.error) navigate("/purchase-orders");
  // };
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
    ? await dispatch(updatePurchaseOrders({ id, data: payload }))
    : await dispatch(createPurchaseOrders(payload));

  if (!res.error) navigate("/purchase-orders");
};

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Purchase Order" : "New Purchase Order"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Purchase Orders", path: "/purchase-orders" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Purchase Order Details</div>
          <div style={G2}>
            <div>
              <label style={Ls}>
                PO Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...Is,
                  ...(e.po_number ? { borderColor: "#EF4444" } : {}),
                }}
                placeholder="e.g. PO-001"
                {...reg("po_number", { required: "Required" })}
              />
              {e.po_number && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.po_number.message}
                </div>
              )}
            </div>
            <div>
              <label style={Ls}>
                Vendor <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select style={Sl} {...reg("vendor", { required: "Required" })}>
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              {e.vendor && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.vendor.message}
                </div>
              )}
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
              <label style={Ls}>Expected Date</label>
              <input type="date" style={Is} {...reg("expected_date")} />
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
              <label style={Ls}>Notes</label>
              <input style={Is} placeholder="Optional" {...reg("notes")} />
            </div>
          </div>
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
          <div style={Ss}>Terms</div>
          <div>
            <label style={Ls}>Terms & Conditions</label>
            <textarea rows={2} style={Ta} {...reg("terms")} />
          </div>
        </div>
        <div style={Cs}>
  <div style={Ss}>Custom Fields</div>

  <CustomFieldRenderer
    moduleSlug="purchase_orders"
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
            onClick={() => navigate("/purchase-orders")}
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
            {submitting ? "Saving..." : isEdit ? "Update PO" : "Create PO"}
          </button>
        </div>
      </form>
    </div>
  );
}
