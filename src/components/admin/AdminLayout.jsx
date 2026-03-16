import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useViewport } from "../../hooks/useViewport";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const theme = useTheme();
  const { isMobile, isTablet } = useViewport();
  const { user, ready, fetchMe, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (!ready) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading admin...</div>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div
      className="admin-shell"
      style={{
        background: theme.bg,
        minHeight: "100vh",
        padding: isMobile ? 12 : 20,
        display: "grid",
        gridTemplateColumns:
          isMobile || isTablet
            ? "minmax(0, 1fr)"
            : `${collapsed ? 84 : 250}px minmax(0, 1fr)`,
        gap: isMobile ? 14 : 20
      }}
    >
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        user={user}
        onLogout={logout}
        stacked={isMobile || isTablet}
      />
      <main style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
