// src/components/Admin/ActasTable/ActasTable.js

import React from "react";
import { Link } from "react-router-dom";
import { Table, Button, Icon, Loader } from "semantic-ui-react";
import "./ActasTable.scss";

/**
 * sessions            = array de sesiones ya cargadas
 * loading             = boolean de carga
 * loadingSessionId    = id de la sesión en proceso de “generación”
 * onGenerateActa(s)   = dispara la API de generación
 * onPreviewActa(s)    = redirige al editor
 */
export function ActasTable({
  sessions = [],
  loading,
  loadingSessionId,
  onGenerateActa,
  onPreviewActa,
}) {
  if (loading) {
    return <Loader active>Cargando sesiones...</Loader>;
  }

  return (
    <div className="actas-table-wrapper">
      <Table celled className="actas-table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Reunión</Table.HeaderCell>
            <Table.HeaderCell>Inicio</Table.HeaderCell>
            <Table.HeaderCell>Fin</Table.HeaderCell>
            <Table.HeaderCell>Audio</Table.HeaderCell>
            <Table.HeaderCell>Estado Acta</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sessions.map((s) => (
            <Table.Row key={s.id}>
              <Table.Cell>{s.meeting_title}</Table.Cell>
              <Table.Cell>
                {s.start_datetime
                  ? new Date(s.start_datetime).toLocaleString()
                  : "-"}
              </Table.Cell>
              <Table.Cell>
                {s.end_datetime
                  ? new Date(s.end_datetime).toLocaleString()
                  : "-"}
              </Table.Cell>
              <Table.Cell>
                {s.audio_file ? (
                  <audio controls src={s.audio_file} />
                ) : (
                  <span className="no-audio">Sin audio</span>
                )}
              </Table.Cell>
              <Table.Cell>
                {s.acta_status === "generated" ? (
                  <span className="status generated">
                    <Icon name="check" /> Generada
                  </span>
                ) : (
                  <span className="status pending">
                    <Icon name="clock" /> Pendiente
                  </span>
                )}
              </Table.Cell>
              <Table.Cell>
                <div className="action-buttons">
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
                    onClick={() => onGenerateActa(s)}
                  >
                    <Icon name="magic" />
                    Generar acta
                  </Button>

                  <Button
                  className="generar-acta-btn"
                    as={Link}
                    to={`/app/actas/${s.id}/editar`}
                    size="mini"
                    color="blue"
                    disabled={s.acta_status !== "generated"}
                  >
                    <Icon name="eye" /> Vista previa
                  </Button>
                  {/* <Button
                    icon
                    color="grey"
                    size="mini"
                    as="a"
                    href={s.word_file} // deberías tener este campo en el objeto sesión, o cargarlo desde backend
                    target="_blank"
                    disabled={!s.word_file}
                    title="Descargar Word"
                  >
                    <Icon name="download" /> Word
                  </Button> */}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
