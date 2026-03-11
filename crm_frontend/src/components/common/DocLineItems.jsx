import React from "react";
import { Plus, Trash2 } from "lucide-react";

const S_inp = {
  width: "100%",
  padding: "8px 10px",
  border: "1.5px solid #E2E8F0",
  borderRadius: 6,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export default function DocLineItems({
  items,
  setItems,
  currency = "INR",
  discount,
  setDiscount,
  adjustment,
  setAdjustment,
  showHSN = false,
}) {
  const update = (idx, field, val) =>
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const u = { ...it, [field]: val };
        u.amount = ((+u.quantity || 0) * (+u.unit_price || 0)).toFixed(2);
        return u;
      }),
    );

  const sub = items.reduce(
    (a, i) => a + (+i.quantity || 0) * (+i.unit_price || 0),
    0,
  );
  const taxAmt = items.reduce((a, i) => {
    const am = (+i.quantity || 0) * (+i.unit_price || 0);
    return a + am * ((+i.tax_percent || 0) / 100);
  }, 0);
  const discVal =
    discount?.type === "%"
      ? (sub * (+discount.value || 0)) / 100
      : +discount?.value || 0;
  const adjVal = +adjustment || 0;
  const grandTotal = sub + taxAmt - discVal + adjVal;

  const th = (al = "left", w) => ({
    padding: "9px 8px",
    textAlign: al,
    fontWeight: 600,
    color: "#6B7280",
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap",
    ...(w ? { width: w } : {}),
  });
  const td = (al = "left") => ({
    padding: "7px 6px",
    verticalAlign: "middle",
    textAlign: al,
  });

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "13px 18px",
          borderBottom: "1px solid #EDF2F7",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700, color: "#1E3A5F", fontSize: 14 }}>
          Line Items
        </span>
        <button
          type="button"
          onClick={() =>
            setItems((p) => [
              ...p,
              {
                item_name: "",
                description: "",
                quantity: 1,
                unit: "",
                unit_price: 0,
                tax_percent: 0,
                amount: "0.00",
              },
            ])
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 13px",
            background: "#2E86AB",
            color: "#fff",
            borderRadius: 7,
            fontWeight: 600,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={13} /> Add Item
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              <th style={th("left", 130)}>#&nbsp;Item</th>
              <th style={th("left")}>Description</th>
              {/* <th style={th("right", 70)}>HSN/SAC</th> */}
              {showHSN && <th style={th("right", 70)}>HSN/SAC</th>}
              <th style={th("right", 70)}>Qty</th>
              <th style={th("left", 60)}>Unit</th>
              <th style={th("right", 105)}>Rate</th>
              <th style={th("right", 75)}>Tax&nbsp;%</th>
              <th style={th("right", 105)}>Amount</th>
              <th style={{ width: 34, borderBottom: "1px solid #E2E8F0" }} />
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #EDF2F7" }}>
                <td style={td()}>
                  <input
                    style={{ ...S_inp, minWidth: 110 }}
                    value={item.item_name || ""}
                    onChange={(e) => update(idx, "item_name", e.target.value)}
                    placeholder="Item name"
                  />
                </td>
                <td style={td()}>
                  <input
                    style={{ ...S_inp, minWidth: 150 }}
                    value={item.description || ""}
                    onChange={(e) => update(idx, "description", e.target.value)}
                    placeholder="Long description"
                  />
                </td>
                {/* <td style={td("right")}>
                  <input
                    style={{ ...S_inp, textAlign: "right", minWidth: 100 }}
                    value={item.HSN_SAC_code || ""}
                    onChange={(e) => update(idx, "HSN_SAC_code", e.target.value)}
                    placeholder="HSN/SAC"
                  />
                </td> */}
                {showHSN && (
  <td style={td("right")}>
    <input
      style={{ ...S_inp, textAlign: "right", minWidth: 100 }}
      value={item.HSN_SAC_code || ""}
      onChange={(e) => update(idx, "HSN_SAC_code", e.target.value)}
      placeholder="HSN/SAC"
    />
  </td>
)}
                
                <td style={td("right")}>
                  <input
                    style={{ ...S_inp, textAlign: "right" }}
                    type="number"
                    min="0"
                    step="0.001"
                    value={item.quantity}
                    onChange={(e) => update(idx, "quantity", e.target.value)}
                  />
                </td>
                <td style={td()}>
                  <input
                    style={S_inp}
                    value={item.unit || ""}
                    onChange={(e) => update(idx, "unit", e.target.value)}
                    placeholder="pcs"
                  />
                </td>
                <td style={td("right")}>
                  <input
                    style={{ ...S_inp, textAlign: "right" }}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => update(idx, "unit_price", e.target.value)}
                  />
                </td>
                <td style={td("right")}>
                  <input
                    style={{ ...S_inp, textAlign: "right" }}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={item.tax_percent}
                    onChange={(e) => update(idx, "tax_percent", e.target.value)}
                  />
                </td>
                <td
                  style={{
                    ...td("right"),
                    fontWeight: 600,
                    color: "#1E3A5F",
                    whiteSpace: "nowrap",
                  }}
                >
                  {currency} {item.amount || "0.00"}
                </td>
                <td style={{ padding: "7px 4px", textAlign: "center" }}>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setItems((p) => p.filter((_, i) => i !== idx))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#EF4444",
                        padding: 3,
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px 20px",
          borderTop: "1px solid #EDF2F7",
        }}
      >
        <div style={{ minWidth: 310 }}>
          <Row label="Sub Total" val={`${currency} ${sub.toFixed(2)}`} />
          <Row label="Tax" val={`${currency} ${taxAmt.toFixed(2)}`} />

          {setDiscount && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              <span style={{ color: "#6B7280" }}>Discount</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount?.value || 0}
                  onChange={(e) =>
                    setDiscount((d) => ({ ...d, value: e.target.value }))
                  }
                  style={{
                    ...S_inp,
                    width: 80,
                    textAlign: "right",
                    padding: "5px 8px",
                  }}
                />
                <select
                  value={discount?.type || "%"}
                  onChange={(e) =>
                    setDiscount((d) => ({ ...d, type: e.target.value }))
                  }
                  style={{
                    border: "1.5px solid #E2E8F0",
                    borderRadius: 6,
                    padding: "5px 6px",
                    fontSize: 13,
                    outline: "none",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="%">%</option>
                  <option value="flat">Flat</option>
                </select>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#EF4444",
                    minWidth: 80,
                    textAlign: "right",
                  }}
                >
                  -{currency} {discVal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {setAdjustment !== undefined && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                fontSize: 14,
              }}
            >
              <span style={{ color: "#6B7280" }}>Adjustment</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment || 0}
                  onChange={(e) => setAdjustment(e.target.value)}
                  style={{
                    ...S_inp,
                    width: 120,
                    textAlign: "right",
                    padding: "5px 8px",
                  }}
                  placeholder="0.00"
                />
                <span
                  style={{
                    fontWeight: 600,
                    minWidth: 80,
                    textAlign: "right",
                    color: adjVal >= 0 ? "#059669" : "#EF4444",
                  }}
                >
                  {adjVal >= 0 ? "+" : ""}
                  {currency} {Math.abs(adjVal).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "11px 0 0",
              borderTop: "2px solid #1E3A5F",
              fontSize: 16,
              fontWeight: 800,
              color: "#1E3A5F",
            }}
          >
            <span>Total</span>
            <span>
              {currency} {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
        fontSize: 14,
      }}
    >
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{val}</span>
    </div>
  );
}
