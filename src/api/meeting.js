// src/api/meeting.js
import { BASE_API } from "../utils/constants";

// Obtener todas las reuniones
export async function getMeetingsApi(token) {
  const url = `${BASE_API}/api/meetings/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener reuniones");
  return await res.json();
}

// Crear reunión
export async function addMeetingApi(data, token) {
  const url = `${BASE_API}/api/meetings/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear reunión");
  return await res.json();
}

// Actualizar reunión (partial)
export async function updateMeetingApi(id, data, token) {
  const url = `${BASE_API}/api/meetings/${id}/`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar reunión");
  return await res.json();
}

// Eliminar reunión
export async function deleteMeetingApi(id, token) {
  const url = `${BASE_API}/api/meetings/${id}/`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 204) throw new Error("Error al eliminar reunión");
  return true;
}

// (Nuevo) Asignar portada a la reunión
export async function setCoverPhotoApi(meetingId, photoId, token) {
  const url = `${BASE_API}/api/meetings/${meetingId}/set_cover_photo/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photo_id: photoId }),
  });
  if (!res.ok) throw new Error("No se pudo asignar la portada");
  return await res.json();
}

// import { BASE_API } from "../utils/constants";

// // Obtener todas las reuniones
// export async function getMeetingsApi(token) {
//   const url = `${BASE_API}/api/meetings/`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("Error al obtener reuniones");
//   return await res.json();
// }

// // Crear reunión
// export async function addMeetingApi(data, token) {
//   const url = `${BASE_API}/api/meetings/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!res.ok) throw new Error("Error al crear reunión");
//   return await res.json();
// }

// // Actualizar reunión
// export async function updateMeetingApi(id, data, token) {
//   const url = `${BASE_API}/api/meetings/${id}/`;
//   const res = await fetch(url, {
//     method: "PATCH",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });
//   if (!res.ok) throw new Error("Error al actualizar reunión");
//   return await res.json();
// }

// // Eliminar reunión
// export async function deleteMeetingApi(id, token) {
//   const url = `${BASE_API}/api/meetings/${id}/`;
//   const res = await fetch(url, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (res.status !== 204) throw new Error("Error al eliminar reunión");
//   return true;
// }
