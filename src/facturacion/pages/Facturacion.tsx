import { useState } from "react";
import Title from "../../shared/components/Title";
import { Factura, FacturacionCedula } from "../types/factura";
import { PAGE_SIZE } from "../../shared/utils/constants";
import CardSlot from "../../shared/components/slots/CardSlot";
import FacturacionTable from "../components/FacturacionTable";
import SubTitle from "../../shared/components/SubTitle";
import FacturacionCedulaFilter from "../components/FacturacionCedulaFilter";


const mockFacturas: Factura[] = [
  {
    id: "1",
    NombreComercial: "IMPORTADORA JUANITO",
    Cedula: "1792837465001",
    Concepto: "Venta de repuestos automotrices",
    FechaEmision: new Date("2025-03-15"),
    Total: "543.80 $",
    Estado: "PAGADO"
  },
  {
    id: "2",
    NombreComercial: "PAPELERÍA CENTRAL",
    Cedula: "1002938475",
    Concepto: "Útiles de oficina varios",
    FechaEmision: new Date("2025-03-20"),
    Total: "125.50 $",
    Estado: "PENDIENTE"
  },
  {
    id: "3",
    NombreComercial: "SUPERMERCADO LA ESQUINA",
    Cedula: "1804736251001",
    Concepto: "Compra de víveres",
    FechaEmision: new Date("2025-03-25"),
    Total: "87.95 $",
    Estado: "PAGADO"
  },
  {
    id: "4",
    NombreComercial: "SERVICIO TÉCNICO INTEGRAL",
    Cedula: "1728394056",
    Concepto: "Mantenimiento de equipos",
    FechaEmision: new Date("2025-03-28"),
    Total: "210.00 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "5",
    NombreComercial: "FARMACIA POPULAR",
    Cedula: "0601928374",
    Concepto: "Adquisición de medicamentos",
    FechaEmision: new Date("2025-04-01"),
    Total: "45.20 $",
    Estado: "PAGADO"
  },
  {
    id: "6",
    NombreComercial: "RESTAURANTE SABORES DEL MUNDO",
    Cedula: "1807654321001",
    Concepto: "Consumo de alimentos",
    FechaEmision: new Date("2025-04-05"),
    Total: "32.75 $",
    Estado: "PAGADO"
  },
  {
    id: "7",
    NombreComercial: "LIBRERÍA NACIONAL",
    Cedula: "1712345678",
    Concepto: "Compra de libros",
    FechaEmision: new Date("2025-04-10"),
    Total: "78.40 $",
    Estado: "PENDIENTE"
  },
  {
    id: "8",
    NombreComercial: "ELECTRODOMÉSTICOS MODERNOS",
    Cedula: "1809876543001",
    Concepto: "Adquisición de lavadora",
    FechaEmision: new Date("2025-04-12"),
    Total: "450.00 $",
    Estado: "AUTORIZADO"
  },
  {
    id: "9",
    NombreComercial: "CLÍNICA DEL SOL",
    Cedula: "0102345678",
    Concepto: "Consulta médica",
    FechaEmision: new Date("2025-04-15"),
    Total: "65.90 $",
    Estado: "PAGADO"
  },
  {
    id: "10",
    NombreComercial: "CONSTRUCTORA EL MAESTRO",
    Cedula: "1798765432001",
    Concepto: "Compra de materiales de construcción",
    FechaEmision: new Date("2025-04-18"),
    Total: "1285.30 $",
    Estado: "PENDIENTE"
  }
];


export default function Facturacion() {
  const [facturas, setFacturas] = useState<Factura[]>(mockFacturas);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FacturacionCedula>({});


  const filteredFacturas = facturas.filter(factura =>
    filters.Cedula ? factura.Cedula.includes(filters.Cedula) : true
  );

  const totalPages = Math.ceil(filteredFacturas.length / PAGE_SIZE);
  const paginatedFacturas = filteredFacturas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  return (
    <>
      <Title title="Facturas" />

      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <FacturacionCedulaFilter filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      </CardSlot>

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

