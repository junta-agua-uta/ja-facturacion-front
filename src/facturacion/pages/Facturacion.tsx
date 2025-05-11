import { useState } from "react";
import { Title, SubTitle, EndSlot, CardSlot } from "../../shared/components";
import { Factura, FacturacionCedula, FacturacionFechaEmisionFilter } from "../types/factura";
import { FacturacionCedulaFilter, FacturacionFechaFilter, FacturacionTable } from "../components";
import { PAGE_SIZE } from "../../shared/utils/constants";
import { Link } from "react-router-dom";

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
  const [dateFilters, setDateFilters] = useState<FacturacionFechaEmisionFilter>({
    FechaEmisionDesde: new Date('2025-01-01'),
    FechaEmisionHasta: new Date('2025-12-31')
  });

  const filteredFacturas = facturas.filter(factura =>
    (filters.Cedula ? factura.Cedula.includes(filters.Cedula) : true) &&
    (dateFilters.FechaEmisionDesde <= factura.FechaEmision && 
     factura.FechaEmision <= dateFilters.FechaEmisionHasta)
  );

  const totalPages = Math.ceil(filteredFacturas.length / PAGE_SIZE);
  const paginatedFacturas = filteredFacturas.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({});
    setDateFilters({
      FechaEmisionDesde: new Date('2025-01-01'),
      FechaEmisionHasta: new Date('2025-12-31')
    });
    setCurrentPage(1);
  };

  return (
    console.log("Facturas", import.meta.env.VITE_API_URL),
    <>
      <Title title="Facturas" />

      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <FacturacionCedulaFilter filters={filters} onChange={setFilters} />
          </div>
          <div className="flex-1">
            <FacturacionFechaFilter filters={dateFilters} onChange={setDateFilters} />
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-primary"
          >
            Limpiar filtros
          </button>
        </div>
      </CardSlot>

      <CardSlot>
        <EndSlot>
          <Link to={"/junta/facturas/crear"}>
            <button
              className="btn btn-primary hover:bg-blue-500 hover:border-blue-500"
            >
              Añadir factura
            </button>
          </Link>
        </EndSlot>

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

