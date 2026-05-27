import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  FaHistory,
  FaPlusCircle,
  FaMinusCircle,
  FaMoneyBillWave,
  FaTable,
} from 'react-icons/fa'
import { CardSlot } from '../../../shared/components'
import { showError, showSuccess } from '../../../shared/utils/notifications'
import { useReporteFiltros } from '../hooks/useReporteFiltros'
import {
  obtenerLibroMayorResumen,
  obtenerLibroMayorDetalle,
  descargarLibroMayorPdf,
} from '../services/reportes.service'
import type { LibroMayorCuentaResumen, LibroMayorMovimiento } from '../types/reportes'
import ReportePageHeader from '../components/ReportePageHeader'
import ReporteFiltrosBar from '../components/ReporteFiltrosBar'
import ReporteKpiCard from '../components/ReporteKpiCard'
import ReporteEmptyState from '../components/ReporteEmptyState'
import ExportarPdfButton from '../components/ExportarPdfButton'
import ReporteAvisoPendientes from '../components/ReporteAvisoPendientes'
import ReporteTablaPaginacion from '../components/ReporteTablaPaginacion'
import { useAsientosPendientesPeriodo } from '../hooks/useAsientosPendientesPeriodo'
import { usePaginacionCliente } from '../hooks/usePaginacionCliente'
import {
  calcularKpisLibroMayor,
  comprobanteDesdeNumero,
  downloadBlob,
  formatFechaReporte,
  formatMoney,
  parseApiError,
} from '../utils/reporteUi'

export default function LibroMayorPage() {
  const { userLoading, userId, filters, setFilters, filtrosApi, filtrosListos, clearFilters } =
    useReporteFiltros()
  const asientosPendientes = useAsientosPendientesPeriodo(filtrosApi, filtrosListos)

  const [cuentas, setCuentas] = useState<LibroMayorCuentaResumen[]>([])
  const [cuentaId, setCuentaId] = useState<number | null>(null)
  const [movimientos, setMovimientos] = useState<LibroMayorMovimiento[]>([])
  const [cuentaLabel, setCuentaLabel] = useState('')
  const [loadingCuentas, setLoadingCuentas] = useState(false)
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cuentasFiltradas, setCuentasFiltradas] = useState<LibroMayorCuentaResumen[]>([])
  const loadCuentas = useCallback(async () => {
    setLoadingCuentas(true)
    setError(null)
    try {
      const res = await obtenerLibroMayorResumen(filtrosApi)
      setCuentas(res)
      const filtradas = res.filter(cuenta => {
        // Si no tiene nivel, mostrarlo como advertencia
        if (cuenta.nivel === undefined || cuenta.nivel === null) {
          console.warn(`⚠️ Cuenta sin nivel: ${cuenta.codigo} - ${cuenta.nombre}`);
          return false; // o true si quieres mostrarlas igual
        }
        return cuenta.nivel > 3;
      });
      setCuentasFiltradas(filtradas)

      if (filtradas.length === 0) {
        setCuentaId(null)
        setMovimientos([])
        setCuentaLabel('')
      } else if (cuentaId && !filtradas.some((c) => c.cuentaId === cuentaId)) {
        setCuentaId(null)
        setMovimientos([])
      }
    } catch (e: unknown) {
      setError(parseApiError(e, 'No se pudo cargar las cuentas del libro mayor.'))
      setCuentas([])
      setCuentasFiltradas([])
    } finally {
      setLoadingCuentas(false)
    }
  }, [filtrosApi, cuentaId])

  const loadDetalle = useCallback(async () => {
    if (cuentaId == null) {
      setMovimientos([])
      return
    }
    setLoadingDetalle(true)
    setError(null)
    try {
      const detalle = await obtenerLibroMayorDetalle({ ...filtrosApi, cuentaId })
      if (!detalle) {
        setMovimientos([])
        setError('No se encontró el detalle de la cuenta seleccionada.')
        return
      }
      setMovimientos(detalle.movimientos ?? [])
      setCuentaLabel(`${detalle.codigo} - ${detalle.nombre}`)
    } catch (e: unknown) {
      setError(parseApiError(e, 'No se pudo cargar el detalle de la cuenta.'))
      setMovimientos([])
    } finally {
      setLoadingDetalle(false)
    }
  }, [filtrosApi, cuentaId])

  useEffect(() => {
    if (!filtrosListos) return
    void loadCuentas()
  }, [filtrosListos, loadCuentas])

  useEffect(() => {
    if (!filtrosListos || cuentaId == null) return
    void loadDetalle()
  }, [filtrosListos, cuentaId, loadDetalle])

  const movimientosFiltrados = useMemo(() => {
    const q = filters.buscar.trim().toLowerCase()
    if (!q) return movimientos
    return movimientos.filter((m) => {
      const blob = `${comprobanteDesdeNumero(m.numero)} ${m.concepto}`.toLowerCase()
      return blob.includes(q)
    })
  }, [movimientos, filters.buscar])

  const {
    page,
    setPage,
    total: totalMovimientos,
    totalPages,
    paginated: movimientosPagina,
  } = usePaginacionCliente(movimientosFiltrados, [
    filters.buscar,
    cuentaId,
    filters.fechaDesde,
    filters.fechaHasta,
    movimientos.length,
  ])

  const kpis = useMemo(
    () => calcularKpisLibroMayor(movimientosFiltrados),
    [movimientosFiltrados],
  )

  const totalesPeriodo = useMemo(() => {
    const totalDebe = movimientosFiltrados.reduce((s, m) => s + Number(m.debe), 0)
    const totalHaber = movimientosFiltrados.reduce((s, m) => s + Number(m.haber), 0)
    const saldoFinal = movimientosFiltrados.length
      ? Number(movimientosFiltrados[movimientosFiltrados.length - 1].saldo)
      : 0
    return { totalDebe, totalHaber, saldoFinal }
  }, [movimientosFiltrados])

  const handleExportPdf = async () => {
    setExportingPdf(true)
    try {
      const blob = await descargarLibroMayorPdf(filtrosApi)
      if (!blob) {
        showError('No se pudo exportar el libro mayor.')
        return
      }
      downloadBlob(blob, 'libro-mayor.pdf')
      showSuccess('Libro mayor exportado correctamente.')
    } catch {
      showError('No se pudo exportar el libro mayor.')
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
    return <ReporteEmptyState message="Inicie sesión para consultar el libro mayor." />
  }

  return (
    <div className="space-y-6 pb-8">
      <ReportePageHeader
        title="Libro Mayor"
        subtitle="Consulta detallada de movimientos contables por cuenta."
        actions={
          <ExportarPdfButton
            loading={exportingPdf}
            disabled={cuentas.length === 0}
            onClick={() => void handleExportPdf()}
          />
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-end">
        <label className="form-control w-full sm:max-w-md">
          <span className="label-text mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Seleccionar cuenta contable
          </span>
          <select
            className="select select-bordered w-full"
            value={cuentaId ?? ''}
            disabled={loadingCuentas || cuentasFiltradas.length === 0}
            onChange={(e) => setCuentaId(Number(e.target.value) || null)}
          >
            <option value="">
              {loadingCuentas
                ? 'Cargando cuentas…'
                : cuentasFiltradas.length === 0
                  ? 'Sin cuentas con movimientos'
                  : 'Seleccione una cuenta'}
            </option>
            {cuentasFiltradas.map((c) => (
              <option key={c.cuentaId} value={c.cuentaId}>
                {c.codigo} - {c.nombre}
                {/* Mostrar nivel para depuración */}
                {c.nivel && ` (Nivel ${c.nivel})`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cuentaId != null && !loadingDetalle && movimientos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReporteKpiCard
            label="Saldo inicial"
            value={formatMoney(kpis.saldoInicial)}
            subtext="Al inicio del periodo filtrado"
            icon={<FaHistory className="h-5 w-5" />}
          />
          <ReporteKpiCard
            label="Total debe"
            value={formatMoney(kpis.totalDebe)}
            subtext="Ingresos del periodo"
            subtextClass="text-emerald-600"
            icon={<FaPlusCircle className="h-5 w-5 text-emerald-600" />}
          />
          <ReporteKpiCard
            label="Total haber"
            value={formatMoney(kpis.totalHaber)}
            subtext="Egresos del periodo"
            subtextClass="text-red-600"
            icon={<FaMinusCircle className="h-5 w-5 text-red-600" />}
          />
          <ReporteKpiCard
            label="Saldo final"
            value={formatMoney(kpis.saldoFinal)}
            subtext="Balance actualizado"
            variant="primary"
            icon={<FaMoneyBillWave className="h-5 w-5" />}
          />
        </div>
      )}

      <CardSlot>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
            <FaTable className="h-4 w-4" />
            Movimientos del periodo
            {cuentaLabel && (
              <span className="text-sm font-normal text-gray-500">· {cuentaLabel}</span>
            )}
          </h3>
        </div>
        <ReporteFiltrosBar filters={filters} onChange={setFilters} onClear={clearFilters} />
      </CardSlot>

      <CardSlot>
        {error && (
          <div role="alert" className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        {loadingDetalle ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : cuentaId == null ? (
          <>
            <ReporteAvisoPendientes
              pendientes={asientosPendientes}
              periodoId={filtrosApi.periodoId}
            />
            <ReporteEmptyState
              title={cuentas.length === 0 ? 'Sin cuentas con movimientos' : 'Seleccione una cuenta'}
              message={
                cuentas.length === 0
                  ? 'No hay líneas contables de asientos aprobados en este periodo. Si tiene asientos pendientes, contabilícelos primero.'
                  : 'Elija una cuenta contable para ver los movimientos del libro mayor.'
              }
            />
          </>
        ) : movimientosFiltrados.length === 0 ? (
          <ReporteEmptyState message="No hay movimientos para la cuenta y filtros seleccionados." />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="table w-full">
                <thead>
                  <tr className="bg-primary text-primary-content hover:bg-primary">
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Referencia</th>
                    <th>Concepto</th>
                    <th className="text-right">Debe</th>
                    <th className="text-right">Haber</th>
                    <th className="text-right">Saldo acum.</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosPagina.map((row, idx) => (
                    <tr key={`${row.numero}-${row.fecha}-${idx}`} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap">{formatFechaReporte(row.fecha)}</td>
                      <td className="font-mono text-sm text-primary">
                        {comprobanteDesdeNumero(row.numero)}
                      </td>
                      <td className="text-sm text-gray-500">—</td>
                      <td className="max-w-xs truncate" title={row.concepto}>
                        {row.concepto}
                      </td>
                      <td className="text-right tabular-nums text-emerald-700">
                        {row.debe > 0 ? formatMoney(row.debe) : '—'}
                      </td>
                      <td className="text-right tabular-nums text-red-600">
                        {row.haber > 0 ? formatMoney(row.haber) : '—'}
                      </td>
                      <td className="text-right font-semibold tabular-nums">
                        {formatMoney(row.saldo)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="text-primary uppercase text-sm">
                      Totales del periodo
                    </td>
                    <td className="text-right text-emerald-700 tabular-nums">
                      {formatMoney(totalesPeriodo.totalDebe)}
                    </td>
                    <td className="text-right text-red-600 tabular-nums">
                      {formatMoney(totalesPeriodo.totalHaber)}
                    </td>
                    <td className="text-right tabular-nums">
                      {formatMoney(totalesPeriodo.saldoFinal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ReporteTablaPaginacion
              currentPage={page}
              totalPages={totalPages}
              shown={movimientosPagina.length}
              total={totalMovimientos}
              onPageChange={setPage}
              label="movimientos"
              notaFiltroLocal={
                filters.buscar.trim() ? 'filtro local en resultados' : undefined
              }
            />
          </>
        )}
      </CardSlot>
    </div>
  )
}
