import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";
import { Factura } from "../types/factura";
import { PrintPreviewModal } from './Ticket';
import { useTablePrint } from '../hooks/useTablePrint';
import AnularFacturaModal from '../modals/AnularFacturaModal';
import { useState } from 'react';
import { showSuccess, showError, showWarning } from '../../shared/utils/notifications';

type FacturacionTableProps = TableProps<Factura> & { 
    loading?: boolean;
    onFacturaAnulada?: () => void; // Callback cuando se anula una factura
};

export default function FacturacionTable({
    data,
    pagination,
    onPageChange,
    loading = false,
    onFacturaAnulada
}: FacturacionTableProps) {

    const {
        isPrintPreviewOpen,
        facturaToPrint,
        totalToPrint,
        handleOpenPrintPreview,
        handleClosePrintPreview,
        handlePrint
    } = useTablePrint();

    // Estados para el modal de anulación
    const [isAnularModalOpen, setIsAnularModalOpen] = useState(false);
    const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);
    const [isAnulando, setIsAnulando] = useState(false);

    // Función para abrir el modal de anulación
    const handleOpenAnularModal = (factura: Factura) => {
        if (factura.Estado !== 'AUTORIZADO') {
            showWarning(`No se puede anular una factura con estado "${factura.Estado}". Solo se pueden anular facturas autorizadas.`);
            return;
        }
        setFacturaSeleccionada(factura);
        setIsAnularModalOpen(true);
    };

    // Función para cerrar el modal
    const handleCloseAnularModal = () => {
        if (!isAnulando) {
            setIsAnularModalOpen(false);
            setFacturaSeleccionada(null);
        }
    };

    // Función para confirmar la anulación
    const handleConfirmarAnulacion = async () => {
        if (!facturaSeleccionada) return;

        setIsAnulando(true);

        try {
            // Importar dinámicamente el servicio
            const { anularFactura } = await import('../services/factura.service');
            const response = await anularFactura(facturaSeleccionada.id);

            if (response.success) {
                setIsAnularModalOpen(false);
                setFacturaSeleccionada(null);
                
                // Mostrar notificación de éxito
                showSuccess(response.message || 'Factura anulada exitosamente');
                
                if (onFacturaAnulada) {
                    onFacturaAnulada();
                }
            } else {
                throw new Error(response.message || 'Error al anular la factura');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Error desconocido al anular la factura';
            
            // Mostrar notificación de error
            showError(errorMessage);
        } finally {
            setIsAnulando(false);
        }
    };

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
                onAnular={handleOpenAnularModal}
                showActions={true}
                showPrint={true}
                showAnular={true}
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
                    concepto: '',
                    tipoPago: ''
                }}
                total={totalToPrint}
                onClose={handleClosePrintPreview}
                onPrint={handlePrint}
                showVencimiento={false}
            />

            <AnularFacturaModal
                id="anular_factura_modal"
                isOpen={isAnularModalOpen}
                onClose={handleCloseAnularModal}
                onConfirm={handleConfirmarAnulacion}
                factura={facturaSeleccionada}
                isLoading={isAnulando}
            />
        </>
    );
}
