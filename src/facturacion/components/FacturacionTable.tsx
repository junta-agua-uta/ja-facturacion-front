import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";
import { Factura } from "../types/factura";
import { PrintPreviewModal } from './Ticket';
import { useTablePrint } from '../hooks/useTablePrint';

type FacturacionTableProps = TableProps<Factura> & { loading?: boolean };

export default function FacturacionTable({
    data,
    pagination,
    onPageChange,
    loading = false
}: FacturacionTableProps) {

    const {
        isPrintPreviewOpen,
        facturaToPrint,
        totalToPrint,
        handleOpenPrintPreview,
        handleClosePrintPreview,
        handlePrint
    } = useTablePrint();

    const formatDate = (date: Date) => {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const columns = [
        { header: 'Nombre Comercial', accessor: 'NombreComercial' as const },
        { header: 'Cédula', accessor: 'Cedula' as const },
        { header: 'Concepto', accessor: 'Concepto' as const },
        {
            header: 'Fecha Emisión',
            accessor: 'FechaEmision' as const,
            Cell: ({ value }: { value: Date }) => formatDate(value)
        },
        { header: 'Total', accessor: 'Total' as const },
        { header: 'Estado', accessor: 'Estado' as const },
        { header: 'Sucursal', accessor: 'Sucursal' as const },
        { header: 'Usuario', accessor: 'Usuario' as const }
    ];

    // Loader dentro de la tabla
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
                <span>Cargando facturas...</span>
            </div>
        );
    }


    if (data.length === 0 && !loading) {
        return (
            <div className="flex justify-center items-center h-32 text-gray-500">
                Aún no se han creado facturas.
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
                formData={facturaToPrint || {
                    cedula: '',
                    cliente: '',
                    codigo: '',
                    emision: '',
                    vencimiento: '',
                    serie: '',
                    numero: '',
                    secuencia: '',
                    concepto: ''
                }}
                total={totalToPrint}
                onClose={handleClosePrintPreview}
                onPrint={handlePrint}
                showVencimiento={false}
            />
        </>
    );
}
