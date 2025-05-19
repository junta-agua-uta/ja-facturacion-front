import { useState, useEffect } from 'react';
import api from '../../shared/api';
import { Branch } from '../../sucursales/types/sucursal';

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      setError(null);

      try {
        const cached = localStorage.getItem('branches');
        if (cached) {
          const parsed = JSON.parse(cached);
          setBranches(parsed);
          setLoading(false);
          return;
        }

        const response = await api.get('/sucursales');
        const data = response.data.data.map((branch: any) => ({
          id: branch.ID.toString(),
          nombre: branch.NOMBRE,
          ubicacion: branch.UBICACION,
          puntoEmision: branch.PUNTO_EMISION,
        }));
        setBranches(data);
        localStorage.setItem('branches', JSON.stringify(data));
        
        // Si no hay una sucursal seleccionada, seleccionar la primera
        if (data.length > 0 && (!localStorage.getItem('selectedBranch'))) {
          localStorage.setItem('selectedBranch', data[0].id);
        }
      } catch (err) {
        setError('No se pudo cargar la lista de sucursales');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading, error };
}