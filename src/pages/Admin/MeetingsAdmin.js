import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Loader, Message, Segment, Icon, Button } from "semantic-ui-react";
import {
  HeaderPage,
  AddMeetingForm,
  MeetingTable,
} from "../../components/Admin";
import { ModalBasic } from "../../components/Common/ModalBasic";
import { useAuth } from "../../hooks";
import { useMeeting } from "../../hooks/useMeeting";

export function MeetingsAdmin() {
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [contentModal, setContentModal] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [formKey, setFormKey] = useState(0); // para forzar remontaje del form

  const { auth } = useAuth();
  const { meetings, loading, error, getMeetings, deleteMeeting } = useMeeting();

  // Carga reuniones al montar / cambiar token / pedir refetch
  useEffect(() => {
    if (auth?.token) getMeetings(auth.token);
  }, [auth?.token, getMeetings, refetch]);

  const openModal = useCallback((title, content) => {
    setTitleModal(title);
    setContentModal(content);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    // Limpia el contenido para que el formulario no persista estado
    setTimeout(() => setContentModal(null), 0);
  }, []);

  const onRefetch = useCallback(() => setRefetch((prev) => !prev), []);

  const handleAddMeeting = useCallback(() => {
    setFormKey((k) => k + 1);
    openModal(
      "Nueva reunión",
      <AddMeetingForm
        key={`new-${formKey}`}
        onClose={closeModal}
        onRefetch={onRefetch}
      />
    );
  }, [closeModal, onRefetch, openModal, formKey]);

  const handleUpdateMeeting = useCallback(
    (meeting) => {
      setFormKey((k) => k + 1);
      openModal(
        "Editar reunión",
        <AddMeetingForm
          key={`edit-${meeting?.id}-${formKey}`}
          meeting={meeting}
          onClose={closeModal}
          onRefetch={onRefetch}
        />
      );
    },
    [closeModal, onRefetch, openModal, formKey]
  );

  const handleDeleteMeeting = useCallback(
    async (meeting) => {
      const confirmDelete = window.confirm(
        `¿Eliminar la reunión "${meeting.title}"?`
      );
      if (!confirmDelete) return;
      try {
        await deleteMeeting(meeting.id, auth.token);
        onRefetch();
      } catch (err) {
        console.error(err);
        // Podrías mostrar un toast aquí si usas uno
      }
    },
    [auth?.token, deleteMeeting, onRefetch]
  );

  const emptyState = useMemo(() => {
    if (loading) return null;
    if (meetings?.length > 0) return null;
    return (
      <Segment placeholder>
        <HeaderPage title="Reuniones" />
        <p>No hay reuniones creadas todavía.</p>
        <Button primary icon labelPosition="left" onClick={handleAddMeeting}>
          <Icon name="plus" /> Nueva reunión
        </Button>
      </Segment>
    );
  }, [loading, meetings?.length, handleAddMeeting]);

  return (
    <>
      <HeaderPage
        title="Reuniones"
        btnTitle="Nueva reunión"
        btnClick={handleAddMeeting}
      />

      {error && (
        <Message negative>
          <Message.Header>
            <Icon name="warning sign" />
            Error al cargar reuniones
          </Message.Header>
          <p>{error.message || "Intenta nuevamente."}</p>
        </Message>
      )}

      {loading ? (
        <Loader active inline="centered">
          Cargando reuniones...
        </Loader>
      ) : meetings?.length ? (
        <MeetingTable
          meetings={meetings}
          updateMeeting={handleUpdateMeeting}
          deleteMeeting={handleDeleteMeeting}
          onRefetch={onRefetch}
        />
      ) : (
        emptyState
      )}

      <ModalBasic show={showModal} onClose={closeModal} title={titleModal}>
        {contentModal}
      </ModalBasic>
    </>
  );
}

// import React, { useEffect, useState } from "react";
// import { Loader } from "semantic-ui-react";
// import {
//   HeaderPage,
//   AddMeetingForm,
//   MeetingTable,
// } from "../../components/Admin";
// import { ModalBasic } from "../../components/Common/ModalBasic";
// import { useAuth } from "../../hooks"; // si ya manejas autenticación
// import { useMeeting } from "../../hooks/useMeeting";

// export function MeetingsAdmin() {
//   const [showModal, setShowModal] = useState(false);
//   const [titleModal, setTitleModal] = useState("");
//   const [contentModal, setContentModal] = useState(null);
//   const [refetch, setRefetch] = useState(false);

//   const { auth } = useAuth();
//   const {
//     meetings,
//     loading,
//     getMeetings,
//     addMeeting,
//     updateMeeting,
//     deleteMeeting,
//   } = useMeeting();

//   useEffect(() => {
//     if (auth?.token) {
//       getMeetings(auth.token);
//     }
//   }, [refetch]);

//   const openCloseModal = () => setShowModal((prev) => !prev);
//   const onRefetch = () => setRefetch((prev) => !prev);

//   const handleAddMeeting = () => {
//     setTitleModal("Nueva reunión");
//     setContentModal(
//       <AddMeetingForm onClose={openCloseModal} onRefetch={onRefetch} />
//     );
//     openCloseModal();
//   };

//   const handleUpdateMeeting = (meeting) => {
//     setTitleModal("Editar reunión");
//     setContentModal(
//       <AddMeetingForm
//         meeting={meeting}
//         onClose={openCloseModal}
//         onRefetch={onRefetch}
//       />
//     );
//     openCloseModal();
//   };

//   const handleDeleteMeeting = async (meeting) => {
//     const confirmDelete = window.confirm(
//       `¿Eliminar la reunión "${meeting.title}"?`
//     );
//     if (confirmDelete) {
//       try {
//         await deleteMeeting(meeting.id, auth.token);
//         onRefetch();
//       } catch (error) {
//         console.error(error);
//       }
//     }
//   };

//   return (
//     <>
//       <HeaderPage
//         title="Reuniones"
//         btnTitle="Nueva reunión"
//         btnClick={handleAddMeeting}
//       />

//       {loading ? (
//         <Loader active inline="centered">
//           Cargando reuniones...
//         </Loader>
//       ) : (
//         <MeetingTable
//           meetings={meetings}
//           updateMeeting={handleUpdateMeeting}
//           deleteMeeting={handleDeleteMeeting}
//           onRefetch={onRefetch}
//         />
//       )}

//       <ModalBasic show={showModal} onClose={openCloseModal} title={titleModal}>
//         {contentModal}
//       </ModalBasic>
//     </>
//   );
// }
