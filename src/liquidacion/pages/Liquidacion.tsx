import { useState, useEffect } from "react";
import { Title, SubTitle, EndSlot, CardSlot } from "../../shared/components";
import { Liquidacion, LiquidacionCedula, LiquidacionFechaEmisionFilter } from "../types/liquidacion";
import { LiquidacionCedulaFilter, LiquidacionFechaFilter, LiquidacionTable } from "../components";
import { PAGE_SIZE } from "../../shared/utils/constants";
import api from '../../shared/api';
import { Link } from "react-router-dom";

export default function LiquidacionPage() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<LiquidacionCedula>({});
  const [dateFilters, setDateFilters] = useState<LiquidacionFechaEmisionFilter>({
    FechaEmisionDesde: new Date('2025-01-01'),
    FechaEmisionHasta: new Date('2025-12-31')
  });

  const [debouncedCedula, setDebouncedCedula] = useState(filters.Cedula || "");

  // Debounce para cédula
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCedula(filters.Cedula || "");
    }, 1500);
    return () => clearTimeout(handler);
  }, [filters.Cedula]);

  // Mapear respuesta de la API a Liquidacion
const mapLiquidaciones = (apiData: any[]): Liquidacion[] => {
  return apiData.map((item: any, idx: number) => ({
    id: (item.ID?.toString()) ?? idx.toString(),
    NombreComercial: (item.cliente?.NOMBRE_COMERCIAL) ?? 'Sin Nombre Comercial',
    Cedula: (item.cliente?.IDENTIFICACION) ?? '',
    Concepto: (item.Concepto || item.cliente?.RAZON_SOCIAL) ?? '',
    FechaEmision: item.FECHA_EMISION ? new Date(item.FECHA_EMISION) : new Date(),
    Total: item.TOTAL ? `${item.TOTAL} $` : '0 $',
    Estado: item.ESTADO ?? '',
    Sucursal: item.sucursal?.NOMBRE ?? '',
    Usuario: item.usuario ? `${item.usuario.NOMBRE} ${item.usuario.APELLIDO}` : '',
    Serie: (item.Serie || item.sucursal?.PUNTO_EMISION) ?? '',
    Numero: item.Numero ?? '',
    Secuencia: item.Secuencia?.toString() ?? '',
    items: item.items ?? []
  }));
};


  const formatDateForAPI = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchLiquidaciones = async () => {
      setLoading(true);
      try {
        let response;
        if (debouncedCedula && debouncedCedula.trim()) {
          response = await api.get('/liquidaciones/cedula', {
            params: { cedula: debouncedCedula.trim() }
          });

          const mapped = mapLiquidaciones(response.data || []);
          const filtered = mapped.filter(l =>
            dateFilters.FechaEmisionDesde <= l.FechaEmision &&
            l.FechaEmision <= dateFilters.FechaEmisionHasta
          );

          setLiquidaciones(filtered);
          setTotalItems(filtered.length);
          setTotalPages(Math.ceil(filtered.length / PAGE_SIZE));
        } else {
          response = await api.get('/liquidaciones/fecha', {
            params: {
              fechaInicio: formatDateForAPI(dateFilters.FechaEmisionDesde),
              fechaFin: formatDateForAPI(dateFilters.FechaEmisionHasta),
              page: currentPage,
              limit: PAGE_SIZE
            }
          });

          if (response.data) {
            const { data, totalPages: apiTotalPages, totalItems: apiTotalItems } = response.data;
            const mapped = mapLiquidaciones(data || []);
            setLiquidaciones(mapped);
            setTotalPages(apiTotalPages || 1);
            setTotalItems(apiTotalItems || 0);
          }
        }
      } catch (error) {
        console.error('Error al obtener liquidaciones:', error);
        setLiquidaciones([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchLiquidaciones();
  }, [currentPage, debouncedCedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedCedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  const paginatedLiquidaciones = debouncedCedula && debouncedCedula.trim()
    ? liquidaciones.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : liquidaciones;

  const handleClearFilters = () => {
    setFilters({});
    setDebouncedCedula('');
    setDateFilters({
      FechaEmisionDesde: new Date('2025-01-01'),
      FechaEmisionHasta: new Date('2025-12-31')
    });
    setCurrentPage(1);
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(
        '/liquidaciones/reporte/fecha',
        {
          params: {
            fechaInicio: formatDateForAPI(dateFilters.FechaEmisionDesde),
            fechaFin: formatDateForAPI(dateFilters.FechaEmisionHasta),
            page: currentPage,
            limit: PAGE_SIZE
          },
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'liquidaciones.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Title title="Liquidaciones de Compras" />

      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <LiquidacionCedulaFilter filters={filters} onChange={setFilters} />
          </div>
          <div className="flex-1">
            <LiquidacionFechaFilter filters={dateFilters} onChange={setDateFilters} />
          </div>
          <button type="button" onClick={handleClearFilters} className="btn btn-primary">
            Limpiar filtros
          </button>
        </div>
      </CardSlot>

      <CardSlot>
        <EndSlot>
          <Link to={"/junta/liquidacion/crear"}>
            <button className="btn btn-primary hover:bg-blue-500 hover:border-blue-500">
              Añadir liquidación
            </button>
          </Link>
          <button
            className="btn btn-accent ml-2 hover:bg-green-500 hover:border-green-500"
            onClick={handleExportToExcel}
            disabled={isExporting}
          >
            {isExporting ? 'Exportando...' : 'Exportar a Excel'}
          </button>
        </EndSlot>

        <LiquidacionTable
          data={paginatedLiquidaciones}
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
