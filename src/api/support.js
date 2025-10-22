import { BASE_API } from "../utils/constants";

// Obtener todas las PDFS
export async function getSupportApi(token) {
  const url = `${BASE_API}/api/supports/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener a los PDFs");
  return await res.json();
}

// Obtener un PDF específico
export async function getSupportByIdApi(id, token) {
  const url = `${BASE_API}/api/supports/${id}/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener el documento");
  return await res.json();
}
