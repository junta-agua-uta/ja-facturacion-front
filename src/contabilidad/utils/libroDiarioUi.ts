import type { AsientoListItem } from '../types/asiento'

export function comprobanteLibroDiario(item: Pick<AsientoListItem, 'comprobante' | 'numero' | 'fecha'>): string {
  if (item.comprobante?.trim()) return item.comprobante.trim()
  const year = new Date(item.fecha).getFullYear()
  return `AS-${year}-${String(item.numero).padStart(4, '0')}`
}

export function esAsientoCuadrado(descuadre: string | number): boolean {
  const desc = Number(descuadre)
  return Number.isFinite(desc) && Math.abs(desc) < 0.005
}

export function isoDateStart(isoDate: string): string {
  if (!isoDate) return ''
  return new Date(`${isoDate}T00:00:00`).toISOString()
}

export function isoDateEnd(isoDate: string): string {
  if (!isoDate) return ''
  return new Date(`${isoDate}T23:59:59.999`).toISOString()
}

export function defaultRangoAnioActual(): { desde: string; hasta: string } {
  const year = new Date().getFullYear()
  return {
    desde: `${year}-01-01`,
    hasta: `${year}-12-31`,
  }
}
