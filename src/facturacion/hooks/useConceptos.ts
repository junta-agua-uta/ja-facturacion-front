
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
        // Revisa si tienes datos en caché (opcional)
        const cached = localStorage.getItem('conceptos');
        if (cached) {
          setConceptos(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const response = await api.get('/conceptos');
        const data = response.data.data.map((c: any) => ({
          id: c.ID.toString(),
          codigo: c.CODIGO,
          codInterno: c.COD_INTERNO,
          desc: c.DESCRIPCION,
          precioBase: c.PRECIO_BASE,
          requiereMes: c.REQUIERE_MES,
        }));
        setConceptos(data);
        localStorage.setItem('conceptos', JSON.stringify(data));
      } catch (err) {
        setError('No se pudo cargar la lista de conceptos');
      } finally {
        setLoading(false);
      }
    };

    fetchConceptos();
  }, []);

  return { conceptos, loading, error };
}
