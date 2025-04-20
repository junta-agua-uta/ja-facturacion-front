import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";
import { Factura } from "../types/factura";

export default function FacturacionTable({
    data,
    pagination,
    onPageChange
  }: TableProps<Factura>) {

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
            accessor: 'FechaEmision' as const
        },
        {
            header: 'Total',
            accessor: 'Total' as const
        },
        {
            header: 'Estado',
            accessor: 'Estado' as const
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
