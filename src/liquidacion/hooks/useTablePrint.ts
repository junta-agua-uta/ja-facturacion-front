import { useState } from 'react';
import { LiquidacionForm } from '../../shared/components/interfaces/liquidacion.interface';

interface TablePrintState {
  isPrintPreviewOpen: boolean;
  liquidacionToPrint: LiquidacionForm | null;
  totalToPrint: number;
}

export const useTablePrint = () => {
  const [printState, setPrintState] = useState<TablePrintState>({
    isPrintPreviewOpen: false,
    liquidacionToPrint: null,
    totalToPrint: 0
  });

  

  const handleOpenPrintPreview = (liquidacion: any) => {
  const liquidacionForm: LiquidacionForm = {
    cedula: liquidacion.identificacionProveedor || '',
    cliente: liquidacion.razonSocialProveedor || '',
    emision: liquidacion.fechaEmision || '',
    concepto: liquidacion.concepto || '',   // si existe
    serie: liquidacion.serie || '',
    numero: liquidacion.numero || '',
    secuencia: liquidacion.secuencia || '',
    vencimiento: liquidacion.vencimiento || '',
    codigo: liquidacion.codigo || '',
    items: liquidacion.items || []          // si tienes detalles
  };

  setPrintState({
    isPrintPreviewOpen: true,
    liquidacionToPrint: liquidacionForm,
    totalToPrint:
      typeof liquidacion.importeTotal === 'string'
        ? parseFloat(liquidacion.importeTotal.replace('$', '').trim()) || 0
        : liquidacion.importeTotal || 0
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
