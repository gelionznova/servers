import { useState } from "react";
import {
  getMeApi,
  getUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  getUserStatusApi,
} from "../api/user";
import { useAuth } from ".";

export function useUser() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState(null);
  const { auth } = useAuth();

  const getMe = async (token) => {
    try {
      const response = await getMeApi(token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersApi(auth.token);
      setLoading(false);
      setUsers(response);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  const getUserss = async () => {
    try {
      setLoading(true);
      const response = await getUsersApi(auth.token);
      // Para cada usuario, verifica si está en línea
      const usersWithStatus = await Promise.all(
        response.map(async (user) => {
          const status = await getUserStatusApi(user.id, auth.token);
          return { ...user, is_online: status.is_online };
        })
      );
      setLoading(false);
      setUsers(usersWithStatus);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  const addUser = async (data) => {
    try {
      setLoading(true);
      await addUserApi(data, auth.token);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  const updateUser = async (id, data) => {
    try {
      setLoading(true);
      await updateUserApi(id, data, auth.token);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  const deleteUser = async (id) => {
    try {
      setLoading(true);
      await deleteUserApi(id, auth.token);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  };

  return {
    loading,
    error,
    users,
    getMe,
    getUsers,
    getUserss,
    addUser,
    updateUser,
    deleteUser,
  };
}
