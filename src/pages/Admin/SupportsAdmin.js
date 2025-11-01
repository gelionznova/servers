// import React, { useState, useEffect } from "react";
// import {
//   Tab,
//   Menu,
//   Icon,
//   Input,
//   Card,
//   Button,
//   Loader,
//   Message,
//   Label,
//   Modal,
//   Embed,
// } from "semantic-ui-react";
// import { useAuth } from "../../hooks/useAuth";
// import { useSupport } from "../../hooks/useSupport";
// import { PDFViewer } from "../../components/Common/PDFViewer";
// import "../../scss/SupportsAdmin.scss";

// export function SupportsAdmin() {
//   const { auth } = useAuth();
//   const { supports, loading, error, loadSupports, searchByTitle } =
//     useSupport();

//   const [activeIndex, setActiveIndex] = useState(0);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedPdf, setSelectedPdf] = useState(null);
//   const [showPdfModal, setShowPdfModal] = useState(false);

//   // Cargar los PDFs al montar el componente
//   useEffect(() => {
//     if (auth?.token) {
//       loadSupports(auth.token).catch((err) => {
//         console.error("Error cargando soportes:", err);
//       });
//     }
//   }, [auth?.token, loadSupports]);

//   // Filtrar PDFs según búsqueda
//   const filteredSupports = searchQuery ? searchByTitle(searchQuery) : supports;

//   // Manejar la apertura del PDF
//   const handleOpenPdf = (support) => {
//     setSelectedPdf(support);
//     setShowPdfModal(true);
//   };

//   const handleClosePdf = () => {
//     setSelectedPdf(null);
//     setShowPdfModal(false);
//   };

//   // Renderizar Centro de Ayuda
//   const renderHelpCenter = () => (
//     <div className="help-center">
//       <div className="help-header">
//         <h2>
//           <Icon name="book" /> Centro de Ayuda - Guías y Documentación
//         </h2>
//         <Input
//           icon="search"
//           placeholder="Buscar guías..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           style={{ width: 300 }}
//         />
//       </div>

//       {loading && (
//         <Loader active inline="centered">
//           Cargando documentos...
//         </Loader>
//       )}

//       {error && (
//         <Message negative>
//           <Message.Header>Error</Message.Header>
//           <p>{error}</p>
//         </Message>
//       )}

//       {!loading && !error && filteredSupports.length === 0 && (
//         <Message info>
//           <Message.Header>Sin documentos disponibles</Message.Header>
//           <p>No hay guías o documentación disponible en este momento.</p>
//         </Message>
//       )}

//       <div className="pdf-grid">
//         {filteredSupports.map((support) => (
//           <Card key={support.id} className="pdf-card">
//             <Card.Content>
//               <Card.Header>
//                 <Icon name="file pdf" color="red" />
//                 {support.title}
//               </Card.Header>
//               <Card.Meta>
//                 {support.created_at &&
//                   new Date(support.created_at).toLocaleDateString("es-CO")}
//               </Card.Meta>
//               {support.tags && (
//                 <Card.Description>
//                   <Label.Group size="mini">
//                     {support.tags.split(",").map((tag, idx) => (
//                       <Label key={idx}>{tag.trim()}</Label>
//                     ))}
//                   </Label.Group>
//                 </Card.Description>
//               )}
//             </Card.Content>
//             <Card.Content extra>
//               <div className="pdf-actions">
//                 <Button
//                   primary
//                   size="small"
//                   onClick={() => handleOpenPdf(support)}
//                 >
//                   <Icon name="eye" /> Ver PDF
//                 </Button>
//                 <Button
//                   secondary
//                   size="small"
//                   as="a"
//                   href={support.file}
//                   download
//                   target="_blank"
//                 >
//                   <Icon name="download" /> Descargar
//                 </Button>
//               </div>
//             </Card.Content>
//           </Card>
//         ))}
//       </div>

//       {/* Modal para visualizar PDF */}

//       <Modal
//         open={showPdfModal}
//         onClose={handleClosePdf}
//         size="large"
//         closeIcon
//       >
//         <Modal.Header>{selectedPdf?.title}</Modal.Header>
//         <Modal.Content>
//           <div className="pdf-viewer-options">
//             <div className="pdf-actions-modal">
//               <Button
//                 primary
//                 size="medium"
//                 as="a"
//                 href={selectedPdf?.file}
//                 target="_blank"
//                 rel="noopener noreferrer"
//               >
//                 <Icon name="external alternate" /> Abrir en nueva pestaña
//               </Button>

//               <Button
//                 secondary
//                 size="medium"
//                 as="a"
//                 href={selectedPdf?.file}
//                 download={selectedPdf?.title}
//               >
//                 <Icon name="download" /> Descargar PDF
//               </Button>
//             </div>

//             {/* Usar el componente PDFViewer aquí */}
//             {selectedPdf && (
//               <PDFViewer pdfUrl={selectedPdf.file} title={selectedPdf.title} />
//             )}
//           </div>
//         </Modal.Content>
//       </Modal>
//     </div>
//   );

//   // Renderizar Chat (estructura básica)
//   const renderChat = () => (
//     <div className="chat-support">
//       <div className="chat-header">
//         <h2>
//           <Icon name="comments" /> Chat de Soporte
//         </h2>
//         <Label color="green">
//           <Icon name="circle" /> En línea
//         </Label>
//       </div>

//       <Message info icon>
//         <Icon name="info circle" />
//         <Message.Content>
//           <Message.Header>Chat en desarrollo</Message.Header>
//           El sistema de chat estará disponible próximamente. Podrás comunicarte
//           directamente con el equipo de soporte para resolver tus dudas.
//         </Message.Content>
//       </Message>

//       {/* Estructura preparada para el chat futuro */}
//       <div className="chat-container">
//         <div className="chat-messages">
//           {/* Aquí irán los mensajes */}
//           <div className="welcome-message">
//             <Icon name="robot" size="huge" color="grey" />
//             <p>¡Hola! El chat de soporte estará disponible pronto.</p>
//             <p>
//               Mientras tanto, puedes consultar nuestras guías en el Centro de
//               Ayuda.
//             </p>
//           </div>
//         </div>

//         <div className="chat-input-area">
//           <Input
//             fluid
//             disabled
//             placeholder="El chat estará disponible pronto..."
//             action={{
//               color: "blue",
//               labelPosition: "right",
//               icon: "send",
//               content: "Enviar",
//               disabled: true,
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );

//   const panes = [
//     {
//       menuItem: (
//         <Menu.Item key="help">
//           <Icon name="book" />
//           Centro de Ayuda
//         </Menu.Item>
//       ),
//       render: () => <Tab.Pane attached={false}>{renderHelpCenter()}</Tab.Pane>,
//     },
//     {
//       menuItem: (
//         <Menu.Item key="chat">
//           <Icon name="comments" />
//           Chat de Soporte
//         </Menu.Item>
//       ),
//       render: () => <Tab.Pane attached={false}>{renderChat()}</Tab.Pane>,
//     },
//   ];

//   return (
//     <div className="supports-admin">
//       <div className="supports-header">
//         <h1>
//           <Icon name="life ring" />
//           Soporte y Ayuda
//         </h1>
//       </div>

//       <Tab
//         menu={{ secondary: true, pointing: true }}
//         panes={panes}
//         activeIndex={activeIndex}
//         onTabChange={(e, { activeIndex }) => setActiveIndex(activeIndex)}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Tab,
  Menu,
  Icon,
  Input,
  Card,
  Button,
  Loader,
  Message,
  Label,
  Modal,
  Comment,
  Dropdown,
  Segment,
  Header,
} from "semantic-ui-react";
import { useAuth } from "../../hooks/useAuth";
import { useSupport } from "../../hooks/useSupport";
import { useChat } from "../../hooks/useChat";
// import { PDFViewer } from "../../components/Common/PDFViewer";
import PDFViewer from "../../components/Common/PDFViewer";
import "../../scss/SupportsAdmin.scss";

export function SupportsAdmin() {
  const { auth } = useAuth();

  // -------- Centro de ayuda (PDFs) --------
  const { supports, loading, error, loadSupports, searchByTitle } =
    useSupport();
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    if (auth?.token) {
      loadSupports(auth.token).catch((err) =>
        console.error("Error cargando soportes:", err)
      );
    }
  }, [auth?.token, loadSupports]);

  const filteredSupports = searchQuery ? searchByTitle(searchQuery) : supports;

  const handleOpenPdf = (support) => {
    setSelectedPdf(support);
    setShowPdfModal(true);
  };
  const handleClosePdf = () => {
    setSelectedPdf(null);
    setShowPdfModal(false);
  };

  const renderHelpCenter = () => (
    <div className="help-center">
      <div className="help-header">
        <h2>
          <Icon name="book" /> Centro de Ayuda - Guías y Documentación
        </h2>
        <Input
          icon="search"
          placeholder="Buscar guías..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      {loading && (
        <Loader active inline="centered">
          Cargando documentos...
        </Loader>
      )}

      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {!loading && !error && filteredSupports.length === 0 && (
        <Message info>
          <Message.Header>Sin documentos disponibles</Message.Header>
          <p>No hay guías o documentación disponible en este momento.</p>
        </Message>
      )}

      <div className="pdf-grid">
        {filteredSupports.map((support) => (
          <Card key={support.id} className="pdf-card">
            <Card.Content>
              <Card.Header>
                <Icon name="file pdf" color="red" />
                {support.title}
              </Card.Header>
              <Card.Meta>
                {support.created_at &&
                  new Date(support.created_at).toLocaleDateString("es-CO")}
              </Card.Meta>
              {support.tags && (
                <Card.Description>
                  <Label.Group size="mini">
                    {support.tags.split(",").map((tag, idx) => (
                      <Label key={idx}>{tag.trim()}</Label>
                    ))}
                  </Label.Group>
                </Card.Description>
              )}
            </Card.Content>
            <Card.Content extra>
              <div className="pdf-actions">
                <Button
                  primary
                  size="small"
                  onClick={() => handleOpenPdf(support)}
                >
                  <Icon name="eye" /> Ver PDF
                </Button>
                <Button
                  secondary
                  size="small"
                  as="a"
                  href={support.file}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="download" /> Descargar
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Modal
        open={showPdfModal}
        onClose={handleClosePdf}
        size="large"
        closeIcon
      >
        <Modal.Header>{selectedPdf?.title}</Modal.Header>
        <Modal.Content>
          <div className="pdf-viewer-options">
            <div className="pdf-actions-modal">
              <Button
                primary
                size="medium"
                as="a"
                href={selectedPdf?.file}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="external alternate" /> Abrir en nueva pestaña
              </Button>

              <Button
                secondary
                size="medium"
                as="a"
                href={selectedPdf?.file}
                download={selectedPdf?.title}
              >
                <Icon name="download" /> Descargar PDF
              </Button>
            </div>

            {selectedPdf && (
              // <PDFViewer
              //   fileUrl={selectedPdf.file}
              //   height="78vh"
              //   id={`pdf-${selectedPdf.id}`}
              // />
              <PDFViewer
                authUrl={selectedPdf.file}
                token={auth?.token}
                height="78vh"
                id={`pdf-${selectedPdf.id}`}
              />
            )}
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );

  // -------- Chat de soporte --------
  const {
    threads,
    activeThread,
    messages,
    loading: chatLoading,
    error: chatError,
    loadThreads,
    loadThread,
    createThread,
    sendMessage,
    closeThread,
    setActiveThread,
  } = useChat(auth?.token);

  const [composerText, setComposerText] = useState("");
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);

  // cargar threads al montar (o cuando cambia el token)
  useEffect(() => {
    if (auth?.token) loadThreads();
  }, [auth?.token, loadThreads]);

  // autoscroll al final de mensajes cuando cambian
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  const unreadFor = (t) => t?.unread_count ?? 0;

  const statusLabel = (status) => {
    if (status === "open")
      return (
        <Label color="green" size="tiny">
          Abierto
        </Label>
      );
    if (status === "pending")
      return (
        <Label color="yellow" size="tiny">
          Pendiente
        </Label>
      );
    return (
      <Label color="grey" size="tiny">
        Cerrado
      </Label>
    );
  };

  const handleSelectThread = async (t) => {
    setActiveThread(t);
    await loadThread(t.id);
  };

  const handleCreateThread = async () => {
    try {
      setCreating(true);
      const subject = "Consulta de soporte";
      const t = await createThread(subject);
      await loadThread(t.id);
      setActiveIndex(1); // saltar a la pestaña de chat si no estás en ella
    } catch (e) {
      // ya gestionas error en el hook
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    const text = composerText.trim();
    if (!text || !activeThread) return;
    try {
      setSending(true);
      await sendMessage(text);
      setComposerText("");
    } catch (e) {
      // error ya en hook
    } finally {
      setSending(false);
    }
  };

  const handleCloseThread = async (t) => {
    if (!t) return;
    await closeThread(t.id);
  };

  const chatHeaderRight = useMemo(() => {
    if (!activeThread) return null;
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {statusLabel(activeThread.status)}
        <Dropdown
          icon="ellipsis vertical"
          direction="left"
          pointing="top right"
          className="icon"
        >
          <Dropdown.Menu>
            <Dropdown.Item
              icon="refresh"
              text="Recargar conversación"
              onClick={() => loadThread(activeThread.id)}
            />
            <Dropdown.Item
              icon="window close"
              text="Cerrar conversación"
              disabled={activeThread.status === "closed"}
              onClick={() => handleCloseThread(activeThread)}
            />
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }, [activeThread, loadThread]);

  const renderThreadList = () => (
    <div className="thread-list">
      <div className="thread-list__header">
        <Header as="h3">
          <Icon name="inbox" />
          <Header.Content>
            Conversaciones
            <Header.Subheader>
              {threads.length} {threads.length === 1 ? "hilo" : "hilos"}
            </Header.Subheader>
          </Header.Content>
        </Header>
        <Button
          primary
          size="tiny"
          loading={creating}
          onClick={handleCreateThread}
        >
          <Icon name="plus" /> Nueva
        </Button>
      </div>

      <div className="thread-list__items">
        {chatLoading && threads.length === 0 ? (
          <Loader
            active
            inline="centered"
            content="Cargando conversaciones..."
          />
        ) : threads.length === 0 ? (
          <Message info>
            <Message.Header>No tienes conversaciones</Message.Header>
            <p>Crea una para iniciar el soporte.</p>
          </Message>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              className={`thread-item ${
                activeThread?.id === t.id ? "active" : ""
              }`}
              onClick={() => handleSelectThread(t)}
            >
              <div className="thread-item__title">
                <Icon name="comments" />
                <span className="truncate">{t.subject || `Chat #${t.id}`}</span>
                <div style={{ marginLeft: "auto" }}>
                  {statusLabel(t.status)}
                </div>
              </div>
              <div className="thread-item__meta">
                <span className="truncate">
                  {t.last_message?.message || "Sin mensajes aún"}
                </span>
                <div className="thread-item__badges">
                  {unreadFor(t) > 0 && (
                    <Label circular color="blue" size="mini">
                      {unreadFor(t)}
                    </Label>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMessageList = () => {
    if (!activeThread) {
      return (
        <Segment placeholder>
          <Header icon>
            <Icon name="comments outline" />
            Selecciona una conversación o crea una nueva.
          </Header>
          <Button primary onClick={handleCreateThread}>
            <Icon name="plus" /> Nueva conversación
          </Button>
        </Segment>
      );
    }

    return (
      <div className="chat-panel">
        <div className="chat-panel__header">
          <div className="left">
            <Header as="h3">
              <Icon name="comments" />
              <Header.Content>
                {activeThread.subject || `Chat #${activeThread.id}`}
                <Header.Subheader>
                  Actualizado:{" "}
                  {new Date(activeThread.updated_at).toLocaleString("es-CO")}
                </Header.Subheader>
              </Header.Content>
            </Header>
          </div>
          <div className="right">{chatHeaderRight}</div>
        </div>

        <div className="chat-panel__messages">
          {chatLoading && messages.length === 0 ? (
            <Loader active inline="centered" content="Cargando mensajes..." />
          ) : messages.length === 0 ? (
            <Message info>
              <Message.Header>Sin mensajes</Message.Header>
              <p>Escribe tu primera consulta abajo.</p>
            </Message>
          ) : (
            <Comment.Group>
              {messages.map((m) => (
                <Comment key={m.id}>
                  <Comment.Avatar
                    src={
                      m.sender_type === "admin"
                        ? "https://ui-avatars.com/api/?name=Admin"
                        : m.sender_type === "system"
                        ? "https://ui-avatars.com/api/?name=SYS"
                        : "https://ui-avatars.com/api/?name=User"
                    }
                  />
                  <Comment.Content>
                    <Comment.Author as="span">
                      {m.sender_name ||
                        (m.sender_type === "admin"
                          ? "Soporte"
                          : m.sender_type === "system"
                          ? "Sistema"
                          : "Tú")}
                    </Comment.Author>
                    <Comment.Metadata>
                      <div>
                        {new Date(m.created_at).toLocaleString("es-CO")}
                      </div>
                    </Comment.Metadata>
                    <Comment.Text style={{ whiteSpace: "pre-wrap" }}>
                      {m.message}
                    </Comment.Text>
                  </Comment.Content>
                </Comment>
              ))}
              <div ref={messagesEndRef} />
            </Comment.Group>
          )}
        </div>

        <div className="chat-panel__composer">
          {activeThread?.status === "closed" ? (
            <Message warning>
              <Message.Header>Conversación cerrada</Message.Header>
              <p>Crea una nueva conversación para continuar el soporte.</p>
            </Message>
          ) : (
            <Input
              fluid
              placeholder="Escribe tu mensaje..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              action={{
                color: "blue",
                labelPosition: "right",
                icon: "send",
                content: sending ? "Enviando..." : "Enviar",
                onClick: handleSend,
                loading: sending,
                disabled: sending || !composerText.trim(),
              }}
            />
          )}
        </div>

        {chatError && (
          <Message negative style={{ marginTop: 12 }}>
            <Message.Header>Error en el chat</Message.Header>
            <p>{chatError}</p>
          </Message>
        )}
      </div>
    );
  };

  const renderChat = () => (
    <div className="chat-support">
      <div className="chat-header">
        <Label color="green">
          <Icon name="circle" /> En línea
        </Label>
      </div>

      <div className="chat-container two-cols">
        <div className="left-col">{renderThreadList()}</div>
        <div className="right-col">{renderMessageList()}</div>
      </div>
    </div>
  );

  const panes = [
    
    {
      menuItem: (
        <Menu.Item key="chat">
          <Icon name="comments" />
          Chat de Soporte
        </Menu.Item>
      ),
      render: () => <Tab.Pane attached={false}>{renderChat()}</Tab.Pane>,
    },
    {
      menuItem: (
        <Menu.Item key="help">
          <Icon name="book" />
          Centro de Ayuda
        </Menu.Item>
      ),
      render: () => <Tab.Pane attached={false}>{renderHelpCenter()}</Tab.Pane>,
    },
  ];

  return (
    <div className="supports-admin">
      <div className="supports-header">
        <h1>
          <Icon name="life ring" />
          Soporte y Ayuda
        </h1>
      </div>

      <Tab
        menu={{ secondary: true, pointing: true }}
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={(e, { activeIndex }) => setActiveIndex(activeIndex)}
      />
    </div>
  );
}
