import type { AsientoDetalle } from '../types/asiento'
import StatusBadge from './StatusBadge'
import { codigoAsientoVisual, formatMoney, inferTipoMovimiento } from '../utils/asientoUi'
import TipoMovimientoBadge from './TipoMovimientoBadge'
import type { TipoMovimientoUi } from '../types/asiento'
import { sumDetalleDebeHaber } from '../utils/asientoUi'

type Props = {
  id: string
  asiento: AsientoDetalle | null
  loading?: boolean
  onClose: () => void
}

function fechaLarga(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AsientoDetailModal({ id, asiento, loading, onClose }: Props) {
  const tipo = asiento
    ? (inferTipoMovimiento(asiento.modelo, asiento.comprobante) as TipoMovimientoUi)
    : 'MANUAL'
  const totales = asiento?.detallesAsiento
    ? sumDetalleDebeHaber(asiento.detallesAsiento)
    : { totalDebe: 0, totalHaber: 0 }
  const desc = asiento ? Math.abs(totales.totalDebe - totales.totalHaber) : 0

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-4xl">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-bold text-xl text-primary">Detalle del asiento</h3>
            {asiento && (
              <p className="text-sm text-base-content/70 mt-1 font-mono">
                {codigoAsientoVisual(asiento)} · {asiento.nombre}
              </p>
            )}
          </div>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost" aria-label="Cerrar" onClick={onClose}>
              ✕
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {!loading && asiento && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-base-content/60">Fecha</span>
                <p className="font-medium">{fechaLarga(asiento.fecha)}</p>
              </div>
              <div>
                <span className="text-base-content/60">Estado</span>
                <p>
                  <StatusBadge kind="asiento" value={asiento.estado} />
                </p>
              </div>
              <div>
                <span className="text-base-content/60">Tipo</span>
                <p>
                  <TipoMovimientoBadge tipo={tipo} />
                </p>
              </div>
              <div>
                <span className="text-base-content/60">Periodo</span>
                <p className="font-medium">{asiento.periodo?.nombre ?? '—'}</p>
              </div>
              {asiento.modelo && (
                <div>
                  <span className="text-base-content/60">Modelo</span>
                  <p className="font-medium">{asiento.modelo}</p>
                </div>
              )}
              {asiento.comprobante && (
                <div>
                  <span className="text-base-content/60">Comprobante</span>
                  <p className="font-medium">{asiento.comprobante}</p>
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-base-content/60">Concepto</span>
              <p className="font-medium">{asiento.concepto}</p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-base-200">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-base-200">
                    <th>#</th>
                    <th>Cuenta</th>
                    <th className="text-right">Debe</th>
                    <th className="text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {(asiento.detallesAsiento ?? []).map((d) => (
                    <tr key={d.id}>
                      <td>{d.no}</td>
                      <td>
                        <span className="font-mono text-xs">{d.codcta}</span> {d.nombre}
                        {d.referencia && (
                          <span className="block text-xs text-base-content/60">{d.referencia}</span>
                        )}
                      </td>
                      <td className="text-right tabular-nums">{formatMoney(Number(d.debe))}</td>
                      <td className="text-right tabular-nums">{formatMoney(Number(d.haber))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-end gap-4 text-sm border-t pt-3">
              <span>
                Total debe: <strong className="tabular-nums">{formatMoney(totales.totalDebe)}</strong>
              </span>
              <span>
                Total haber: <strong className="tabular-nums">{formatMoney(totales.totalHaber)}</strong>
              </span>
              <span className={desc > 0.009 ? 'text-warning' : 'text-success'}>
                Descuadre: <strong className="tabular-nums">{formatMoney(desc)}</strong>
              </span>
            </div>

            {asiento.creadoPor && (
              <p className="text-xs text-base-content/50">
                Creado por: {asiento.creadoPor.NOMBRE} {asiento.creadoPor.APELLIDO}
              </p>
            )}
          </div>
        )}

        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
