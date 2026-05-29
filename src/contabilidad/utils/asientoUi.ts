import type { AsientoListItem } from '../types/asiento'
import type { TipoMovimientoUi } from '../types/asiento'

export function codigoAsientoVisual(item: Pick<AsientoListItem, 'numero'>): string {
  return `ASI-${String(item.numero).padStart(3, '0')}`
}

export function inferTipoMovimiento(modelo?: string | null, comprobante?: string | null): TipoMovimientoUi {
  const m = (modelo || '').toLowerCase()
  const c = (comprobante || '').toLowerCase()
  if (m.includes('compra') || c.includes('compra')) return 'COMPRA'
  if (m.includes('venta') || m.includes('ingreso') || c.includes('fact')) return 'VENTA'
  if (!modelo && !comprobante) return 'MANUAL'
  return 'MANUAL'
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function sumDetalleDebeHaber(
  detalles: { debe: string | number; haber: string | number }[],
): { totalDebe: number; totalHaber: number } {
  let totalDebe = 0
  let totalHaber = 0
  for (const d of detalles) {
    totalDebe += Number(d.debe)
    totalHaber += Number(d.haber)
  }
  return { totalDebe, totalHaber }
}
