import { ClienteFilter } from "../types/cliente";

type Props = Readonly<{
  filters: ClienteFilter;
  onChange: (filters: ClienteFilter) => void;
  onClear: () => void;
}>;

export default function ClienteFilters({ filters, onChange, onClear }: Props) {
  return (
    <form className="form-control space-y-4">
      <br />
      <div>
        <label className="block text-blue-900">Número de cédula o razón social:</label>
        <div className="flex gap-4 mt-2">
          <input
            type="text"
            placeholder="Buscar por cédula o razón social"
            className="input border border-gray-300 input-md w-full"
            value={filters.identificacion ?? ''}
            onChange={(e) => onChange({ ...filters, identificacion: e.target.value })}
          />
          
          <button
            type="button"
            onClick={onClear}
            className="btn btn-outline btn-primary bg-primary hover:bg-blue-500 text-white font-semibold border-0 rounded-md shadow-sm hover:shadow-lg transition duration-200 ease-in-out px-4 py-2"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </form>
  );
}