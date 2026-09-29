import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "@mui/icons-material/ChevronRight";

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
}) {
  return (
    <div style={styles.container}>
      <div style={styles.left}>
        {breadcrumbs.length > 0 && (
          <div style={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {crumb.path ? (
                  <Link to={crumb.path} style={styles.crumbLink}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span style={styles.crumbCurrent}>{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight size={12} style={{ color: "#A0AEC0" }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
    flexWrap: "wrap",
  },
  left: { display: "flex", flexDirection: "column", gap: 4 },
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  crumbLink: {
    fontSize: 12.5,
    color: "#2E86AB",
    textDecoration: "none",
    fontWeight: 500,
  },
  crumbCurrent: { fontSize: 12.5, color: "#718096" },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#1E3A5F",
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: "#718096" },
  actions: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0 },
};
