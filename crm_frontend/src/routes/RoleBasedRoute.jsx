import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectPermissions } from "../features/auth/authSlice";

/**
 * Wraps a route element and checks RBAC permissions.
 * - Superusers pass always.
 * - If module is null, passes all authenticated users.
 * - Otherwise checks permissions map from Redux store.
 */
export default function RoleBasedRoute({ module, requiredPermission = "can_view", children }) {
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);

  if (!module) return children;

  if (user?.is_superuser) return children;

  const modulePerms = permissions?.[module] || [];
  const hasAccess = modulePerms.includes(requiredPermission);

  if (!hasAccess) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
