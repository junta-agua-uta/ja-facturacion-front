import { FaEye, FaEdit, FaTrash } from 'react-icons/fa'
import type { AsientoListItem } from '../types/asiento'
import StatusBadge from './StatusBadge'
import TipoMovimientoBadge from './TipoMovimientoBadge'
import { codigoAsientoVisual, formatMoney, inferTipoMovimiento } from '../utils/asientoUi'
import type { TipoMovimientoUi } from '../types/asiento'

export type AsientoRowVm = AsientoListItem

type Props = {
  rows: AsientoRowVm[]
  loading?: boolean
  onVer: (id: number) => void
  onEditar: (id: number) => void
  onEliminar: (id: number) => void
}

function fechaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function AsientosTable({ rows, loading, onVer, onEditar, onEliminar }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-base-300 rounded-lg">
      <table className="table table-zebra w-full">
        <thead className="bg-primary text-primary-content">
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th className="text-right">Descuadre</th>
            <th className="text-center w-40">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-base-content/60">
                No hay asientos que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const tipo = inferTipoMovimiento(row.modelo, row.comprobante) as TipoMovimientoUi
              const desc = Number(row.descuadre)
              const descLabel =
                Number.isFinite(desc) && Math.abs(desc) < 0.005 ? (
                  <span className="text-success font-medium">Cuadrado</span>
                ) : (
                  <span className="text-warning font-medium tabular-nums">{formatMoney(desc)}</span>
                )
              return (
                <tr key={row.id}>
                  <td className="font-mono font-medium">{codigoAsientoVisual(row)}</td>
                  <td>{fechaCorta(row.fecha)}</td>
                  <td className="max-w-xs truncate" title={row.concepto}>
                    {row.concepto}
                  </td>
                  <td>
                    <TipoMovimientoBadge tipo={tipo} />
                  </td>
                  <td>
                    <StatusBadge kind="asiento" value={row.estado} />
                  </td>
                  <td className="text-right">{descLabel}</td>
                  <td>
                    <div className="flex flex-wrap justify-center gap-1">
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-primary text-primary-content"
                        title="Ver detalle"
                        onClick={() => onVer(row.id)}
                      >
                        <FaEye />
                      </button>
                      {row.estado === 'PENDIENTE' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-xs btn-circle btn-outline border-primary text-primary"
                            title="Editar borrador"
                            onClick={() => onEditar(row.id)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="btn btn-xs btn-circle btn-outline btn-error"
                            title="Eliminar"
                            onClick={() => onEliminar(row.id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
