import { useState, useCallback } from "react";
import {
  getMeetingsApi,
  addMeetingApi,
  updateMeetingApi,
  deleteMeetingApi,
  setCoverPhotoApi,
} from "../api/meeting";
import {
  getMeetingSessionsApi,
  addMeetingSessionApi,
  deleteMeetingSessionApi,
} from "../api/meetingSession";
import { generarActaApi } from "../api/meetingSessionActa";

/** Util: asegura FormData para sesiones (audio_file opcional) */
function ensureSessionFormData(sessionData, meetingId) {
  if (sessionData instanceof FormData) {
    // forzamos meeting correcto
    sessionData.set("meeting", meetingId);
    return sessionData;
  }
  const fd = new FormData();
  // Campos esperados por el serializer de MeetingSession
  // start_datetime, end_datetime, audio_file?, meeting
  if (sessionData?.start_datetime) fd.append("start_datetime", sessionData.start_datetime);
  if (sessionData?.end_datetime) fd.append("end_datetime", sessionData.end_datetime);
  if (sessionData?.audio_file) fd.append("audio_file", sessionData.audio_file);
  fd.append("meeting", meetingId);
  return fd;
}

export function useMeeting() {
  const [meetings, setMeetings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const getMeetings = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMeetingsApi(token);
      setMeetings(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /** Lista todas las sesiones (usa query params si quieres filtrar en el API) */
  const getSessions = useCallback(async (token) => {
    setError(null);
    try {
      const response = await getMeetingSessionsApi(token); // GET /api/sessions/
      setSessions(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  /** Conveniencia: sesiones por reunión */
  const getSessionsByMeeting = useCallback(async (meetingId, token) => {
    setError(null);
    try {
      const response = await getMeetingSessionsApi(token, { meeting: meetingId }); // si tu API admite params
      // Si tu implementación actual de getMeetingSessionsApi no acepta params,
      // puedes filtrar aquí:
      // const response = await getMeetingSessionsApi(token);
      // const filtered = response.filter(s => s.meeting === meetingId);
      setSessions(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const addMeeting = useCallback(async (data, token) => {
    setCreating(true);
    setError(null);
    try {
      const created = await addMeetingApi(data, token);
      // opcional: actualizar estado local
      setMeetings((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const updateMeeting = useCallback(async (id, data, token) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateMeetingApi(id, data, token);
      setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  const deleteMeeting = useCallback(async (id, token) => {
    setError(null);
    try {
      await deleteMeetingApi(id, token);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      // también podrías limpiar sessions relacionadas si las manejas en memoria
      setSessions((prev) => prev.filter((s) => s.meeting !== id));
      return true;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const addSession = useCallback(async (sessionData, token) => {
    setCreating(true);
    setError(null);
    try {
      // sessionData debe ser FormData con 'meeting', 'start_datetime', 'end_datetime', 'audio_file?'
      const created = await addMeetingSessionApi(sessionData, token);
      setSessions((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteSession = useCallback(async (id, token) => {
    setError(null);
    try {
      await deleteMeetingSessionApi(id, token);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  /**
   * Flujo completo:
   * 1) Crea Meeting
   * 2) (Opcional) Crea Session (audio_file soportado)
   * 3) (Opcional) Genera Acta si actaOptions.generate === true
   * 
   * @param {object} meetingData  Campos del Meeting (title, agenda[], objetivos[], etc.)
   * @param {object|FormData|null} sessionData  start_datetime, end_datetime, audio_file?
   * @param {object|null} actaOptions  { generate?: boolean }
   * @returns {object} { meeting, session?, acta? }
   */
  const addCompleteMeeting = useCallback(async (meetingData, sessionData, actaOptions, token) => {
    setCreating(true);
    setError(null);
    try {
      // 1) Crear reunión
      const meeting = await addMeetingApi(meetingData, token);
      if (!meeting?.id) throw new Error("No se pudo crear la reunión");

      // 2) Crear sesión si la enviaron
      let session = null;
      if (sessionData && Object.keys(sessionData).length > 0) {
        const fd = ensureSessionFormData(sessionData, meeting.id);
        session = await addMeetingSessionApi(fd, token);
        setSessions((prev) => (session ? [session, ...prev] : prev));
      }

      // 3) Generar acta si se solicita y hay sesión
      let acta = null;
      if (actaOptions?.generate === true && session?.id) {
        acta = await generarActaApi(session.id, token);
      }

      // Actualiza estado local de meetings
      setMeetings((prev) => [meeting, ...prev]);

      return { meeting, session, acta };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  /** Asignar foto de portada al Meeting */
  const setCoverPhoto = useCallback(async (meetingId, photoId, token) => {
    setUpdating(true);
    setError(null);
    try {
      const updatedMeeting = await setCoverPhotoApi(meetingId, photoId, token);
      setMeetings((prev) => prev.map((m) => (m.id === meetingId ? updatedMeeting : m)));
      return updatedMeeting;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  /** Recarga reuniones y sesiones en paralelo */
  const reload = useCallback(async (token) => {
    await Promise.all([getMeetings(token), getSessions(token)]);
  }, [getMeetings, getSessions]);

  return {
    meetings,
    sessions,
    loading,
    creating,
    updating,
    error,
    // fetchers
    getMeetings,
    getSessions,
    getSessionsByMeeting,
    // meeting
    addMeeting,
    updateMeeting,
    deleteMeeting,
    setCoverPhoto,
    // session
    addSession,
    deleteSession,
    // flow
    addCompleteMeeting,
    // misc
    reload,
  };
}

// import { useState, useCallback } from "react";
// import {
//   getMeetingsApi,
//   addMeetingApi,
//   updateMeetingApi,
//   deleteMeetingApi,
// } from "../api/meeting";
// import {
//   getMeetingSessionsApi,
//   addMeetingSessionApi,
//   deleteMeetingSessionApi,
// } from "../api/meetingSession";

// export function useMeeting() {
//   const [meetings, setMeetings] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [creating, setCreating] = useState(false);
//   const [updating, setUpdating] = useState(false);
//   const [error, setError] = useState(null);

//   const getMeetings = async (token) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getMeetingsApi(token);
//       setMeetings(response);
//       return response;
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getSessions = async (token) => {
//     setError(null);
//     try {
//       const response = await getMeetingSessionsApi(token);
//       setSessions(response);
//       return response;
//     } catch (err) {
//       setError(err);
//       throw err;
//     }
//   };

//   const addMeeting = async (data, token) => {
//     setCreating(true);
//     setError(null);
//     try {
//       return await addMeetingApi(data, token);
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setCreating(false);
//     }
//   };

//   const updateMeeting = async (id, data, token) => {
//     setUpdating(true);
//     setError(null);
//     try {
//       return await updateMeetingApi(id, data, token);
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const deleteMeeting = async (id, token) => {
//     setError(null);
//     try {
//       return await deleteMeetingApi(id, token);
//     } catch (err) {
//       setError(err);
//       throw err;
//     }
//   };

//   const addSession = async (formData, token) => {
//     setCreating(true);
//     setError(null);
//     try {
//       return await addMeetingSessionApi(formData, token);
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setCreating(false);
//     }
//   };

//   const deleteSession = async (id, token) => {
//     setError(null);
//     try {
//       return await deleteMeetingSessionApi(id, token);
//     } catch (err) {
//       setError(err);
//       throw err;
//     }
//   };

//   // Crear reunión + sesión + acta
//   const addCompleteMeeting = async (meetingData, sessionData, actaData, token) => {
//     setCreating(true);
//     setError(null);
//     try {
//       const meetingResponse = await addMeetingApi(meetingData, token);
//       if (!meetingResponse?.id) throw new Error("No se pudo crear la reunión");

//       if (sessionData && Object.keys(sessionData).length > 0) {
//         await addMeetingSessionApi({ ...sessionData, meeting_id: meetingResponse.id }, token);
//       }

//       return meetingResponse;
//     } catch (err) {
//       setError(err);
//       throw err;
//     } finally {
//       setCreating(false);
//     }
//   };

//   const reload = useCallback(async (token) => {
//     await Promise.all([getMeetings(token), getSessions(token)]);
//   }, []);

//   return {
//     meetings,
//     sessions,
//     loading,
//     creating,
//     updating,
//     error,
//     getMeetings,
//     getSessions,
//     addMeeting,
//     updateMeeting,
//     deleteMeeting,
//     addSession,
//     deleteSession,
//     addCompleteMeeting,
//     reload,
//   };
// }
