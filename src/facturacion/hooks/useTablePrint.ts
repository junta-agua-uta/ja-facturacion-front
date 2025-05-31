import { useState } from 'react';
import { FacturaForm } from '../../shared/components/interfaces/factura.interface';

interface TablePrintState {
  isPrintPreviewOpen: boolean;
  facturaToPrint: FacturaForm | null;
  totalToPrint: number;
}

export const useTablePrint = () => {
  const [printState, setPrintState] = useState<TablePrintState>({
    isPrintPreviewOpen: false,
    facturaToPrint: null,
    totalToPrint: 0
  });

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenPrintPreview = (factura: any) => {
    // Conversión segura sin depender de propiedades que puedan faltar
    const facturaForm: FacturaForm = {
      cedula: factura.Cedula || '',
      cliente: factura.NombreComercial || '',
      emision: factura.FechaEmision ? formatDate(factura.FechaEmision) : '',
      concepto: factura.Concepto || '',
      serie: '', // Valor por defecto ya que no podemos acceder a factura.Serie
      numero: '', // Valor por defecto
      secuencia: '', // Valor por defecto
      vencimiento: '', // Valor por defecto
      codigo: '' // Valor por defecto
    };

    setPrintState({
      isPrintPreviewOpen: true,
      facturaToPrint: facturaForm,
      totalToPrint: typeof factura.Total === 'string' 
        ? parseFloat(factura.Total) || 0 
        : factura.Total || 0
    });
  };

  const handleClosePrintPreview = () => {
    setPrintState(prev => ({ ...prev, isPrintPreviewOpen: false }));
  };

  const handlePrint = () => {
    setPrintState(prev => ({ ...prev, isPrintPreviewOpen: false }));
  };

  return {
    ...printState,
    handleOpenPrintPreview,
    handleClosePrintPreview,
    handlePrint
  };
};