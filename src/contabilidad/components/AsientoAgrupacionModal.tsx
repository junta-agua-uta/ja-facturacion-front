import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { FaCalendarAlt, FaCalendarDay, FaInfoCircle, FaLayerGroup } from 'react-icons/fa'
import type { PeriodoContable } from '../types/periodo'

export type ModoAsientos = 'INDIVIDUAL' | 'DIARIO' | 'MENSUAL'

type AgrupacionResult = Promise<void>

type Props = {
  id: string
  modoAsientos: ModoAsientos
  periodoActual: PeriodoContable | null
  loading: boolean
  onClose: () => void
  onAgruparDia: (fecha: string) => AgrupacionResult
  onAgruparPeriodo: () => AgrupacionResult
}

const todayInputValue = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 10)
}

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(new Date(value))
}

const modoCopy: Record<ModoAsientos, { label: string; detail: string }> = {
  INDIVIDUAL: {
    label: 'Individual',
    detail: 'Las facturas autorizadas generan su propio asiento automaticamente.',
  },
  DIARIO: {
    label: 'Diario',
    detail: 'Agrupa las facturas autorizadas de una fecha en un solo asiento resumen.',
  },
  MENSUAL: {
    label: 'Mensual',
    detail: 'Agrupa las facturas del periodo contable seleccionado en un solo asiento resumen.',
  },
}

export default function AsientoAgrupacionModal({
  id,
  modoAsientos,
  periodoActual,
  loading,
  onClose,
  onAgruparDia,
  onAgruparPeriodo,
}: Props) {
  const [fecha, setFecha] = useState(todayInputValue)
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => {
    setLocalError(null)
  }, [modoAsientos])

  const modoInfo = modoCopy[modoAsientos]

  const actionLabel = useMemo(() => {
    if (modoAsientos === 'DIARIO') return 'Agrupar dia'
    if (modoAsientos === 'MENSUAL') return 'Agrupar periodo'
    return 'Agrupacion no disponible'
  }, [modoAsientos])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (modoAsientos === 'INDIVIDUAL') {
      setLocalError('La empresa esta en modo individual. Cambie el modo en Empresa para usar agrupacion.')
      return
    }

    if (modoAsientos === 'DIARIO') {
      if (!fecha) {
        setLocalError('Seleccione la fecha que desea agrupar.')
        return
      }
      await onAgruparDia(fecha)
      return
    }

    if (!periodoActual) {
      setLocalError('Seleccione un periodo contable antes de agrupar.')
      return
    }

    await onAgruparPeriodo()
  }

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-2xl overflow-hidden p-0">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-blue-900">
              <FaLayerGroup className="shrink-0" />
              <h3 className="text-xl font-bold text-gray-800">Agrupar facturas autorizadas</h3>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              El tipo de agrupacion se toma del modo configurado en la empresa.
            </p>
          </div>
          <form method="dialog">
            <button type="button" className="btn btn-sm btn-circle btn-ghost" aria-label="Cerrar" onClick={onClose}>
              x
            </button>
          </form>
        </div>

        <div className="p-6">
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-3">
                <FaInfoCircle className="mt-1 shrink-0 text-blue-900" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-800/80">
                    Modo de asientos
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{modoInfo.detail}</p>
                </div>
              </div>
              <span className="badge badge-primary whitespace-nowrap">{modoInfo.label}</span>
            </div>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {modoAsientos === 'DIARIO' && (
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-semibold">Fecha a agrupar</span>
                </div>
                <div className="join w-full">
                  <span className="join-item flex items-center border border-base-300 bg-base-200 px-4 text-blue-900">
                    <FaCalendarDay />
                  </span>
                  <input
                    type="date"
                    className="input input-bordered join-item w-full"
                    value={fecha}
                    onChange={(event) => setFecha(event.target.value)}
                  />
                </div>
              </label>
            )}

            {modoAsientos === 'MENSUAL' && (
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <FaCalendarAlt className="text-blue-900" />
                  <span>Periodo seleccionado</span>
                </div>
                {periodoActual ? (
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-gray-500">Nombre</p>
                      <p className="font-medium text-gray-800">{periodoActual.nombre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Desde</p>
                      <p className="font-medium text-gray-800">{formatDate(periodoActual.fechaInicio)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hasta</p>
                      <p className="font-medium text-gray-800">{formatDate(periodoActual.fechaFin)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-warning">No hay un periodo contable seleccionado.</p>
                )}
              </div>
            )}

            {modoAsientos === 'INDIVIDUAL' && (
              <div role="alert" className="alert border-blue-100 bg-blue-50 text-slate-700">
                <span>No hay acciones por lote para este modo.</span>
              </div>
            )}

            {localError && (
              <div role="alert" className="alert alert-error">
                <span>{localError}</span>
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || modoAsientos === 'INDIVIDUAL'}
              >
                {loading && <span className="loading loading-spinner loading-sm" />}
                {actionLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}
