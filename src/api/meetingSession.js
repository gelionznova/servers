// src/api/meetingSession.js
import { BASE_API } from "../utils/constants";

// Obtener todas las sesiones (puedes pasar ?meeting=ID si quieres filtrar)
export async function getMeetingSessionsApi(token) {
  const url = `${BASE_API}/sessions/`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Error obteniendo sesiones de reunión");
  return await res.json();
}

// Obtener una sesión por ID
export async function getMeetingSessionApi(sessionId, token) {
  const url = `${BASE_API}/sessions/${sessionId}/`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("No se pudo cargar la sesión");
  return await res.json();
}

// Crear sesión (FormData: meeting, start_datetime, end_datetime, audio_file?)
export async function addMeetingSessionApi(data, token) {
  const url = `${BASE_API}/sessions/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: data, // FormData
  });
  if (!res.ok) throw new Error("No se pudo crear la sesión");
  return await res.json();
}

// Eliminar sesión
export async function deleteMeetingSessionApi(id, token) {
  const url = `${BASE_API}/sessions/${id}/`;
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (res.status !== 204) throw new Error("No se pudo eliminar la sesión");
  return true;
}


// import { BASE_API } from "../utils/constants";

// // Obtener todas las sesiones
// export async function getMeetingSessionsApi(token) {
//   const url = `${BASE_API}/api/meeting-sessions/`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("Error obteniendo sesiones de reunión");
//   return await res.json();
// }

// // Obtener una sesión por ID
// export async function getMeetingSessionApi(sessionId, token) {
//   const url = `${BASE_API}/api/meeting-sessions/${sessionId}/`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("No se pudo cargar la sesión");
//   return await res.json();
// }

// // Crear sesión (puede incluir audio con FormData)
// export async function addMeetingSessionApi(data, token) {
//   const url = `${BASE_API}/api/meeting-sessions/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//     body: data, // FormData
//   });
//   if (!res.ok) throw new Error("No se pudo crear la sesión");
//   return await res.json();
// }

// // Eliminar sesión
// export async function deleteMeetingSessionApi(id, token) {
//   const url = `${BASE_API}/api/meeting-sessions/${id}/`;
//   const res = await fetch(url, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (res.status !== 204) throw new Error("No se pudo eliminar la sesión");
//   return true;
// }
