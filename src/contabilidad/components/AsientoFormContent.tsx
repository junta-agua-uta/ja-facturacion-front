import type { LineaAsientoForm } from '../hooks/useAsientoForm'
import type { PlanCuentaRow } from '../types/planCuenta'
import CuentaSelect from './CuentaSelect'

type Props = {
  fetchingEdit: boolean
  loading: boolean
  fecha: string
  setFecha: (v: string) => void
  concepto: string
  setConcepto: (v: string) => void
  tipoMov: string
  setTipoMov: (v: string) => void
  comprobante: string
  setComprobante: (v: string) => void
  lineas: LineaAsientoForm[]
  cuentas: PlanCuentaRow[]
  addLinea: () => void
  removeLinea: (idx: number) => void
  updateLinea: (idx: number, patch: Partial<LineaAsientoForm>) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export default function AsientoFormContent({
  fetchingEdit,
  loading,
  fecha,
  setFecha,
  concepto,
  setConcepto,
  tipoMov,
  setTipoMov,
  comprobante,
  setComprobante,
  lineas,
  cuentas,
  addLinea,
  removeLinea,
  updateLinea,
  onSubmit,
  onCancel,
}: Props) {
  if (fetchingEdit) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="form-control">
          <span className="label-text font-medium">Fecha</span>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </label>
        <label className="form-control md:col-span-2">
          <span className="label-text font-medium">Tipo (referencia)</span>
          <select
            className="select select-bordered w-full"
            value={tipoMov}
            onChange={(e) => setTipoMov(e.target.value)}
          >
            <option value="MANUAL">Manual</option>
            <option value="VENTA">Venta</option>
            <option value="COMPRA">Compra</option>
          </select>
        </label>
      </div>

      <label className="form-control">
        <span className="label-text font-medium">Concepto</span>
        <textarea
          className="textarea textarea-bordered w-full min-h-[5rem]"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          placeholder="Descripción del asiento contable…"
          required
        />
      </label>

      <label className="form-control">
        <span className="label-text font-medium">Comprobante (opcional)</span>
        <input
          type="text"
          className="input input-bordered w-full"
          value={comprobante}
          onChange={(e) => setComprobante(e.target.value)}
          placeholder="Ej. F-001-123"
        />
      </label>

      <div className="divider">Líneas del asiento</div>

      <div className="space-y-3">
        {lineas.map((linea, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end border border-base-200 rounded-lg p-4 bg-base-200/40"
          >
            <label className="form-control lg:col-span-5">
              <span className="label-text text-xs font-medium">Cuenta</span>
              <CuentaSelect
                cuentas={cuentas}
                value={linea.cuentaId}
                onChange={(cuentaId) => updateLinea(idx, { cuentaId })}
              />
            </label>
            <label className="form-control lg:col-span-2">
              <span className="label-text text-xs font-medium">Debe</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input input-bordered w-full"
                value={linea.debe}
                onChange={(e) => updateLinea(idx, { debe: e.target.value })}
              />
            </label>
            <label className="form-control lg:col-span-2">
              <span className="label-text text-xs font-medium">Haber</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input input-bordered w-full"
                value={linea.haber}
                onChange={(e) => updateLinea(idx, { haber: e.target.value })}
              />
            </label>
            <label className="form-control lg:col-span-2">
              <span className="label-text text-xs font-medium">Referencia</span>
              <input
                type="text"
                className="input input-bordered w-full"
                value={linea.referencia}
                onChange={(e) => updateLinea(idx, { referencia: e.target.value })}
              />
            </label>
            <div className="lg:col-span-1 flex justify-end pb-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm text-error"
                disabled={lineas.length <= 2}
                onClick={() => removeLinea(idx)}
                title="Quitar línea"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-outline btn-sm" onClick={addLinea}>
        + Añadir línea
      </button>

      {cuentas.length < 2 && (
        <p className="text-sm text-warning">
          Se necesitan al menos dos cuentas de detalle en el plan de cuentas para guardar.
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-base-200">
        <button type="button" className="btn btn-outline min-w-[7rem]" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary min-w-[7rem]" disabled={loading || cuentas.length < 2}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
