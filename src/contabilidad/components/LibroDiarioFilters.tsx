import { FaSearch } from 'react-icons/fa'

export type LibroDiarioFiltersState = {
  buscar: string
  fechaDesde: string
  fechaHasta: string
  estado: '' | 'PENDIENTE' | 'APROBADO'
}

type Props = {
  filters: LibroDiarioFiltersState
  onChange: (next: LibroDiarioFiltersState) => void
  onClear: () => void
}

export default function LibroDiarioFilters({ filters, onChange, onClear }: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
      <label className="form-control min-w-0 flex-1 lg:min-w-[14rem]">
        <span className="label-text mb-1 text-sm font-medium text-gray-600">Buscador</span>
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Comprobante o concepto"
            className="input input-bordered w-full pl-10"
            value={filters.buscar}
            onChange={(e) => onChange({ ...filters, buscar: e.target.value })}
          />
        </div>
      </label>

      <label className="form-control min-w-0 w-full sm:w-auto sm:min-w-[10rem]">
        <span className="label-text mb-1 text-sm font-medium text-gray-600">Desde</span>
        <input
          type="date"
          className="input input-bordered w-full"
          value={filters.fechaDesde}
          onChange={(e) => onChange({ ...filters, fechaDesde: e.target.value })}
        />
      </label>

      <label className="form-control min-w-0 w-full sm:w-auto sm:min-w-[10rem]">
        <span className="label-text mb-1 text-sm font-medium text-gray-600">Hasta</span>
        <input
          type="date"
          className="input input-bordered w-full"
          value={filters.fechaHasta}
          onChange={(e) => onChange({ ...filters, fechaHasta: e.target.value })}
        />
      </label>

      <label className="form-control min-w-0 w-full sm:w-auto sm:min-w-[11rem]">
        <span className="label-text mb-1 text-sm font-medium text-gray-600">Estados</span>
        <select
          className="select select-bordered w-full"
          value={filters.estado}
          onChange={(e) =>
            onChange({
              ...filters,
              estado: e.target.value as LibroDiarioFiltersState['estado'],
            })
          }
        >
          <option value="">Todos</option>
          <option value="APROBADO">Contabilizado</option>
          <option value="PENDIENTE">Pendiente</option>
        </select>
      </label>

      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        onClick={onClear}
      >
        Limpiar filtros
      </button>
    </div>
  )
}
