import type { AsientoListItem } from '../types/asiento'
import type { LibroDiarioKpisUi, LibroDiarioResumenApi, LibroDiarioRow } from '../types/libroDiario'

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

export function parseMontoApi(value: number | string | undefined | null): number | undefined {
  if (value == null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function asientoListItemToLibroDiarioRow(item: AsientoListItem): LibroDiarioRow {
  return {
    ...item,
    comprobanteLabel: comprobanteLibroDiario(item),
    totalDebe: parseMontoApi(item.totalDebe),
    totalHaber: parseMontoApi(item.totalHaber),
  }
}

export function filaNecesitaTotales(row: LibroDiarioRow): boolean {
  return row.totalDebe == null || row.totalHaber == null
}

export function mapResumenApiToKpis(res: LibroDiarioResumenApi): LibroDiarioKpisUi {
  return {
    totalAsientos: res.totalAsientos,
    asientosCuadrados: res.asientosCuadrados,
    asientosDescuadre: res.asientosDescuadrados,
    totalMovimientos: res.totalMovimientos,
    porcentajeCuadrados: res.porcentajeCuadrados,
    statsAproximados: false,
  }
}
