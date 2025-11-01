// src/pages/Admin/ActasAdmin.js

import React, { useMemo, useState } from "react";
import { HeaderPage } from "../../components/Admin";
import { ActasTable } from "../../components/Admin/ActasTable";
import { useAuth } from "../../hooks/useAuth";
import { useActas } from "../../hooks/useActas";
import { generarActaApi } from "../../api/meetingSessionActa";
import { generarActaConsolidadaApi } from "../../api/meetings"; // ⬅️ nuevo
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../scss/ActasAdmin.scss";

/**
 * Cambios clave:
 * - Agrupamos sesiones por reunión con useMemo.
 * - Mantenemos generación por sesión (igual que antes).
 * - Añadimos handler para generación de Acta Consolidada por reunión.
 */
export function ActasAdmin() {
  const { auth } = useAuth();
  const { sessions, loading, error, reload } = useActas();
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [loadingMeetingId, setLoadingMeetingId] = useState(null);
  const navigate = useNavigate();

  // Agrupar sesiones por reunión
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of sessions || []) {
      const meetingId = s.meeting; // asume que viene el id de reunión; si no, usa s.meeting_id
      if (!map.has(meetingId)) {
        map.set(meetingId, {
          meetingId,
          meetingTitle: s.meeting_title,
          ciudad: s.ciudad,
          centro: s.centro,
          // agrega lo que recibas desde backend si lo expones en sesión
          sessions: [],
        });
      }
      map.get(meetingId).sessions.push(s);
    }
    // sort opcional por fecha de la primera sesión
    return Array.from(map.values()).sort((a, b) => {
      const aDate = a.sessions[0]?.start_datetime || "";
      const bDate = b.sessions[0]?.start_datetime || "";
      return new Date(bDate) - new Date(aDate);
    });
  }, [sessions]);

  // === por sesión (sin cambios en lógica) ===
  const handleGenerateActa = async (session) => {
    if (!window.confirm("¿Confirmas generar el acta de la sesión?")) return;
    setLoadingSessionId(session.id);
    try {
      await generarActaApi(session.id, auth.token);
      toast.success("¡Acta de sesión generada!");
      await reload();
    } catch {
      toast.error("No se pudo generar el acta de sesión");
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handlePreviewActa = (session) => {
    navigate(`/app/actas/${session.id}/editar`);
  };

  // === consolidada por reunión (nuevo) ===
  const handleGenerateActaConsolidada = async (meetingId) => {
    if (!window.confirm("¿Generar el acta CONSOLIDADA de esta reunión?"))
      return;
    setLoadingMeetingId(meetingId);
    try {
      const res = await generarActaConsolidadaApi(meetingId, auth.token);
      toast.success("¡Acta consolidada generada!");
      // si quieres, recarga algo o abre preview:
      // abrir preview HTML ligero en nueva pestaña
      if (res?.preview?.content_html) {
        const blob = new Blob([res.preview.content_html], {
          type: "text/html;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
      // descarga opcional
      // window.open(res.docx_url, "_blank");
    } catch (e) {
      toast.error("No se pudo generar el acta consolidada");
    } finally {
      setLoadingMeetingId(null);
    }
  };

  if (error) return <div>Error cargando sesiones.</div>;

  return (
    <>
      <HeaderPage title="🧠 Actas inteligentes" />
      <ActasTable
        groupedMeetings={grouped}
        loading={loading}
        loadingSessionId={loadingSessionId}
        loadingMeetingId={loadingMeetingId}
        onGenerateActaSession={handleGenerateActa}
        onPreviewActaSession={handlePreviewActa}
        onGenerateActaConsolidada={handleGenerateActaConsolidada}
      />
    </>
  );
}

// // src/pages/Admin/ActasAdmin.js

// import React, { useState } from "react";
// import { HeaderPage } from "../../components/Admin";
// import { ActasTable } from "../../components/Admin/ActasTable";
// import { useAuth } from "../../hooks/useAuth";
// import { useActas } from "../../hooks/useActas";
// import { generarActaApi } from "../../api/meetingSessionActa";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "../../scss/ActasAdmin.scss";

// export function ActasAdmin() {
//   const { auth } = useAuth();
//   const { sessions, loading, error, reload } = useActas(); // <-- usamos reload
//   const [loadingSessionId, setLoadingSessionId] = useState(null);
//   const navigate = useNavigate();

//   // 1) Generar Acta
//   const handleGenerateActa = async (session) => {
//     if (!window.confirm("¿Confirmas generar el acta?")) return;
//     setLoadingSessionId(session.id);
//     try {
//       await generarActaApi(session.id, auth.token);
//       toast.success("¡Acta generada!");
//       await reload(); // <-- Recarga solo la tabla
//     } catch {
//       toast.error("No se pudo generar el acta");
//     } finally {
//       setLoadingSessionId(null);
//     }
//   };

//   // 2) Redirigir al editor
//   const handlePreviewActa = (session) => {
//     navigate(`/actas/${session.id}/editar`);
//   };

//   if (error) return <div>Error cargando sesiones.</div>;

//   return (
//     <>
//       <HeaderPage title="🧠 Actas inteligentes" />

//       <ActasTable
//         sessions={sessions}
//         loading={loading}
//         loadingSessionId={loadingSessionId}
//         onGenerateActa={handleGenerateActa}
//         onPreviewActa={handlePreviewActa}
//       />
//     </>
//   );
// }
