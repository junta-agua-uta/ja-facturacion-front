import api from '../../shared/api'
import type {
  AsientoDetalle,
  AsientosListResponse,
  CreateAsientoPayload,
} from '../types/asiento'
import type { LibroDiarioResumenApi } from '../types/libroDiario'

export type ListAsientosParams = {
  page?: number
  limit?: number
  estado?: 'PENDIENTE' | 'APROBADO'
  periodoId?: number
  creadoPorId?: number
  fechaInicio?: string
  fechaFin?: string
}

export type LibroDiarioFiltrosParams = Pick<
  ListAsientosParams,
  'estado' | 'periodoId' | 'fechaInicio' | 'fechaFin'
>

function buildQueryParams(
  params: ListAsientosParams & { empresaId?: number },
): Record<string, string | number> {
  const q: Record<string, string | number> = {}
  if (params.page != null) q.page = params.page
  if (params.limit != null) q.limit = params.limit
  if (params.estado) q.estado = params.estado
  if (params.periodoId != null) q.periodoId = params.periodoId
  if (params.creadoPorId != null) q.creadoPorId = params.creadoPorId
  if (params.fechaInicio) q.fechaInicio = params.fechaInicio
  if (params.fechaFin) q.fechaFin = params.fechaFin
  if (params.empresaId != null) q.empresaId = params.empresaId
  return q
}

function buildQuery(params: ListAsientosParams): string {
  const entries = buildQueryParams(params)
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(entries)) {
    q.set(key, String(value))
  }
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

// ---- Nuevos Endpoints: Aprobación de Asientos ----

export async function aprobarAsiento(id: number): Promise<AsientoDetalle> {
  const { data } = await api.patch<AsientoDetalle>(`/asientos/${id}/aprobar`)
  return data
}

export async function aprobarAsientosLote(asientoIds: number[]): Promise<{ message: string; aprobados: number }> {
  const { data } = await api.patch<{ message: string; aprobados: number }>('/asientos/aprobar-lote', { asientoIds })
  return data
}

// ---- Nuevos Endpoints: Agrupación de Asientos ----

export async function agruparPorDia(payload: { fecha: string; empresaId: number }): Promise<{ message: string; asiento: AsientoDetalle | null }> {
  const { data } = await api.post<{ message: string; asiento: AsientoDetalle | null }>('/asientos/agrupar/dia', payload)
  return data
}

export async function agruparPorCliente(payload: { clienteId: number; fechaInicio?: string; fechaFin?: string; empresaId: number }): Promise<{ message: string; asiento: AsientoDetalle | null }> {
  const { data } = await api.post<{ message: string; asiento: AsientoDetalle | null }>('/asientos/agrupar/cliente', payload)
  return data
}

export async function agruparPorPeriodo(payload: { periodoId: number; empresaId: number }): Promise<{ message: string; asiento: AsientoDetalle | null }> {
  const { data } = await api.post<{ message: string; asiento: AsientoDetalle | null }>('/asientos/agrupar/periodo', payload)
  return data
}

// ---- Nuevos Endpoints: Exportación ----

export async function descargarAsientoPdf(id: number, empresaId: number): Promise<Blob> {
  const { data } = await api.get(`/asientos/${id}/pdf`, {
    params: { empresaId },
    responseType: 'blob',
  })
  return data
}

// ---- Libro Diario ----

export async function obtenerKpisLibroDiario(
  empresaId: number,
  filtros: LibroDiarioFiltrosParams = {},
): Promise<LibroDiarioResumenApi> {
  const { data } = await api.get<LibroDiarioResumenApi>('/asientos/kpis', {
    params: buildQueryParams({ ...filtros, empresaId }),
  })
  return data
}

export async function descargarLibroDiarioPdf(
  empresaId: number,
  filtros: LibroDiarioFiltrosParams = {},
): Promise<Blob> {
  const { data } = await api.get('/asientos/exportar/pdf', {
    params: buildQueryParams({ ...filtros, empresaId }),
    responseType: 'blob',
  })
  return data
}

// ---- Nuevo: exportar asientos a PDF

export type ExportarLibroDiarioParams = {
  empresaId: number
  estado?: 'PENDIENTE' | 'APROBADO'
  periodoId?: number
  fechaInicio?: string
  fechaFin?: string
}

export async function exportarLibroDiarioPdf(
  params: ExportarLibroDiarioParams,
): Promise<Blob> {
  const { data } = await api.get('/asientos/exportar/pdf', {
    params,
    responseType: 'blob', // 🔥 CLAVE
  })

  return data
}
// ---- Nuevo: KPIs ----

// ---- Nuevo: Facturas vinculadas a un asiento ----

export interface FacturaAsientoItem {
  id: number
  secuencia: number
  fechaEmision: string
  total: number
  valorSinImpuesto: number
  iva: number
  estado: string
  tipoRelacion: string
  cliente: {
    id: number
    razonSocial: string
    identificacion: string
  } | null
}

export async function obtenerFacturasDeAsiento(asientoId: number): Promise<FacturaAsientoItem[]> {
  try {
    const { data } = await api.get<FacturaAsientoItem[]>(`/asientos/${asientoId}/facturas`)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}
