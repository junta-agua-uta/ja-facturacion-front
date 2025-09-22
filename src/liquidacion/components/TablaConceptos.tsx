import React, { useCallback, memo } from "react";

export interface ConceptoCobro {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  subtotal: number;
  total: number;
}

interface TablaConceptosProps {
  conceptos: ConceptoCobro[];
  onChange: (index: number, updated: ConceptoCobro) => void;
  onDelete: (index: number) => void;
}

const recalcularConcepto = (concepto: ConceptoCobro): ConceptoCobro => {
  const subtotal = (concepto.precio - concepto.descuento) * concepto.cantidad;
  return {
    ...concepto,
    subtotal: +subtotal,
    total: +subtotal
  };
};

const ConceptoRow = memo(({ 
  concepto, 
  index, 
  onEdit, 
  onDelete 
}: { 
  concepto: ConceptoCobro; 
  index: number; 
  onEdit: (index: number, field: keyof ConceptoCobro, value: number) => void; 
  onDelete: (index: number) => void; 
}) => {
  return (
    <tr>
      <td>{concepto.codigo}</td>
      <td>{concepto.descripcion}</td>
      <td>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          className="input input-bordered w-20"
          value={concepto.cantidad === 0 ? "" : concepto.cantidad}
          onChange={e => {
            const val = e.target.value;
            if (val === "") {
              onEdit(index, "cantidad", 0);
              return;
            }
            let num = parseFloat(val);
            if (isNaN(num) || num < 0) num = 0;
            onEdit(index, "cantidad", num);
          }}
        />
      </td>
      <td>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          className="input input-bordered w-24"
          value={concepto.precio === 0 ? "" : concepto.precio}
          onChange={e => {
            const val = e.target.value;
            if (val === "") {
              onEdit(index, "precio", 0);
              return;
            }
            let num = parseFloat(val);
            if (isNaN(num) || num < 0) num = 0;
            onEdit(index, "precio", num);
          }}
        />
      </td>
      <td>
        <input
          type="number"
          step="any"
          inputMode="decimal"
          className="input input-bordered w-20"
          value={concepto.descuento === 0 ? "" : concepto.descuento}
          onChange={e => {
            const val = e.target.value;
            if (val === "") {
              onEdit(index, "descuento", 0);
              return;
            }
            let num = parseFloat(val);
            if (isNaN(num) || num < 0) num = 0;
            onEdit(index, "descuento", num);
          }}
        />
      </td>
      <td>{concepto.total.toFixed(2)}</td>
      <td>
        <button
          type="button"
          className="btn btn-error btn-xs text-white"
          onClick={() => onDelete(index)}
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
});

ConceptoRow.displayName = 'ConceptoRow';

const EmptyRow = () => (
  <tr>
    <td colSpan={8} className="text-center text-gray-400">No hay conceptos agregados</td>
  </tr>
);

const TableHeader = () => (
  <thead className="sticky top-0 bg-base-200 z-10">
    <tr>
      <th>Código</th>
      <th>Descripción</th>
      <th>Cantidad</th>
      <th>Precio</th>
      <th>Descuento</th>
      <th>Total</th>
      <th>Acciones</th>
    </tr>
  </thead>
);

export const TablaConceptos: React.FC<TablaConceptosProps> = ({ conceptos, onChange, onDelete }) => {
  const handleEdit = useCallback((index: number, field: keyof ConceptoCobro, value: number) => {
    const concepto = conceptos[index];
    const updated = { ...concepto, [field]: value };

    if (field === "cantidad" || field === "precio" || field === "descuento") {
      onChange(index, recalcularConcepto(updated));
    } else {
      onChange(index, updated);
    }
  }, [conceptos, onChange]);

  return (
    <div className="mt-8 w-full">
      <div className="max-h-[280px] overflow-y-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="table w-full">
            <TableHeader />
            <tbody>
              {conceptos.length === 0 ? (
                <EmptyRow />
              ) : (
                conceptos.map((concepto, idx) => (
                  <ConceptoRow 
                    key={`${concepto.codigo}-${idx}`}
                    concepto={concepto}
                    index={idx}
                    onEdit={handleEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default memo(TablaConceptos);
