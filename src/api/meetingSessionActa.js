// src/api/meetingSessionActa.js
import { BASE_API } from "../utils/constants";

// Generar acta desde el audio de la sesión
export async function generarActaApi(sessionId, token) {
  const url = `${BASE_API}/api/sessions/${sessionId}/generar_acta/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error generando acta");
  }
  return await res.json(); // { msg, acta_version_id }
}

// // src/api/meetingSessionActa.js
// import { BASE_API } from "../utils/constants";

// // Generar acta desde el audio de la sesión
// export async function generarActaApi(sessionId, token) {
//   const url = `${BASE_API}/api/sessions/${sessionId}/generar_acta/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || "Error generando acta");
//   }
//   return await res.json(); // { msg, acta_version_id }
// }

// import { BASE_API } from "../utils/constants";

// /**
//  * Genera una nueva acta a partir del audio de la sesión.
//  */
// export async function generarActaApi(sessionId, token) {
//   const url = `${BASE_API}/api/meeting-sessions/${sessionId}/generar_acta/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || "Error generando acta");
//   }
//   return await res.json();
// }
