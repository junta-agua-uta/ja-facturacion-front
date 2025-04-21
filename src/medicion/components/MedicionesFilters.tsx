import { MedicionFilter } from "../types/medicion";


type Props = Readonly<{
  filters: MedicionFilter;
  onChange: (filters: MedicionFilter) => void;
  onClear: () => void;
}>;

export default function MedicionesFilters({ filters, onChange, onClear }: Props) {
  return (
    <form className="form-control gap-4 sm:flex sm:items-end">
      <div className="flex-1">
        <label className="label">
          <span className="label-text font-semibold">Filtros de búsqueda</span>
        </label>
        <input
          type="text"
          placeholder="Filtrar por número de medidor"
          className="input border border-gray-300 input-md w-full"
          value={filters.numeroMedidor ?? ''}
          onChange={(e) => onChange({ ...filters, numeroMedidor: e.target.value })}
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Desde:</span>
        </label>
        <input
          type="date"
          className="input border border-gray-300 input-md"
          value={filters.fechaDesde ?? ''}
          onChange={(e) => onChange({ ...filters, fechaDesde: e.target.value })}
        />
      </div>

      <div>
        <label className="label">
          <span className="label-text">Hasta:</span>
        </label>
        <input
          type="date"
          className="input border border-gray-300 input-md"
          value={filters.fechaHasta ?? ''}
          onChange={(e) => onChange({ ...filters, fechaHasta: e.target.value })}
        />
      </div>

      <div className="mt-6 sm:mt-0">
        <button
          type="button"
          onClick={onClear}
          className="btn btn-primary rounded-md"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
