import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { CardSlot } from '../../../shared/components'
import { showError, showSuccess } from '../../../shared/utils/notifications'
import { useReporteFiltros } from '../hooks/useReporteFiltros'
import {
  obtenerBalanceGeneral,
  descargarBalanceGeneralPdf,
} from '../services/reportes.service'
import type { BalanceGeneralCuenta, BalanceGeneralResponse } from '../types/reportes'
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

function filtrarCuentas(cuentas: BalanceGeneralCuenta[], q: string) {
  if (!q) return cuentas
  const lower = q.toLowerCase()
  return cuentas.filter((c) => `${c.codigo} ${c.nombre}`.toLowerCase().includes(lower))
}

export default function BalanceGeneralPage() {
  const { userLoading, userId, filters, setFilters, filtrosApi, filtrosListos, clearFilters } =
    useReporteFiltros()
  const asientosPendientes = useAsientosPendientesPeriodo(filtrosApi, filtrosListos)
  const [data, setData] = useState<BalanceGeneralResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await obtenerBalanceGeneral(filtrosApi)
      setData(res)
      if (!res) setError('No se pudo obtener el balance general.')
    } catch (e: unknown) {
      setError(parseApiError(e, 'Error al cargar el balance general.'))
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [filtrosApi])

  useEffect(() => {
    if (!filtrosListos) return
    void load()
  }, [filtrosListos, load])

  const activos = useMemo(
    () => (data ? filtrarCuentas(data.activos, filters.buscar) : []),
    [data, filters.buscar],
  )
  const pasivos = useMemo(
    () => (data ? filtrarCuentas(data.pasivos, filters.buscar) : []),
    [data, filters.buscar],
  )
  const patrimonio = useMemo(
    () => (data ? filtrarCuentas(data.patrimonio, filters.buscar) : []),
    [data, filters.buscar],
  )

  const filasAplanadas = useMemo(
    () =>
      aplanarCuentasPorSeccion([
        { titulo: 'Activos', cuentas: activos },
        { titulo: 'Pasivos', cuentas: pasivos },
        { titulo: 'Patrimonio', cuentas: patrimonio },
      ]),
    [activos, pasivos, patrimonio],
  )

  const hayFilas = filasAplanadas.length > 0

  const {
    page,
    setPage,
    total: totalFilas,
    totalPages,
    paginated: filasPagina,
  } = usePaginacionCliente(filasAplanadas, [
    filters.buscar,
    activos.length,
    pasivos.length,
    patrimonio.length,
  ])

  const handleExport = async () => {
    setExportingPdf(true)
    try {
      const blob = await descargarBalanceGeneralPdf(filtrosApi)
      if (!blob) {
        showError('No se pudo exportar el reporte.')
        return
      }
      downloadBlob(blob, 'balance-general.pdf')
      showSuccess('Balance general exportado.')
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
        title="Balance General"
        subtitle="Activos, pasivos y patrimonio a la fecha del reporte."
        actions={
          <ExportarPdfButton
            loading={exportingPdf}
            disabled={!data}
            onClick={() => void handleExport()}
          />
        }
      />

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReporteKpiCard label="Total activos" value={formatMoney(data.totales.activos)} />
          <ReporteKpiCard label="Total pasivos" value={formatMoney(data.totales.pasivos)} />
          <ReporteKpiCard label="Patrimonio" value={formatMoney(data.totales.patrimonio)} />
          <ReporteKpiCard
            label="Pasivo + patrimonio"
            value={formatMoney(data.totales.pasivoMasPatrimonio)}
            variant="primary"
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
            <ReporteEmptyState message="No hay datos de balance general (solo asientos aprobados) para los filtros seleccionados." />
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
                {filasPagina.map((fila, index) => (
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
                      <td className="text-right tabular-nums font-medium">
                        {formatMoney(fila.cuenta.saldo)}
                      </td>
                    </tr>
                  </Fragment>
                ))}
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
