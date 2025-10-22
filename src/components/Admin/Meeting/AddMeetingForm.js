import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Button,
  Grid,
  Segment,
  Header,
  Message,
  Icon,
} from "semantic-ui-react";
import { useAuth } from "../../../hooks";
import { useMeeting } from "../../../hooks/useMeeting";

const MAX_ITEMS = 10;

const parseLines = (text) =>
  String(text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export function AddMeetingForm({ onClose, onRefetch, meeting }) {
  const isEditing = Boolean(meeting);
  const { auth } = useAuth();
  const { addMeeting, updateMeeting, addSession, loading } = useMeeting();

  const getInitialFormState = () => ({
    title: "",
    description: "",
    ciudad: "",
    fecha: new Date().toISOString().split("T")[0],
    hora_inicio: "",
    hora_fin: "",
    lugar: "",
    enlace: "",
    centro: "",
    acta_numero: "",
    // campos de texto para multilinea
    agendaText: "",
    objetivosText: "",
  });

  const [formData, setFormData] = useState(getInitialFormState());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Precarga en edición
  useEffect(() => {
    if (!isEditing || !meeting) return;

    const firstSession = meeting.sessions?.[0] || null;

    const fechaISO = firstSession?.start_datetime
      ? new Date(firstSession.start_datetime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const horaInicio = firstSession?.start_datetime
      ? new Date(firstSession.start_datetime).toTimeString().slice(0, 5)
      : "";

    const horaFin = firstSession?.end_datetime
      ? new Date(firstSession.end_datetime).toTimeString().slice(0, 5)
      : "";

    setFormData((prev) => ({
      ...prev,
      title: meeting.title || "",
      description: meeting.description || "",
      ciudad: meeting.ciudad || "",
      fecha: fechaISO,
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      lugar: meeting.lugar || "",
      enlace: meeting.enlace || "",
      centro: meeting.centro || "",
      acta_numero: meeting.acta_numero || "",
      agendaText: Array.isArray(meeting.agenda)
        ? meeting.agenda.join("\n")
        : "",
      objetivosText: Array.isArray(meeting.objetivos)
        ? meeting.objetivos.join("\n")
        : "",
    }));
  }, [meeting, isEditing]);

  // Helpers
  const validateUrl = (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return ["http:", "https:"].includes(u.protocol);
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "El título es requerido";
    } else if (formData.title.length > 200) {
      newErrors.title = "El título no puede exceder 200 caracteres";
    }

    if (!formData.ciudad?.trim()) newErrors.ciudad = "La ciudad es requerida";

    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida";
    } else {
      const selectedDate = new Date(formData.fecha);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (selectedDate < oneYearAgo) {
        newErrors.fecha = "La fecha no puede ser anterior a un año";
      }
    }

    const agendaArr = parseLines(formData.agendaText);
    if (agendaArr.length === 0)
      newErrors.agendaText = "Incluye al menos un punto en la agenda";
    if (agendaArr.length > MAX_ITEMS)
      newErrors.agendaText = `Máximo ${MAX_ITEMS} puntos`;

    const objetivosArr = parseLines(formData.objetivosText);
    if (objetivosArr.length === 0)
      newErrors.objetivosText = "Incluye al menos un objetivo";
    if (objetivosArr.length > MAX_ITEMS)
      newErrors.objetivosText = `Máximo ${MAX_ITEMS} objetivos`;

    if (formData.hora_inicio && formData.hora_fin) {
      const [sh, sm] = formData.hora_inicio.split(":").map(Number);
      const [eh, em] = formData.hora_fin.split(":").map(Number);
      if (sh * 60 + sm >= eh * 60 + em) {
        newErrors.hora_fin =
          "La hora de fin debe ser posterior a la hora de inicio";
      }
    } else if (formData.hora_inicio || formData.hora_fin) {
      newErrors.hora_fin = "Debes ingresar hora de inicio y fin (ambas).";
    }

    if (formData.enlace?.trim() && !validateUrl(formData.enlace.trim())) {
      newErrors.enlace = "El enlace debe ser una URL válida (http/https)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleChange = useCallback(
    (e, { name, value }) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    [errors]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      document
        .querySelector(".error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const agenda = parseLines(formData.agendaText).slice(0, MAX_ITEMS);
      const objetivos = parseLines(formData.objetivosText).slice(0, MAX_ITEMS);

      const meetingData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        ciudad: formData.ciudad.trim(),
        lugar: formData.lugar?.trim() || "",
        enlace: formData.enlace?.trim() || "",
        centro: formData.centro?.trim() || "",
        agenda,
        objetivos,
        acta_numero: formData.acta_numero?.trim() || "",
      };

      if (isEditing) {
        await updateMeeting(meeting.id, meetingData, auth.token);
        setErrors({ success: "Reunión actualizada exitosamente" });
      } else {
        const createdMeeting = await addMeeting(meetingData, auth.token);

        if (formData.fecha && formData.hora_inicio && formData.hora_fin) {
          const fd = new FormData();
          fd.append("meeting", createdMeeting.id);
          fd.append(
            "start_datetime",
            new Date(
              `${formData.fecha}T${formData.hora_inicio}:00`
            ).toISOString()
          );
          fd.append(
            "end_datetime",
            new Date(`${formData.fecha}T${formData.hora_fin}:00`).toISOString()
          );
          await addSession(fd, auth.token);
        }
        setErrors({ success: "Reunión creada exitosamente" });
      }

      setTimeout(() => {
        onRefetch?.();
        onClose?.();
      }, 1200);
    } catch (error) {
      let errorMessage = "Error al guardar la reunión";
      if (error?.response?.data?.message)
        errorMessage = error.response.data.message;
      else if (error?.response?.data?.error)
        errorMessage = error.response.data.error;
      else if (error?.message) errorMessage = error.message;

      setErrors({ submit: errorMessage });
      setTimeout(() => {
        document
          .querySelector(".negative.message")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };

  const isProcessing = submitting || loading;

  return (
    <Form onSubmit={handleSubmit} loading={isProcessing}>
      {errors.submit && (
        <Message negative className="error">
          <Message.Header>
            <Icon name="warning sign" />
            Error
          </Message.Header>
          <p>{errors.submit}</p>
        </Message>
      )}

      {errors.success && (
        <Message positive>
          <Message.Header>
            <Icon name="check circle" />
            Éxito
          </Message.Header>
          <p>{errors.success}</p>
        </Message>
      )}

      <Grid>
        {/* Información Básica */}
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Header as="h4" color="blue">
                <Icon name="info circle" />
                Información Básica
              </Header>
              <Form.Group widths="equal">
                <Form.Input
                  label="Nombre del comité o de la reunión"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={
                    errors.title
                      ? { content: errors.title, pointing: "below" }
                      : false
                  }
                  required
                  placeholder="Ej: Comité de Seguridad y Salud en el Trabajo"
                  maxLength={200}
                  disabled={isProcessing}
                />
                <Form.Input
                  label="Acta No."
                  name="acta_numero"
                  value={formData.acta_numero}
                  onChange={handleChange}
                  placeholder="Ej: 001-2025"
                  maxLength={50}
                  disabled={isProcessing}
                />
              </Form.Group>
              <Form.TextArea
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descripción detallada de la reunión..."
                rows={3}
                maxLength={1000}
                disabled={isProcessing}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        {/* Fecha, Hora y Lugar */}
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment>
              <Header as="h4" color="green">
                <Icon name="calendar alternate" />
                Fecha, Hora y Lugar
              </Header>
              <Form.Group widths="equal">
                <Form.Input
                  label="Ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  error={
                    errors.ciudad
                      ? { content: errors.ciudad, pointing: "below" }
                      : false
                  }
                  required
                  placeholder="Ej: Popayán"
                  maxLength={100}
                  disabled={isProcessing}
                />
                <Form.Input
                  label="Fecha"
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleChange}
                  error={
                    errors.fecha
                      ? { content: errors.fecha, pointing: "below" }
                      : false
                  }
                  required
                  disabled={isProcessing}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Input
                  label="Hora inicio"
                  name="hora_inicio"
                  type="time"
                  value={formData.hora_inicio}
                  onChange={handleChange}
                  disabled={isProcessing}
                />
                <Form.Input
                  label="Hora fin"
                  name="hora_fin"
                  type="time"
                  value={formData.hora_fin}
                  onChange={handleChange}
                  error={
                    errors.hora_fin
                      ? { content: errors.hora_fin, pointing: "below" }
                      : false
                  }
                  disabled={isProcessing}
                />
              </Form.Group>
              <Form.Group widths="equal">
                <Form.Input
                  label="Lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Ej: Sala de juntas principal"
                  maxLength={200}
                  disabled={isProcessing}
                />
                <Form.Input
                  label="Enlace virtual (opcional)"
                  name="enlace"
                  value={formData.enlace}
                  onChange={handleChange}
                  error={
                    errors.enlace
                      ? { content: errors.enlace, pointing: "below" }
                      : false
                  }
                  placeholder="https://meet.google.com/..."
                  maxLength={500}
                  disabled={isProcessing}
                />
              </Form.Group>
              <Form.Input
                label="Dirección / Regional / Centro"
                name="centro"
                value={formData.centro}
                onChange={handleChange}
                placeholder="Ej: Centro de Biotecnología Industrial - Calle 52 #13-65"
                maxLength={300}
                disabled={isProcessing}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        {/* Agenda y Objetivos (multilínea) */}
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment>
              <Header as="h4" color="orange">
                <Icon name="tasks" />
                Agenda o puntos para desarrollar
              </Header>
              <Form.TextArea
                name="agendaText"
                value={formData.agendaText}
                onChange={handleChange}
                placeholder={
                  "Escribe un punto por línea.\nEj:\n- Revisión de KPIs\n- Presupuesto Q4"
                }
                rows={6}
              />
              {errors.agendaText && (
                <Message negative size="small" className="error">
                  <Icon name="exclamation triangle" />
                  {errors.agendaText}
                </Message>
              )}
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Máximo {MAX_ITEMS} ítems. Cada línea = 1 punto.
              </div>
            </Segment>
          </Grid.Column>

          <Grid.Column width={8}>
            <Segment>
              <Header as="h4" color="purple">
                <Icon name="target" />
                Objetivo(s) de la reunión
              </Header>
              <Form.TextArea
                name="objetivosText"
                value={formData.objetivosText}
                onChange={handleChange}
                placeholder={
                  "Escribe un objetivo por línea.\nEj:\n- Alinear prioridades del sprint\n- Definir backlog del mes"
                }
                rows={6}
              />
              {errors.objetivosText && (
                <Message negative size="small" className="error">
                  <Icon name="exclamation triangle" />
                  {errors.objetivosText}
                </Message>
              )}
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                Máximo {MAX_ITEMS} ítems. Cada línea = 1 objetivo.
              </div>
            </Segment>
          </Grid.Column>
        </Grid.Row>

        {/* Botones */}
        <Grid.Row>
          <Grid.Column width={16}>
            <Segment basic clearing>
              <Button.Group floated="right">
                <Button type="button" onClick={onClose} disabled={isProcessing}>
                  <Icon name="cancel" />
                  Cancelar
                </Button>
                <Button.Or text="o" />
                <Button
                  type="submit"
                  primary
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  <Icon name={isEditing ? "save" : "plus"} />
                  {isEditing ? "Actualizar reunión" : "Crear reunión"}
                </Button>
              </Button.Group>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
  );
}
