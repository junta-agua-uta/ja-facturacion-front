import api from '../../shared/api';

export interface EmpresaApiResponse {
  id: number;
  nombre: string;
  email: string;
  ruc: string;
  direccion: string;
  telefono: string;
  moneda: string;
  representanteLegal: string;
  logo: string | null;
  modoAsientos?: 'INDIVIDUAL' | 'DIARIO' | 'MENSUAL';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmpresaPayload {
  nombre?: string;
  email?: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  moneda?: string;
  representanteLegal?: string;
  logo?: string | null;
  modoAsientos?: 'INDIVIDUAL' | 'DIARIO' | 'MENSUAL';
}

export const empresaService = {
  async obtenerEmpresa() {
    const response = await api.get('/empresa');
    return response.data as EmpresaApiResponse;
  },

  async actualizarEmpresa(id: number, payload: UpdateEmpresaPayload) {
    const response = await api.put(`/empresa/${id}`, payload);
    return response.data as EmpresaApiResponse;
  },

  async obtenerUsuariosEmpresa(empresaId: number) {
    const response = await api.get(`/users/empresa/${empresaId}`);
    return response.data;
  }
};