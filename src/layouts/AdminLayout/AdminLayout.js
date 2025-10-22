import React from "react";
import { LoginAdmin } from "../../pages/Admin";
import { SideMenu, TopMenu } from "../../components/Admin";
import { useAuth } from "../../hooks";
import "./AdminLayout.scss";

export function AdminLayout(props) {
  const { children } = props;
  const { auth } = useAuth();

  if (!auth) return <LoginAdmin />;

  return (
    <div className="admin-layout">
      <SideMenu />
      <div className="admin-layout__main-content">
        <TopMenu /> {/* El TopMenu solo afecta el área del contenido */}
        <div className="admin-layout__content">{children}</div>
      </div>
    </div>
  );
}
