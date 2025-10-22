import { useState, useCallback } from "react";
import { getSupportApi } from "../api/support";

export function useSupport() {
  const [supports, setSupports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSupports = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSupportApi(token);
      // La respuesta puede venir paginada o como array directo
      const data = response.results || response;
      setSupports(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err.message || "Error cargando los documentos de soporte");
      setSupports([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para filtrar por tags
  const filterByTag = useCallback((tag) => {
    if (!tag) return supports;
    return supports.filter(support => 
      support.tags && support.tags.toLowerCase().includes(tag.toLowerCase())
    );
  }, [supports]);

  // Función para buscar por título
  const searchByTitle = useCallback((query) => {
    if (!query) return supports;
    return supports.filter(support => 
      support.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [supports]);

  return {
    supports,
    loading,
    error,
    loadSupports,
    filterByTag,
    searchByTitle,
  };
}