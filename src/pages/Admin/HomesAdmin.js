import React, { useEffect, useState } from "react";
import { HeaderPage } from "../../components/Admin";
import { useAuth } from "../../hooks/useAuth";
import { useMeeting } from "../../hooks/useMeeting";
import { useNavigate } from "react-router-dom";
import "../../scss/HomesAdmin.scss";

export function HomesAdmin() {
  const { auth } = useAuth();
  const { meetings, loading, getMeetings } = useMeeting();
  const navigate = useNavigate();

  // Para estadísticas básicas:
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    recordings: 0,
    actas: 0,
  });

  useEffect(() => {
    if (auth?.token) {
      getMeetings(auth.token);
    }
  }, [auth]);

  useEffect(() => {
    if (!meetings || meetings.length === 0) return;

    // Hoy
    const today = new Date();
    const meetingsToday = meetings.filter((m) => {
      // Si alguna sesión es hoy
      return m.sessions.some((s) => {
        const start = new Date(s.start_datetime);
        return (
          start.getFullYear() === today.getFullYear() &&
          start.getMonth() === today.getMonth() &&
          start.getDate() === today.getDate()
        );
      });
    });

    setTodayMeetings(meetingsToday);

    // Recientes (últimas 2 distintas a hoy)
    const recent = meetings
      .filter((m) => !meetingsToday.includes(m))
      .slice(0, 2);
    setRecentMeetings(recent);

    // Estadísticas: total, grabaciones, actas
    const allSessions = meetings.flatMap((m) => m.sessions);
    setStats({
      total: meetings.length,
      recordings: allSessions.filter((s) => s.audio_file).length,
      actas: allSessions.filter((s) => s.acta_status === "generated").length,
    });
  }, [meetings]);

  return (
    <div className="home-dashboard-container">
      <HeaderPage title="Panel de Inicio" />

      <div className="home-dashboard-row">
        {/* Reuniones de Hoy */}
        <div className="home-dashboard-card">
          <h3>📅 Reuniones de Hoy</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : todayMeetings.length === 0 ? (
            <p>No hay reuniones para hoy.</p>
          ) : (
            <ul>
              {todayMeetings.map((meeting) =>
                meeting.sessions
                  .filter((s) => {
                    const start = new Date(s.start_datetime);
                    const today = new Date();
                    return (
                      start.getFullYear() === today.getFullYear() &&
                      start.getMonth() === today.getMonth() &&
                      start.getDate() === today.getDate()
                    );
                  })
                  .map((session) => (
                    <li key={session.id}>
                      <strong>
                        {new Date(session.start_datetime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </strong>
                      {" - "}
                      {meeting.title}
                    </li>
                  ))
              )}
            </ul>
          )}
        </div>

        {/* Accesos rápidos */}
        <div className="home-dashboard-card">
          <h3>⚡ Accesos Rápidos</h3>
          <button onClick={() => navigate("/app/meetings")}>
            ➕ Nueva Reunión
          </button>
          <button onClick={() => navigate("/app/actas")}>
            📄 Generar Acta
          </button>
        </div>
      </div>

      <div className="home-dashboard-row">
        {/* Reuniones recientes */}
        <div className="home-dashboard-card">
          <h3>🕓 Reuniones Recientes</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : recentMeetings.length === 0 ? (
            <p>No hay reuniones recientes.</p>
          ) : (
            <ul>
              {recentMeetings.map((meeting) => (
                <li key={meeting.id}>
                  <strong>{meeting.title}</strong> -{" "}
                  {meeting.sessions.length > 0
                    ? new Date(
                        meeting.sessions[
                          meeting.sessions.length - 1
                        ].start_datetime
                      ).toLocaleDateString()
                    : "Sin fecha"}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Estadísticas */}
        <div className="home-dashboard-card">
          <h3>📊 Estadísticas</h3>
          <p>
            📅 Total reuniones este mes: <strong>{stats.total}</strong>
          </p>
          <p>
            🎙️ Grabaciones: <strong>{stats.recordings}</strong>
          </p>
          <p>
            📝 Actas generadas: <strong>{stats.actas}</strong>
          </p>
        </div>
      </div>

      <div className="home-dashboard-row">
        <div className="home-dashboard-card home-full-width">
          <h3>🧠 Consejo del Día</h3>
          <p>
            Antes de finalizar una sesión, asegúrate de que la grabación esté
            completa y clara.
          </p>
        </div>
      </div>
    </div>
  );
}
