import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { CardSlot } from '../../../shared/components'
import { showError, showSuccess } from '../../../shared/utils/notifications'
import { useReporteFiltros } from '../hooks/useReporteFiltros'
import {
  obtenerEstadoResultados,
  descargarEstadoResultadosPdf,
} from '../services/reportes.service'
import type { EstadoResultadosCuenta, EstadoResultadosResponse } from '../types/reportes'
import ReportePageHeader from '../components/ReportePageHeader'
import ReporteFiltrosBar from '../components/ReporteFiltrosBar'
import ReporteKpiCard from '../components/ReporteKpiCard'
import ReporteEmptyState from '../components/ReporteEmptyState'
import ExportarPdfButton from '../components/ExportarPdfButton'
import ReporteAvisoPendientes from '../components/ReporteAvisoPendientes'
import ReporteTablaPaginacion from '../components/ReporteTablaPaginacion'
import { useAsientosPendientesPeriodo } from '../hooks/useAsientosPendientesPeriodo'
import { usePaginacionCliente } from '../hooks/usePaginacionCliente'
import { aplanarCuentasPorSeccion, seccionVisibleEnPagina } from '../utils/filasSeccion'
import { downloadBlob, formatMoney, parseApiError } from '../utils/reporteUi'

function filtrarCuentas(cuentas: EstadoResultadosCuenta[], q: string) {
  if (!q) return cuentas
  const lower = q.toLowerCase()
  return cuentas.filter((c) => `${c.codigo} ${c.nombre}`.toLowerCase().includes(lower))
}

export default function EstadoResultadosPage() {
  const { userLoading, userId, filters, setFilters, filtrosApi, filtrosListos, clearFilters } =
    useReporteFiltros()
  const asientosPendientes = useAsientosPendientesPeriodo(filtrosApi, filtrosListos)
  const [data, setData] = useState<EstadoResultadosResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await obtenerEstadoResultados(filtrosApi)
      setData(res)
      if (!res) setError('No se pudo obtener el estado de resultados.')
    } catch (e: unknown) {
      setError(parseApiError(e, 'Error al cargar el estado de resultados.'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filtrosApi])

  useEffect(() => {
    if (!filtrosListos) return
    void load()
  }, [filtrosListos, load])

  const ingresos = useMemo(
    () => (data ? filtrarCuentas(data.ingresos, filters.buscar) : []),
    [data, filters.buscar],
  )
  const gastos = useMemo(
    () => (data ? filtrarCuentas(data.gastos, filters.buscar) : []),
    [data, filters.buscar],
  )

  const filasAplanadas = useMemo(
    () =>
      aplanarCuentasPorSeccion([
        { titulo: 'Ingresos', cuentas: ingresos },
        { titulo: 'Gastos', cuentas: gastos },
      ]),
    [ingresos, gastos],
  )

  const hayFilas = filasAplanadas.length > 0
  const utilidad = data?.totales.utilidad ?? 0

  const {
    page,
    setPage,
    total: totalFilas,
    totalPages,
    paginated: filasPagina,
  } = usePaginacionCliente(filasAplanadas, [
    filters.buscar,
    ingresos.length,
    gastos.length,
  ])

  const handleExport = async () => {
    setExportingPdf(true)
    try {
      const blob = await descargarEstadoResultadosPdf(filtrosApi)
      if (!blob) {
        showError('No se pudo exportar el reporte.')
        return
      }
      downloadBlob(blob, 'estado-resultados.pdf')
      showSuccess('Estado de resultados exportado.')
    } finally {
      setExportingPdf(false)
    }
  }

  if (userLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!userId) {
    return <ReporteEmptyState message="Inicie sesión para consultar este reporte." />
  }

  return (
    <div className="space-y-6 pb-8">
      <ReportePageHeader
        title="Estado de Resultados"
        subtitle="Ingresos, gastos y utilidad del periodo."
        actions={
          <ExportarPdfButton
            loading={exportingPdf}
            disabled={!data}
            onClick={() => void handleExport()}
          />
        }
      />

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <ReporteKpiCard
            label="Total ingresos"
            value={formatMoney(data.totales.ingresos)}
            subtextClass="text-emerald-600"
          />
          <ReporteKpiCard
            label="Total gastos"
            value={formatMoney(data.totales.gastos)}
            subtextClass="text-red-600"
          />
          <ReporteKpiCard
            label={utilidad >= 0 ? 'Utilidad' : 'Pérdida'}
            value={formatMoney(Math.abs(utilidad))}
            variant="primary"
            subtextClass={utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}
          />
        </div>
      )}

      <CardSlot>
        <ReporteFiltrosBar
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          buscarPlaceholder="Código o nombre de cuenta"
        />
      </CardSlot>

      <CardSlot>
        {error && (
          <div role="alert" className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : !data || !hayFilas ? (
          <>
            <ReporteAvisoPendientes
              pendientes={asientosPendientes}
              periodoId={filtrosApi.periodoId}
            />
            <ReporteEmptyState message="No hay ingresos/gastos de asientos aprobados para los filtros seleccionados." />
          </>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="table w-full">
              <thead>
                <tr className="bg-primary text-primary-content hover:bg-primary">
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {filasPagina.map((fila, index) => {
                  const colorSaldo =
                    fila.section === 'Ingresos' ? 'text-emerald-700' : 'text-red-600'
                  return (
                    <Fragment key={fila.key}>
                      {seccionVisibleEnPagina(index, filasPagina) && (
                        <tr className="bg-gray-100">
                          <td colSpan={3} className="font-semibold text-primary">
                            {fila.section}
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-gray-50">
                        <td className="font-mono text-sm text-primary">{fila.cuenta.codigo}</td>
                        <td>{fila.cuenta.nombre}</td>
                        <td className={`text-right tabular-nums font-medium ${colorSaldo}`}>
                          {formatMoney(fila.cuenta.saldo)}
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
            <ReporteTablaPaginacion
              currentPage={page}
              totalPages={totalPages}
              shown={filasPagina.length}
              total={totalFilas}
              onPageChange={setPage}
              label="cuentas"
              notaFiltroLocal={
                filters.buscar.trim() ? 'filtro local en resultados' : undefined
              }
            />
          </div>
        )}
      </CardSlot>
    </div>
  )
}
