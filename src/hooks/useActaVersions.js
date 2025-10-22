import { useState, useEffect, useCallback } from "react";
import {
  fetchActaVersions,
  createActaVersion,
  updateActaVersion,
  downloadActaDocx,
} from "../api/meetingSessionActaVersion";

/** Orden estable: primero por version desc, luego created_at desc */
function sortVersions(list = []) {
  return [...list].sort((a, b) => {
    if (b.version !== a.version) return b.version - a.version;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

/** Quita campos read-only para no romper el serializer */
function sanitizeWritableActaPayload(data = {}) {
  const {
    agenda, // read-only (proviene de Meeting)
    objetivos, // read-only (proviene de Meeting)
    meeting_title,
    session_start,
    session_end,
    reunion, // auxiliares read-only
    ...rest
  } = data || {};
  return rest;
}

export function useActaVersions(sessionId, token) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const loadVersions = useCallback(async () => {
    if (!sessionId || !token) return [];
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActaVersions(sessionId, token); // GET /api/acta-versions/?session=ID
      const list = Array.isArray(data) ? data : [];
      const ordered = sortVersions(list);
      setVersions(ordered);
      return ordered;
    } catch (err) {
      setError(err);
      setVersions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [sessionId, token]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  /** Crea una nueva versión explícitamente (no reusa la última) */
  const create = useCallback(
    async (actaData) => {
      if (!sessionId || !token) throw new Error("No sessionId/token");
      setSaving(true);
      setError(null);
      try {
        const payload = sanitizeWritableActaPayload(actaData);
        const created = await createActaVersion(sessionId, payload, token); // POST
        await loadVersions();
        return created;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [sessionId, token, loadVersions]
  );

  /** Actualiza una versión existente por id */
  const update = useCallback(
    async (versionId, actaData) => {
      if (!versionId || !token) throw new Error("No versionId/token");
      setSaving(true);
      setError(null);
      try {
        const payload = sanitizeWritableActaPayload(actaData);
        const updated = await updateActaVersion(versionId, payload, token); // PATCH
        await loadVersions();
        return updated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [token, loadVersions]
  );

  /**
   * Guarda cambios “inteligente”:
   * - Si existe al menos una versión, actualiza la más reciente (versions[0]).
   * - Si no, crea una versión nueva.
   * IMPORTANTE: pasa listas completas de compromisos/asistentes
   * o el serializer eliminará los que no vengan.
   */
  const save = useCallback(
    async (actaData) => {
      if (!sessionId || !token) throw new Error("No sessionId/token");
      if (versions.length > 0) {
        return await update(versions[0].id, actaData);
      }
      return await create(actaData);
    },
    [sessionId, token, versions, create, update]
  );

  /** Descarga el .docx de una versión */
  const download = useCallback(
    async (versionId) => {
      if (!versionId || !token) throw new Error("No versionId/token");
      setDownloadingId(versionId);
      setError(null);
      try {
        const blob = await downloadActaDocx(versionId, token);
        // Devolvemos el blob para que la UI decida si guarda o abre
        return blob;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setDownloadingId(null);
      }
    },
    [token]
  );

  return {
    versions, // lista ordenada (última primero)
    lastVersion: versions[0] || null,
    loading,
    saving,
    downloadingId,
    error,
    // acciones
    reload: loadVersions,
    create,
    update,
    save,
    download,
  };
}

// import { useState, useEffect, useCallback } from "react";
// import {
//   fetchActaVersions,
//   createActaVersion,
//   updateActaVersion,
// } from "../api/meetingSessionActaVersion";

// export function useActaVersions(sessionId, token) {
//   const [versions, setVersions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const loadVersions = useCallback(async () => {
//     if (!sessionId || !token) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchActaVersions(sessionId, token);
//       setVersions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setError(err);
//       setVersions([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [sessionId, token]);

//   useEffect(() => {
//     loadVersions();
//   }, [loadVersions]);

//   const save = async (actaData) => {
//     if (!sessionId || !token) throw new Error("No sessionId/token");
//     try {
//       let result;
//       if (versions.length > 0) {
//         result = await updateActaVersion(versions[0].id, actaData, token);
//       } else {
//         result = await createActaVersion(sessionId, actaData, token);
//       }
//       await loadVersions(); // refresca
//       return result;
//     } catch (err) {
//       setError(err);
//       throw err;
//     }
//   };

//   return {
//     versions,
//     loading,
//     error,
//     save,
//     lastVersion: versions[0] || null,
//     reload: loadVersions,
//   };
// }
