import api from '../../shared/api'
import type {
  AsientoDetalle,
  AsientosListResponse,
  CreateAsientoPayload,
} from '../types/asiento'

export type ListAsientosParams = {
  page?: number
  limit?: number
  estado?: 'PENDIENTE' | 'APROBADO'
  periodoId?: number
  creadoPorId?: number
  fechaInicio?: string
  fechaFin?: string
}

function buildQuery(params: ListAsientosParams): string {
  const q = new URLSearchParams()
  if (params.page != null) q.set('page', String(params.page))
  if (params.limit != null) q.set('limit', String(params.limit))
  if (params.estado) q.set('estado', params.estado)
  if (params.periodoId != null) q.set('periodoId', String(params.periodoId))
  if (params.creadoPorId != null) q.set('creadoPorId', String(params.creadoPorId))
  if (params.fechaInicio) q.set('fechaInicio', params.fechaInicio)
  if (params.fechaFin) q.set('fechaFin', params.fechaFin)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function listarAsientos(
  params: ListAsientosParams,
): Promise<AsientosListResponse> {
  const { data } = await api.get<AsientosListResponse>(`/asientos${buildQuery(params)}`)
  return data
}

export async function obtenerAsiento(id: number): Promise<AsientoDetalle> {
  const { data } = await api.get<AsientoDetalle>(`/asientos/${id}`)
  return data
}

export async function crearAsiento(payload: CreateAsientoPayload): Promise<AsientoDetalle> {
  const { data } = await api.post<AsientoDetalle>('/asientos', payload)
  return data
}

export async function actualizarAsiento(
  id: number,
  payload: Partial<Pick<CreateAsientoPayload, 'fecha' | 'concepto' | 'modelo' | 'comprobante'>> & {
    detalles?: CreateAsientoPayload['detalles']
  },
): Promise<AsientoDetalle> {
  const { data } = await api.patch<AsientoDetalle>(`/asientos/${id}`, payload)
  return data
}

export async function eliminarAsiento(id: number): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/asientos/${id}`)
  return data
}
