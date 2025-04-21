import { Branch} from '../types/sucursal';
import Table from '../../shared/components/Table';
import { TableProps } from '../../shared/utils/types';

export default function BranchTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: TableProps<Branch>) {
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
