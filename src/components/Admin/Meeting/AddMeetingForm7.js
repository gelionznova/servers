import React, { useState, useEffect } from "react";
import { Form, Button } from "semantic-ui-react";
import { useAuth } from "../../../hooks";
import { useMeeting } from "../../../hooks/useMeeting";

export function AddMeetingForm({ onClose, onRefetch, meeting }) {
  const isEditing = Boolean(meeting);
  const { auth } = useAuth();
  const { addMeeting, updateMeeting } = useMeeting();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (isEditing) {
      setFormData({
        title: meeting.title || "",
        description: meeting.description || "",
      });
    }
  }, [meeting]);

  const handleChange = (e, { name, value }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await updateMeeting(meeting.id, formData, auth.token);
      } else {
        await addMeeting(formData, auth.token);
      }
      onRefetch();
      onClose();
    } catch (error) {
      console.error("Error al guardar la reunión", error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Input
        label="Título de la reunión"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
      />

      <Form.TextArea
        label="Descripción"
        name="description"
        value={formData.description}
        onChange={handleChange}
      />

      <Button type="submit" primary>
        {isEditing ? "Actualizar" : "Crear reunión"}
      </Button>
    </Form>
  );
}
