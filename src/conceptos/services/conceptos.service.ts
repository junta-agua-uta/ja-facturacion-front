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

  // Desactivar concepto (eliminado lógico)
  desactivar: async (id: string): Promise<void> => {
    try {
      await api.patch(`/conceptos/${id}/desactivar`);
    } catch (error) {
      console.error("Error deactivating concepto:", error);
      throw new Error("No se pudo desactivar el concepto");
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
        params: { descripcion: descripcion }
      });
      return response.data || [];
    } catch (error) {
      console.error("Error searching conceptos:", error);
      throw new Error("No se pudo buscar conceptos");
    }
  },

  // Buscar conceptos por código interno
  buscarPorCodigo: async (codigo: string): Promise<Concepto[]> => {
    try {
      const response = await api.get("/conceptos/buscarCodigo", {
        params: { codigo: codigo }
      });
      return response.data || [];
    } catch (error) {
      console.error("Error searching conceptos by code:", error);
      throw new Error("No se pudo buscar conceptos por código");
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
      console.log("🔍 Buscando conceptos con filtros:");
      console.log("Filtros recibidos:", filters);

      // Si no hay filtros, usar endpoint general
      if (!filters.desc && !filters.codigo) {
        console.log("🔍 Listando todos los conceptos");
        const response = await api.get("/conceptos", {
          params: { page, limit }
        });
        
        console.log("📥 Respuesta de la API:", response.data);
        
        return {
          data: response.data.data || [],
          totalItems: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 1,
          currentPage: response.data.currentPage || page
        };
      }

      // Si hay filtros, obtener todos los conceptos y filtrar en el frontend
      console.log("🔍 Obteniendo todos los conceptos para filtrar localmente");
      const response = await api.get("/conceptos", {
        params: { page: 1, limit: 1000 } // Obtener muchos registros para filtrar
      });
      
      let data = response.data.data || [];
      
      // Aplicar filtros localmente
      if (filters.desc) {
        console.log("🔍 Filtrando por descripción:", filters.desc);
        data = data.filter((concepto: Concepto) => 
          concepto.desc.toLowerCase().includes(filters.desc!.toLowerCase())
        );
      }
      
      if (filters.codigo) {
        console.log("🔍 Filtrando por código:", filters.codigo);
        data = data.filter((concepto: Concepto) => 
          concepto.codInterno.toLowerCase().includes(filters.codigo!.toLowerCase())
        );
      }
      
      console.log("📊 Datos filtrados:", data.length, "conceptos");
      
      return {
        data: data,
        totalItems: data.length,
        totalPages: 1,
        currentPage: 1
      };
    } catch (error) {
      console.error("Error searching conceptos with filters:", error);
      throw new Error("No se pudo buscar conceptos");
    }
  }
};
