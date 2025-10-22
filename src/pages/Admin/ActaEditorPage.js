import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Loader, Header } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";
import { useActaVersions } from "../../hooks/useActaVersions";
import { getMeetingSessionApi } from "../../api/meetingSession";
import { getMeetingsApi, updateMeetingApi } from "../../api/meeting";
import { ActaTemplateEditor } from "../../components/Admin/ActaTemplateEditor";
import logoSena from "../../assets/images/logo_sena.png";

export function ActaEditorPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const token = auth?.token;

  const { versions, loading, save } = useActaVersions(sessionId, token);

  const actaPrintRef = useRef(null);

  const [sessionInfo, setSessionInfo] = useState(null);
  const [meetingInfo, setMeetingInfo] = useState(null);

  const [actaData, setActaData] = useState(null);
  const [compromisos, setCompromisos] = useState([]);
  const [asistentes, setAsistentes] = useState([]);

  // 1) cargar sesión
  useEffect(() => {
    if (!sessionId || !token) return;
    getMeetingSessionApi(sessionId, token)
      .then(setSessionInfo)
      .catch(() => setSessionInfo(null));
  }, [sessionId, token]);

  // 2) con la sesión, cargar la reunión (para metadatos)
  useEffect(() => {
    if (!sessionInfo || !token) return;
    const load = async () => {
      try {
        const meetingId = sessionInfo.meeting ?? sessionInfo.meeting_id;
        if (!meetingId) return;
        const all = await getMeetingsApi(token);
        const found = Array.isArray(all)
          ? all.find((m) => m.id === meetingId)
          : null;
        setMeetingInfo(found || null);
      } catch {
        setMeetingInfo(null);
      }
    };
    load();
  }, [sessionInfo, token]);

  // 3) construir estado del acta
  useEffect(() => {
    if (!sessionInfo || !meetingInfo) return;

    const version = versions[0] || {};
    const start = sessionInfo.start_datetime
      ? new Date(sessionInfo.start_datetime)
      : null;
    const end = sessionInfo.end_datetime
      ? new Date(sessionInfo.end_datetime)
      : null;

    setActaData({
      numero: meetingInfo.acta_numero || "01",
      comite: meetingInfo.title || sessionInfo.meeting_title || "",
      ciudad: meetingInfo.ciudad || "",
      lugar: meetingInfo.lugar || "",
      enlace: meetingInfo.enlace || "",
      centro: meetingInfo.centro || "",
      agenda: Array.isArray(meetingInfo.agenda) ? meetingInfo.agenda : [],
      objetivos: Array.isArray(meetingInfo.objetivos)
        ? meetingInfo.objetivos
        : [],
      fecha: start ? start.toLocaleDateString("es-CO") : "",
      hora_inicio: start
        ? start.toLocaleTimeString("es-CO", { hour12: true })
        : "",
      hora_fin: end ? end.toLocaleTimeString("es-CO", { hour12: true }) : "",
      desarrollo: version.desarrollo || version.content_html || "",
      conclusiones: version.conclusiones || "",
      logoUrl: logoSena,
    });

    setCompromisos(version.compromisos || []);
    setAsistentes(version.asistentes || []);
  }, [versions, sessionInfo, meetingInfo]);

  const handleFieldChange = (field, value) =>
    setActaData((prev) => ({ ...prev, [field]: value }));

  // ---- SAVE con saneamiento de datos ----
  const handleSave = async () => {
    try {
      // 1) Limpiar arrays para cumplir el serializer
      const cleanCompromisos = (compromisos || [])
        .map((c) => ({
          ...(c.id ? { id: c.id } : {}),
          actividad: (c.actividad || "").trim(),
          fecha: (c.fecha || "").trim(),
          responsable: (c.responsable || "").trim(),
          firma: (c.firma || "").trim(),
        }))
        .filter((c) => c.actividad); // <— requerido

      const cleanAsistentes = (asistentes || [])
        .map((a) => ({
          ...(a.id ? { id: a.id } : {}),
          nombre: (a.nombre || "").trim(),
          dependencia: (a.dependencia || "").trim(),
          aprueba: (a.aprueba || "").trim(),
          observacion: (a.observacion || "").trim(),
          firma: (a.firma || "").trim(),
        }))
        .filter((a) => a.nombre); // <— requerido

      // 2) Actualizar Meeting (metadatos) si lo tenemos
      if (meetingInfo?.id && token) {
        await updateMeetingApi(
          meetingInfo.id,
          {
            title: actaData.comite || "",
            acta_numero: actaData.numero || "",
            ciudad: actaData.ciudad || "",
            lugar: actaData.lugar || "",
            enlace: actaData.enlace || "",
            centro: actaData.centro || "",
            agenda: Array.isArray(actaData.agenda) ? actaData.agenda : [],
            objetivos: Array.isArray(actaData.objetivos)
              ? actaData.objetivos
              : [],
          },
          token
        );
      }

      // 3) Guardar/Actualizar versión (solo campos propios de versión)
      await save({
        desarrollo: actaData.desarrollo || "",
        conclusiones: actaData.conclusiones || "",
        compromisos: cleanCompromisos,
        asistentes: cleanAsistentes,
      });

      alert("Acta guardada con éxito.");
      navigate("/actas");
    } catch (err) {
      console.error("Error al guardar acta:", err);
      alert(err.message || "Error al guardar el acta.");
    }
  };

  const handlePrint = () => {
    if (!actaPrintRef.current) return;
    const printContents = actaPrintRef.current.innerHTML;
    const win = window.open("", "", "height=900,width=700");
    win.document.write(`
      <html>
        <head>
          <title></title>
          <style>${
            document.getElementById("print-styles")?.innerHTML || ""
          }</style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 400);
  };

  if (loading || !actaData) {
    return (
      <Loader active inline="centered">
        Cargando acta...
      </Loader>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <Header as="h2">Editar Acta (Sesión {sessionId})</Header>
      <Button primary onClick={handlePrint} className="no-print">
        Imprimir Acta
      </Button>
      <Button
        onClick={handleSave}
        className="no-print"
        style={{ marginLeft: 10 }}
      >
        Guardar Acta
      </Button>

      <div ref={actaPrintRef}>
        <ActaTemplateEditor
          acta={actaData}
          compromisos={compromisos}
          asistentes={asistentes}
          onChangeCompromisos={setCompromisos}
          onChangeAsistentes={setAsistentes}
          onFieldChange={handleFieldChange}
          editable={true}
          meetingId={meetingInfo?.id} // ✅ AÑADIDO: ID de la reunión
          token={token} // ✅ AÑADIDO: Token de autenticación
        />
      </div>

      <style id="print-styles">{`
        @media print { .no-print { display: none !important; } }
        .page-break { display: block; height: 32px; margin-bottom: 16px; page-break-after: always; }
        .acta-template { max-width: 900px; margin: 0 auto; background: #fff; padding: 32px 24px 40px; border-radius: 10px; font-size: 14px; }
        .acta-logo { display: block; margin: 0 auto 15px; max-width: 120px; }
        .acta-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px; }
        .acta-table th, .acta-table td { border: 1px solid #222; padding: 6px; vertical-align: top; text-align: left; }
        .acta-table th { font-weight: bold; background: #f5f7f6; text-align: center; }
        .acta-header { background: #e6f6ef; font-size: 17px; text-align: center; font-weight: bold; }
        .acta-section-header { background: #f6f7f9; font-weight: bold; text-align: center; font-size: 15px; }
        .annex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
        .annex-item { margin: 0; text-align: center; }
        .annex-item img { width: 100%; height: auto; max-height: 300px; object-fit: cover; border: 1px solid #ddd; }
        .annex-item figcaption { margin-top: 8px; font-style: italic; font-size: 12px; color: #555; }
        .annex-empty { text-align: center; padding: 20px; color: #666; }
      `}</style>
    </div>
  );
}
