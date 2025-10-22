// src/pages/Admin/ActasAdmin.js

import React, { useState } from "react";
import { HeaderPage } from "../../components/Admin";
import { ActasTable } from "../../components/Admin/ActasTable";
import { useAuth } from "../../hooks/useAuth";
import { useActas } from "../../hooks/useActas";
import { generarActaApi } from "../../api/meetingSessionActa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../scss/ActasAdmin.scss";

export function ActasAdmin() {
  const { auth } = useAuth();
  const { sessions, loading, error, reload } = useActas(); // <-- usamos reload
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const navigate = useNavigate();

  // 1) Generar Acta
  const handleGenerateActa = async (session) => {
    if (!window.confirm("¿Confirmas generar el acta?")) return;
    setLoadingSessionId(session.id);
    try {
      await generarActaApi(session.id, auth.token);
      toast.success("¡Acta generada!");
      await reload(); // <-- Recarga solo la tabla
    } catch {
      toast.error("No se pudo generar el acta");
    } finally {
      setLoadingSessionId(null);
    }
  };

  // 2) Redirigir al editor
  const handlePreviewActa = (session) => {
    navigate(`/actas/${session.id}/editar`);
  };

  if (error) return <div>Error cargando sesiones.</div>;

  return (
    <>
      <HeaderPage title="🧠 Actas inteligentes" />

      <ActasTable
        sessions={sessions}
        loading={loading}
        loadingSessionId={loadingSessionId}
        onGenerateActa={handleGenerateActa}
        onPreviewActa={handlePreviewActa}
      />
    </>
  );
}
