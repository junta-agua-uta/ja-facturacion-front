import { useState } from 'react';
import { anularFactura } from '../services/factura.service';
import { Factura } from '../types/factura';

interface UseAnularFacturaReturn {
  isModalOpen: boolean;
  isLoading: boolean;
  facturaSeleccionada: Factura | null;
  error: string | null;
  abrirModal: (factura: Factura) => void;
  cerrarModal: () => void;
  confirmarAnulacion: () => Promise<void>;
}

export const useAnularFactura = (
  onSuccess?: () => void,
  onError?: (error: string) => void
): UseAnularFacturaReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<Factura | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abrirModal = (factura: Factura) => {
    // Solo permitir anular facturas autorizadas
    if (factura.Estado !== 'AUTORIZADO') {
      const mensaje = `No se puede anular una factura con estado "${factura.Estado}". Solo se pueden anular facturas autorizadas.`;
      setError(mensaje);
      if (onError) {
        onError(mensaje);
      }
      return;
    }

    setFacturaSeleccionada(factura);
    setIsModalOpen(true);
    setError(null);
  };

  const cerrarModal = () => {
    if (!isLoading) {
      setIsModalOpen(false);
      setFacturaSeleccionada(null);
      setError(null);
    }
  };

  const confirmarAnulacion = async () => {
    if (!facturaSeleccionada) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await anularFactura(facturaSeleccionada.id);

      if (response.success) {
        // Cerrar modal
        setIsModalOpen(false);
        setFacturaSeleccionada(null);

        // Callback de éxito
        if (onSuccess) {
          onSuccess();
        }

        // Mostrar mensaje de éxito
        alert(`✓ ${response.message}`);
      } else {
        throw new Error(response.message || 'Error al anular la factura');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido al anular la factura';
      setError(errorMessage);

      // Callback de error
      if (onError) {
        onError(errorMessage);
      }

      // Mostrar mensaje de error
      alert(`✗ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModalOpen,
    isLoading,
    facturaSeleccionada,
    error,
    abrirModal,
    cerrarModal,
    confirmarAnulacion
  };
};
