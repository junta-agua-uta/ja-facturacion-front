import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";
import { LiquidacionForm } from "../types/liquidacion";
import { PrintPreviewModal } from './Ticket';
import { useTablePrint } from '../hooks/useTablePrint';

type LiquidacionTableProps = TableProps<LiquidacionForm> & { loading?: boolean };

export default function LiquidacionTable({
  data,
  pagination,
  onPageChange,
  loading = false
}: LiquidacionTableProps) {

  const {
    isPrintPreviewOpen,
    liquidacionToPrint,
    totalToPrint,
    handleOpenPrintPreview,
    handleClosePrintPreview,
    handlePrint
  } = useTablePrint();

  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };


  const columns = [
    { header: 'Nombre Comercial', accessor: 'razonSocialProveedor' as const },
    { header: 'Cédula', accessor: 'identificacionProveedor' as const },
    {
      header: 'Fecha Emisión',
      accessor: 'fechaEmision' as const,
      Cell: ({ value }: { value: string }) => formatDate(value)
    },

    { header: 'Total', accessor: 'importeTotal' as const, Cell: ({ value }: { value: number }) => `$${value?.toFixed(2) ?? '0.00'}` },
    { header: 'Estado', accessor: 'estadoSri' as const }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-32">
        <div className="loader mb-2"
          style={{
            border: '4px solid #f3f3f3',
            borderRadius: '50%',
            borderTop: '4px solid #3498db',
            width: '32px',
            height: '32px',
            animation: 'spin 1s linear infinite'
          }}
        />
        <span>Cargando liquidaciones...</span>
      </div>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-32 text-gray-500">
        Aún no se han creado liquidaciones.
      </div>
    );
  }

  return (
    <>
      <Table
        data={data}
        columns={columns}
        pagination={pagination}
        onPageChange={onPageChange}
        onPrint={handleOpenPrintPreview}
        showActions={true}
        showPrint={true}
      />

      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        formData={liquidacionToPrint || {
          cliente: '',
          cedula: '',
          emision: '',
          total: 0,
          autorizacion: ''
        }}
        total={totalToPrint}
        onClose={handleClosePrintPreview}
        onPrint={handlePrint}
        showVencimiento={false}
      />
    </>
  );
}
