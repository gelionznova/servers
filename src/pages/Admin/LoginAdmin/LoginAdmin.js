import React from "react";
import { LoginForm } from "../../../components/Admin";
import "./LoginAdmin.scss";

export function LoginAdmin() {
  return (
    <main className="login-admin" role="main">
      {/* Panel visual (opcional) */}
      <section className="login-admin__hero" aria-hidden="true">
        <div className="hero__gradient" />
        <div className="hero__content">
          <h2>Actas Inteligentes</h2>
          <p>Gestión segura de actas y evidencia de reuniones.</p>
        </div>
      </section>

      {/* Panel formulario */}
      <section className="login-admin__content">
        <div className="login-admin__card">
          {/* <header className="login-admin__header">
            <h1>Bienvenido</h1>
            <p>Accede al panel administrativo</p>
          </header> */}

          <LoginForm />

          <footer className="login-admin__footer">
            © {new Date().getFullYear()} Actas Inteligentes
          </footer>
        </div>
      </section>
    </main>
  );
}
