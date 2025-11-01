// src/hooks/useChat.js
import { useState, useCallback, useEffect } from "react";
import {
  getChatThreadsApi,
  getChatThreadDetailApi,
  createChatThreadApi,
  sendMessageApi,
  markMessagesAsReadApi,
  closeThreadApi,
} from "../api/chat";

export function useChat(token) {
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar todos los threads
  const loadThreads = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getChatThreadsApi(token);
      const data = response.results || response;
      setThreads(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cargar un thread específico con sus mensajes
  const loadThread = useCallback(
    async (threadId) => {
      if (!token || !threadId) return;

      setLoading(true);
      setError(null);
      try {
        const thread = await getChatThreadDetailApi(threadId, token);
        setActiveThread(thread);
        setMessages(thread.messages || []);

        // Marcar mensajes como leídos
        await markMessagesAsReadApi(threadId, token);

        return thread;
      } catch (err) {
        setError(err.message);
        setActiveThread(null);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Crear un nuevo thread
  const createThread = useCallback(
    async (subject = "Consulta de soporte") => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const newThread = await createChatThreadApi({ subject }, token);

        // Añadir el nuevo thread a la lista
        setThreads((prev) => [newThread, ...prev]);

        // Activar el nuevo thread
        setActiveThread(newThread);
        setMessages([]);

        return newThread;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Enviar un mensaje
  const sendMessage = useCallback(
    async (message) => {
      if (!token || !activeThread) return;

      setError(null);
      try {
        const newMessage = await sendMessageApi(
          activeThread.id,
          message,
          token
        );

        // Añadir el mensaje a la lista local
        setMessages((prev) => [...prev, newMessage]);

        // Actualizar el último mensaje en el thread
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === activeThread.id
              ? {
                  ...thread,
                  last_message: {
                    message: newMessage.message,
                    sender_type: newMessage.sender_type,
                    created_at: newMessage.created_at,
                  },
                  updated_at: new Date().toISOString(),
                }
              : thread
          )
        );

        return newMessage;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [token, activeThread]
  );

  // Cerrar un thread
  const closeThread = useCallback(
    async (threadId) => {
      if (!token) return;

      try {
        await closeThreadApi(threadId, token);

        // Actualizar el estado del thread
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, status: "closed" } : thread
          )
        );

        if (activeThread?.id === threadId) {
          setActiveThread((prev) => ({ ...prev, status: "closed" }));
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [token, activeThread]
  );

  // Polling para nuevos mensajes (cada 5 segundos cuando hay un thread activo)
  useEffect(() => {
    if (!activeThread || !token) return;

    const interval = setInterval(async () => {
      try {
        const updatedThread = await getChatThreadDetailApi(
          activeThread.id,
          token
        );

        // Si hay nuevos mensajes, actualizar
        if (updatedThread.messages.length > messages.length) {
          setMessages(updatedThread.messages);
          // Marcar como leídos
          await markMessagesAsReadApi(activeThread.id, token);
        }
      } catch (err) {
        console.error("Error en polling:", err);
      }
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [activeThread, token, messages.length]);

  return {
    threads,
    activeThread,
    messages,
    loading,
    error,
    loadThreads,
    loadThread,
    createThread,
    sendMessage,
    closeThread,
    setActiveThread,
  };
}
