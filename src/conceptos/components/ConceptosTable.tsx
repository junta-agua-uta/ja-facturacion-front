// Define el tipo ConceptoCobro localmente si no existe aún
import { Concepto } from "../types/concepto";
import Table from "../../shared/components/Table";
import { TableProps } from "../../shared/utils/types";

export default function ConceptosTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: TableProps<Concepto>) {
  const columns = [
    {
      header: "Código",
      accessor: "codInterno" as const
    },
    {
      header: "Descripción",
      accessor: "desc" as const
    },
    {
      header: "Precio Base",
      accessor: "precioBase" as const
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
      showActions={true}
      showDelete={true}
    />
  );
}
