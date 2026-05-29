import api from '../../../shared/api'
import type {
  BalanceComprobacionResponse,
  BalanceGeneralResponse,
  CarteraClienteItem,
  EstadoResultadosResponse,
  FiltrosCarteraBody,
  FiltrosDetalleCuentaBody,
  FiltrosReporteBody,
  LibroMayorCuentaResumen,
  LibroMayorDetalleCuenta,
} from '../types/reportes'

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const { data } = await api.post<T>(path, body)
    return data
  } catch {
    return null
  }
}

async function postBlob(path: string, body: unknown): Promise<Blob | null> {
  try {
    const { data } = await api.post(path, body, { responseType: 'blob' })
    return data as Blob
  } catch {
    return null
  }
}

// --- Libro Mayor ---
export async function obtenerLibroMayorResumen(
  body: FiltrosReporteBody,
): Promise<LibroMayorCuentaResumen[]> {
  const data = await postJson<LibroMayorCuentaResumen[]>('/reportes/libro-mayor/resumen', body)
  return Array.isArray(data) ? data : []
}

export async function obtenerLibroMayorDetalle(
  body: FiltrosDetalleCuentaBody,
): Promise<LibroMayorDetalleCuenta | null> {
  return postJson<LibroMayorDetalleCuenta>('/reportes/libro-mayor/detalle', body)
}

export async function descargarLibroMayorPdf(body: FiltrosReporteBody): Promise<Blob | null> {
  return postBlob('/reportes/libro-mayor/pdf', body)
}

// --- Balance de Comprobación ---
export async function obtenerBalanceComprobacion(
  body: FiltrosReporteBody,
): Promise<BalanceComprobacionResponse | null> {
  return postJson<BalanceComprobacionResponse>('/reportes/balance-comprobacion', body)
}

export async function descargarBalanceComprobacionPdf(body: FiltrosReporteBody): Promise<Blob | null> {
  return postBlob('/reportes/balance-comprobacion/pdf', body)
}

// --- Balance General ---
export async function obtenerBalanceGeneral(
  body: FiltrosReporteBody,
): Promise<BalanceGeneralResponse | null> {
  return postJson<BalanceGeneralResponse>('/reportes/balance-general', body)
}

export async function descargarBalanceGeneralPdf(body: FiltrosReporteBody): Promise<Blob | null> {
  return postBlob('/reportes/balance-general/pdf', body)
}

// --- Estado de Resultados ---
export async function obtenerEstadoResultados(
  body: FiltrosReporteBody,
): Promise<EstadoResultadosResponse | null> {
  return postJson<EstadoResultadosResponse>('/reportes/estado-resultados', body)
}

export async function descargarEstadoResultadosPdf(body: FiltrosReporteBody): Promise<Blob | null> {
  return postBlob('/reportes/estado-resultados/pdf', body)
}

// --- Cartera de Clientes ---
export async function obtenerCarteraClientes(
  body: FiltrosCarteraBody,
): Promise<CarteraClienteItem[]> {
  const data = await postJson<CarteraClienteItem[]>('/reportes/cartera-clientes', body)
  return Array.isArray(data) ? data : []
}

export async function descargarCarteraClientesPdf(body: FiltrosCarteraBody): Promise<Blob | null> {
  return postBlob('/reportes/cartera-clientes/pdf', body)
}
