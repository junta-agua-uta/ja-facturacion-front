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
      Usuario: item.usuario ? `${item.usuario.NOMBRE} ${item.usuario.APELLIDO}` : ''
    }));
  };

  // Función auxiliar para formatear fechas al formato YYYY-MM-DD
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Fetch facturas desde la API
  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        let response;
        
        // Determinar qué endpoint usar basado en los filtros
        if (filters.Cedula && filters.Cedula.trim()) {
          // Búsqueda por cédula (sin paginación del servidor)
          response = await api.get('/facturas/cedula', {
            params: { 
              cedula: filters.Cedula.trim()
            }
          });
          
          // Mapear y filtrar por fechas localmente
          const mappedFacturas = mapFacturas(response.data || []);
          const dateFilteredFacturas = mappedFacturas.filter(factura =>
            (dateFilters.FechaEmisionDesde <= factura.FechaEmision &&
              factura.FechaEmision <= dateFilters.FechaEmisionHasta)
          );
          
          setFacturas(dateFilteredFacturas);
          setTotalItems(dateFilteredFacturas.length);
          setTotalPages(Math.ceil(dateFilteredFacturas.length / PAGE_SIZE));
          
        } else {
          // Búsqueda por fechas con paginación del servidor
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
  }, [currentPage, filters.Cedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.Cedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  // Para paginación local cuando se busca por cédula
  const paginatedFacturas = filters.Cedula && filters.Cedula.trim() 
    ? facturas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : facturas;

  const handleClearFilters = () => {
    setFilters({});
    setDateFilters({
      FechaEmisionDesde: new Date('2025-01-01'),
      FechaEmisionHasta: new Date('2025-12-31')
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <>
        <Title title="Facturas" />
        <CardSlot>
          <div className="flex flex-col justify-center items-center h-32">
            <div className="loader mb-2" style={{ border: '4px solid #f3f3f3', borderRadius: '50%', borderTop: '4px solid #3498db', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
            <span>Cargando facturas...</span>
          </div>
        </CardSlot>
      </>
    );
  }

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