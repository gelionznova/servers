// src/api/meetingSessionActa.js
import { BASE_API } from "../utils/constants";

/**
 * Generar acta (DOCX + versión) a partir del audio de una sesión.
 * POST /api/sessions/:id/generar_acta/
 */
export async function generarActaApi(sessionId, token) {
  const url = `${BASE_API}/sessions/${sessionId}/generar_acta/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.detail || "Error generando acta");
  }
  return res.json(); // { msg, acta_version_id, word_file, ... }
}

/**
 * Obtener metadata de la sesión (incluye meeting si el serializer lo expone).
 * GET /api/sessions/:id/
 * Fallback opcional por si el backend cambiara el prefijo.
 */
export async function getSessionApi(sessionId, token) {
  const headers = { Authorization: `Bearer ${token}` };

  // endpoint principal en tu DRF (coincide con generar_acta)
  let res = await fetch(`${BASE_API}/sessions/${sessionId}/`, { headers });

  // fallback opcional si en algún entorno el path difiere
  if (res.status === 404) {
    res = await fetch(`${BASE_API}/meeting/session/${sessionId}/`, {
      headers,
    });
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Error al cargar sesión");
  }
  return res.json();
}

/**
 * Obtener la última versión de acta asociada a una sesión.
 * GET /api/acta-versions/?session=:id&page_size=1  (backend debe ordenar -created_at)
 */
export async function getActaVersionLatestApi(sessionId, token) {
  const url = `${BASE_API}/acta-versions/?session=${encodeURIComponent(
    sessionId
  )}&page_size=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.detail || err.error || "Error al cargar última versión de acta"
    );
  }

  const data = await res.json();

  // Soporta tanto paginado DRF ({ results: [...] }) como arreglo simple [...]
  const first = Array.isArray(data?.results)
    ? data.results[0]
    : Array.isArray(data)
    ? data[0]
    : null;

  return first || null;
}
