import { ConceptoFilter } from "../types/concepto";

type Props = Readonly<{
  filters: ConceptoFilter;
  onChange: (filters: ConceptoFilter) => void;
  onClear: () => void;
}>;

export default function ConceptoFilters({ filters, onChange, onClear }: Props) {
  // Limpiar los otros campos cuando se ingresa texto en un campo
  const handleDescripcionChange = (value: string) => {
    onChange({ ...filters, desc: value, codigo: '', codInterno: '' });
  };

  const handleCodigoChange = (value: string) => {
    onChange({ ...filters, codigo: value, desc: '', codInterno: '' });
  };

  const handleCodInternoChange = (value: string) => {
    onChange({ ...filters, codInterno: value, desc: '', codigo: '' });
  };

  return (
    <form className="form-control space-y-4">
      <br />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-blue-900">Descripción:</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar por descripción"
              className="input border border-gray-300 input-md w-full"
              value={filters.desc ?? ''}
              onChange={(e) => handleDescripcionChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-blue-900">Código:</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar por código"
              className="input border border-gray-300 input-md w-full"
              value={filters.codigo ?? ''}
              onChange={(e) => handleCodigoChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-blue-900">Código Interno:</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar por código interno"
              className="input border border-gray-300 input-md w-full"
              value={filters.codInterno ?? ''}
              onChange={(e) => handleCodInternoChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="btn btn-outline btn-primary bg-primary hover:bg-blue-500 text-white font-semibold border-0 rounded-md shadow-sm hover:shadow-lg transition duration-200 ease-in-out px-4 py-2"
        >
          Limpiar filtros
        </button>
      </div>
    </form>
  );
}
