import { useState, useEffect } from "react";
import { Title, SubTitle, EndSlot, CardSlot } from "../../shared/components";
import { LiquidacionCedulaFilter, LiquidacionFechaFilter } from "../components";
import { LiquidacionForm } from "../types/liquidacion";
import { PAGE_SIZE } from "../../shared/utils/constants";
import api from '../../shared/api';
import { Link } from "react-router-dom";
import LiquidacionTable from "../components/LiquidacionTable";

export default function LiquidacionPage() {
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<{ Cedula?: string }>({});
  const [dateFilters, setDateFilters] = useState<{ FechaEmisionDesde: Date; FechaEmisionHasta: Date }>({
    FechaEmisionDesde: new Date('2025-01-01'),
    FechaEmisionHasta: new Date('2025-12-31')
  });

  const [debouncedCedula, setDebouncedCedula] = useState(filters.Cedula || "");

  // Debounce para cédula
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCedula(filters.Cedula || ""), 1500);
    return () => clearTimeout(handler);
  }, [filters.Cedula]);

  // Mapear respuesta de la API a LiquidacionForm
  const mapLiquidaciones = (apiData: any[]): LiquidacionForm[] => {
    return apiData.map((item: any) => ({
      razonSocialProveedor: item.razonSocialProveedor ?? 'Sin Nombre Comercial',
      identificacionProveedor: item.identificacionProveedor ?? '',
      fechaEmision: item.fechaEmision ?? '',
      importeTotal: item.importeTotal ?? 0,
      estadoSri: item.estadoSri ?? '',
    }));
  };


  // Fetch liquidaciones paginadas
  useEffect(() => {
    const fetchLiquidaciones = async () => {
      setLoading(true);
      try {
        const params: any = { page: currentPage, limit: PAGE_SIZE || 10 };

        if (debouncedCedula?.trim()) params.cedula = debouncedCedula.trim();

        const response = await api.get('/liquidacion-compra/all', { params });

        if (response.data) {
          const { data, totalPages: apiTotalPages, total: apiTotalItems } = response.data;
          setLiquidaciones(mapLiquidaciones(data || []));
          setTotalPages(apiTotalPages || 1);
          setTotalItems(apiTotalItems || 0);
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

  useEffect(() => setCurrentPage(1), [debouncedCedula, dateFilters.FechaEmisionDesde, dateFilters.FechaEmisionHasta]);

  const handleClearFilters = () => {
    setFilters({});
    setDebouncedCedula('');
    setDateFilters({ FechaEmisionDesde: new Date('2025-01-01'), FechaEmisionHasta: new Date('2025-12-31') });
    setCurrentPage(1);
  };

  const [isExporting, setIsExporting] = useState(false);

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleExportToExcel = async () => {
    setIsExporting(true);
    try {
      const response = await api.get(
        '/liquidacion-compra/descargar-excel',
        {
          params: {
            fechaInicio: formatDateForAPI(dateFilters.FechaEmisionDesde),
            fechaFin: formatDateForAPI(dateFilters.FechaEmisionHasta),
            page: currentPage,
            limit: PAGE_SIZE
          },
          responseType: 'blob' // Para manejar la respuesta como un archivo
        }
      );

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'liquidacion_compras.xlsx');
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
            {isExporting ? (
              <>
                <span className="loader mr-2" style={{border: '2px solid #fff', borderRadius: '50%', width: '1em', height: '1em', display: 'inline-block', borderTop: '2px solid transparent', animation: 'spin 1s linear infinite'}}></span>
                Exportando...
              </>
            ) : (
              'Exportar a Excel'
            )}
          </button>
        </EndSlot>

        <LiquidacionTable
          data={liquidaciones}
          loading={loading}
          pagination={{ currentPage, totalPages, pageSize: PAGE_SIZE || 10, totalItems }}
          onPageChange={setCurrentPage}
        />
      </CardSlot>
    </>
  );
}
