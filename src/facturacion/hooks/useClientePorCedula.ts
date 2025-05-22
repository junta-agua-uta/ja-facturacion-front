import { useState, useEffect, useCallback } from 'react';
import api from '../../shared/api';

interface ClienteResponse {
  ID: number;
  RAZON_SOCIAL: string;
  // Otros campos del cliente que puedan ser necesarios
}

export function useClientePorCedula(cedula: string) {
  const [cliente, setCliente] = useState('');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [showAddClienteModal, setShowAddClienteModal] = useState(false);
  
  // Función para reiniciar el estado del cliente
  const resetCliente = useCallback(() => {
    setCliente('');
    setClienteId(null);
    setError(null);
    setShowAddButton(false);
  }, []);
  
  // Función para manejar el clic en el botón de agregar cliente
  const handleAddCliente = useCallback(() => {
    setShowAddClienteModal(true);
  }, []);

  // Función para cerrar el modal
  const handleCloseAddClienteModal = useCallback(() => {
    setShowAddClienteModal(false);
  }, []);

  // Función para manejar cuando se agrega un cliente exitosamente
  const handleClienteAdded = useCallback(() => {
    setShowAddClienteModal(false);
    // Aquí podrías implementar lógica adicional después de agregar el cliente
  }, []);

  useEffect(() => {
    // Si la cédula está vacía o es muy corta, limpiamos los datos del cliente
    if (!cedula || cedula.length < 10) {
      setCliente('');
      setClienteId(null);
      setError(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get('/clientes/buscarCedula', { params: { cedula } });
        const clientes = response.data;
        if (Array.isArray(clientes) && clientes.length > 0 && clientes[0].RAZON_SOCIAL) {
          const clienteData = clientes[0] as ClienteResponse;
          setCliente(clienteData.RAZON_SOCIAL);
          setClienteId(clienteData.ID);
          setError(null);
          setShowAddButton(false);
        } else {
          setCliente('');
          setClienteId(null);
          setError('Cliente no encontrado');
          // Mostrar el botón de agregar solo si la cédula tiene un formato válido
          setShowAddButton(/^\d{10}(\d{3})?$/.test(cedula));
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
        setCliente('');
        setClienteId(null);
        setError('Error al buscar cliente');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cedula]);

  return {
    cliente,
    clienteId,
    error,
    resetCliente,
    showAddButton,
    showAddClienteModal,
    handleAddCliente,
    handleCloseAddClienteModal,
    handleClienteAdded
  };
}
