import React, { useRef, useEffect } from "react";
import "./ActaTemplateEditor.scss";
import { useMeetingPhoto } from "../../../hooks/useMeetingPhoto";

/** Campo editable sin <input>, imprime como línea (border-bottom).
 *  Usa contentEditable y dispara onChange con el texto plano.
 */
function LineField({
  value = "",
  onChange = () => {},
  placeholder = "",
  style = {},
  className = "",
  editable = true,
}) {
  const fieldRef = useRef(null);

  // Inicializar el contenido cuando cambia el value externo
  useEffect(() => {
    if (fieldRef.current && fieldRef.current.textContent !== value) {
      fieldRef.current.textContent = value;
    }
  }, [value]);

  if (!editable) {
    return (
      <span className={`line-field-static ${className}`} style={style}>
        {value}
      </span>
    );
  }

  return (
    <div
      ref={fieldRef}
      className={`line-field ${className}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      onBlur={(e) => {
        const newValue = e.currentTarget.textContent || "";
        if (newValue !== value) {
          onChange(newValue);
        }
      }}
    />
  );
}

export function ActaTemplateEditor({
  acta = {},
  compromisos = [],
  asistentes = [],
  onFieldChange = () => {},
  onChangeCompromisos = () => {},
  onChangeAsistentes = () => {},
  editable = true,
  meetingId,
  token,
}) {
  const desarrolloRef = useRef();
  const conclusionesRef = useRef();

  // ------ Fotos (ANEXOS) - Solo lectura desde la reunión ------
  const { photos, loading: loadingPhotos, getPhotos } = useMeetingPhoto();

  useEffect(() => {
    if (meetingId && token) {
      getPhotos(meetingId, token).catch((err) => {
        console.error("Error cargando fotos de la reunión:", err);
      });
    }
  }, [meetingId, token]);

  // ------ tablas ------
  const handleCompromisoCell = (rowIdx, field, value) => {
    const rows = compromisos.map((r, i) =>
      i === rowIdx ? { ...r, [field]: value } : r
    );
    onChangeCompromisos(rows);
  };
  const handleAsistenteCell = (rowIdx, field, value) => {
    const rows = asistentes.map((r, i) =>
      i === rowIdx ? { ...r, [field]: value } : r
    );
    onChangeAsistentes(rows);
  };

  const addCompromiso = () =>
    onChangeCompromisos([
      ...compromisos,
      { actividad: "", fecha: "", responsable: "", firma: "" },
    ]);
  const removeCompromiso = (idx) =>
    onChangeCompromisos(compromisos.filter((_, i) => i !== idx));

  const addAsistente = () =>
    onChangeAsistentes([
      ...asistentes,
      { nombre: "", dependencia: "", aprueba: "", observacion: "", firma: "" },
    ]);
  const removeAsistente = (idx) =>
    onChangeAsistentes(asistentes.filter((_, i) => i !== idx));

  const handleFieldBlur = (field, ref) =>
    onFieldChange(field, ref.current.innerHTML);

  return (
    <div className="acta-template">
      {/* ENCABEZADO */}
      <img
        src={(acta && acta.logoUrl) || "/logo_sena.png"}
        alt="Logo SENA"
        className="acta-logo"
      />

      <table className="acta-table">
        <tbody>
          {/* ACTA No. */}
          <tr>
            <td colSpan={6} className="acta-header">
              <div style={{ display: "flex", justifyContent: "center" }}>
                ACTA No.&nbsp;
                <LineField
                  style={{
                    width: 60,
                    fontWeight: "bold",
                    fontSize: 17,
                    textAlign: "center",
                    display: "inline-block",
                  }}
                  value={acta.numero || ""}
                  onChange={(v) => onFieldChange("numero", v)}
                  editable={editable}
                />
              </div>
            </td>
          </tr>

          {/* Nombre comité/reunión */}
          <tr>
            <td colSpan={6} style={{ fontWeight: "bold" }}>
              NOMBRE DEL COMITÉ O DE LA REUNIÓN:
              <span
                style={{
                  fontWeight: "normal",
                  marginLeft: 5,
                  display: "inline-block",
                  width: "90%",
                  maxWidth: 350,
                }}
              >
                <LineField
                  style={{ width: "100%" }}
                  value={acta.comite || ""}
                  onChange={(v) => onFieldChange("comite", v)}
                  editable={editable}
                />
              </span>
            </td>
          </tr>

          {/* Ciudad / Fecha / Horas */}
          <tr>
            <td style={{ fontWeight: "bold" }}>CIUDAD Y FECHA:</td>
            <td>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <LineField
                  style={{ width: "100%" }}
                  value={acta.ciudad || ""}
                  placeholder="Ciudad"
                  onChange={(v) => onFieldChange("ciudad", v)}
                  editable={editable}
                />
                <LineField
                  style={{ width: "100%" }}
                  value={acta.fecha || ""}
                  placeholder="dd/mm/yyyy"
                  onChange={(v) => onFieldChange("fecha", v)}
                  editable={editable}
                />
              </div>
            </td>

            <td style={{ fontWeight: "bold" }}>
              HORA INICIO:
              <br />
              <LineField
                style={{ width: "90%" }}
                value={acta.hora_inicio || ""}
                onChange={(v) => onFieldChange("hora_inicio", v)}
                editable={editable}
              />
            </td>
            <td style={{ fontWeight: "bold" }}>
              HORA FIN:
              <br />
              <LineField
                style={{ width: "90%" }}
                value={acta.hora_fin || ""}
                onChange={(v) => onFieldChange("hora_fin", v)}
                editable={editable}
              />
            </td>
          </tr>

          {/* Lugar / Enlace / Centro */}
          <tr>
            <td style={{ fontWeight: "bold" }}>LUGAR Y/O ENLACE:</td>
            <td>
              <LineField
                style={{ width: "95%" }}
                value={acta.lugar || ""}
                onChange={(v) => onFieldChange("lugar", v)}
                editable={editable}
              />
            </td>
            <td>
              <LineField
                style={{ width: "95%" }}
                value={acta.enlace || ""}
                onChange={(v) => onFieldChange("enlace", v)}
                editable={editable}
              />
            </td>
            <td style={{ fontWeight: "bold" }}>
              DIRECCIÓN / REGIONAL / CENTRO:
              <br />
              <LineField
                style={{ width: "95%" }}
                value={acta.centro || ""}
                onChange={(v) => onFieldChange("centro", v)}
                editable={editable}
              />
            </td>
          </tr>

          {/* Agenda */}
          <tr>
            <td colSpan={6}>
              <b>AGENDA O PUNTOS PARA DESARROLLAR:</b>
              <br />
              {editable ? (
                <ol>
                  {(acta.agenda || []).map((item, idx) => (
                    <li key={`agenda-${idx}`}>
                      <LineField
                        className="list-line"
                        style={{ width: "80%" }}
                        value={item}
                        onChange={(v) => {
                          const newAgenda = [...(acta.agenda || [])];
                          newAgenda[idx] = v;
                          onFieldChange("agenda", newAgenda);
                        }}
                        editable={editable}
                      />
                      <button
                        type="button"
                        className="no-print"
                        onClick={() => {
                          const newAgenda = [...(acta.agenda || [])];
                          newAgenda.splice(idx, 1);
                          onFieldChange("agenda", newAgenda);
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="no-print"
                      onClick={() =>
                        onFieldChange("agenda", [...(acta.agenda || []), ""])
                      }
                    >
                      + Agregar punto
                    </button>
                  </li>
                </ol>
              ) : (
                <ol>
                  {(acta.agenda || []).map((item, idx) => (
                    <li key={`agenda-${idx}`}>{item}</li>
                  ))}
                </ol>
              )}
            </td>
          </tr>

          {/* Objetivos */}
          <tr>
            <td colSpan={6}>
              <b>OBJETIVO(S) DE LA REUNIÓN:</b>
              <br />
              {editable ? (
                <ul>
                  {(acta.objetivos || []).map((obj, idx) => (
                    <li key={`obj-${idx}`}>
                      <LineField
                        className="list-line"
                        style={{ width: "80%" }}
                        value={obj}
                        onChange={(v) => {
                          const newObjs = [...(acta.objetivos || [])];
                          newObjs[idx] = v;
                          onFieldChange("objetivos", newObjs);
                        }}
                        editable={editable}
                      />
                      <button
                        type="button"
                        className="no-print"
                        onClick={() => {
                          const newObjs = [...(acta.objetivos || [])];
                          newObjs.splice(idx, 1);
                          onFieldChange("objetivos", newObjs);
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="no-print"
                      onClick={() =>
                        onFieldChange("objetivos", [
                          ...(acta.objetivos || []),
                          "",
                        ])
                      }
                    >
                      + Agregar objetivo
                    </button>
                  </li>
                </ul>
              ) : (
                <ul>
                  {(acta.objetivos || []).map((obj, idx) => (
                    <li key={`obj-${idx}`}>{obj}</li>
                  ))}
                </ul>
              )}
            </td>
          </tr>

          {/* Desarrollo */}
          <tr>
            <td colSpan={6} className="acta-section-header">
              DESARROLLO DE LA REUNIÓN
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div
                ref={desarrolloRef}
                contentEditable={editable}
                suppressContentEditableWarning
                className="acta-editable"
                onBlur={() => handleFieldBlur("desarrollo", desarrolloRef)}
                dangerouslySetInnerHTML={{
                  __html: acta.desarrollo || "<p></p>",
                }}
              />
            </td>
          </tr>

          {/* Conclusiones */}
          <tr>
            <td colSpan={6} className="acta-section-header">
              CONCLUSIONES
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div
                ref={conclusionesRef}
                contentEditable={editable}
                suppressContentEditableWarning
                className="acta-editable"
                style={{
                  minHeight: "100px",
                  padding: "8px",
                  lineHeight: "1.5",
                }}
                onBlur={() => handleFieldBlur("conclusiones", conclusionesRef)}
                onInput={(e) => {
                  // Esta función se ejecuta cada vez que hay una entrada
                  const content = e.currentTarget.innerHTML;
                  // Asegura que cada viñeta esté en una línea separada
                  const formattedContent = content.replace(
                    /<li>/g,
                    '<li style="margin-bottom: 8px;">'
                  );
                  if (content !== formattedContent) {
                    e.currentTarget.innerHTML = formattedContent;
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: acta.conclusiones || "",
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      <span style={{ fontWeight: "normal" }}>GOR-F-084V02</span>

      <div className="page-break" />

      {/* ========= COMPROMISOS ========= */}
      <img
        src={(acta && acta.logoUrl) || "/logo_sena.png"}
        alt="Logo SENA"
        className="acta-logo"
      />

      <div className="acta-table-wrap">
        <table className="acta-table compromisos-table">
          <colgroup>
            <col style={{ width: "46%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "16%" }} />
            {editable && <col style={{ width: "60px" }} />}
          </colgroup>

          <thead>
            <tr>
              <th colSpan={editable ? 5 : 4} style={{ textAlign: "center" }}>
                <b>ESTABLECIMIENTO Y ACEPTACIÓN DE COMPROMISOS</b>
              </th>
            </tr>
            <tr>
              <th>ACTIVIDAD / DECISIÓN</th>
              <th class="th-fecha">
                FECHA
                <span class="sub">(yy-mm-dd)</span>
              </th>
              <th>RESPONSABLE</th>
              <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
              {editable && <th className="no-print" />}
            </tr>
          </thead>

          <tbody>
            {compromisos.map((c, idx) => (
              <tr key={`comp-${idx}`} className="no-break">
                <td>
                  <LineField
                    className="cell-field"
                    value={c.actividad}
                    onChange={(v) => handleCompromisoCell(idx, "actividad", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={c.fecha}
                    onChange={(v) => handleCompromisoCell(idx, "fecha", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={c.responsable}
                    onChange={(v) =>
                      handleCompromisoCell(idx, "responsable", v)
                    }
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={c.firma}
                    onChange={(v) => handleCompromisoCell(idx, "firma", v)}
                    editable={editable}
                  />
                </td>
                {editable && (
                  <td className="no-print">
                    <button
                      type="button"
                      className="eliminar-btn"
                      onClick={() => removeCompromiso(idx)}
                    >
                      ❌
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {editable && (
          <div className="no-print add-btn-row">
            <button type="button" onClick={addCompromiso}>
              + Agregar Compromiso
            </button>
          </div>
        )}
      </div>

      {/* ========= ASISTENTES ========= */}
      <div className="acta-table-wrap">
        <table className="acta-table asistentes-table">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "24%" }} />
            {editable && <col style={{ width: "60px" }} />}
          </colgroup>

          <thead>
            <tr>
              <th colSpan={editable ? 6 : 5} style={{ textAlign: "center" }}>
                <b>DE: ASISTENTES Y APROBACIÓN DECISIONES</b>
              </th>
            </tr>
            <tr>
              <th>NOMBRE</th>
              <th>DEPENDENCIA / EMPRESA</th>
              <th>APRUEBA (SI/NO)</th>
              <th>OBSERVACIÓN</th>
              <th>FIRMA O PARTICIPACIÓN VIRTUAL</th>
              {editable && <th className="no-print" />}
            </tr>
          </thead>

          <tbody>
            {asistentes.map((a, idx) => (
              <tr key={`asis-${idx}`} className="no-break">
                <td>
                  <LineField
                    className="cell-field"
                    value={a.nombre}
                    onChange={(v) => handleAsistenteCell(idx, "nombre", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={a.dependencia}
                    onChange={(v) => handleAsistenteCell(idx, "dependencia", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={a.aprueba}
                    onChange={(v) => handleAsistenteCell(idx, "aprueba", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={a.observacion}
                    onChange={(v) => handleAsistenteCell(idx, "observacion", v)}
                    editable={editable}
                  />
                </td>
                <td>
                  <LineField
                    className="cell-field"
                    value={a.firma}
                    onChange={(v) => handleAsistenteCell(idx, "firma", v)}
                    editable={editable}
                  />
                </td>
                {editable && (
                  <td className="no-print">
                    <button
                      type="button"
                      className="eliminar-btn"
                      onClick={() => removeAsistente(idx)}
                    >
                      ❌
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {editable && (
          <div className="no-print add-btn-row">
            <button type="button" onClick={addAsistente}>
              + Agregar Asistente
            </button>
          </div>
        )}
      </div>

      <br />
      <span style={{ fontWeight: "normal" }}>GOR-F-084V02</span>

      <div className="page-break" />

      {/* ========= ANEXOS ========= */}
      <img
        src={(acta && acta.logoUrl) || "/logo_sena.png"}
        alt="Logo SENA"
        className="acta-logo"
      />
      <table className="acta-table anexos-table">
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>
              <b>ANEXOS</b>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              {loadingPhotos && (
                <div style={{ textAlign: "center", padding: "10px" }}>
                  Cargando fotos de la reunión...
                </div>
              )}

              <div className="annex-grid">
                {photos.length > 0
                  ? photos.map((photo, idx) => (
                      <figure className="annex-item" key={photo.id || idx}>
                        <img
                          src={photo.image}
                          alt={`Figura ${idx + 1}`}
                          loading="lazy"
                        />
                        <figcaption>Figura {idx + 1}</figcaption>
                      </figure>
                    ))
                  : !loadingPhotos && (
                      <div
                        className="annex-empty"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          color: "#666",
                        }}
                      >
                        {editable
                          ? "No hay fotos en esta reunión. Las fotos se pueden agregar desde la tabla de reuniones."
                          : "Sin anexos fotográficos."}
                      </div>
                    )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <span style={{ fontWeight: "normal" }}>GOR-F-084V02</span>

      <div className="page-break" />
    </div>
  );
}
