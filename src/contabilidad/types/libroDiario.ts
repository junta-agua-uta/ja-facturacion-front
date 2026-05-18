import type { AsientoListItem } from './asiento'

export type LibroDiarioRow = AsientoListItem & {
  comprobanteLabel: string
  totalDebe: number
  totalHaber: number
}
