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
        console.log("🔄 Cargando conceptos desde API...");
        const response = await api.get('/conceptos');
        console.log("📥 Respuesta de conceptos:", response.data);

        // Comprobar que response.data.data es un array
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        console.log("📊 Datos procesados:", data);

        const mapped: Concepto[] = data.map((c: any) => ({
          id: c.id || c.ID?.toString() || '',
          codigo: c.codigo || c.CODIGO,
          codInterno: c.codInterno || c.COD_INTERNO,
          desc: c.desc || c.DESCRIPCION,
          precioBase: c.precioBase ?? c.PRECIO_BASE,
          requiereMes: c.requiereMes ?? c.REQUIERE_MES ?? false,
        }));

        const ordenConceptos = [
          "EXCEDENTE",
          "TARIFA BASICA",
          "MORA",
          "MULTA",
          "REBAJA",
          "ABONO",
          "CUOTA PROYECTOS",
          "VERTIENTE",
          "OTROS"
        ];
        const quitarAcentos = (str: string) =>
          str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const mappedOrdenado = mapped.sort((a, b) => {
          const indexA = ordenConceptos.indexOf(quitarAcentos(a.desc.toUpperCase()));
          const indexB = ordenConceptos.indexOf(quitarAcentos(b.desc.toUpperCase()));

          const posA = indexA === -1 ? ordenConceptos.length : indexA;
          const posB = indexB === -1 ? ordenConceptos.length : indexB;

          return posA - posB;
        });
        


        console.log("🗂️ Conceptos mapeados:", mapped);
        setConceptos(mappedOrdenado);
      } catch (err) {
        console.error("❌ Error cargando conceptos:", err);
        setError('No se pudo cargar la lista de conceptos');
      } finally {
        setLoading(false);
      }
    };

    fetchConceptos();
  }, []);

  return { conceptos, loading, error };
}
