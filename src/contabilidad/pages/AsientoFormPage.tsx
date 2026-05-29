import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import { Title, SubTitle, CardSlot } from '../../shared/components'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useAsientoForm, type AsientoFormMode } from '../hooks/useAsientoForm'
import { listarPeriodos } from '../services/periodos.service'
import { listarCuentasDetalle } from '../services/planCuentas.service'
import type { PeriodoContable } from '../types/periodo'
import type { PlanCuentaRow } from '../types/planCuenta'
import AsientoFormContent from '../components/AsientoFormContent'
import StatusBadge from '../components/StatusBadge'
import { formatMoney } from '../utils/asientoUi'

const LIST_PATH = '/junta/contabilidad/asientos'

export default function AsientoFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { asientoId: asientoIdParam } = useParams<{ asientoId?: string }>()
  const [searchParams] = useSearchParams()

  const mode: AsientoFormMode = asientoIdParam ? 'edit' : 'create'
  const asientoIdNum =
    asientoIdParam && !Number.isNaN(parseInt(asientoIdParam, 10))
      ? parseInt(asientoIdParam, 10)
      : null

  const { loading: userLoading, empresaId, userId, displayName } = useCurrentUser()

  const [periodos, setPeriodos] = useState<PeriodoContable[]>([])
  const [periodoId, setPeriodoId] = useState<number | null>(null)
  const [cuentas, setCuentas] = useState<PlanCuentaRow[]>([])
  const [cuentasFiltradas, setCuentasFiltradas] = useState<PlanCuentaRow[]>([])
  const [pageError, setPageError] = useState<string | null>(null)

  const periodoActual = useMemo(
    () => periodos.find((p) => p.id === periodoId) ?? null,
    [periodos, periodoId],
  )

  const loadMeta = useCallback(async () => {
    setPageError(null)
    try {
      const [perRes, ctaRows] = await Promise.all([
        listarPeriodos({ empresaId, page: 1, limit: 50 }),
        listarCuentasDetalle(empresaId, 500),
      ])
      const filtradas = ctaRows.filter(cuenta => {
        // Verificar si la cuenta tiene nivel definido
        if (cuenta.nivel === undefined || cuenta.nivel === null) {
          console.warn(`⚠️ Cuenta sin nivel: ${cuenta.codigo} - ${cuenta.nombre}`);
          return false; // Excluir cuentas sin nivel
        }
        return cuenta.nivel > 3; // Nivel 3 o superior
      });
      setPeriodos(perRes.data)
      setCuentas(ctaRows)
      setCuentasFiltradas(filtradas)
      console.log(filtradas)

      const fromUrl = Number(searchParams.get('periodoId'))
      const abierto = perRes.data.find((p) => p.estado === 'ABIERTO')
      const fallback = abierto?.id ?? perRes.data[0]?.id ?? null

      if (Number.isFinite(fromUrl) && fromUrl > 0 && perRes.data.some((p) => p.id === fromUrl)) {
        setPeriodoId(fromUrl)
      } else {
        setPeriodoId(fallback)
      }
    } catch {
      setPageError('No se pudieron cargar periodos o plan de cuentas.')
    }
  }, [empresaId, searchParams])

  useEffect(() => {
    if (userLoading || !userId) return
    void loadMeta()
  }, [userLoading, userId, loadMeta])

  const goList = useCallback(() => {
    navigate(LIST_PATH)
  }, [navigate])

  const handleEditLoaded = useCallback((pid: number) => {
    setPeriodoId(pid)
  }, [])

  const form = useAsientoForm({
    mode,
    asientoId: asientoIdNum,
    periodoId: periodoId ?? 0,
    userId: userId ?? 0,
    cuentas,
    onLoadEditError: goList,
    onEditLoaded: handleEditLoaded,
    onSubmitSuccess: goList,
  })

  const { totalDebe, totalHaber, descuadre } = useMemo(() => {
    let d = 0
    let h = 0
    for (const L of form.lineas) {
      d += Number(L.debe) || 0
      h += Number(L.haber) || 0
    }
    return { totalDebe: d, totalHaber: h, descuadre: Math.abs(d - h) }
  }, [form.lineas])

  useEffect(() => {
    if (mode !== 'create') return
    form.resetCreate()
  }, [location.key, mode, form.resetCreate])

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
        <Title title="Asiento manual" />
        <p className="text-error">Debe iniciar sesión para continuar.</p>
        <Link to={LIST_PATH} className="btn btn-outline">
          Volver al listado
        </Link>
      </div>
    )
  }

  const titulo = mode === 'create' ? 'Nuevo asiento manual' : 'Editar asiento'

  return (
    <>
      <Link
        to={LIST_PATH}
        className="inline-flex items-center gap-2 text-white btn btn-primary hover:bg-blue-600 hover:border-blue-600 mb-2"
      >
        <FaArrowLeft />
        Regresar
      </Link>

      <header className="mb-8">
        <Title title={titulo} />
        <div className="mt-2">
          <SubTitle title="Registro contable en el periodo seleccionado" />
          <p className="mt-5 pt-4 border-t border-base-200 text-sm text-base-content/75 leading-relaxed">
            Contador:{' '}
            <span className="font-semibold text-primary">{displayName || 'Usuario'}</span>
          </p>
        </div>
      </header>

      {pageError && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{pageError}</span>
        </div>
      )}

      <CardSlot>
        <p className="text-xs uppercase tracking-wide text-base-content/60 mb-2">Periodo contable</p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="select select-bordered select-sm min-w-[14rem]"
            value={periodoId ?? ''}
            onChange={(e) => setPeriodoId(Number(e.target.value) || null)}
            disabled={mode === 'edit'}
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
          {mode === 'edit' && (
            <span className="text-xs text-base-content/50">El periodo no se puede cambiar al editar.</span>
          )}
        </div>
      </CardSlot>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="flex-1 min-w-0">
          <CardSlot>
            <AsientoFormContent
              fetchingEdit={form.fetchingEdit}
              loading={form.loading}
              fecha={form.fecha}
              setFecha={form.setFecha}
              concepto={form.concepto}
              setConcepto={form.setConcepto}
              tipoMov={form.tipoMov}
              setTipoMov={form.setTipoMov}
              comprobante={form.comprobante}
              setComprobante={form.setComprobante}
              lineas={form.lineas}
              cuentas={cuentasFiltradas}
              addLinea={form.addLinea}
              removeLinea={form.removeLinea}
              updateLinea={form.updateLinea}
              onSubmit={form.handleSubmit}
              onCancel={goList}
            />
          </CardSlot>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-4">
            <CardSlot>
              <h3 className="text-lg font-semibold text-primary mb-4">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-base-content/70">Total debe</span>
                  <span className="font-medium tabular-nums">{formatMoney(totalDebe)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-base-content/70">Total haber</span>
                  <span className="font-medium tabular-nums">{formatMoney(totalHaber)}</span>
                </div>
                <div className="border-t border-base-200 my-2" />
                <div className="flex justify-between gap-2 font-semibold">
                  <span>Descuadre</span>
                  <span className={descuadre < 0.005 ? 'text-success' : 'text-warning tabular-nums'}>
                    {descuadre < 0.005 ? 'Cuadrado' : formatMoney(descuadre)}
                  </span>
                </div>
              </div>
            </CardSlot>
          </div>
        </div>
      </div>
    </>
  )
}
