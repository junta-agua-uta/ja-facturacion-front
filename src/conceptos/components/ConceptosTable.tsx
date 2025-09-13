// // Define el tipo ConceptoCobro localmente si no existe aún
// import { ConceptoCobro } from "../types/concepto";
// import Table from "../../shared/components/Table";
// import { TableProps } from "../../shared/utils/types";

// export default function ConceptosTable({
//   data,
//   pagination,
//   onEdit,
//   onDelete,
//   onPageChange
// }: TableProps<ConceptoCobro>) {
//   const columns = [
//     {
//       header: "Código",
//       accessor: "codigo" as const
//     },
//     {
//       header: "Descripción",
//       accessor: "descripcion" as const
//     },
//     {
//       header: "Cantidad",
//       accessor: "cantidad" as const
//     },
//     {
//       header: "Precio",
//       accessor: "precio" as const
//     },
//     {
//       header: "Descuento",
//       accessor: "descuento" as const
//     },
//     {
//       header: "Subtotal",
//       accessor: "subtotal" as const
//     },
//     {
//       header: "Total",
//       accessor: "total" as const
//     }
//   ];

//   return (
//     <Table
//       data={data}
//       columns={columns}
//       pagination={pagination}
//       onEdit={onEdit}
//       onDelete={onDelete}
//       onPageChange={onPageChange}
//       showDelete={true} // Puedes ajustarlo según tus necesidades
//     />
//   );
// }
