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

  // Fetch facturas desde la API y almacena la data mapeada
  useEffect(() => {
    const fetchFacturas = async () => {
      setLoading(true);
      try {
        // Array para almacenar todas las facturas de todas las páginas
        let allFacturas: any[] = [];
        let totalPages = 1;

  // Función para mapear los datos de la API al formato que espera la tabla
  const mapFacturas = (apiFacturas: any[]) => {
    return apiFacturas.map((item: any) => ({
      id: item.ID?.toString() ?? '',
      NombreComercial: item.cliente?.NOMBRE_COMERCIAL ?? '',
      Cedula: item.cliente?.IDENTIFICACION ?? '',
            Concepto: item.cliente?.RAZON_SOCIAL ?? '', // Puedes cambiar este campo por otro si tienes un concepto real
      FechaEmision: item.FECHA_EMISION ? new Date(item.FECHA_EMISION) : new Date(),
      Total: item.TOTAL ? `${item.TOTAL} $` : '0 $',
      Estado: item.ESTADO_FACTURA ?? '',
      // Agregar más campos si es necesario
      Sucursal: item.sucursal?.NOMBRE ?? '',
      Usuario: item.usuario ? `${item.usuario.NOMBRE} ${item.usuario.APELLIDO}` : ''
    }));
  };

        // Obtener la primera página para saber cuántas páginas hay en total
        const firstResponse = await api.get('/facturas/all', {
          params: { page: 1 }
        });
        
        if (firstResponse.data) {
          const { data, totalPages: apiTotalPages } = firstResponse.data;
          totalPages = apiTotalPages || 1;
      
          // Agregar los datos de la primera página
          allFacturas = [...allFacturas, ...(data || [])];
          
          // Obtener el resto de las páginas si hay más de una
          if (totalPages > 1) {
            // Crear un array de promesas para todas las páginas restantes
            const pagePromises = [];
            for (let page = 2; page <= totalPages; page++) {
              pagePromises.push(
                api.get('/facturas/all', {
                  params: { page }
                })
              );
      }
      
            // Ejecutar todas las promesas en paralelo
            const responses = await Promise.all(pagePromises);
            
            // Procesar cada respuesta y agregar los datos
            responses.forEach(response => {
              if (response.data && response.data.data) {
                allFacturas = [...allFacturas, ...response.data.data];
              }
            });
          }
        }
        
        // Mapear todas las facturas obtenidas
        const mappedFacturas = mapFacturas(allFacturas);
        setFacturas(mappedFacturas);
    } catch (error) {
      console.error('Error al obtener facturas:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchFacturas();
  }, []);

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
            totalItems: facturas.length
          }}
          onPageChange={setCurrentPage}
        />
      </CardSlot>
    </>
  );
}

