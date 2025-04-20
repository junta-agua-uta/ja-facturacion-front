import { BranchTableProps } from '../types/sucursal';
import Table from '../../shared/components/Table';

export default function BranchTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: BranchTableProps) {
  const columns = [
    {
      header: 'Nombre',
      accessor: 'name' as const
    },
    {
      header: 'Dirección',
      accessor: 'address' as const
    },
    {
      header: 'Código',
      accessor: 'code' as const
    }
  ];

  return (
    <Table
      data={data}
      columns={columns}
      pagination={pagination}
      onEdit={onEdit}
      onDelete={onDelete}
      onPageChange={onPageChange}
    />
  );
}
