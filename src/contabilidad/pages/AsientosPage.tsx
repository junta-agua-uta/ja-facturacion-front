import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Title, SubTitle, EndSlot, CardSlot } from '../../shared/components'
import { PAGE_SIZE } from '../../shared/utils/constants'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { listarAsientos, obtenerAsiento, eliminarAsiento } from '../services/asientos.service'
import { listarPeriodos } from '../services/periodos.service'
import type { AsientoDetalle, AsientoListItem } from '../types/asiento'
import type { PeriodoContable } from '../types/periodo'
import { inferTipoMovimiento } from '../utils/asientoUi'
import type { TipoMovimientoUi } from '../types/asiento'
import StatusBadge from '../components/StatusBadge'
import AsientosFilters from '../components/AsientosFilters'
import type { AsientosFiltersState } from '../components/AsientosFilters'
import AsientosTable from '../components/AsientosTable'
import AsientoDetailModal from '../components/AsientoDetailModal'
import ConfirmModal from '../../sucursales/modals/ConfirmModal'
import { showError, showSuccess } from '../../shared/utils/notifications'
import Pagination from '../../shared/components/Pagination'

const MODAL_DETAIL = 'modal_asiento_detalle'
const MODAL_DELETE = 'modal_asiento_delete'

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-base-content/60">Periodo activo</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <select
                  className="select select-bordered select-sm min-w-[12rem]"
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
            <p className="text-sm text-base-content/60 self-end sm:self-center">
              {total} asiento{total !== 1 ? 's' : ''} en este periodo (pág. {page}/{totalPages})
            </p>
          </div>
          <EndSlot>
            <button
              type="button"
              className="btn btn-primary gap-2"
              disabled={periodoActual?.estado === 'CERRADO' || periodoId == null}
              onClick={openCreate}
            >
              <span className="text-lg leading-none">+</span>
              Nuevo asiento manual
            </button>
          </EndSlot>
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
          onVer={openDetail}
          onEditar={openEdit}
          onEliminar={openDelete}
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
    </div>
  )
}
