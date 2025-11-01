// src/api/meetings.js
import { BASE_API } from "../utils/constants";

export async function generarActaConsolidadaApi(meetingId, token) {
  const url = `${BASE_API}/meetings/${meetingId}/generar_acta_consolidada/`;
  const params = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
  const res = await fetch(url, params);
  if (!res.ok) throw new Error("Error al generar acta consolidada");
  return await res.json();
}
