import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Title, SubTitle, CardSlot } from '../../shared/components'
import { FaCheck } from 'react-icons/fa'
import { PAGE_SIZE } from '../../shared/utils/constants'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { listarAsientos, obtenerAsiento, eliminarAsiento, aprobarAsiento, aprobarAsientosLote, descargarAsientoPdf, agruparPorDia, agruparPorPeriodo } from '../services/asientos.service'
import { listarPeriodos } from '../services/periodos.service'
import { empresaService } from '../../empresa/services/empresa.service'
import type { AsientoDetalle, AsientoListItem } from '../types/asiento'
import type { PeriodoContable } from '../types/periodo'
import { inferTipoMovimiento } from '../utils/asientoUi'
import type { TipoMovimientoUi } from '../types/asiento'
import StatusBadge from '../components/StatusBadge'
import AsientosFilters from '../components/AsientosFilters'
import type { AsientosFiltersState } from '../components/AsientosFilters'
import AsientosTable from '../components/AsientosTable'
import AsientoDetailModal from '../components/AsientoDetailModal'
import AsientoAgrupacionModal, { type ModoAsientos } from '../components/AsientoAgrupacionModal'
import ConfirmModal from '../../sucursales/modals/ConfirmModal'
import { showError, showSuccess } from '../../shared/utils/notifications'
import Pagination from '../../shared/components/Pagination'

const MODAL_DETAIL = 'modal_asiento_detalle'
const MODAL_DELETE = 'modal_asiento_delete'
const MODAL_AGRUPACION = 'modal_asiento_agrupacion'

const defaultFilters: AsientosFiltersState = {
  buscar: '',
  estado: '',
  tipo: '',
}

export default function AsientosPage() {
  const navigate = useNavigate()
  const { loading: userLoading, empresaId, userId } = useCurrentUser()

  const [periodos, setPeriodos] = useState<PeriodoContable[]>([])
  const [periodoId, setPeriodoId] = useState<number | null>(null)

  const [asientos, setAsientos] = useState<AsientoListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loadingList, setLoadingList] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<AsientosFiltersState>(defaultFilters)

  const [detail, setDetail] = useState<AsientoDetalle | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // ---- Modo de asientos de la empresa ----
  const [modoAsientos, setModoAsientos] = useState<ModoAsientos>('INDIVIDUAL')
  const [agrupando, setAgrupando] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const emp = await empresaService.obtenerEmpresa()
        setModoAsientos((emp.modoAsientos as ModoAsientos) || 'INDIVIDUAL')
      } catch {
        // fallback, se queda en INDIVIDUAL
      }
    })()
  }, [])

  const periodoActual = useMemo(
    () => periodos.find((p) => p.id === periodoId) ?? null,
    [periodos, periodoId],
  )

  const loadPeriodos = useCallback(async () => {
    try {
      const res = await listarPeriodos({
        empresaId,
        page: 1,
        limit: 50,
      })
      setPeriodos(res.data)
      const abierto = res.data.find((p) => p.estado === 'ABIERTO')
      setPeriodoId((prev) => {
        if (prev && res.data.some((p) => p.id === prev)) return prev
        return abierto?.id ?? res.data[0]?.id ?? null
      })
    } catch {
      setError('No se pudieron cargar los periodos contables.')
    }
  }, [empresaId])

  useEffect(() => {
    if (userLoading || !userId) return
    void loadPeriodos()
  }, [userLoading, userId, loadPeriodos])

  const loadAsientos = useCallback(async () => {
    if (periodoId == null) {
      setAsientos([])
      setLoadingList(false)
      return
    }
    setLoadingList(true)
    setError(null)
    try {
      const res = await listarAsientos({
        page,
        limit: PAGE_SIZE,
        periodoId,
        ...(filters.estado ? { estado: filters.estado } : {}),
      })
      setAsientos(res.data)
      setTotalPages(Math.max(1, res.totalPages))
      setTotal(res.total)
      setSelectedIds([])
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      setError(ax.response?.data?.message || 'No se pudo cargar el listado de asientos.')
    } finally {
      setLoadingList(false)
    }
  }, [page, periodoId, filters.estado])

  useEffect(() => {
    void loadAsientos()
  }, [loadAsientos])

  useEffect(() => {
    setPage(1)
  }, [periodoId, filters.estado])

  const rowsFiltradas = useMemo(() => {
    const q = filters.buscar.trim().toLowerCase()
    return asientos.filter((row) => {
      const tipo = inferTipoMovimiento(row.modelo, row.comprobante) as TipoMovimientoUi
      if (filters.tipo && tipo !== filters.tipo) return false
      if (!q) return true
      const blob = `${row.concepto} ${row.nombre} ${row.comprobante ?? ''}`.toLowerCase()
      return blob.includes(q)
    })
  }, [asientos, filters.buscar, filters.tipo])

  const openDetail = async (id: number) => {
    setDetail(null)
    setDetailLoading(true)
      ; (document.getElementById(MODAL_DETAIL) as HTMLDialogElement)?.showModal()
    try {
      const data = await obtenerAsiento(id)
      setDetail(data)
    } catch {
      showError('No se pudo cargar el detalle del asiento.')
        ; (document.getElementById(MODAL_DETAIL) as HTMLDialogElement)?.close()
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetail(null)
      ; (document.getElementById(MODAL_DETAIL) as HTMLDialogElement)?.close()
  }

  const openCreate = () => {
    if (!userId || periodoId == null) {
      showError('Seleccione un periodo e inicie sesión para crear asientos.')
      return
    }
    navigate(`/junta/contabilidad/asientos/nuevo?periodoId=${periodoId}`)
  }

  const openEdit = (id: number) => {
    if (!userId || periodoId == null) return
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
      void loadAsientos()
        ; (document.getElementById(MODAL_DELETE) as HTMLDialogElement)?.close()
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      showError(ax.response?.data?.message || 'No se pudo eliminar el asiento.')
    }
  }

  const handleSelect = (id: number, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(rowsFiltradas.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleAprobar = async (id: number) => {
    try {
      if (!window.confirm('¿Desea aprobar este asiento contabilizando sus valores?')) return
      await aprobarAsiento(id)
      showSuccess('Asiento aprobado con éxito.')
      void loadAsientos()
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      showError(ax.response?.data?.message || 'Error al aprobar asiento.')
    }
  }

  const handleAprobarLote = async () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`¿Desea aprobar ${selectedIds.length} asiento(s)?`)) return
    try {
      const res = await aprobarAsientosLote(selectedIds)
      showSuccess(res.message || 'Lote de asientos aprobado.')
      setSelectedIds([])
      void loadAsientos()
    } catch (e: unknown) {
      const ax = e as { response?: { data?: { message?: string } } }
      showError(ax.response?.data?.message || 'Error al aprobar el lote.')
    }
  }

  const handleDescargarPdf = async (id: number) => {
    if (!empresaId) return;
    try {
      const blob = await descargarAsientoPdf(id, empresaId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `comprobante_diario_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (e: unknown) {
      showError('Error al descargar el PDF del asiento.')
    }
  }

  const getErrorMessage = (e: unknown, fallback: string) => {
    const ax = e as { response?: { data?: { message?: string | string[] } } }
    const message = ax.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    return message || fallback
  }

  const openAgrupacion = () => {
    ; (document.getElementById(MODAL_AGRUPACION) as HTMLDialogElement)?.showModal()
  }

  const closeAgrupacion = () => {
    ; (document.getElementById(MODAL_AGRUPACION) as HTMLDialogElement)?.close()
  }

  const handleAgruparPorDia = async (fecha: string) => {
    if (!empresaId) {
      showError('No se pudo identificar la empresa actual.')
      return
    }

    try {
      setAgrupando(true)
      const res = await agruparPorDia({ fecha, empresaId })
      showSuccess(res.message || 'Facturas agrupadas por dia correctamente.')
      closeAgrupacion()
      await loadAsientos()
    } catch (e: unknown) {
      showError(getErrorMessage(e, 'No se pudieron agrupar las facturas.'))
    } finally {
      setAgrupando(false)
    }
  }

  const handleAgruparPorPeriodo = async () => {
    if (!empresaId || !periodoId) {
      showError('Seleccione un periodo activo.')
      return
    }

    try {
      setAgrupando(true)
      const res = await agruparPorPeriodo({ periodoId, empresaId })
      showSuccess(res.message || 'Facturas agrupadas por periodo correctamente.')
      closeAgrupacion()
      await loadAsientos()
    } catch (e: unknown) {
      showError(getErrorMessage(e, 'No se pudieron agrupar las facturas del periodo.'))
    } finally {
      setAgrupando(false)
    }
  }

  const agrupacionLabel = useMemo(() => {
    if (modoAsientos === 'DIARIO') return 'Agrupar por dia'
    if (modoAsientos === 'MENSUAL') return 'Agrupar por periodo'
    return 'Agrupacion automatica'
  }, [modoAsientos])

  const modoAsientosInfo = useMemo(() => {
    if (modoAsientos === 'DIARIO') {
      return {
        label: 'Diario',
        description: 'Agrupa ventas autorizadas por fecha.',
      }
    }

    if (modoAsientos === 'MENSUAL') {
      return {
        label: 'Mensual',
        description: 'Agrupa ventas del periodo seleccionado.',
      }
    }

    return {
      label: 'Individual',
      description: 'Cada factura autorizada genera su asiento.',
    }
  }, [modoAsientos])

  const renderAgrupacionAction = () => {
    if (modoAsientos === 'INDIVIDUAL') {
      return null
    }

    return (
      <button
        type="button"
        className="btn btn-outline btn-info gap-2"
        onClick={openAgrupacion}
        disabled={agrupando}
      >
        {agrupando && <span className="loading loading-spinner loading-sm" />}
        {agrupacionLabel}
      </button>
    )
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
        <Title title="Asientos contables" />
        <p className="text-error">No se pudo obtener el usuario actual. Vuelva a iniciar sesión.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Title title="Asientos contables" />

      <CardSlot>
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-4 md:grid-cols-[minmax(13rem,21rem)_minmax(13rem,1fr)_auto] md:items-center">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-base-content/60">Periodo activo</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <select
                  className="select select-bordered select-sm w-full"
                  value={periodoId ?? ''}
                  onChange={(e) => setPeriodoId(Number(e.target.value) || null)}
                >
                  {periodos.length === 0 ? (
                    <option value="">Sin periodos</option>
                  ) : (
                    periodos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))
                  )}
                </select>
                {periodoActual && <StatusBadge kind="periodo" value={periodoActual.estado} />}
              </div>
            </div>
            <div
              className="min-w-0 rounded-md border border-blue-100 bg-blue-50/70 px-4 py-3 text-blue-950"
              title="Modo de generación de asientos de la empresa"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-800/80">
                  Modo de asientos
                </span>
                <span className="rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {modoAsientosInfo.label}
                </span>
              </div>
              <p className="mt-1 text-sm leading-snug text-slate-600">
                {modoAsientosInfo.description}
              </p>
            </div>

            <p className="text-sm leading-relaxed text-base-content/60 md:text-right">
              {total} asiento{total !== 1 ? 's' : ''}<br className="hidden md:block" /> en este periodo
              <span className="whitespace-nowrap"> (pág. {page}/{totalPages})</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
            {renderAgrupacionAction()}

            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-success gap-2"
                onClick={handleAprobarLote}
              >
                <FaCheck /> Aprobar Lote ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary gap-2"
              disabled={periodoActual?.estado === 'CERRADO' || periodoId == null}
              onClick={openCreate}
            >
              <span className="text-lg leading-none">+</span>
              Nuevo asiento manual
            </button>
          </div>
        </div>
      </CardSlot>

      <CardSlot>
        <SubTitle title="Filtros" />
        <AsientosFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => {
            setFilters(defaultFilters)
            setPage(1)
          }}
        />
      </CardSlot>

      <CardSlot>
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        <AsientosTable
          rows={rowsFiltradas}
          loading={loadingList}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onVer={openDetail}
          onEditar={openEdit}
          onEliminar={openDelete}
          onAprobar={handleAprobar}
          onDescargarPdf={handleDescargarPdf}
        />
        {!loadingList && periodoId != null && total > 0 && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <Pagination pagination={{ currentPage: page, totalPages }} onPageChange={setPage} />
            <p className="text-xs text-base-content/60">
              Página {page} de {totalPages} · {total} asiento{total !== 1 ? 's' : ''}
            </p>
          </div>
        )}
        {filters.buscar.trim() && (
          <p className="text-xs text-base-content/50 mt-2">
            La búsqueda por texto se aplica sobre la página actual mostrada (el API no expone búsqueda global
            aún).
          </p>
        )}
      </CardSlot>

      <AsientoDetailModal
        id={MODAL_DETAIL}
        asiento={detail}
        loading={detailLoading}
        onClose={closeDetail}
      />

      <ConfirmModal
        id={MODAL_DELETE}
        title="Eliminar asiento"
        message="¿Confirma eliminar este asiento? Solo aplica a comprobantes en estado pendiente y periodo abierto."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteTargetId(null)
            ; (document.getElementById(MODAL_DELETE) as HTMLDialogElement)?.close()
        }}
      />

      <AsientoAgrupacionModal
        id={MODAL_AGRUPACION}
        modoAsientos={modoAsientos}
        periodoActual={periodoActual}
        loading={agrupando}
        onClose={closeAgrupacion}
        onAgruparDia={handleAgruparPorDia}
        onAgruparPeriodo={handleAgruparPorPeriodo}
      />
    </div>
  )
}
