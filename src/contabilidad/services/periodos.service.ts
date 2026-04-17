import api from '../../shared/api'
import type { PeriodosListResponse } from '../types/periodo'

export type ListPeriodosParams = {
  page?: number
  limit?: number
  empresaId?: number
  estado?: 'ABIERTO' | 'CERRADO'
}

function buildQuery(params: ListPeriodosParams): string {
  const q = new URLSearchParams()
  if (params.page != null) q.set('page', String(params.page))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.empresaId != null) q.set('empresaId', String(params.empresaId))
  if (params.estado) q.set('estado', params.estado)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function listarPeriodos(
  params: ListPeriodosParams = {},
): Promise<PeriodosListResponse> {
  const { data } = await api.get<PeriodosListResponse>(
    `/periodos-contables${buildQuery(params)}`,
  )
  return data
}
