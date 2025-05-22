import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";
import { Factura } from "../types/factura";

export default function FacturacionTable({
    data,
    pagination,
    onPageChange
  }: TableProps<Factura>) {

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const columns = [
        {
            header: 'Nombre Comercial',
            accessor: 'NombreComercial' as const
        },
        {
            header: 'Cédula',
            accessor: 'Cedula' as const
        },
        {
            header: 'Concepto',
            accessor: 'Concepto' as const
        },
        {
            header: 'Fecha Emisión',
            accessor: 'FechaEmision' as const,
            Cell: ({ value }: { value: Date }) => formatDate(value)
        },
        {
            header: 'Total',
            accessor: 'Total' as const
        },
        {
            header: 'Estado',
            accessor: 'Estado' as const
        },
        {
            header: 'Sucursal',
            accessor: 'Sucursal' as const
        },
        {
            header: 'Usuario',
            accessor: 'Usuario' as const
        }
    ]

    return (
        <Table
            data={data}
            columns={columns}
            pagination={pagination}
            onPageChange={onPageChange}
            showActions={false}
        />
    )
    
}
