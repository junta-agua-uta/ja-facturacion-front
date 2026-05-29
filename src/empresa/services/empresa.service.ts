import api from '../../shared/api';

export type ModoAsientos = 'INDIVIDUAL' | 'DIARIO' | 'MENSUAL';

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
  modoAsientos: ModoAsientos;
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
  modoAsientos?: ModoAsientos;
}

const normalizeEmpresa = (data: EmpresaApiResponse | Omit<EmpresaApiResponse, 'modoAsientos'> & { modoAsientos?: ModoAsientos }): EmpresaApiResponse => ({
  ...data,
  modoAsientos: data.modoAsientos || 'INDIVIDUAL',
});

export const empresaService = {
  async obtenerEmpresa() {
    const response = await api.get('/empresa');
    return normalizeEmpresa(response.data);
  },

  async actualizarEmpresa(id: number, payload: UpdateEmpresaPayload) {
    const response = await api.put(`/empresa/${id}`, payload);
    return normalizeEmpresa(response.data);
  },

  async obtenerUsuariosEmpresa(empresaId: number) {
    const response = await api.get(`/users/empresa/${empresaId}`);
    return response.data;
  }
};