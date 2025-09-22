import { LiquidacionCedula } from "../types/liquidacion";

type Props = Readonly<{
    filters: LiquidacionCedula;
    onChange: (filters: LiquidacionCedula) => void;
}>;

export default function LiquidacionCedulaFilter({ filters, onChange }: Props) {
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
