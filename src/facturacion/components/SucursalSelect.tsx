import React from 'react';
import { Branch } from '../../sucursales/types/sucursal';

interface SucursalSelectProps {
  branches: Branch[];
  selected: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loading: boolean;
  error: string | null;
}

export const SucursalSelect: React.FC<SucursalSelectProps> = ({ branches, selected, onChange, loading, error }) => {
  if (loading) return <span className="text-blue-500 font-bold">Cargando...</span>;
  if (error) return <span className="text-red-500 font-bold">{error}</span>;
  return (
    <select
      className="select select-bordered font-bold text-blue-500"
      value={selected}
      onChange={onChange}
    >
      {branches.map(branch => (
        <option key={branch.id} value={branch.id}>
          {branch.nombre}
        </option>
      ))}
    </select>
  );
};
