import type { AsientoListItem } from './asiento'

export type LibroDiarioRow = AsientoListItem & {
  comprobanteLabel: string
  totalDebe: number
  totalHaber: number
}

/** Respuesta GET /asientos/kpis */
export interface LibroDiarioResumenApi {
  totalAsientos: number
  asientosCuadrados: number
  asientosDescuadrados: number
  totalMovimientos: number
  porcentajeCuadrados: number
}

/** KPIs normalizados para la UI del Libro Diario */
export interface LibroDiarioKpisUi {
  totalAsientos: number
  asientosCuadrados: number
  asientosDescuadre: number
  totalMovimientos: number | null
  porcentajeCuadrados?: number
  statsAproximados?: boolean
}
