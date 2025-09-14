import api from "../../shared/api";
import { Concepto, ConceptoFilter } from "../types/concepto";

export const conceptosService = {
  // Listar conceptos con paginación
  listar: async (page: number = 1, limit: number = 10): Promise<{
    data: Concepto[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> => {
    try {
      const response = await api.get("/conceptos", {
        params: { page, limit }
      });
      
      return {
        data: response.data.data || [],
        totalItems: response.data.totalItems || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page
      };
    } catch (error) {
      console.error("Error fetching conceptos:", error);
      throw new Error("No se pudo cargar la lista de conceptos");
    }
  },

  // Crear nuevo concepto
  crear: async (concepto: Omit<Concepto, 'id'>): Promise<Concepto> => {
    try {
      const response = await api.post("/conceptos", concepto);
      return response.data;
    } catch (error) {
      console.error("Error creating concepto:", error);
      throw new Error("No se pudo crear el concepto");
    }
  },

  // Actualizar concepto existente
  actualizar: async (id: string, concepto: Omit<Concepto, 'id'>): Promise<Concepto> => {
    try {
      // Incluir el id en el payload según el formato del backend
      const payload = {
        ...concepto,
        id: id
      };
      
      const response = await api.put(`/conceptos/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error updating concepto:", error);
      throw new Error("No se pudo actualizar el concepto");
    }
  },

  // Eliminar concepto
  eliminar: async (id: string): Promise<void> => {
    try {
      await api.delete(`/conceptos/${id}`);
    } catch (error) {
      console.error("Error deleting concepto:", error);
      throw new Error("No se pudo eliminar el concepto");
    }
  },

  // Obtener un concepto por ID
  obtenerPorId: async (id: string): Promise<Concepto> => {
    try {
      const response = await api.get(`/conceptos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching concepto:", error);
      throw new Error("No se pudo obtener el concepto");
    }
  },

  // Buscar conceptos por descripción
  buscar: async (descripcion: string): Promise<Concepto[]> => {
    try {
      const response = await api.get("/conceptos/buscar", {
        params: { desc: descripcion }
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error searching conceptos:", error);
      throw new Error("No se pudo buscar conceptos");
    }
  },

  // Buscar conceptos con filtros
  buscarConFiltros: async (filters: ConceptoFilter, page: number = 1, limit: number = 10): Promise<{
    data: Concepto[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> => {
    try {
      // Construir parámetros de búsqueda
      const searchParams: any = { page, limit };
      
      if (filters.desc) {
        searchParams.desc = filters.desc;
      }
      if (filters.codigo) {
        searchParams.codigo = filters.codigo;
      }
      if (filters.codInterno) {
        searchParams.codInterno = filters.codInterno;
      }

      console.log("🔍 Buscando conceptos con filtros:");
      console.log("Filtros recibidos:", filters);
      console.log("Parámetros de búsqueda:", searchParams);
      console.log("URL:", "/conceptos");

      const response = await api.get("/conceptos", {
        params: searchParams
      });
      
      console.log("📥 Respuesta de la API:", response.data);
      
      return {
        data: response.data.data || [],
        totalItems: response.data.totalItems || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || page
      };
    } catch (error) {
      console.error("Error searching conceptos with filters:", error);
      throw new Error("No se pudo buscar conceptos");
    }
  }
};
