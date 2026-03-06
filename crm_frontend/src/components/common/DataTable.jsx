import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

export default function DataTable({
  columns,
  data,
  loading,
  pagination,
  onPageChange,
  onSort,
  sortField,
  sortOrder,
  emptyMessage = "No records found",
  actions,
}) {
  if (loading)
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <LoadingSpinner />
      </div>
    );

  return (
    <div style={styles.wrapper}>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...styles.th,
                    ...(col.sortable ? styles.thSortable : {}),
                  }}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div style={styles.thInner}>
                    {col.label}
                    {col.sortable && (
                      <span style={styles.sortIcons}>
                        <ChevronUp
                          size={10}
                          style={{
                            opacity:
                              sortField === col.key && sortOrder === "asc"
                                ? 1
                                : 0.3,
                          }}
                        />
                        <ChevronDown
                          size={10}
                          style={{
                            opacity:
                              sortField === col.key && sortOrder === "desc"
                                ? 1
                                : 0.3,
                          }}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th style={{ ...styles.th, width: 100, textAlign: "right" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  style={styles.empty}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} style={styles.tr} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} style={styles.td}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.pageInfo}>
            {pagination.count} total · Page {pagination.current_page} of{" "}
            {pagination.total_pages}
          </span>
          <div style={styles.pageButtons}>
            <button
              style={styles.pageBtn}
              disabled={!pagination.previous}
              onClick={() =>
                onPageChange && onPageChange(pagination.current_page - 1)
              }
            >
              ←
            </button>
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    style={{
                      ...styles.pageBtn,
                      ...(page === pagination.current_page
                        ? styles.pageBtnActive
                        : {}),
                    }}
                    onClick={() => onPageChange && onPageChange(page)}
                  >
                    {page}
                  </button>
                );
              },
            )}
            <button
              style={styles.pageBtn}
              disabled={!pagination.next}
              onClick={() =>
                onPageChange && onPageChange(pagination.current_page + 1)
              }
            >
              →
            </button>
          </div>
        </div>
      )}

      <style>{`
        .table-row:hover { background: #F7FAFC !important; }
      `}</style>
    </div>
  );
}

export function Badge({ color = "gray", children }) {
  const colors = {
    green: { bg: "#F0FFF4", text: "#276749", border: "#9AE6B4" },
    red: { bg: "#FFF5F5", text: "#9B2C2C", border: "#FEB2B2" },
    blue: { bg: "#EBF8FF", text: "#2C5282", border: "#90CDF4" },
    yellow: { bg: "#FFFFF0", text: "#744210", border: "#FAF089" },
    gray: { bg: "#F7FAFC", text: "#4A5568", border: "#E2E8F0" },
    orange: { bg: "#FFFAF0", text: "#7B341E", border: "#FBBF24" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const styles = {
  wrapper: {
    background: "white",
    borderRadius: 10,
    border: "1px solid #E2E8F0",
    overflow: "hidden",
  },
  tableContainer: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  th: {
    padding: "12px 16px",
    background: "#F7FAFC",
    color: "#4A5568",
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #E2E8F0",
    whiteSpace: "nowrap",
  },
  thSortable: { cursor: "pointer", userSelect: "none" },
  thInner: { display: "flex", alignItems: "center", gap: 4 },
  sortIcons: { display: "flex", flexDirection: "column" },
  tr: { borderBottom: "1px solid #EDF2F7", transition: "background 0.1s" },
  td: { padding: "12px 16px", color: "#2D3748", verticalAlign: "middle" },
  empty: { padding: 48, textAlign: "center", color: "#A0AEC0", fontSize: 14 },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid #EDF2F7",
  },
  pageInfo: { fontSize: 12.5, color: "#718096" },
  pageButtons: { display: "flex", gap: 4 },
  pageBtn: {
    minWidth: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid #E2E8F0",
    background: "white",
    cursor: "pointer",
    fontSize: 13,
    color: "#4A5568",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageBtnActive: {
    background: "#2E86AB",
    color: "white",
    border: "1px solid #2E86AB",
  },
};
// Badge component for status indicators
const BC = {
  green: {
    background: "#F0FFF4",
    color: "#276749",
    border: "1px solid #9AE6B4",
  },
  red: { background: "#FFF5F5", color: "#9B2C2C", border: "1px solid #FEB2B2" },
  blue: {
    background: "#EBF8FF",
    color: "#2C5282",
    border: "1px solid #90CDF4",
  },
  yellow: {
    background: "#FFFFF0",
    color: "#744210",
    border: "1px solid #FAF089",
  },
  gray: {
    background: "#F7FAFC",
    color: "#4A5568",
    border: "1px solid #E2E8F0",
  },
  orange: {
    background: "#FFFAF0",
    color: "#7B341E",
    border: "1px solid #FBBF24",
  },
  purple: {
    background: "#FAF5FF",
    color: "#553C9A",
    border: "1px solid #D6BCFA",
  },
};
