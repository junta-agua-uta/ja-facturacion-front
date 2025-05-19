import React, { useCallback, memo } from "react";

export interface ConceptoCobro {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  descuento: number;
  iva: number;
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
    iva: +(subtotal * 0.15),
    total: +(subtotal + subtotal * 0.15)
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
          type="text"
          className="input input-bordered w-20"
          value={concepto.cantidad === 0 ? "" : concepto.cantidad}
          onChange={e => {
            const val = parseFloat(e.target.value);
            onEdit(index, "cantidad", isNaN(val) ? 0 : val);
          }}
        />
      </td>
      <td>
        <input
          type="text"
          className="input input-bordered w-24"
          value={concepto.precio === 0 ? "" : concepto.precio}
          onChange={e => {
            const val = parseFloat(e.target.value);
            onEdit(index, "precio", isNaN(val) ? 0 : val);
          }}
        />
      </td>
      <td>
        <input
          type="text"
          className="input input-bordered w-20"
          value={concepto.descuento === 0 ? "" : concepto.descuento}
          onChange={e => {
            const val = parseFloat(e.target.value);
            onEdit(index, "descuento", isNaN(val) ? 0 : val);
          }}
        />
      </td>
      <td>{concepto.iva.toFixed(2)}</td>
      <td>{concepto.total.toFixed(2)}</td>
      <td>
        <button
          type="button"
          className="btn btn-error btn-xs"
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
  <thead>
    <tr>
      <th>Código</th>
      <th>Descripción</th>
      <th>Cantidad</th>
      <th>Precio</th>
      <th>Descuento</th>
      <th>IVA (15%)</th>
      <th>Total</th>
      <th></th>
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
    <div className="overflow-x-auto mt-8">
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
  );
};

export default memo(TablaConceptos);
