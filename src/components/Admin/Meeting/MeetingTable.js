import React, { useRef, useState } from "react";
import { Button, Icon, Label, Modal } from "semantic-ui-react";
import { useAuth } from "../../../hooks/useAuth";
import { useMeeting } from "../../../hooks/useMeeting";
import { useMeetingPhoto } from "../../../hooks/useMeetingPhoto";
import { BASE_API } from "../../../utils/constants";
import "./MeetingTable.scss";

export function MeetingTable({
  meetings,
  updateMeeting,
  deleteMeeting,
  onRefetch,
}) {
  const { auth } = useAuth();
  const { addSession, deleteSession } = useMeeting();

  // Estado local de fotos (fotos SOLO de la reunión seleccionada)
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Estados para el modal y selección
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);

  // API de fotos (solo funciones)
  const { getPhotos, addPhoto, deletePhoto } = useMeetingPhoto();

  // Grabación de sesión
  const [recordingId, setRecordingId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);

  // --- SESIONES (audios) ---
  const handleRecord = async (meetingId) => {
    if (recordingId === meetingId) {
      mediaRecorderRef.current.stop();
      setRecordingId(null);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const endTime = new Date().toISOString();
        const blob = new Blob(chunksRef.current, { type: "audio/mp3" });
        const file = new File([blob], `grabacion_${Date.now()}.mp3`, {
          type: "audio/mp3",
        });

        const formData = new FormData();
        formData.append("meeting", meetingId);
        formData.append("start_datetime", startTimeRef.current);
        formData.append("end_datetime", endTime);
        formData.append("audio_file", file);

        await addSession(formData, auth.token);
        window.location.reload();
      };

      startTimeRef.current = new Date().toISOString();
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingId(meetingId);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmDelete = window.confirm("¿Eliminar esta sesión?");
    if (!confirmDelete) return;

    try {
      await deleteSession(sessionId, auth.token);
      window.location.reload();
    } catch (error) {
      console.error("Error eliminando la sesión:", error);
    }
  };

  // --- FOTOS ---
  const handleOpenPhotoModal = async (meeting) => {
    setSelectedMeeting(meeting);
    setShowPhotoModal(true);
    setSelectedPhotoId(null);
    setFiles([]);
    setPhotos([]); // Limpia al abrir
    setLoadingPhotos(true);
    try {
      const result = await getPhotos(meeting.id, auth.token);
      setPhotos(result);
    } catch {
      setPhotos([]);
    }
    setLoadingPhotos(false);
  };

  const handleClosePhotoModal = () => {
    setShowPhotoModal(false);
    setFiles([]);
    setSelectedMeeting(null);
    setSelectedPhotoId(null);
    setPhotos([]); // Limpia al cerrar
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadPhotos = async () => {
    if (!files.length || !selectedMeeting) return;
    for (let file of files) {
      const formData = new FormData();
      formData.append("meeting", selectedMeeting.id);
      formData.append("image", file);
      await addPhoto(formData, auth.token);
    }
    // Recarga solo las fotos de la reunión actual
    setLoadingPhotos(true);
    try {
      const result = await getPhotos(selectedMeeting.id, auth.token);
      setPhotos(result);
    } catch {
      setPhotos([]);
    }
    setLoadingPhotos(false);
    setFiles([]);
  };

  // --- PORTADA ---
  const handleSetCoverPhoto = async (meetingId, photoId) => {
    try {
      const response = await fetch(
        `${BASE_API}/meetings/${meetingId}/set_cover_photo/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo_id: photoId }),
        }
      );

      if (response.ok) {
        if (typeof onRefetch === "function") onRefetch();
        setSelectedPhotoId(null);
        setShowPhotoModal(false);
      } else {
        alert(
          "No se pudo establecer la portada. Selecciona otra foto o intenta de nuevo."
        );
      }
    } catch (error) {
      alert("Error en la petición: " + error.message);
    }
  };

  // CORRECCIÓN: La función ahora recibe el objeto photo completo y pasa el token
  const onDeletePhoto = async (photo) => {
    const result = window.confirm(`¿Eliminar Foto?`);
    if (!result) return;
    try {
      // CORRECCIÓN: Ahora pasamos tanto el id como el token
      await deletePhoto(photo.id, auth.token);
      const refreshed = await getPhotos(selectedMeeting.id, auth.token);
      setPhotos(refreshed);
    } catch (error) {
      console.error("Error eliminando foto:", error);
      alert("Error al eliminar la foto");
    }
  };

  return (
    <div className="meeting-container">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="meeting-card">
          <img
            src={
              meeting.cover_photo?.image ||
              "https://retos-operaciones-logistica.eae.es/wp-content/uploads/2015/08/iStock_000034424836_Small.jpg"
            }
            alt="Imagen reunión"
            className="meeting-image"
          />

          <div className="meeting-header">
            <h2>{meeting.title}</h2>
            <p>{meeting.description || "Sin descripción"}</p>
          </div>

          <div className="meeting-sessions">
            {meeting.sessions.length === 0 ? (
              <span className="no-session">Sin sesiones aún</span>
            ) : (
              meeting.sessions.map((session) => (
                <div key={session.id} className="session-item">
                  <Label size="mini" color="blue">
                    Inicio
                  </Label>{" "}
                  {new Date(session.start_datetime).toLocaleString()}
                  <br />
                  <Label size="mini" color="teal">
                    Fin
                  </Label>{" "}
                  {new Date(session.end_datetime).toLocaleString()}
                  <br />
                  <button
                    className="delete-session-btn"
                    title="Eliminar sesión"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Icon name="trash" />
                  </button>
                  {session.audio_file ? (
                    <audio controls src={session.audio_file} />
                  ) : (
                    <em>Sin audio</em>
                  )}
                  <br />
                </div>
              ))
            )}
          </div>

          <div className="meeting-actions">
            <Button
              icon
              size="small"
              color={recordingId === meeting.id ? "red" : "green"}
              onClick={() => handleRecord(meeting.id)}
              title={recordingId === meeting.id ? "Detener" : "Grabar sesión"}
            >
              + sesion
              <Icon name={recordingId === meeting.id ? "stop" : "microphone"} />
            </Button>
            <Button
              title="Actualizar reunión"
              icon
              size="small"
              onClick={() => updateMeeting(meeting)}
            >
              <Icon name="edit" />
            </Button>
            <Button
              icon
              size="small"
              color="blue"
              title="Subir fotos de la reunión"
              onClick={() => handleOpenPhotoModal(meeting)}
            >
              <Icon name="folder open" />
            </Button>
            <Button
              title="Eliminar reunión"
              icon
              color="red"
              size="small"
              onClick={() => deleteMeeting(meeting)}
            >
              <Icon name="trash" />
            </Button>
          </div>
        </div>
      ))}

      {/* MODAL DE FOTOS */}
      <Modal
        open={showPhotoModal}
        onClose={handleClosePhotoModal}
        size="small"
        closeIcon
        className="photo-modal"
      >
        <Modal.Header>
          Fotos de la reunión
          {selectedMeeting ? `: ${selectedMeeting.title}` : ""}
        </Modal.Header>
        <Modal.Content>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
          />
          <Button onClick={handleUploadPhotos} disabled={!files.length}>
            Subir
          </Button>
          <div
            className="photo-gallery"
            style={{ marginTop: 16, marginBottom: 12 }}
          >
            {loadingPhotos ? (
              <div>Cargando fotos...</div>
            ) : (
              photos.map((photo) => (
                <div
                  className={`photo-thumb-wrapper${
                    selectedPhotoId === photo.id ? " selected" : ""
                  }`}
                  key={photo.id}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    marginRight: 8,
                    border:
                      selectedPhotoId === photo.id
                        ? "2px solid #2185d0"
                        : "none",
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                >
                  <img
                    src={photo.image}
                    alt="Foto subida"
                    className="photo-thumb"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  />

                  {/* Icono de portada */}
                  {selectedMeeting?.cover_photo?.id === photo.id && (
                    <Icon
                      name="check circle"
                      color="green"
                      size="large"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "#fff",
                        borderRadius: "50%",
                      }}
                      title="Portada actual"
                    />
                  )}

                  {/* CORRECCIÓN: Ahora pasamos el objeto photo completo */}
                  <Button
                    icon
                    circular
                    size="mini"
                    color="red"
                    style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // evita que seleccione la foto
                      onDeletePhoto(photo); // CORRECCIÓN: Pasamos photo completo, no solo el id
                    }}
                  >
                    <Icon name="trash" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <Button
            color="green"
            disabled={
              !selectedPhotoId ||
              selectedMeeting?.cover_photo?.id === selectedPhotoId
            }
            onClick={() =>
              handleSetCoverPhoto(selectedMeeting.id, selectedPhotoId)
            }
          >
            Establecer como portada
          </Button>
        </Modal.Content>
      </Modal>
    </div>
  );
}
