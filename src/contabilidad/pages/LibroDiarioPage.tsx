import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaFilePdf, FaPlus } from 'react-icons/fa'
import { Title, CardSlot } from '../../shared/components'
import Pagination from '../../shared/components/Pagination'
import { PAGE_SIZE } from '../../shared/utils/constants'
import { showError, showSuccess } from '../../shared/utils/notifications'
import { empresaService } from '../../empresa/services/empresa.service'
import { useCurrentUser } from '../hooks/useCurrentUser'
import {
  listarAsientos,
  eliminarAsiento,
  exportarLibroDiarioPdf,
  obtenerKpisLibroDiario,
} from '../services/asientos.service'
import { listarPeriodos } from '../services/periodos.service'
import type { LibroDiarioRow } from '../types/libroDiario'
import LibroDiarioFilters, { type LibroDiarioFiltersState } from '../components/LibroDiarioFilters'
import LibroDiarioKpiCards, { type LibroDiarioKpis } from '../components/LibroDiarioKpiCards'
import LibroDiarioTable from '../components/LibroDiarioTable'
import ConfirmModal from '../../sucursales/modals/ConfirmModal'
import {
  comprobanteLibroDiario,
  defaultRangoAnioActual,
  isoDateEnd,
  isoDateStart,
} from '../utils/libroDiarioUi'

const MODAL_DELETE = 'modal_libro_diario_delete'

function buildDefaultFilters(periodo?: { fechaInicio: string; fechaFin: string } | null): LibroDiarioFiltersState {
  if (periodo) {
    return {
      buscar: '',
      fechaDesde: periodo.fechaInicio.slice(0, 10),
      fechaHasta: periodo.fechaFin.slice(0, 10),
      estado: '',
    }
  }
  const { desde, hasta } = defaultRangoAnioActual()
  return { buscar: '', fechaDesde: desde, fechaHasta: hasta, estado: '' }
}

export default function LibroDiarioPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const periodoIdParam = searchParams.get('periodoId')
  const { loading: userLoading, userId, empresaId } = useCurrentUser()

  const [empresaRuc, setEmpresaRuc] = useState('')
  const [filters, setFilters] = useState<LibroDiarioFiltersState>(() => buildDefaultFilters())
  const [rows, setRows] = useState<LibroDiarioRow[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingKpis, setLoadingKpis] = useState(true)
  const [kpis, setKpis] = useState<LibroDiarioKpis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [initializedPeriodo, setInitializedPeriodo] = useState(false)

  useEffect(() => {
    void empresaService.obtenerEmpresa().then((e) => setEmpresaRuc(e.ruc)).catch(() => { })
  }, [])

  useEffect(() => {
    if (!periodoIdParam || initializedPeriodo) return
    const id = Number(periodoIdParam)
    if (Number.isNaN(id)) return
    void listarPeriodos({ page: 1, limit: 100, empresaId }).then((res) => {
      const p = res.data.find((x) => x.id === id)
      if (p) setFilters(buildDefaultFilters({ fechaInicio: p.fechaInicio, fechaFin: p.fechaFin }))
      setInitializedPeriodo(true)
    })
  }, [periodoIdParam, initializedPeriodo, empresaId])

  const apiQueryBase = useMemo(
    () => ({
      ...(filters.estado ? { estado: filters.estado as 'PENDIENTE' | 'APROBADO' } : {}),
      ...(filters.fechaDesde ? { fechaInicio: isoDateStart(filters.fechaDesde) } : {}),
      ...(filters.fechaHasta ? { fechaFin: isoDateEnd(filters.fechaHasta) } : {}),
      ...(periodoIdParam && !Number.isNaN(Number(periodoIdParam))
        ? { periodoId: Number(periodoIdParam) }
        : {}),
    }),
    [filters.estado, filters.fechaDesde, filters.fechaHasta, periodoIdParam],
  )

  const handleExportPdf = async () => {
    try {
      const blob = await exportarLibroDiarioPdf({
        empresaId,
        estado: filters.estado || undefined,
        fechaInicio: filters.fechaDesde || undefined,
        fechaFin: filters.fechaHasta || undefined,
        periodoId: periodoIdParam ? Number(periodoIdParam) : undefined,
      })

      const url = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = 'libro_diario.pdf'
      a.click()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.log(error)
      showError('No se pudo exportar el PDF')
    }
  }

  const loadKpis = useCallback(async () => {
    setLoadingKpis(true)
    try {
      const data = await obtenerKpisLibroDiario({
        empresaId,
        estado: filters.estado || undefined,
        fechaInicio: filters.fechaDesde || undefined,
        fechaFin: filters.fechaHasta || undefined,
        periodoId: periodoIdParam ? Number(periodoIdParam) : undefined,
      })

      setKpis({
        totalAsientos: data.totalAsientos,
        asientosCuadrados: data.asientosCuadrados,
        asientosDescuadre: data.asientosDescuadrados,
        totalMovimientos: data.totalMovimientos,
        statsAproximados: false, // 🔥 ahora es real, no estimado
      })
    } catch {
      setKpis(null)
    } finally {
      setLoadingKpis(false)
    }
  }, [empresaId, filters, periodoIdParam])

  const loadList = useCallback(async () => {
    setLoadingList(true)
    setError(null)
    try {
      const res = await listarAsientos({
        page,
        limit: PAGE_SIZE,
        ...apiQueryBase,
      })
      const baseRows: LibroDiarioRow[] = res.data.map((a) => ({
        ...a,
        comprobanteLabel: comprobanteLibroDiario(a),
      }))
      setRows(baseRows)
      setTotalPages(Math.max(1, res.totalPages))
      setTotal(res.total)
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      setError(ax.response?.data?.message || 'No se pudo cargar el libro diario.')
      setRows([])
    } finally {
      setLoadingList(false)
    }
  }, [page, apiQueryBase])

  useEffect(() => {
    if (userLoading) return
    void loadList()
    void loadKpis()
  }, [userLoading, loadList, loadKpis])

  useEffect(() => {
    setPage(1)
  }, [filters.buscar, filters.estado, filters.fechaDesde, filters.fechaHasta])

  const rowsFiltradas = useMemo(() => {
    const q = filters.buscar.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const blob = `${row.comprobanteLabel} ${row.concepto} ${row.nombre}`.toLowerCase()
      return blob.includes(q)
    })
  }, [rows, filters.buscar])

  const handleClearFilters = () => {
    setFilters(buildDefaultFilters())
    setPage(1)
  }

  const openCreate = () => {
    const q = periodoIdParam ? `?periodoId=${periodoIdParam}` : ''
    navigate(`/junta/contabilidad/asientos/nuevo${q}`)
  }

  const openEdit = (id: number) => {
    navigate(`/junta/contabilidad/asientos/${id}/editar`)
  }

  const openDelete = (id: number) => {
    setDeleteTargetId(id)
      ; (document.getElementById(MODAL_DELETE) as HTMLDialogElement)?.showModal()
  }

  const confirmDelete = async () => {
    if (deleteTargetId == null) return
    try {
      await eliminarAsiento(deleteTargetId)
      showSuccess('Asiento eliminado.')
      setDeleteTargetId(null)
        ; (document.getElementById(MODAL_DELETE) as HTMLDialogElement)?.close()
      void loadList()
      void loadKpis()
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      showError(ax.response?.data?.message || 'No se pudo eliminar el asiento.')
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
    return (
      <div className="space-y-4">
        <Title title="Libro Diario" />
        <p className="text-error">No se pudo obtener el usuario actual. Vuelva a iniciar sesión.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Title title="Libro Diario" />
          <p className="mt-1 text-sm text-gray-500">
            {empresaRuc ? `RUC: ${empresaRuc}` : 'RUC: —'} | Gestión Contable
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            className="btn btn-outline border-primary text-primary hover:bg-primary/10 gap-2"
            title="Próximamente: requiere endpoint de exportación del libro completo"
            onClick={handleExportPdf}
          >
            <FaFilePdf />
            Exportar PDF
          </button>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={openCreate}
          >
            <FaPlus />
            Crear Asiento
          </button>
        </div>
      </div>

      <LibroDiarioKpiCards kpis={kpis} loading={loadingKpis} />

      <CardSlot>
        <LibroDiarioFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      </CardSlot>

      <CardSlot>
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        <LibroDiarioTable
          rows={rowsFiltradas}
          loading={loadingList}
          onEditar={openEdit}
          onEliminar={openDelete}
        />
        {!loadingList && total > 0 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {rowsFiltradas.length} de {total.toLocaleString('es-EC')} registros
              {filters.buscar.trim() ? ' (filtro local en página actual)' : ''}
            </p>
            <Pagination pagination={{ currentPage: page, totalPages }} onPageChange={setPage} />
          </div>
        )}
      </CardSlot>

      <ConfirmModal
        id={MODAL_DELETE}
        title="Eliminar asiento"
        message="¿Confirma eliminar este asiento del libro diario? Solo aplica a comprobantes pendientes."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteTargetId(null)
            ; (document.getElementById(MODAL_DELETE) as HTMLDialogElement)?.close()
        }}
      />
    </div>
  )
}
