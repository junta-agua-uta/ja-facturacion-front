import { useState, useEffect } from 'react';
import api from '../../shared/api';

export function useClientePorCedula(cedula: string) {
  const [cliente, setCliente] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cedula || cedula.length < 10) {
      setCliente('');
      setError(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get('/clientes/buscarCedula', { params: { cedula } });
        const clientes = response.data;
        if (Array.isArray(clientes) && clientes.length > 0 && clientes[0].RAZON_SOCIAL) {
          setCliente(clientes[0].RAZON_SOCIAL);
          setError(null);
        } else {
          setCliente('');
          setError('Cliente no encontrado');
        }
      } catch {
        setCliente('');
        setError('Error al buscar cliente');
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cedula]);

  return { cliente, error };
}
