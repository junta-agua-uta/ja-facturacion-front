export interface PlanCuentaRow {
  id: number
  codigo: string
  nombre: string
  tipo: string
  naturaleza: string
  nivel: number
  esDetalle: boolean
  activo: boolean
  empresaId: number
  padreId?: number | null
}

export interface PlanCuentasPlanoResponse {
  formato: 'plano'
  page: number
  limit: number
  total: number
  totalPages: number
  data: PlanCuentaRow[]
}
