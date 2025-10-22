// src/hooks/useActas.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { getMeetingSessionsApi } from "../api/meetingSession";
import { generarActaApi } from "../api/meetingSessionActa";
import { fetchActaVersions } from "../api/meetingSessionActaVersion";
import {
  generarActasReunionApi,
  descargarWordCompletoApi,
} from "../api/meetingActas";

export function useActas() {
  const { auth } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [batchLoadingMeetingId, setBatchLoadingMeetingId] = useState(null);
  const [error, setError] = useState(null);

  /** Carga todas las sesiones del usuario */
  const fetchSessions = useCallback(async () => {
    if (!auth?.token) return [];
    setLoading(true);
    setError(null);
    try {
      const list = await getMeetingSessionsApi(auth.token);
      const enhanced = (list || []).map((s) => ({
        ...s,
        meeting_id: s.meeting,
        meeting_title: s.meeting_title || "Sin título",
      }));
      setSessions(enhanced);
      return enhanced;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  /** Derivar reuniones únicas desde las sesiones */
  const meetings = useMemo(() => {
    const map = new Map();
    for (const s of sessions) {
      if (!map.has(s.meeting_id)) {
        map.set(s.meeting_id, { id: s.meeting_id, title: s.meeting_title });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      String(a.title).localeCompare(String(b.title))
    );
  }, [sessions]);

  /** Generar acta para una sesión */
  const generateActa = useCallback(
    async (sessionId) => {
      if (!auth?.token) throw new Error("No hay token de autenticación");
      setGeneratingId(sessionId);
      setError(null);
      try {
        const resp = await generarActaApi(sessionId, auth.token);
        return resp; // { msg, acta_version_id }
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setGeneratingId(null);
      }
    },
    [auth?.token]
  );

  /** Generar actas para TODAS las sesiones de una reunión */
  const generateAllForMeeting = useCallback(
    async (meetingId) => {
      if (!auth?.token) throw new Error("No hay token de autenticación");
      setBatchLoadingMeetingId(meetingId);
      setError(null);
      try {
        const resp = await generarActasReunionApi(meetingId, auth.token);
        await fetchSessions(); // refrescar estados acta_status
        return resp; // { meeting_id, results: [...] }
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setBatchLoadingMeetingId(null);
      }
    },
    [auth?.token, fetchSessions]
  );

  /** Descargar Word unificado de la reunión */
  const downloadWordForMeeting = useCallback(
    async (meetingId, filename = null) => {
      if (!auth?.token) throw new Error("No hay token de autenticación");
      const blob = await descargarWordCompletoApi(meetingId, auth.token);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename || `Acta_Reunion_${meetingId}_COMPLETA.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    },
    [auth?.token]
  );

  /** (Opcional) versiones de acta por sesión */
  const fetchVersionsBySession = useCallback(
    async (sessionId) => {
      if (!auth?.token) return [];
      try {
        const versions = await fetchActaVersions(sessionId, auth.token);
        return versions;
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [auth?.token]
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    meetings,
    loading,
    generatingId,
    batchLoadingMeetingId,
    error,
    // actions
    reload: fetchSessions,
    generateActa,
    generateAllForMeeting,
    downloadWordForMeeting,
    fetchVersionsBySession,
  };
}

// import { useState, useEffect, useCallback } from "react";
// import { useAuth } from "./useAuth";
// import { getMeetingSessionsApi } from "../api/meetingSession";
// import { generarActaApi } from "../api/meetingSessionActa";
// import { fetchActaVersions } from "../api/meetingSessionActaVersion";

// /**
//  * useActas: lista sesiones y utilidades relacionadas con actas.
//  * - Ahora consulta /api/sessions/ directamente (más eficiente que /api/meetings/)
//  * - Cada sesión ya trae: meeting (id), meeting_title, agenda[], objetivos[] (read-only)
//  */
// export function useActas() {
//   const { auth } = useAuth();

//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [generatingId, setGeneratingId] = useState(null);
//   const [error, setError] = useState(null);

//   /** Carga todas las sesiones del usuario */
//   const fetchSessions = useCallback(async () => {
//     if (!auth?.token) return [];
//     setLoading(true);
//     setError(null);
//     try {
//       // GET /api/sessions/
//       const list = await getMeetingSessionsApi(auth.token);

//       // Normalización mínima: asegurar meeting_id y título
//       const enhanced = (list || []).map((s) => ({
//         ...s,
//         meeting_id: s.meeting, // FK numérico
//         meeting_title: s.meeting_title || "Sin título", // auxiliar de UI
//         // agenda y objetivos ya vienen como read-only desde Meeting
//       }));

//       setSessions(enhanced);
//       return enhanced;
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, [auth?.token]);

//   /** Dispara la generación de acta para una sesión */
//   const generateActa = useCallback(
//     async (sessionId) => {
//       if (!auth?.token) throw new Error("No hay token de autenticación");
//       setGeneratingId(sessionId);
//       setError(null);
//       try {
//         // POST /api/sessions/:id/generar_acta/
//         const resp = await generarActaApi(sessionId, auth.token);
//         // Opcional: podrías recargar sesiones si quieres reflejar acta_status
//         // await fetchSessions();
//         return resp; // { msg, acta_version_id }
//       } catch (err) {
//         setError(err);
//         throw err;
//       } finally {
//         setGeneratingId(null);
//       }
//     },
//     [auth?.token]
//   );

//   /** (Opcional) Trae las versiones de acta de una sesión */
//   const fetchVersionsBySession = useCallback(
//     async (sessionId) => {
//       if (!auth?.token) return [];
//       try {
//         // GET /api/acta-versions/?session=ID
//         const versions = await fetchActaVersions(sessionId, auth.token);
//         return versions;
//       } catch (err) {
//         setError(err);
//         throw err;
//       }
//     },
//     [auth?.token]
//   );

//   useEffect(() => {
//     fetchSessions();
//   }, [fetchSessions]);

//   return {
//     sessions,
//     loading,
//     generatingId,
//     error,
//     // actions
//     reload: fetchSessions,
//     generateActa,
//     fetchVersionsBySession,
//   };
// }

// // import { useState, useEffect, useCallback } from "react";
// // import { getMeetingsApi } from "../api/meeting";
// // import { useAuth } from "./useAuth";

// // export function useActas() {
// //   const { auth } = useAuth();
// //   const [sessions, setSessions] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);

// //   const fetchSessions = useCallback(async () => {
// //     if (!auth?.token) return;
// //     setLoading(true);
// //     setError(null);
// //     try {
// //       const meetings = await getMeetingsApi(auth.token);
// //       const allSessions = meetings.flatMap((m) =>
// //         (m.sessions || []).map((s) => ({
// //           ...s,
// //           meeting_title: m.title || "Sin título",
// //           meeting_id: m.id,
// //         }))
// //       );
// //       setSessions(allSessions);
// //     } catch (err) {
// //       setError(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [auth?.token]);

// //   useEffect(() => {
// //     fetchSessions();
// //   }, [fetchSessions]);

// //   return { sessions, loading, error, reload: fetchSessions };
// // }
