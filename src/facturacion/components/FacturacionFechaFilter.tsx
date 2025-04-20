import { FacturacionFechaEmisionFilter } from "../types/factura";

type Props = Readonly<{
    filters: FacturacionFechaEmisionFilter;
    onChange: (filters: FacturacionFechaEmisionFilter) => void;
}>;

export default function FacturacionFechaFilter({ filters, onChange }: Props) {
    return (
        <div className="flex gap-4">
            <div className="flex-1 space-y-2">
                <label className="label font-bold">
                    <span className="label-text">Desde:</span>
                </label>
                <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filters.FechaEmisionDesde.toISOString().split('T')[0]}
                    onChange={(e) => onChange({
                        ...filters,
                        FechaEmisionDesde: new Date(e.target.value)
                    })}
                />
            </div>
            <div className="flex-1 space-y-2">
                <label className="label">
                    <span className="label-text font-bold">Hasta:</span>
                </label>
                <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filters.FechaEmisionHasta.toISOString().split('T')[0]}
                    onChange={(e) => onChange({
                        ...filters,
                        FechaEmisionHasta: new Date(e.target.value)
                    })}
                />
            </div>
        </div>
    );
} 