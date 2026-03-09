import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  createEstimates,
  updateEstimates,
  fetchOneEstimates,
  selectSelected,
  selectSubmitting,
} from "../../features/estimates/estimatesSlice";
import PageHeader from "../../components/common/PageHeader";
import DocLineItems from "../../components/common/DocLineItems";
import CustomerAddressBlock from "../../components/common/CustomerAddressBlock";
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
const STATS = ["draft", "sent", "paid", "partial", "overdue", "cancelled", "unpaid"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"];

export default function EstimateFormPage() {
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
  } = useForm({ defaultValues: { currency: "INR", status: "draft", custom_field_values: {}, } });
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

  useEffect(() => {
    api
      .get("/customers/?page_size=200")
      .then((r) =>
        setCustomers(Array.isArray(r.data) ? r.data : r.data.results || []),
      );
    if (isEdit) dispatch(fetchOneEstimates(id));
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (watchedCustomer) {
      const c = customers.find((x) => String(x.id) === String(watchedCustomer));
      setSelectedCustomer(c || null);
    } else setSelectedCustomer(null);
  }, [watchedCustomer, customers]);

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
  //         updateEstimates({
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
  //         createEstimates({
  //           ...data,
  //           items,
  //           discount_percent: discPercent,
  //           discount_amount: discAmount,
  //           adjustment: +adjustment,
  //         }),
  //       );
  //   if (!res.error) navigate("/estimates");
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
    ? await dispatch(updateEstimates({ id, data: payload }))
    : await dispatch(createEstimates(payload));

  if (!res.error) navigate("/estimates");
};

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Estimate" : "New Estimate"}
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Estimates", path: "/estimates" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={Cs}>
          <div style={Ss}>Estimate Details</div>
          <div style={G2}>
            <div>
              <label style={Ls}>
                Estimate Number <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                style={{
                  ...Is,
                  ...(e.estimate_number ? { borderColor: "#EF4444" } : {}),
                }}
                placeholder="e.g. EST-001"
                {...reg("estimate_number", { required: "Required" })}
              />
              {e.estimate_number && (
                <div style={{ fontSize: 11.5, color: "#DC2626", marginTop: 3 }}>
                  {e.estimate_number.message}
                </div>
              )}
            </div>
            <div>
              <label style={Ls}>
                Customer <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select style={Sl} {...reg("customer", { required: "Required" })}>
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={Ls}>
                Estimate Date <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="date"
                style={Is}
                {...reg("date", { required: "Required" })}
              />
            </div>
            <div>
              <label style={Ls}>Due Date</label>
              <input type="date" style={Is} {...reg("valid_until")} />
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
        <div style={Cs}>
  <div style={Ss}>Custom Fields</div>

  <CustomFieldRenderer
    moduleSlug="estimates"
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
            onClick={() => navigate("/estimates")}
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
                ? "Update Estimate"
                : "Create Estimate"}
          </button>
        </div>
      </form>
    </div>
  );
}
