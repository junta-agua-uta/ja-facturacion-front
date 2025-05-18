import { Branch } from '../types/sucursal';
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
      accessor: 'nombre' as const
    },
    {
      header: 'Ubicación',
      accessor: 'ubicacion' as const
    },
    {
      header: 'Punto de Emisión',
      accessor: 'puntoEmision' as const
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
      showDelete={false}
    />
  );
}