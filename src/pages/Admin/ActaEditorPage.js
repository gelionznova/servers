// src/pages/Admin/ActaEditorPage.js
import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button, Header, Loader } from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";

// Hijos
import { ActaTemplateEditor } from "../../components/Admin/ActaTemplateEditor";
import { ActaTemplateEditorConsolidado } from "../../components/Admin/ActaTemplateEditorConsolidado";

// APIs (ajusta los paths si difieren en tu proyecto)
import {
  getSessionApi,
  getActaVersionLatestApi,
} from "../../api/meetingSessionActa";
import { generarActaConsolidadaApi } from "../../api/meetings";
import { getMeetingsApi } from "../../api/meeting";

// Recursos (opcional)
import logoSena from "../../assets/images/logo_sena.png";

export function ActaEditorPage() {
  const { sessionId, meetingId } = useParams();
  const location = useLocation();
  const { auth } = useAuth();
  const token = auth?.token;

  // Modo: si viene meetingId => Consolidado; si viene sessionId => Sesión
  const isConsolidado =
    Boolean(meetingId) ||
    new URLSearchParams(location.search).get("mode") === "consolidado";

  const [meta, setMeta] = useState(null); // info de la sesión o de la reunión
  const [acta, setActa] = useState(null); // datos que consumen los editores
  const [docxUrl, setDocxUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function loadSesion(sessionId) {
      // 1) metadata de la sesión (y su meeting)
      const s = await getSessionApi(sessionId, token);
      // 2) última versión de acta (por sesión)
      const last = await getActaVersionLatestApi(sessionId, token);

      // Mapea a la estructura que espera ActaTemplateEditor
      const actaData = {
        numero: s?.meeting?.acta_numero ?? "01",
        comite: s?.meeting?.title ?? "",
        ciudad: s?.meeting?.ciudad ?? "",
        lugar: s?.meeting?.lugar ?? "",
        enlace: s?.meeting?.enlace ?? "",
        centro: s?.meeting?.centro ?? "",
        agenda: Array.isArray(s?.meeting?.agenda) ? s.meeting.agenda : [],
        objetivos: Array.isArray(s?.meeting?.objetivos)
          ? s.meeting.objetivos
          : [],
        fecha: s?.start_datetime
          ? new Date(s.start_datetime).toLocaleDateString()
          : "",
        hora_inicio: s?.start_datetime
          ? new Date(s.start_datetime).toLocaleTimeString()
          : "",
        hora_fin: s?.end_datetime
          ? new Date(s.end_datetime).toLocaleTimeString()
          : "",
        desarrollo: last?.desarrollo ?? "",
        // si tu editor por sesión admite HTML de conclusiones, pásalo en HTML; si no, el texto plano:
        conclusiones: last?.content_html
          ? last.content_html
          : last?.conclusiones ?? "",
      };

      if (!mounted) return;
      setMeta(s || null);
      setActa(actaData);
      setDocxUrl(last?.word_file || null); // si tu API devuelve la URL absoluta/relativa
    }

    async function loadConsolidado(meetingId) {
      // 1) metadata de la reunión
      const meetings = await getMeetingsApi(token);
      const m = Array.isArray(meetings)
        ? meetings.find((x) => x.id === Number(meetingId))
        : null;

      // 2) generar/obtener consolidado (devuelve preview + docx_url)
      const res = await generarActaConsolidadaApi(meetingId, token);

      // Mapea a la estructura que espera ActaTemplateEditorConsolidado
      const actaData = {
        numero: (m?.acta_numero ?? "01") + "C",
        comite: m?.title ?? "",
        ciudad: m?.ciudad ?? "",
        lugar: m?.lugar ?? "",
        enlace: m?.enlace ?? "",
        centro: m?.centro ?? "",
        agenda: Array.isArray(m?.agenda) ? m.agenda : [],
        objetivos: Array.isArray(m?.objetivos) ? m.objetivos : [],
        // si luego devuelves fecha/hora desde backend, pásalas aquí:
        fecha: res?.fecha || "",
        hora_inicio: res?.hora_inicio || "",
        hora_fin: res?.hora_fin || "",
        // prioridad: HTML de preview; si no, texto
        desarrollo:
          res?.preview?.content_html || res?.preview?.desarrollo_text || "",
        conclusiones: res?.preview?.conclusiones_html || "",
        logoUrl: logoSena,
      };

      if (!mounted) return;
      setMeta(m || null);
      setActa(actaData);
      setDocxUrl(res?.docx_url || null);
    }

    (async () => {
      try {
        setLoading(true);
        if (isConsolidado && meetingId) {
          await loadConsolidado(meetingId);
        } else if (!isConsolidado && sessionId) {
          await loadSesion(sessionId);
        } else {
          // ruta mal formada
          setMeta(null);
          setActa(null);
        }
      } catch (e) {
        console.error("Error cargando acta:", e);
        setMeta(null);
        setActa(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isConsolidado, meetingId, sessionId, token]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const w = window.open("", "", "height=900,width=700");
    w.document.write(
      `<html><head><title>Acta</title></head><body>${html}</body></html>`
    );
    w.document.close();
    setTimeout(() => {
      w.focus();
      w.print();
      w.close();
    }, 250);
  };

  if (loading || !acta) {
    return (
      <Loader active inline="centered">
        Cargando acta...
      </Loader>
    );
  }

  // Elegimos qué hijo renderizar:
  const EditorComponent = isConsolidado
    ? ActaTemplateEditorConsolidado
    : ActaTemplateEditor;

  return (
    <div style={{ padding: 20 }}>
      <Header as="h2">
        {isConsolidado
          ? `Acta consolidada — Reunión ${meetingId}`
          : `Acta de sesión ${sessionId}`}
      </Header>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {docxUrl && (
          <Button as="a" href={docxUrl} target="_blank" rel="noreferrer">
            Descargar Word
          </Button>
        )}
      </div>

      <div ref={printRef}>
        <EditorComponent
          acta={acta}
          compromisos={[]} // puedes alimentar desde tu backend si lo deseas
          asistentes={[]}
          onFieldChange={() => {}}
          onChangeCompromisos={() => {}}
          onChangeAsistentes={() => {}}
          editable={true}
          meta={meta}
        />
      </div>
    </div>
  );
}

// import React, { useRef, useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button, Loader, Header } from "semantic-ui-react";
// import { useAuth } from "../../hooks/useAuth";
// import { useActaVersions } from "../../hooks/useActaVersions";
// import { getMeetingSessionApi } from "../../api/meetingSession";
// import { getMeetingsApi, updateMeetingApi } from "../../api/meeting";
// import { ActaTemplateEditor } from "../../components/Admin/ActaTemplateEditor";
// import logoSena from "../../assets/images/logo_sena.png";

// export function ActaEditorPage() {
//   const { sessionId } = useParams();
//   const navigate = useNavigate();
//   const { auth } = useAuth();
//   const token = auth?.token;

//   const { versions, loading, save } = useActaVersions(sessionId, token);

//   const actaPrintRef = useRef(null);

//   const [sessionInfo, setSessionInfo] = useState(null);
//   const [meetingInfo, setMeetingInfo] = useState(null);

//   const [actaData, setActaData] = useState(null);
//   const [compromisos, setCompromisos] = useState([]);
//   const [asistentes, setAsistentes] = useState([]);

//   // 1) cargar sesión
//   useEffect(() => {
//     if (!sessionId || !token) return;
//     getMeetingSessionApi(sessionId, token)
//       .then(setSessionInfo)
//       .catch(() => setSessionInfo(null));
//   }, [sessionId, token]);

//   // 2) con la sesión, cargar la reunión (para metadatos)
//   useEffect(() => {
//     if (!sessionInfo || !token) return;
//     const load = async () => {
//       try {
//         const meetingId = sessionInfo.meeting ?? sessionInfo.meeting_id;
//         if (!meetingId) return;
//         const all = await getMeetingsApi(token);
//         const found = Array.isArray(all)
//           ? all.find((m) => m.id === meetingId)
//           : null;
//         setMeetingInfo(found || null);
//       } catch {
//         setMeetingInfo(null);
//       }
//     };
//     load();
//   }, [sessionInfo, token]);

//   // 3) construir estado del acta
//   useEffect(() => {
//     if (!sessionInfo || !meetingInfo) return;

//     const version = versions[0] || {};
//     const start = sessionInfo.start_datetime
//       ? new Date(sessionInfo.start_datetime)
//       : null;
//     const end = sessionInfo.end_datetime
//       ? new Date(sessionInfo.end_datetime)
//       : null;

//     setActaData({
//       numero: meetingInfo.acta_numero || "01",
//       comite: meetingInfo.title || sessionInfo.meeting_title || "",
//       ciudad: meetingInfo.ciudad || "",
//       lugar: meetingInfo.lugar || "",
//       enlace: meetingInfo.enlace || "",
//       centro: meetingInfo.centro || "",
//       agenda: Array.isArray(meetingInfo.agenda) ? meetingInfo.agenda : [],
//       objetivos: Array.isArray(meetingInfo.objetivos)
//         ? meetingInfo.objetivos
//         : [],
//       fecha: start ? start.toLocaleDateString("es-CO") : "",
//       hora_inicio: start
//         ? start.toLocaleTimeString("es-CO", { hour12: true })
//         : "",
//       hora_fin: end ? end.toLocaleTimeString("es-CO", { hour12: true }) : "",
//       desarrollo: version.desarrollo || version.content_html || "",
//       conclusiones: version.conclusiones || "",
//       logoUrl: logoSena,
//     });

//     setCompromisos(version.compromisos || []);
//     setAsistentes(version.asistentes || []);
//   }, [versions, sessionInfo, meetingInfo]);

//   const handleFieldChange = (field, value) =>
//     setActaData((prev) => ({ ...prev, [field]: value }));

//   // ---- SAVE con saneamiento de datos ----
//   const handleSave = async () => {
//     try {
//       // 1) Limpiar arrays para cumplir el serializer
//       const cleanCompromisos = (compromisos || [])
//         .map((c) => ({
//           ...(c.id ? { id: c.id } : {}),
//           actividad: (c.actividad || "").trim(),
//           fecha: (c.fecha || "").trim(),
//           responsable: (c.responsable || "").trim(),
//           firma: (c.firma || "").trim(),
//         }))
//         .filter((c) => c.actividad); // <— requerido

//       const cleanAsistentes = (asistentes || [])
//         .map((a) => ({
//           ...(a.id ? { id: a.id } : {}),
//           nombre: (a.nombre || "").trim(),
//           dependencia: (a.dependencia || "").trim(),
//           aprueba: (a.aprueba || "").trim(),
//           observacion: (a.observacion || "").trim(),
//           firma: (a.firma || "").trim(),
//         }))
//         .filter((a) => a.nombre); // <— requerido

//       // 2) Actualizar Meeting (metadatos) si lo tenemos
//       if (meetingInfo?.id && token) {
//         await updateMeetingApi(
//           meetingInfo.id,
//           {
//             title: actaData.comite || "",
//             acta_numero: actaData.numero || "",
//             ciudad: actaData.ciudad || "",
//             lugar: actaData.lugar || "",
//             enlace: actaData.enlace || "",
//             centro: actaData.centro || "",
//             agenda: Array.isArray(actaData.agenda) ? actaData.agenda : [],
//             objetivos: Array.isArray(actaData.objetivos)
//               ? actaData.objetivos
//               : [],
//           },
//           token
//         );
//       }

//       // 3) Guardar/Actualizar versión (solo campos propios de versión)
//       await save({
//         desarrollo: actaData.desarrollo || "",
//         conclusiones: actaData.conclusiones || "",
//         compromisos: cleanCompromisos,
//         asistentes: cleanAsistentes,
//       });

//       alert("Acta guardada con éxito.");
//       navigate("z/actas");
//     } catch (err) {
//       console.error("Error al guardar acta:", err);
//       alert(err.message || "Error al guardar el acta.");
//     }
//   };

//   const handlePrint = () => {
//     if (!actaPrintRef.current) return;
//     const printContents = actaPrintRef.current.innerHTML;
//     const win = window.open("", "", "height=900,width=700");
//     win.document.write(`
//       <html>
//         <head>
//           <title></title>
//           <style>${
//             document.getElementById("print-styles")?.innerHTML || ""
//           }</style>
//         </head>
//         <body>${printContents}</body>
//       </html>
//     `);
//     win.document.close();
//     setTimeout(() => {
//       win.focus();
//       win.print();
//       win.close();
//     }, 400);
//   };

//   if (loading || !actaData) {
//     return (
//       <Loader active inline="centered">
//         Cargando acta...
//       </Loader>
//     );
//   }

//   return (
//     <div style={{ padding: 20 }}>
//       <Header as="h2">Editar Acta (Sesión {sessionId})</Header>
//       <Button primary onClick={handlePrint} className="no-print">
//         Imprimir Acta
//       </Button>
//       <Button
//         onClick={handleSave}
//         className="no-print"
//         style={{ marginLeft: 10 }}
//       >
//         Guardar Acta
//       </Button>

//       <div ref={actaPrintRef}>
//         <ActaTemplateEditor
//           acta={actaData}
//           compromisos={compromisos}
//           asistentes={asistentes}
//           onChangeCompromisos={setCompromisos}
//           onChangeAsistentes={setAsistentes}
//           onFieldChange={handleFieldChange}
//           editable={true}
//           meetingId={meetingInfo?.id} // ✅ AÑADIDO: ID de la reunión
//           token={token} // ✅ AÑADIDO: Token de autenticación
//         />
//       </div>

//       <style id="print-styles">{`
//         @media print { .no-print { display: none !important; } }
//         .page-break { display: block; height: 32px; margin-bottom: 16px; page-break-after: always; }
//         .acta-template { max-width: 900px; margin: 0 auto; background: #fff; padding: 32px 24px 40px; border-radius: 10px; font-size: 14px; }
//         .acta-logo { display: block; margin: 0 auto 15px; max-width: 120px; }
//         .acta-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px; }
//         .acta-table th, .acta-table td { border: 1px solid #222; padding: 6px; vertical-align: top; text-align: left; }
//         .acta-table th { font-weight: bold; background: #f5f7f6; text-align: center; }
//         .acta-header { background: #e6f6ef; font-size: 17px; text-align: center; font-weight: bold; }
//         .acta-section-header { background: #f6f7f9; font-weight: bold; text-align: center; font-size: 15px; }
//         .annex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
//         .annex-item { margin: 0; text-align: center; }
//         .annex-item img { width: 100%; height: auto; max-height: 300px; object-fit: cover; border: 1px solid #ddd; }
//         .annex-item figcaption { margin-top: 8px; font-style: italic; font-size: 12px; color: #555; }
//         .annex-empty { text-align: center; padding: 20px; color: #666; }
//       `}</style>
//     </div>
//   );
// }
