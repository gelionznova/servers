// src/api/chat.js
import { BASE_API } from "../utils/constants";

// ============================================
// THREADS (CONVERSACIONES)
// ============================================

// Obtener todos los threads del usuario
export async function getChatThreadsApi(token) {
  const url = `${BASE_API}/chat-threads/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener las conversaciones");
  return await res.json();
}

// Obtener un thread específico con sus mensajes
export async function getChatThreadDetailApi(threadId, token) {
  const url = `${BASE_API}/chat-threads/${threadId}/`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener la conversación");
  return await res.json();
}

// Crear un nuevo thread
export async function createChatThreadApi(data, token) {
  const url = `${BASE_API}/chat-threads/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la conversación");
  return await res.json();
}

// ============================================
// MENSAJES
// ============================================

// Enviar un mensaje en un thread
export async function sendMessageApi(threadId, message, token) {
  const url = `${BASE_API}/api/chat-threads/${threadId}/send_message/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Error al enviar el mensaje");
  return await res.json();
}

// Marcar mensajes como leídos
export async function markMessagesAsReadApi(threadId, token) {
  const url = `${BASE_API}/api/chat-threads/${threadId}/mark_as_read/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al marcar mensajes como leídos");
  return await res.json();
}

// Cerrar un thread (solo admin)
export async function closeThreadApi(threadId, token) {
  const url = `${BASE_API}/api/chat-threads/${threadId}/close_thread/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al cerrar la conversación");
  return await res.json();
}
