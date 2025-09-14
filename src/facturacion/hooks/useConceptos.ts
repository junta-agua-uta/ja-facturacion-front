import { useState, useEffect } from 'react';
import api from '../../shared/api';
import { Concepto } from '../../conceptos/types/concepto';

export function useConceptos() {
  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConceptos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/conceptos');
        // Comprobar que response.data.data es un array
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        const mapped: Concepto[] = data.map((c: any) => ({
          id: c.id || c.ID?.toString() || '',
          codigo: c.codigo || c.CODIGO,
          codInterno: c.codInterno || c.COD_INTERNO,
          desc: c.desc || c.DESCRIPCION,
          precioBase: c.precioBase ?? c.PRECIO_BASE,
          requiereMes: c.requiereMes ?? c.REQUIERE_MES ?? false,
        }));

        setConceptos(mapped);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de conceptos');
      } finally {
        setLoading(false);
      }
    };

    fetchConceptos();
  }, []);

  return { conceptos, loading, error };
}
