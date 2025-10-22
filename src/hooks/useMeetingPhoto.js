import { useState, useCallback } from "react";
import {
  getMeetingPhotosApi,
  addMeetingPhotoApi,
  deletePhotoApi,
} from "../api/meetingPhoto";

export function useMeetingPhoto() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPhotos = async (meetingId, token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMeetingPhotosApi(meetingId, token);
      setPhotos(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPhoto = async (formData, token) => {
    setError(null);
    try {
      const response = await addMeetingPhotoApi(formData, token);
      setPhotos((prev) => [...prev, response]);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deletePhoto = useCallback(async (id, token) => {
    setError(null);
    try {
      await deletePhotoApi(id, token);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const reload = useCallback(async (meetingId, token) => {
    await getPhotos(meetingId, token);
  }, []);

  return { photos, loading, error, getPhotos, addPhoto, deletePhoto, reload };
}
