import React from "react";

export default function CustomerAddressBlock({ customer }) {
  if (!customer) return null;

  const hasBilling =
    customer.billing_address ||
    customer.billing_city ||
    customer.billing_country;
  const hasShipping =
    customer.shipping_address ||
    customer.shipping_city ||
    customer.shipping_country;
  if (!hasBilling && !hasShipping) return null;

  const fmtAddr = (prefix, c) =>
    [
      c[`${prefix}_address`],
      [c[`${prefix}_city`], c[`${prefix}_state`]].filter(Boolean).join(", "),
      [c[`${prefix}_country`], c[`${prefix}_pincode`]]
        .filter(Boolean)
        .join(" - "),
    ]
      .filter(Boolean)
      .join("\n");

  const boxStyle = {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    padding: "12px 14px",
    flex: 1,
    minWidth: 0,
  };
  const headStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: "#2E86AB",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  };
  const addrStyle = {
    fontSize: 13,
    color: "#374151",
    whiteSpace: "pre-line",
    lineHeight: 1.6,
  };

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
      {hasBilling && (
        <div style={boxStyle}>
          <div style={headStyle}>📍 Billing Address</div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#1E3A5F",
              marginBottom: 3,
            }}
          >
            {customer.name}
          </div>
          {customer.company_name && (
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 3 }}>
              {customer.company_name}
            </div>
          )}
          <div style={addrStyle}>{fmtAddr("billing", customer)}</div>
        </div>
      )}
      {hasShipping && (
        <div style={boxStyle}>
          <div style={headStyle}>🚚 Shipping Address</div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#1E3A5F",
              marginBottom: 3,
            }}
          >
            {customer.name}
          </div>
          {customer.company_name && (
            <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 3 }}>
              {customer.company_name}
            </div>
          )}
          <div style={addrStyle}>{fmtAddr("shipping", customer)}</div>
        </div>
      )}
    </div>
  );
}
