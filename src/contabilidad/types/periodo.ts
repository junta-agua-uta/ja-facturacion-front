export interface PeriodoContable {
  id: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  estado: 'ABIERTO' | 'CERRADO'
  empresaId: number
}

export interface PeriodosListResponse {
  page: number
  limit: number
  total: number
  totalPages: number
  data: PeriodoContable[]
}
