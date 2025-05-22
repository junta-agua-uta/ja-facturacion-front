import { BranchFilter } from "../types/sucursal";

type Props = Readonly<{
  filters: BranchFilter;
  onChange: (filters: BranchFilter) => void;
  onClear: () => void;
}>;

export default function BranchFilters({ filters, onChange, onClear }: Props) {
  return (

    <form className="form-control space-y-4">
      <br></br>
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre de la sucursal"
          className="input border border-gray-300 input-md"
          value={filters.nombre ?? ''}
          onChange={(e) => onChange({ ...filters, nombre: e.target.value })}
        />

          <button
            type="button"
            onClick={onClear}
            className="btn btn-outline btn-primary bg-primary hover:bg-blue-500 text-white font-semibold border-0 rounded-md shadow-sm hover:shadow-lg transition duration-200 ease-in-out px-4 py-2 mx-2"
          >
            Limpiar filtros
          </button>
        </div>

    </form>

  );
}
