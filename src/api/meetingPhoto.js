// src/api/meetingPhoto.js
import { BASE_API } from "../utils/constants";

// Obtener fotos de una reunión
export async function getMeetingPhotosApi(meetingId, token) {
  const url = `${BASE_API}/photos/?meeting=${meetingId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error obteniendo fotos");
  return await res.json();
}

// Subir foto/s (FormData con { meeting, image })
export async function addMeetingPhotoApi(formData, token) {
  const url = `${BASE_API}/photos/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // NO pongas Content-Type
  });
  if (!res.ok) throw new Error("Error subiendo foto");
  return await res.json();
}

// Eliminar foto
export async function deletePhotoApi(id, token) {
  const url = `${BASE_API}/photos/${id}/`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 204) throw new Error("Error eliminando foto");
  return true;
}


// import { BASE_API } from "../utils/constants";

// // Obtener fotos de una reunión
// export async function getMeetingPhotosApi(meetingId, token) {
//   const url = `${BASE_API}/api/meeting-photos/?meeting=${meetingId}`;
//   const res = await fetch(url, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("Error obteniendo fotos");
//   return await res.json();
// }

// // Subir foto/s (FormData)
// export async function addMeetingPhotoApi(formData, token) {
//   const url = `${BASE_API}/api/meeting-photos/`;
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { Authorization: `Bearer ${token}` },
//     body: formData,
//   });
//   if (!res.ok) throw new Error("Error subiendo foto");
//   return await res.json();
// }

// // Eliminar foto
// export async function deletePhotoApi(id, token) {
//   const url = `${BASE_API}/api/meeting-photos/${id}/`;
//   const res = await fetch(url, {
//     method: "DELETE",
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (res.status !== 204 && !res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.error || "Error eliminando foto");
//   }
//   return true;
// }
