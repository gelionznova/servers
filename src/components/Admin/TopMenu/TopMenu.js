import React from "react";
import { Icon, Menu } from "semantic-ui-react";
import { useAuth } from "../../../hooks";
// import logo from "../../../assets/images/Logo_04.png";
import "./TopMenu.scss";

export function TopMenu() {
  const { auth, logout } = useAuth();

  const renderName = () => {
    if (auth.me?.first_name && auth.me?.last_name) {
      return `${auth.me.first_name} ${auth.me.last_name}`;
    }
    return auth.me?.email;
  };

  return (
    <>
      <Menu className="top-menu-admin">
        {/* <div className="top-menu-admin__logo">
          <div className="logo-container">
            <img src={logo} alt="Gelionz Admin" />
          </div>
        </div> */}

        <Menu.Menu position="right">
          <Menu.Item className="top-menu-admin__greeting">
            Hola, {renderName()}!
          </Menu.Item>
          <Menu.Item onClick={logout}>
            <Icon name="sign out" />
            <span>Salir</span>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </>
  );
}
