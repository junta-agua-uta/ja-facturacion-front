import { formatMoney } from '../../utils/asientoUi'
import type { LibroMayorMovimiento } from '../types/reportes'

export { formatMoney }

export function defaultRangoAnioActual(): { desde: string; hasta: string } {
  const year = new Date().getFullYear()
  return { desde: `${year}-01-01`, hasta: `${year}-12-31` }
}

export function isoDateStart(isoDate: string): string {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toISOString()
}

export function isoDateEnd(isoDate: string): string {
  if (!isoDate) return ''
  return new Date(`${isoDate}T23:59:59.999`).toISOString()
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export function parseApiError(e: unknown, fallback: string): string {
  const ax = e as { response?: { data?: { message?: string | string[] } } }
  const message = ax.response?.data?.message
  if (Array.isArray(message)) return message.join(', ')
  return message || fallback
}

export function formatFechaReporte(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function comprobanteDesdeNumero(numero: number): string {
  return `AS-${String(numero).padStart(5, '0')}`
}

export function calcularKpisLibroMayor(
  movimientos: LibroMayorMovimiento[],
  naturaleza?: string,
): {
  saldoInicial: number
  totalDebe: number
  totalHaber: number
  saldoFinal: number
} {
  const totalDebe = movimientos.reduce((s, m) => s + Number(m.debe), 0)
  const totalHaber = movimientos.reduce((s, m) => s + Number(m.haber), 0)
  const saldoFinal = movimientos.length ? Number(movimientos[movimientos.length - 1].saldo) : 0

  let saldoInicial = 0
  if (movimientos.length > 0) {
    const m0 = movimientos[0]
    if (naturaleza === 'ACREEDORA') {
      saldoInicial = Number(m0.saldo) - (Number(m0.haber) - Number(m0.debe))
    } else {
      saldoInicial = Number(m0.saldo) - (Number(m0.debe) - Number(m0.haber))
    }
  }

  return { saldoInicial, totalDebe, totalHaber, saldoFinal }
}

export function labelNaturaleza(naturaleza?: string): string {
  if (naturaleza === 'ACREEDORA') return 'Acreedora'
  if (naturaleza === 'DEUDORA') return 'Deudora'
  return naturaleza ?? '—'
}
