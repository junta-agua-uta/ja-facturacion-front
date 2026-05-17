import { FaEdit, FaTrash } from 'react-icons/fa'
import LibroDiarioEstadoBadge from './LibroDiarioEstadoBadge'
import { formatMoney } from '../utils/asientoUi'
import type { LibroDiarioRow } from '../types/libroDiario'

type Props = {
  rows: LibroDiarioRow[]
  loading?: boolean
  enriching?: boolean
  onEditar: (id: number) => void
  onEliminar: (id: number) => void
}

function fechaLibro(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function LibroDiarioTable({
  rows,
  loading,
  enriching,
  onEditar,
  onEliminar,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="table w-full">
        <thead>
          <tr className="bg-primary text-primary-content hover:bg-primary">
            <th>Fecha</th>
            <th>Comprobante</th>
            <th>Concepto</th>
            <th className="text-right">Debe</th>
            <th className="text-right">Haber</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-500">
                No hay registros que coincidan con los filtros.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const desc = Number(row.descuadre)
              const tieneDescuadre = Number.isFinite(desc) && Math.abs(desc) >= 0.005
              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap text-gray-700">{fechaLibro(row.fecha)}</td>
                  <td className="font-mono text-sm font-medium text-primary">{row.comprobanteLabel}</td>
                  <td className="max-w-xs truncate text-gray-700" title={row.concepto}>
                    {row.concepto}
                  </td>
                  <td className="text-right tabular-nums">
                    {enriching && row.totalDebe == null ? (
                      <span className="loading loading-dots loading-xs" />
                    ) : row.totalDebe != null ? (
                      <span className={tieneDescuadre ? 'text-amber-700 font-medium' : ''}>
                        {formatMoney(row.totalDebe)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-right tabular-nums">
                    {enriching && row.totalHaber == null ? (
                      <span className="loading loading-dots loading-xs" />
                    ) : row.totalHaber != null ? (
                      <span className={tieneDescuadre ? 'text-amber-700 font-medium' : ''}>
                        {formatMoney(row.totalHaber)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <LibroDiarioEstadoBadge value={row.estado} />
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-outline border-primary text-primary"
                        title="Editar"
                        disabled={row.estado !== 'PENDIENTE'}
                        onClick={() => onEditar(row.id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-circle text-red-600 hover:bg-red-50"
                        title="Eliminar"
                        disabled={row.estado !== 'PENDIENTE'}
                        onClick={() => onEliminar(row.id)}
                      >
                        <FaTrash />
                      </button>
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
