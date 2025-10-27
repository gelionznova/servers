// src/api/meetingSessionActaVersion.js
import { BASE_API } from "../utils/constants";

// Obtener todas las versiones de acta de una sesión
export async function fetchActaVersions(sessionId, token) {
  const url = `${BASE_API}/acta-versions/?session=${sessionId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudieron cargar las versiones de acta");
  return await res.json();
}

// Crear una nueva versión de acta
export async function createActaVersion(sessionId, actaData, token) {
  const url = `${BASE_API}/acta-versions/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: sessionId, ...actaData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error al crear nueva versión de acta");
  }
  return await res.json();
}

// Actualizar versión existente de acta
export async function updateActaVersion(versionId, actaData, token) {
  const url = `${BASE_API}/acta-versions/${versionId}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(actaData),
  });

  if (!res.ok) {
    let detail = "Error al actualizar la versión de acta";
    try {
      const body = await res.json();
      // DRF suele devolver {field: ["msg"]} o {detail: "..."}
      if (body.detail) detail = body.detail;
      else detail = JSON.stringify(body);
    } catch {}
    throw new Error(detail);
  }
  return await res.json();
}

// (Nuevo) Descargar .docx de una versión de acta
export async function downloadActaDocx(versionId, token) {
  const url = `${BASE_API}/acta-versions/${versionId}/descargar_word/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo descargar el acta");
  // Devuelve blob para que el caller cree un link de descarga
  return await res.blob();
}

// import { BASE_API } from "../utils/constants";

// // Obtener todas las versiones de acta de una sesión
// export async function fetchActaVersions(sessionId, token) {
//   const url = `${BASE_API}/api/meeting-session-acta-versions/?session=${sessionId}`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("No se pudieron cargar las versiones de acta");
//   return await res.json();
// }

// // Crear una nueva versión de acta
// export async function createActaVersion(sessionId, actaData, token) {
//   const url = `${BASE_API}/api/meeting-session-acta-versions/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ session: sessionId, ...actaData }),
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || "Error al crear nueva versión de acta");
//   }
//   return await res.json();
// }

// // Actualizar versión existente de acta
// export async function updateActaVersion(versionId, actaData, token) {
//   const url = `${BASE_API}/api/meeting-session-acta-versions/${versionId}/`;
//   const res = await fetch(url, {
//     method: "PATCH",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(actaData),
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || "Error al actualizar la versión de acta");
//   }
//   return await res.json();
// }
