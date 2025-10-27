// src/api/meetingActas.js
import { BASE_API } from "../utils/constants";

/** Genera actas para TODAS las sesiones de una reunión */
export async function generarActasReunionApi(meetingId, token) {
  const url = `${BASE_API}/meetings/${meetingId}/generar_actas/`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error generando actas de la reunión");
  }
  return await res.json(); // { meeting_id, results: [...] }
}

/** Descarga el Word unificado de TODAS las sesiones de la reunión */
export async function descargarWordCompletoApi(meetingId, token) {
  const url = `${BASE_API}/meetings/${meetingId}/descargar_word_completo/`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "No se pudo descargar el Word completo");
  }
  const blob = await res.blob();
  return blob; // el caller se encarga de forzar la descarga
}
