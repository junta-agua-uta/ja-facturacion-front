import { useState } from "react";
import Title from "../../shared/components/Title";
import { Factura } from "../types/factura";
import { PAGE_SIZE } from "../../shared/utils/constants";
import CardSlot from "../../shared/components/slots/CardSlot";
import FacturacionTable from "../components/FacturacionTable";


const mockFacturas: Factura[] = [
  {
    id: "1",
    NombreComercial: "SEGUNDO MANUEL JHON PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "2",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "3",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "4",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "5",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "6",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "7",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "8",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "9",
    NombreComercial: "SEGUNDO MANUEL PANDI PANDI",
    Cedula: "1803058393",
    Concepto: "ABC",
    FechaEmision: new Date("2025-02-24"),
    Total: "1231.23 $",
    Estado: "AUTORIZADO"
  }
]


export default function Facturacion() {
  const [facturas, setFacturas] = useState<Factura[]>(mockFacturas);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(facturas.length / PAGE_SIZE);
  const paginatedFacturas = facturas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <>
    <Title title="Facturas" />

    <CardSlot>
      <FacturacionTable 
          data={paginatedFacturas}
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems: facturas.length
          }}
          onPageChange={setCurrentPage} 
      />
    </CardSlot>
    </>
  );
}

