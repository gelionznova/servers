// src/components/Admin/ActasTable/ActasTable.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Icon, Loader, Label } from "semantic-ui-react";
import "./ActasTable.scss";

/**
 * groupedMeetings: [
 *   {
 *     meetingId, meetingTitle, ciudad, centro,
 *     // opcionales si tu backend los manda:
 *     consolidated_status? ("generated" | ...),
 *     has_consolidated_acta? (bool),
 *     sessions: [ { id, start_datetime, end_datetime, audio_file, acta_status, word_file, meeting_title, meeting } ]
 *   },
 *   ...
 * ]
 */
export function ActasTable({
  groupedMeetings = [],
  loading,
  loadingSessionId,
  loadingMeetingId,
  onGenerateActaSession,
  onPreviewActaSession,
  onGenerateActaConsolidada,
}) {
  // === ESTADO PARA CONSOLIDADO ===
  const [consolidadaOK, setConsolidadaOK] = useState(new Set()); // meetings con consolidado listo
  const [flashOK, setFlashOK] = useState({}); // { [meetingId]: true } -> "Acta consolidada generada"

  // Hidrata estado desde backend si ya hay consolidado listo
  useEffect(() => {
    const s = new Set();
    groupedMeetings.forEach((m) => {
      if (m?.consolidated_status === "generated" || m?.has_consolidated_acta) {
        s.add(m.meetingId);
      }
    });
    setConsolidadaOK(s);
  }, [groupedMeetings]);

  // Dispara la generación, marca como generado y muestra el label temporal
  const handleGenerarConsolidada = async (meetingId) => {
    try {
      await onGenerateActaConsolidada(meetingId);
      setConsolidadaOK((prev) => {
        const n = new Set(prev);
        n.add(meetingId);
        return n;
      });
      setFlashOK((prev) => ({ ...prev, [meetingId]: true }));
      setTimeout(() => {
        setFlashOK((prev) => {
          const cp = { ...prev };
          delete cp[meetingId];
          return cp;
        });
      }, 3500);
    } catch (e) {
      console.error("Error al generar acta consolidada:", e);
      // No marcar como generado si falla
    }
  };

  if (loading) {
    return <Loader active>Cargando reuniones y sesiones...</Loader>;
  }

  return (
    <div className="actas-table-wrapper">
      <Table celled className="actas-table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell style={{ width: "28%" }}>
              Reunión
            </Table.HeaderCell>
            <Table.HeaderCell>Sesiones</Table.HeaderCell>
            <Table.HeaderCell style={{ width: 210 }}>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {groupedMeetings.map((m) => {
            const total = m.sessions.length;
            const generadas = m.sessions.filter(
              (s) => s.acta_status === "generated"
            ).length;

            const puedePrevisualizar = consolidadaOK.has(m.meetingId);

            return (
              <Table.Row key={m.meetingId}>
                {/* Columna Reunión */}
                <Table.Cell>
                  <div className="meeting-head">
                    <div className="title">{m.meetingTitle}</div>
                    <div className="meta">
                      {m.ciudad && <span className="chip">{m.ciudad}</span>}
                      {m.centro && <span className="chip">{m.centro}</span>}
                      <span className="chip neutral">
                        {total} sesión{total !== 1 ? "es" : ""}
                      </span>
                      <span
                        className={`chip ${
                          generadas === total && total > 0 ? "ok" : "warn"
                        }`}
                      >
                        {generadas}/{total} actas
                      </span>
                    </div>
                  </div>
                </Table.Cell>

                {/* Columna Sesiones */}
                <Table.Cell>
                  <div className="sessions-inline">
                    {m.sessions.map((s, i) => (
                      <div key={s.id} className="session-pill">
                        <div className="line1">
                          <Label size="mini" circular>
                            {i + 1}
                          </Label>
                          <span className="dt">
                            {s.start_datetime
                              ? new Date(s.start_datetime).toLocaleString()
                              : "Sin inicio"}
                            {" — "}
                            {s.end_datetime
                              ? new Date(s.end_datetime).toLocaleString()
                              : "Sin fin"}
                          </span>
                        </div>

                        <div className="line2">
                          {s.audio_file ? (
                            <span className="audio ok">
                              <Icon name="volume up" /> Audio
                            </span>
                          ) : (
                            <span className="audio none">
                              <Icon name="ban" /> Sin audio
                            </span>
                          )}

                          {s.acta_status === "generated" ? (
                            <span className="status generated">
                              <Icon name="check" /> Generada
                            </span>
                          ) : (
                            <span className="status pending">
                              <Icon name="clock" /> Pendiente
                            </span>
                          )}
                        </div>

                        <div className="line3 actions">
                          <Button
                            size="mini"
                            color="green"
                            icon
                            labelPosition="left"
                            loading={loadingSessionId === s.id}
                            disabled={
                              !s.audio_file ||
                              s.acta_status === "generated" ||
                              loadingSessionId === s.id
                            }
                            onClick={() => onGenerateActaSession(s)}
                          >
                            <Icon name="magic" />
                            Generar
                          </Button>

                          <Button
                            as={Link}
                            to={`/app/actas/${s.id}/editar`}
                            size="mini"
                            color="blue"
                            disabled={s.acta_status !== "generated"}
                          >
                            <Icon name="eye" /> Vista previa
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Table.Cell>

                {/* Columna Acciones (Consolidado): DOS BOTONES, mutuamente excluyentes */}
                <Table.Cell textAlign="center">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    {/* <Button
                      size="small"
                      color="violet"
                      icon
                      labelPosition="left"
                      loading={loadingMeetingId === m.meetingId}
                      disabled={
                        loadingMeetingId === m.meetingId || // generando
                        m.sessions.length === 0 || // sin sesiones
                        puedePrevisualizar // si ya hay consolidado, deshabilitar "Generar"
                      }
                      onClick={() => handleGenerarConsolidada(m.meetingId)}
                      style={{ minWidth: 210 }}
                    >
                      <Icon name="clone" />
                      Generar Acta consolidada
                    </Button> */}

                    <Button
                      as={Link}
                      to={`/app/actas/consolidado/${m.meetingId}`}
                      size="small"
                      color="blue"
                      icon
                      labelPosition="left"
                      // disabled={
                      //   !puedePrevisualizar || // habilitar solo si ya está generado
                      //   // loadingMeetingId === m.meetingId // bloquear si aún está generando
                      // }
                      title={
                        puedePrevisualizar
                          ? "Abrir vista previa del acta consolidada"
                          : "Primero genera el acta consolidada"
                      }
                      style={{ minWidth: 210 }}
                    >
                      <Icon name="eye" />
                      Vista previa (consolidada)
                    </Button>

                    {flashOK[m.meetingId] && (
                      <Label color="green" basic size="small">
                        <Icon name="check circle" />
                        Acta consolidada generada
                      </Label>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
