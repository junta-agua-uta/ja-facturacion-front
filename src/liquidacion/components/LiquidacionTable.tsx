import { LiquidacionForm } from "../types/liquidacion";
import { PrintPreviewModal } from "./Ticket";
import { useTablePrint } from "../hooks/useTablePrint";

interface Pagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

interface LiquidacionTableProps {
  data: LiquidacionForm[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function LiquidacionTable({
  data,
  loading,
  pagination,
  onPageChange,
}: LiquidacionTableProps) {
  const {
    isPrintPreviewOpen,
    liquidacionToPrint,
    totalToPrint,
    handleOpenPrintPreview,
    handleClosePrintPreview,
    handlePrint,
  } = useTablePrint();

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) onPageChange(pagination.currentPage - 1);
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) onPageChange(pagination.currentPage + 1);
  };

  return (
    <>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre Comercial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cédula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Emisión
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600" />
                    <span className="ml-2">Cargando liquidaciones...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aún no se han creado Liquidaciones de compra.
                </td>
              </tr>
            ) : (
              data.map((liquidacion) => (
                <tr key={liquidacion.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{liquidacion.razonSocialProveedor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{liquidacion.identificacionProveedor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{liquidacion.fechaEmision}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">${liquidacion.importeTotal?.toFixed(2) ?? "0.00"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{liquidacion.estadoSri}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenPrintPreview(liquidacion)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Imprimir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-700">
            Mostrando {data.length} de {pagination.totalItems} liquidaciones
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-700">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        formData={liquidacionToPrint || {
          cliente: "",
          cedula: "",
          emision: "",
          total: 0,
          autorizacion: "",
        }}
        total={totalToPrint}
        onClose={handleClosePrintPreview}
        onPrint={handlePrint}
        showVencimiento={false}
      />
    </>
  );
}
