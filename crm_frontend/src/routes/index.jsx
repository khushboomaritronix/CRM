import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { moduleRoutes } from "./moduleRoutes";
import RoleBasedRoute from "./RoleBasedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import NotFoundPage from "../pages/auth/NotFoundPage";
import ForbiddenPage from "../pages/auth/ForbiddenPage";
import LoadingSpinner from "../components/common/LoadingSpinner";

function PrivateRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppLayout>
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>
          {moduleRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RoleBasedRoute
                  module={route.module}
                  requiredPermission={route.requiredPermission || "can_view"}
                >
                  {route.element}
                </RoleBasedRoute>
              }
            />
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
