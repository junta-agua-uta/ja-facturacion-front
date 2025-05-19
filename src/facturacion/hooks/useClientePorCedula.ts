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
  
  // Función para reiniciar el estado del cliente
  const resetCliente = useCallback(() => {
    setCliente('');
    setClienteId(null);
    setError(null);
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
        } else {
          setCliente('');
          setClienteId(null);
          setError('Cliente no encontrado');
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

  return { cliente, clienteId, error, resetCliente };
}
