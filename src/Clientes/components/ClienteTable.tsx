import { Cliente } from '../types/cliente';
import Table from '../../shared/components/Table';
import { TableProps } from '../../shared/utils/types';

export default function ClienteTable({
  data,
  pagination,
  onEdit,
  // onDelete,
  onPageChange
}: TableProps<Cliente>) {
  const columns = [
  
    {
      header: 'Identificación',
      accessor: 'identificacion' as const
    },
    {
      header: 'Razón Social',
      accessor: 'razonSocial' as const
    },
    {
      header: 'Nombre Comercial',
      accessor: 'nombreComercial' as const
    },
    {
      header: 'Dirección',
      accessor: 'direccion' as const
    },
    {
      header: 'Teléfono 1',
      accessor: 'telefono1' as const
    },
    {
      header: 'Correo Electrónico',
      accessor: 'correo' as const
    }
  ];

  return (
    <Table
      data={data}
      columns={columns}
      pagination={pagination}
      onEdit={onEdit}
      // onDelete={onDelete}
      onPageChange={onPageChange}
    />
  );
}