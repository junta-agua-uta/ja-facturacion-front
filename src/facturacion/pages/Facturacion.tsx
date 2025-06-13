import { useState, useEffect } from "react";
import { Title, SubTitle, EndSlot, CardSlot } from "../../shared/components";
import { Factura, FacturacionCedula, FacturacionFechaEmisionFilter } from "../types/factura";
import { FacturacionCedulaFilter, FacturacionFechaFilter, FacturacionTable } from "../components";
import { PAGE_SIZE } from "../../shared/utils/constants";
import api from '../../shared/api';
import { Link } from "react-router-dom";

export default function Facturacion() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<FacturacionCedula>({});
  const [dateFilters, setDateFilters] = useState<FacturacionFechaEmisionFilter>({
    FechaEmisionDesde: new Date('2025-01-01'),
    FechaEmisionHasta: new Date('2025-12-31')
  });

  // Estado para el debounce de la cédula
  const [debouncedCedula, setDebouncedCedula] = useState(filters.Cedula || "");

  // Actualiza debouncedCedula con debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCedula(filters.Cedula || "");
    }, 1500);

    return () => clearTimeout(handler);
  }, [filters.Cedula]);

  // Función para mapear los datos de la API al formato que espera la tabla
  const mapFacturas = (apiFacturas: any[]) => {
    return apiFacturas.map((item: any) => ({
      id: item.ID?.toString() ?? '',
      NombreComercial: item.cliente?.NOMBRE_COMERCIAL ?? '',
      Cedula: item.cliente?.IDENTIFICACION ?? '',
      Concepto: item.cliente?.RAZON_SOCIAL ?? '',
      FechaEmision: item.FECHA_EMISION ? new Date(item.FECHA_EMISION) : new Date(),
      Total: item.TOTAL ? `${item.TOTAL} $` : '0 $',
      Estado: item.ESTADO_FACTURA ?? '',
      Sucursal: item.sucursal?.NOMBRE ?? '',
      Usuario: item.usuario ? `${item.usuario.NOMBRE} ${item.usuario.APELLIDO}` : '',
      Secuencia: item.SECUENCIA?.toString() ?? '', // Agregamos la secuencia
      Serie: item.sucursal?.PUNTO_EMISION ?? '', // Agregamos la serie
      Numero: item.sucursal?.PUNTO_EMISION ?? ''
    }));
  };

  const mapFacturasCedula = (facturas: any[]) => {
    return facturas.map((item: any, idx: number) => ({
      id: idx.toString(),
      NombreComercial: "Sin Nombre Comercial",
      Cedula: item.identificacionComprador,
      Concepto: item.razonSocialComprador,
      FechaEmision: item.fechaEmision ? new Date(item.fechaEmision) : new Date(),
      Total: item.importeTotal ? `${item.importeTotal} $` : '0 $',
      Estado: '',
      Sucursal: item.pto_emision ?? '',
      Usuario: '',
      detalles: item.detalles ?? []
    }));
  };

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        let response;

        if (debouncedCedula && debouncedCedula.trim()) {
          response = await api.get('/facturas/cedula', {
            params: {
              cedula: debouncedCedula.trim()
            }
          });

          const mappedFacturas = mapFacturasCedula(response.data || []);
          const dateFilteredFacturas = mappedFacturas.filter(factura =>
          (dateFilters.FechaEmisionDesde <= factura.FechaEmision &&
            factura.FechaEmision <= dateFilters.FechaEmisionHasta)
          );

          setFacturas(dateFilteredFacturas);
          setTotalItems(dateFilteredFacturas.length);
          setTotalPages(Math.ceil(dateFilteredFacturas.length / PAGE_SIZE));

        } else {
          response = await api.get('/facturas/fecha', {
            params: {
              fechaInicio: formatDateForAPI(dateFilters.FechaEmisionDesde),
              fechaFin: formatDateForAPI(dateFilters.FechaEmisionHasta),
              page: currentPage,
              limit: PAGE_SIZE
            }
          });

          if (response.data) {
            const { data, totalPages: apiTotalPages, totalItems: apiTotalItems } = response.data;
            const mappedFacturas = mapFacturas(data || []);
            setFacturas(mappedFacturas);
            setTotalPages(apiTotalPages || 1);
            setTotalItems(apiTotalItems || 0);
          }
        }
      } catch (error) {
        console.error('Error al obtener facturas:', error);
        setFacturas([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFacturas();
  }, [currentPage, debouncedCedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedCedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  const paginatedFacturas = debouncedCedula && debouncedCedula.trim()
    ? facturas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : facturas;

  const handleClearFilters = () => {
    setFilters({});
    setDebouncedCedula(''); 
    setDateFilters({
      FechaEmisionDesde: new Date('2025-01-01'),
      FechaEmisionHasta: new Date('2025-12-31')
    });
    setCurrentPage(1);
  };

  return (
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
          loading={loading}
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems
          }}
          onPageChange={setCurrentPage}
        />
      </CardSlot>
    </>
  );
}
