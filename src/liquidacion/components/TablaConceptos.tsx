import { ConceptoCobro } from "../types/liquidacion";

interface TablaConceptosProps {
  conceptos: ConceptoCobro[];
  onChange: (idx: number, updated: ConceptoCobro) => void;
  onDelete: (idx: number) => void;
}

export const TablaConceptos: React.FC<TablaConceptosProps> = ({
  conceptos,
  onChange,
  onDelete,
}) => {
  const handleInputChange = (
    idx: number,
    field: keyof ConceptoCobro,
    value: any
  ) => {
    const updated = { ...conceptos[idx], [field]: value };
    updated.precioTotalSinImpuesto = (updated.precioUnitario - updated.descuento) * updated.cantidad;
    updated.baseImponible = updated.precioTotalSinImpuesto;
    updated.valorImpuesto = updated.baseImponible * (updated.tarifaImpuesto / 100);
    onChange(idx, updated);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Principal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Auxiliar</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad Medida</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Total Sin Imp.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código Impuesto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cód. % Impuesto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarifa Impuesto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Imponible</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Impuesto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {conceptos.map((concepto, idx) => (
            <tr key={idx} className="hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.codigoPrincipal}
                  onChange={(e) => handleInputChange(idx, "codigoPrincipal", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.codigoAuxiliar || ""}
                  onChange={(e) => handleInputChange(idx, "codigoAuxiliar", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.descripcion}
                  onChange={(e) => handleInputChange(idx, "descripcion", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.unidadMedida || ""}
                  onChange={(e) => handleInputChange(idx, "unidadMedida", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={concepto.cantidad}
                  onChange={(e) => handleInputChange(idx, "cantidad", +e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={concepto.precioUnitario}
                  onChange={(e) => handleInputChange(idx, "precioUnitario", +e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={concepto.descuento}
                  onChange={(e) => handleInputChange(idx, "descuento", +e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{concepto.precioTotalSinImpuesto.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.codigoImpuesto}
                  onChange={(e) => handleInputChange(idx, "codigoImpuesto", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="text"
                  value={concepto.codigoPorcentajeImpuesto}
                  onChange={(e) => handleInputChange(idx, "codigoPorcentajeImpuesto", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="number"
                  value={concepto.tarifaImpuesto}
                  onChange={(e) => handleInputChange(idx, "tarifaImpuesto", +e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{concepto.baseImponible.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">{concepto.valorImpuesto.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onDelete(idx)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};