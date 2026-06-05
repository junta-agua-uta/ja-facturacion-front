import { FaSearch, FaFilter } from 'react-icons/fa'
import type { TipoMovimientoUi } from '../types/asiento'

export type AsientosFiltersState = {
  buscar: string
  estado: '' | 'PENDIENTE' | 'APROBADO'
  tipo: '' | TipoMovimientoUi
}

type Props = {
  filters: AsientosFiltersState
  onChange: (next: AsientosFiltersState) => void
  onClear: () => void
}

export default function AsientosFilters({ filters, onChange, onClear }: Props) {
  return (
    <div className="flex flex-col gap-4 min-w-0 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-4 lg:gap-y-3">
      <label className="form-control min-w-0 lg:col-span-5">
        <span className="label-text text-sm font-medium text-base-content/70 mb-1 flex items-center gap-2">
          <FaSearch className="opacity-60 shrink-0" aria-hidden />
          Búsqueda
        </span>
        <input
          type="search"
          placeholder="Buscar por concepto, nombre o comprobante…"
          className="input input-bordered w-full min-w-0"
          value={filters.buscar}
          onChange={(e) => onChange({ ...filters, buscar: e.target.value })}
        />
      </label>

      <label className="form-control min-w-0 w-full sm:max-w-[14rem] lg:max-w-none lg:col-span-2">
        <span className="label-text text-sm font-medium text-base-content/70 mb-1 flex items-center gap-2">
          <FaFilter className="opacity-60 shrink-0" aria-hidden />
          Estado
        </span>
        <select
          className="select select-bordered w-full min-w-0"
          value={filters.estado}
          onChange={(e) =>
            onChange({
              ...filters,
              estado: e.target.value as AsientosFiltersState['estado'],
            })
          }
        >
          <option value="">Todos</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
        </select>
      </label>

      <label className="form-control min-w-0 w-full sm:max-w-[14rem] lg:max-w-none lg:col-span-2">
        <span className="label-text text-sm font-medium text-base-content/70 mb-1">Tipo</span>
        <select
          className="select select-bordered w-full min-w-0"
          value={filters.tipo}
          onChange={(e) =>
            onChange({
              ...filters,
              tipo: e.target.value as AsientosFiltersState['tipo'],
            })
          }
        >
          <option value="">Todos</option>
          <option value="INGRESO">Ingreso</option>
          <option value="EGRESO">Egreso</option>
          <option value="DIARIO">Diario</option>
        </select>
      </label>

      <div className="flex min-w-0 lg:col-span-3 lg:justify-end">
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full sm:w-auto shrink-0"
          onClick={onClear}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
