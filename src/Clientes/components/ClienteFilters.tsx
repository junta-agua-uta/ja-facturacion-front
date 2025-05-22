import { ClienteFilter } from "../types/cliente";

type Props = Readonly<{
  filters: ClienteFilter;
  onChange: (filters: ClienteFilter) => void;
  onClear: () => void;
}>;

export default function ClienteFilters({ filters, onChange, onClear }: Props) {
  // Limpiar el otro campo cuando se ingresa texto en un campo
  const handleIdentificacionChange = (value: string) => {
    onChange({ ...filters, identificacion: value, razonSocial: '' });
  };

  const handleRazonSocialChange = (value: string) => {
    onChange({ ...filters, razonSocial: value, identificacion: '' });
  };

  return (
    <form className="form-control space-y-4">
      <br />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-blue-900">Número de cédula:</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar por cédula"
              className="input border border-gray-300 input-md w-full"
              value={filters.identificacion ?? ''}
              onChange={(e) => handleIdentificacionChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-blue-900">Razón social:</label>
          <div className="mt-2">
            <input
              type="text"
              placeholder="Buscar por razón social"
              className="input border border-gray-300 input-md w-full"
              value={filters.razonSocial ?? ''}
              onChange={(e) => handleRazonSocialChange(e.target.value)}
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