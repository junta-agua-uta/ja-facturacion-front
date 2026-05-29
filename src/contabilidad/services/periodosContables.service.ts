import api from '../../shared/api';
import type { PeriodoContableDto, PeriodosListResponse } from '../types/periodoContable';

const DEFAULT_EMPRESA_ID = 1;

export type EstadoPeriodoFiltro = 'ABIERTO' | 'CERRADO';

export const periodosContablesService = {
  /** GET /periodos-contables — Listar periodos con paginación y filtro */
  listar: async (
    page = 1,
    limit = 10,
    empresaId = DEFAULT_EMPRESA_ID,
    estado?: EstadoPeriodoFiltro,
  ): Promise<PeriodosListResponse> => {
    const params: Record<string, string | number> = { page, limit, empresaId };
    if (estado) params.estado = estado;
    const { data } = await api.get<PeriodosListResponse>('/periodos-contables', { params });
    return data;
  },

  /** PATCH /periodos-contables/:id/cerrar — Cierra un periodo (rol CONTADOR) */
  cerrar: async (
    id: number,
    empresaId = DEFAULT_EMPRESA_ID,
  ): Promise<PeriodoContableDto> => {
    const { data } = await api.patch<PeriodoContableDto>(
      `/periodos-contables/${id}/cerrar`,
      {},
      { params: { empresaId } },
    );
    return data;
  },

  /** PATCH /periodos-contables/:id/abrir — Reabre un periodo (rol ADMIN) */
  abrir: async (
    id: number,
    empresaId = DEFAULT_EMPRESA_ID,
  ): Promise<PeriodoContableDto> => {
    const { data } = await api.patch<PeriodoContableDto>(
      `/periodos-contables/${id}/abrir`,
      {},
      { params: { empresaId } },
    );
    return data;
  },

  crear: async (
    empresaId = DEFAULT_EMPRESA_ID,
    body: { nombre: string; fechaInicio: string; fechaFin: string },
  ): Promise<PeriodoContableDto> => {
    const { data } = await api.post<PeriodoContableDto>(
      '/periodos-contables',
      body,
      { params: { empresaId } },
    );
    return data;
  },
};
