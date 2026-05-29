export type EstadoPeriodoApi = 'ABIERTO' | 'CERRADO';

export interface PeriodoContableDto {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoPeriodoApi;
  createdAt: string;
  updatedAt: string;
  empresaId: number;
}

export interface PeriodosListResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: PeriodoContableDto[];
}
