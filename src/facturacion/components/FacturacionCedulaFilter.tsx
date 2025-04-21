import { FacturacionCedula } from "../types/factura";

type Props = Readonly<{
    filters: FacturacionCedula;
    onChange: (filters: FacturacionCedula) => void;
}>;

export default function FacturacionCedulaFilter({ filters, onChange }: Props) {
    return (
        <div>
            <input
                type="text"
                placeholder="Buscar por número de cedula"
                className="input input-bordered w-full"
                value={filters.Cedula ?? ''}
                onChange={(e) => onChange({ ...filters, Cedula: e.target.value })}
            />
        </div>
    );
}
