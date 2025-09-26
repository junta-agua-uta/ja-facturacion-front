import React from 'react';
import { SucursalSelect } from './SucursalSelect';

interface LiquidacionHeaderProps {
  liquidador: string;
  branches: any[];
  selectedBranch: string;
  onBranchChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  loadingBranches: boolean;
  branchesError: string | null;
}

export const LiquidacionHeader: React.FC<LiquidacionHeaderProps> = ({
  liquidador,
  branches,
  selectedBranch,
  onBranchChange,
  loadingBranches,
  branchesError
}) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-semibold text-gray-600">
        Liquidador: <span className="font-bold text-blue-500">{liquidador}</span>
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
