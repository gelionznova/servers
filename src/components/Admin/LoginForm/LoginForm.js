import React, { useMemo, useState } from "react";
import { Button, Form, Header, Icon, Message } from "semantic-ui-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { loginApi } from "../../../api/user";
import { useAuth } from "../../../hooks";
import "./LoginForm.scss";

export function LoginForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email("Correo inválido")
          .required("El correo es obligatorio"),
        password: Yup.string().required("La contraseña es obligatoria"),
      }),
    []
  );

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { access } = await loginApi(values);
        login(access);
      } catch (error) {
        toast.error(error?.message || "No se pudo iniciar sesión");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const emailError =
    formik.touched.email && formik.errors.email
      ? { content: formik.errors.email, pointing: "below" }
      : null;

  const passwordError =
    formik.touched.password && formik.errors.password
      ? { content: formik.errors.password, pointing: "below" }
      : null;

  return (
    <div className="login-page">
      <div className="login-card" role="dialog" aria-labelledby="login-title">
        <Header as="h2" id="login-title" className="login-title">
          <Icon name="shield alternate" />
          <Header.Content>
            Bienvenido
            <Header.Subheader>Accede al panel administrativo</Header.Subheader>
          </Header.Content>
        </Header>

        <Form
          className="login-form-admin"
          onSubmit={formik.handleSubmit}
          noValidate
        >
          <Form.Input
            name="email"
            type="email"
            icon="mail"
            iconPosition="left"
            placeholder="Correo electrónico"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={emailError}
            autoComplete="email"
            aria-label="Correo electrónico"
          />

          <Form.Input
            name="password"
            type={showPassword ? "text" : "password"}
            icon={
              <Icon
                name={showPassword ? "eye slash" : "eye"}
                link
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              />
            }
            iconPosition="left"
            placeholder="Contraseña"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={passwordError}
            autoComplete="current-password"
            aria-label="Contraseña"
          />

          <div className="login-actions">
            <div className="left">
              <Form.Checkbox
                label="Recordarme"
                name="remember"
                onChange={() => {}}
              />
            </div>
            <div className="right">
              <button
                type="button"
                className="link-button"
                onClick={() => toast.info("Recuperación de contraseña próximamente")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            content={formik.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            primary
            fluid
            loading={formik.isSubmitting}
            disabled={formik.isSubmitting}
            aria-busy={formik.isSubmitting}
          />

          {/* Mensaje general opcional */}
          {formik.status?.error && (
            <Message error content={formik.status.error} className="mt-12" />
          )}
        </Form>

        <div className="brand-footer">
          <Icon name="lock" />
          Seguridad de nivel empresarial
        </div>
      </div>
    </div>
  );
}
