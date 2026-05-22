import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { CardSlot } from '../../../shared/components'
import { showError, showSuccess } from '../../../shared/utils/notifications'
import { useReporteFiltros } from '../hooks/useReporteFiltros'
import {
  obtenerCarteraClientes,
  descargarCarteraClientesPdf,
} from '../services/reportes.service'
import type { CarteraClienteItem, FiltrosCarteraBody } from '../types/reportes'
import ReportePageHeader from '../components/ReportePageHeader'
import ReporteFiltrosBar from '../components/ReporteFiltrosBar'
import ReporteKpiCard from '../components/ReporteKpiCard'
import ReporteEmptyState from '../components/ReporteEmptyState'
import ExportarPdfButton from '../components/ExportarPdfButton'
import ReporteTablaPaginacion from '../components/ReporteTablaPaginacion'
import { usePaginacionCliente } from '../hooks/usePaginacionCliente'
import {
  defaultRangoAnioActual,
  downloadBlob,
  formatFechaReporte,
  formatMoney,
  isoDateEnd,
  isoDateStart,
  parseApiError,
} from '../utils/reporteUi'

export default function CarteraClientesPage() {
  const { userLoading, userId, empresaId, filters, setFilters } = useReporteFiltros()
  const [clientes, setClientes] = useState<CarteraClienteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filtrosApi = useMemo((): FiltrosCarteraBody => {
    const body: FiltrosCarteraBody = { empresaId }
    if (filters.fechaDesde) body.fechaInicio = isoDateStart(filters.fechaDesde)
    if (filters.fechaHasta) body.fechaFin = isoDateEnd(filters.fechaHasta)
    return body
  }, [empresaId, filters.fechaDesde, filters.fechaHasta])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await obtenerCarteraClientes(filtrosApi)
      setClientes(res)
    } catch (e: unknown) {
      setError(parseApiError(e, 'Error al cargar la cartera de clientes.'))
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [filtrosApi])

  useEffect(() => {
    if (userLoading) return
    void load()
  }, [userLoading, load])

  const clientesFiltrados = useMemo(() => {
    const q = filters.buscar.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        `${c.razonSocial} ${c.identificacion}`.toLowerCase().includes(q),
    )
  }, [clientes, filters.buscar])

  const {
    page,
    setPage,
    total: totalClientes,
    totalPages,
    paginated: clientesPagina,
  } = usePaginacionCliente(clientesFiltrados, [filters.buscar, clientes.length])

  useEffect(() => {
    setExpandedId(null)
  }, [page])

  const totales = useMemo(() => {
    return clientesFiltrados.reduce(
      (acc, c) => ({
        totalDebe: acc.totalDebe + c.totalDebe,
        totalAbonos: acc.totalAbonos + c.totalAbonos,
        saldoTotal: acc.saldoTotal + c.saldoTotal,
      }),
      { totalDebe: 0, totalAbonos: 0, saldoTotal: 0 },
    )
  }, [clientesFiltrados])

  const handleClear = () => {
    const { desde, hasta } = defaultRangoAnioActual()
    setFilters({ buscar: '', fechaDesde: desde, fechaHasta: hasta, periodoId: null })
  }

  const handleExport = async () => {
    setExportingPdf(true)
    try {
      const blob = await descargarCarteraClientesPdf(filtrosApi)
      if (!blob) {
        showError('No se pudo exportar el reporte.')
        return
      }
      downloadBlob(blob, 'cartera-clientes.pdf')
      showSuccess('Cartera de clientes exportada.')
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
    return <ReporteEmptyState message="Inicie sesión para consultar la cartera." />
  }

  return (
    <div className="space-y-6 pb-8">
      <ReportePageHeader
        title="Cartera de Clientes"
        subtitle="Cuentas por cobrar y saldos pendientes por cliente."
        actions={
          <ExportarPdfButton
            loading={exportingPdf}
            disabled={clientes.length === 0}
            onClick={() => void handleExport()}
          />
        }
      />

      {clientesFiltrados.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <ReporteKpiCard label="Total facturado" value={formatMoney(totales.totalDebe)} />
          <ReporteKpiCard
            label="Total abonos"
            value={formatMoney(totales.totalAbonos)}
            subtextClass="text-emerald-600"
          />
          <ReporteKpiCard
            label="Saldo cartera"
            value={formatMoney(totales.saldoTotal)}
            variant="primary"
          />
        </div>
      )}

      <CardSlot>
        <ReporteFiltrosBar
          filters={filters}
          onChange={setFilters}
          onClear={handleClear}
          buscarPlaceholder="Cliente o identificación"
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
        ) : clientesFiltrados.length === 0 ? (
          <ReporteEmptyState message="No hay registros en cartera para los filtros seleccionados." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="table w-full">
              <thead>
                <tr className="bg-primary text-primary-content hover:bg-primary">
                  <th>Cliente</th>
                  <th>Identificación</th>
                  <th className="text-right">Valor original</th>
                  <th className="text-right">Abonos</th>
                  <th className="text-right">Saldo</th>
                  <th className="text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {clientesPagina.map((c) => (
                  <Fragment key={c.clienteId}>
                    <tr className="hover:bg-gray-50">
                      <td className="font-medium">{c.razonSocial}</td>
                      <td className="font-mono text-sm">{c.identificacion}</td>
                      <td className="text-right tabular-nums">{formatMoney(c.totalDebe)}</td>
                      <td className="text-right tabular-nums text-emerald-700">
                        {formatMoney(c.totalAbonos)}
                      </td>
                      <td className="text-right tabular-nums font-semibold">
                        {formatMoney(c.saldoTotal)}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-primary"
                          onClick={() =>
                            setExpandedId(expandedId === c.clienteId ? null : c.clienteId)
                          }
                        >
                          {expandedId === c.clienteId ? 'Ocultar' : 'Ver'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === c.clienteId && c.cuentas.length > 0 && (
                      <tr key={`${c.clienteId}-det`}>
                        <td colSpan={6} className="bg-gray-50 p-0">
                          <table className="table table-sm w-full">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th className="text-right">Valor</th>
                                <th className="text-right">Abonos</th>
                                <th className="text-right">Saldo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.cuentas.map((cuenta) => (
                                <tr key={cuenta.cuentaId}>
                                  <td>{formatFechaReporte(cuenta.fechaEmision)}</td>
                                  <td>{cuenta.estado}</td>
                                  <td className="text-right tabular-nums">
                                    {formatMoney(cuenta.valorOriginal)}
                                  </td>
                                  <td className="text-right tabular-nums text-emerald-700">
                                    {formatMoney(cuenta.abonos)}
                                  </td>
                                  <td className="text-right tabular-nums">
                                    {formatMoney(cuenta.saldo)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <ReporteTablaPaginacion
              currentPage={page}
              totalPages={totalPages}
              shown={clientesPagina.length}
              total={totalClientes}
              onPageChange={setPage}
              label="clientes"
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
