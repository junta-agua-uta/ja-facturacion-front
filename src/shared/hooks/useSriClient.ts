import { useState, useCallback } from 'react';

// Definir la variable de entorno para TypeScript
declare global {
  interface ImportMetaEnv {
    VITE_API_TO_GET_INFORMATION?: string;
  }
}

interface SriContribuyente {
  identificacion: string;
  denominacion: string | null;
  tipo: string | null;
  clase: string;
  tipoIdentificacion: string;
  resolucion: string | null;
  nombreComercial: string;
  direccionMatriz: string | null;
  fechaInformacion: number;
  mensaje: string | null;
  estado: string | null;
}

interface SriResponse {
  contribuyente: SriContribuyente | null;
  deuda: any | null;
  impugnacion: any | null;
  remision: any | null;
  codigo?: string;
  mensaje?: string;
  detalles?: any | null;
}

export function useSriClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contribuyente, setContribuyente] = useState<SriContribuyente | null>(null);

  const fetchContribuyenteInfo = useCallback(async (identificacion: string) => {
    if (!identificacion || identificacion.length < 10) {
      setContribuyente(null);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_TO_GET_INFORMATION || 'https://srienlinea.sri.gob.ec/movil-servicios/api/v1.0/deudas/porIdentificacion/';
      const response = await fetch(`${apiUrl}${identificacion}`);
      
      if (!response.ok) {
        throw new Error(`Error en la consulta: ${response.status}`);
      }
      
      const data: SriResponse = await response.json();
      
      if (data.codigo) {
        // Si hay un código, es un error
        setError(data.mensaje || 'No se encontró información del contribuyente');
        setContribuyente(null);
        return null;
      }
      
      setContribuyente(data.contribuyente);
      return data.contribuyente;
    } catch (err) {
      console.error('Error al consultar el SRI:', err);
      setError('Error al consultar el servicio del SRI');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    contribuyente,
    fetchContribuyenteInfo
  };
}
