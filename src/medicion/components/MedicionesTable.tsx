
import Table from '../../shared/components/Table';
import { TableProps } from '../../shared/utils/types';
import { Medicion } from '../types/medicion';

export default function MedicionesTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: TableProps<Medicion>) {
  const columns = [
    {
      header: 'Nro Medidor',
      accessor: 'numeroMedidor' as const,
    },
    {
      header: 'Cédula',
      accessor: 'cedula' as const,
    },
    {
      header: 'Fecha Lectura',
      accessor: 'fechaLectura' as const,
    },
    {
      header: 'Consumo (m3)',
      accessor: 'consumo' as const,
    },
    {
      header: 'Mes Facturado',
      accessor: 'mesFacturado' as const,
    },
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
