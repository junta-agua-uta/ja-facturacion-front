import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { CardSlot } from '../../../shared/components'
import { showError, showSuccess } from '../../../shared/utils/notifications'
import { useReporteFiltros } from '../hooks/useReporteFiltros'
import {
  obtenerBalanceComprobacion,
  descargarBalanceComprobacionPdf,
} from '../services/reportes.service'
import type { BalanceComprobacionResponse } from '../types/reportes'
import ReportePageHeader from '../components/ReportePageHeader'
import ReporteFiltrosBar from '../components/ReporteFiltrosBar'
import ReporteKpiCard from '../components/ReporteKpiCard'
import ReporteEmptyState from '../components/ReporteEmptyState'
import ExportarPdfButton from '../components/ExportarPdfButton'
import ReporteAvisoPendientes from '../components/ReporteAvisoPendientes'
import ReporteTablaPaginacion from '../components/ReporteTablaPaginacion'
import { useAsientosPendientesPeriodo } from '../hooks/useAsientosPendientesPeriodo'
import { usePaginacionCliente } from '../hooks/usePaginacionCliente'
import { downloadBlob, formatMoney, parseApiError } from '../utils/reporteUi'

export default function BalanceComprobacionPage() {
  const { userLoading, userId, filters, setFilters, filtrosApi, filtrosListos, clearFilters } =
    useReporteFiltros()
  const asientosPendientes = useAsientosPendientesPeriodo(filtrosApi, filtrosListos)
  const [data, setData] = useState<BalanceComprobacionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await obtenerBalanceComprobacion(filtrosApi)
      setData(res)
      if (!res) setError('No se pudo obtener el balance de comprobación.')
    } catch (e: unknown) {
      setError(parseApiError(e, 'Error al cargar el balance de comprobación.'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filtrosApi])

  useEffect(() => {
    if (!filtrosListos) return
    void load()
  }, [filtrosListos, load])

  const filas = useMemo(() => {
    const q = filters.buscar.trim().toLowerCase()
    if (!data?.cuentas) return []
    if (!q) return data.cuentas
    return data.cuentas.filter(
      (c) => `${c.codigo} ${c.nombre}`.toLowerCase().includes(q),
    )
  }, [data, filters.buscar])

  const {
    page,
    setPage,
    total: totalFilas,
    totalPages,
    paginated: filasPagina,
  } = usePaginacionCliente(filas, [filters.buscar, data?.cuentas?.length ?? 0])

  const cuadra = data
    ? Math.abs(data.totales.totalDebe - data.totales.totalHaber) < 0.01
    : false

  const handleExport = async () => {
    setExportingPdf(true)
    try {
      const blob = await descargarBalanceComprobacionPdf(filtrosApi)
      if (!blob) {
        showError('No se pudo exportar el reporte.')
        return
      }
      downloadBlob(blob, 'balance-comprobacion.pdf')
      showSuccess('Balance de comprobación exportado.')
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
        title="Balance de Comprobación"
        subtitle="Sumas y saldos de todas las cuentas del periodo."
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
            label="Total debe"
            value={formatMoney(data.totales.totalDebe)}
            subtextClass="text-emerald-600"
          />
          <ReporteKpiCard
            label="Total haber"
            value={formatMoney(data.totales.totalHaber)}
            subtextClass="text-red-600"
          />
          <ReporteKpiCard
            label="Estado"
            value={cuadra ? 'Cuadrado' : 'Descuadrado'}
            subtext={cuadra ? 'Debe = Haber' : 'Revisar movimientos'}
            subtextClass={cuadra ? 'text-emerald-600' : 'text-red-600'}
            icon={cuadra ? <FaCheckCircle /> : <FaTimesCircle />}
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
        ) : !data || filas.length === 0 ? (
          <>
            <ReporteAvisoPendientes
              pendientes={asientosPendientes}
              periodoId={filtrosApi.periodoId}
            />
            <ReporteEmptyState message="No hay cuentas con movimientos de asientos aprobados para los filtros seleccionados." />
          </>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="table w-full">
              <thead>
                <tr className="bg-primary text-primary-content hover:bg-primary">
                  <th>Código</th>
                  <th>Cuenta</th>
                  <th className="text-right">Debe</th>
                  <th className="text-right">Haber</th>
                  <th className="text-right">Saldo deudor</th>
                  <th className="text-right">Saldo acreedor</th>
                </tr>
              </thead>
              <tbody>
                {filasPagina.map((c) => (
                  <tr key={c.cuentaId} className="hover:bg-gray-50">
                    <td className="font-mono text-primary">{c.codigo}</td>
                    <td>{c.nombre}</td>
                    <td className="text-right tabular-nums text-emerald-700">
                      {formatMoney(c.totalDebe)}
                    </td>
                    <td className="text-right tabular-nums text-red-600">
                      {formatMoney(c.totalHaber)}
                    </td>
                    <td className="text-right tabular-nums">
                      {c.saldoDeudor > 0 ? formatMoney(c.saldoDeudor) : '—'}
                    </td>
                    <td className="text-right tabular-nums">
                      {c.saldoAcreedor > 0 ? formatMoney(c.saldoAcreedor) : '—'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={2} className="text-primary uppercase text-sm">
                    Totales
                  </td>
                  <td className="text-right text-emerald-700 tabular-nums">
                    {formatMoney(data.totales.totalDebe)}
                  </td>
                  <td className="text-right text-red-600 tabular-nums">
                    {formatMoney(data.totales.totalHaber)}
                  </td>
                  <td className="text-right tabular-nums">
                    {formatMoney(data.totales.totalSaldoDeudor)}
                  </td>
                  <td className="text-right tabular-nums">
                    {formatMoney(data.totales.totalSaldoAcreedor)}
                  </td>
                </tr>
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
