import type { TipoMovimientoUi } from '../types/asiento'

const map: Record<TipoMovimientoUi, string> = {
  VENTA: 'badge badge-outline border-primary text-primary',
  COMPRA: 'badge badge-outline border-warning text-warning-content',
  MANUAL: 'badge badge-outline border-neutral',
}

const text: Record<TipoMovimientoUi, string> = {
  VENTA: 'Venta',
  COMPRA: 'Compra',
  MANUAL: 'Manual',
}

type Props = { tipo: TipoMovimientoUi }

export default function TipoMovimientoBadge({ tipo }: Props) {
  return <span className={map[tipo]}>{text[tipo]}</span>
}
