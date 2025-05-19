import React from 'react';
import { SucursalSelect } from './SucursalSelect';

interface FacturaHeaderProps {
  facturador: string;
  branches: any[];
  selectedBranch: string;
  onBranchChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loadingBranches: boolean;
  branchesError: string | null;
}

export const FacturaHeader: React.FC<FacturaHeaderProps> = ({
  facturador,
  branches,
  selectedBranch,
  onBranchChange,
  loadingBranches,
  branchesError
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-600">
        Facturador: <span className="font-bold text-blue-500">{facturador}</span>
      </p>
      <div className="text-lg font-semibold text-gray-600 flex items-center gap-2">
        Sucursal:
        <SucursalSelect
          branches={branches}
          selected={selectedBranch}
          onChange={onBranchChange}
          loading={loadingBranches}
          error={branchesError}
        />
      </div>
    </div>
  );
};
