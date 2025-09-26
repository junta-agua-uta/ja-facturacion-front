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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleOpenPrintPreview = (liquidacion: any) => {
    // Conversión segura sin depender de propiedades que puedan faltar
    const liquidacionForm: LiquidacionForm = {
      cedula: liquidacion.Cedula || '',
      cliente: liquidacion.NombreComercial || '',
      emision: liquidacion.FechaEmision
        ? formatDate(new Date(liquidacion.FechaEmision))
        : '',
      concepto: liquidacion.Concepto || '',
      serie: liquidacion.Serie || '',
      numero: liquidacion.Numero || '',
      secuencia: liquidacion.Secuencia || '',
      vencimiento: '', // Si la API no lo trae
      codigo: '',      // No lo necesitas para imprimir
      items: liquidacion.items || [] 
    };

    setPrintState({
      isPrintPreviewOpen: true,
      liquidacionToPrint: liquidacionForm,
      totalToPrint:
        typeof liquidacion.Total === 'string'
          ? parseFloat(liquidacion.Total.replace('$', '').trim()) || 0
          : liquidacion.Total || 0
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
