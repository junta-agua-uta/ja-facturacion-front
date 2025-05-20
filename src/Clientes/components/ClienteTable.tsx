import { Cliente } from '../types/cliente';
import Table from '../../shared/components/Table';
import { TableProps } from '../../shared/utils/types';

export default function ClienteTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: TableProps<Cliente>) {
  const columns = [
    {
      header: 'ID',
      accessor: 'id' as const
    },
    {
      header: 'Identificación',
      accessor: 'identificacion' as const
    },
    {
      header: 'Razón Social',
      accessor: 'razonSocial' as const
    },
    {
      header: 'Dirección',
      accessor: 'direccion' as const
    },
    {
      header: 'Teléfono Nro 1',
      accessor: 'telefonoNro1' as const
    },
    {
      header: 'Teléfono Nro 2',
      accessor: 'telefonoNro2' as const
    },
    {
      header: 'Correo Electrónico',
      accessor: 'correoElectronico' as const
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