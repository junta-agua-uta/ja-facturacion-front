import { useState, useCallback } from 'react';
import { useBranches } from './useBranches';

export const useBranchSelection = () => {
  // Obtener sucursales
  const { branches, loading: loadingBranches, error: branchesError } = useBranches();
  
  // Obtener sucursal guardada en localStorage
  const [selectedBranch, setSelectedBranch] = useState<string>(() => {
    // La primera sucursal ya se selecciona en useBranches.ts si es necesario
    return localStorage.getItem('selectedBranch') || '';
  });

  // Guardar sucursal seleccionada en localStorage
  const handleBranchChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedBranch(value);
    localStorage.setItem('selectedBranch', value);
  }, []);

  return {
    branches,
    selectedBranch,
    loadingBranches,
    branchesError,
    handleBranchChange
  };
};
