import { useCallback, useEffect, useState } from 'react'
import type { PlanCuentaRow } from '../types/planCuenta'
import type { CreateAsientoPayload, CreateDetalleAsientoPayload } from '../types/asiento'
import { crearAsiento, actualizarAsiento, obtenerAsiento } from '../services/asientos.service'
import { showError, showSuccess } from '../../shared/utils/notifications'

export type AsientoFormMode = 'create' | 'edit'

export type LineaAsientoForm = {
  cuentaId: number
  debe: string
  haber: string
  referencia: string
}

const emptyLine = (): LineaAsientoForm => ({
  cuentaId: 0,
  debe: '0',
  haber: '0',
  referencia: '',
})

export function toIsoFromDatetimeLocal(v: string): string {
  if (!v) return new Date().toISOString()
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

export function toDatetimeLocalValue(iso: string): string {
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

function modeloFromTipoSelect(t: string): string | undefined {
  if (t === 'DIARIO' || t === 'MANUAL') return 'Diario'
  if (t === 'INGRESO' || t === 'VENTA') return 'Ingreso'
  if (t === 'EGRESO' || t === 'COMPRA') return 'Egreso'
  return 'Diario'
}

function tipoSelectFromModelo(modelo?: string | null): string {
  const m = (modelo || '').toLowerCase()
  if (m.includes('compra') || m.includes('egreso')) return 'EGRESO'
  if (m.includes('venta') || m.includes('ingreso')) return 'INGRESO'
  return 'DIARIO'
}

type Options = {
  mode: AsientoFormMode
  asientoId: number | null
  periodoId: number
  userId: number
  cuentas: PlanCuentaRow[]
  onLoadEditError?: () => void
  /** Al cargar un asiento en edición, sincroniza el periodo en la página padre */
  onEditLoaded?: (periodoId: number) => void
  onSubmitSuccess: () => void
}

export function useAsientoForm({
  mode,
  asientoId,
  periodoId,
  userId,
  cuentas,
  onLoadEditError,
  onEditLoaded,
  onSubmitSuccess,
}: Options) {
  const [loading, setLoading] = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(() => mode === 'edit' && asientoId != null)
  const [fecha, setFecha] = useState(() => toDatetimeLocalValue(new Date().toISOString()))
  const [concepto, setConcepto] = useState('')
  const [tipoMov, setTipoMov] = useState('DIARIO')
  const [comprobante, setComprobante] = useState('')
  const [lineas, setLineas] = useState<LineaAsientoForm[]>([emptyLine(), emptyLine()])

  const aplicarCuentasPorDefecto = useCallback(
    (rows: LineaAsientoForm[]) => {
      if (cuentas.length === 0) return rows
      return rows.map((row, i) => ({
        ...row,
        cuentaId:
          row.cuentaId > 0
            ? row.cuentaId
            : cuentas[Math.min(i, cuentas.length - 1)]?.id ?? 0,
      }))
    },
    [cuentas],
  )

  useEffect(() => {
    if (cuentas.length === 0) return
    setLineas((prev) => aplicarCuentasPorDefecto(prev))
  }, [cuentas, aplicarCuentasPorDefecto])

  useEffect(() => {
    if (mode !== 'edit' || !asientoId) return
    let cancel = false
    ;(async () => {
      setFetchingEdit(true)
      try {
        const a = await obtenerAsiento(asientoId)
        if (cancel) return
        setFecha(toDatetimeLocalValue(a.fecha))
        setConcepto(a.concepto)
        setTipoMov(tipoSelectFromModelo(a.modelo))
        setComprobante(a.comprobante || '')
        const ls: LineaAsientoForm[] = (a.detallesAsiento ?? []).map((d) => ({
          cuentaId: d.cuentaId,
          debe: String(d.debe),
          haber: String(d.haber),
          referencia: d.referencia || '',
        }))
        if (ls.length >= 2) {
          setLineas(ls)
        } else {
          const padded = [...ls]
          while (padded.length < 2) padded.push(emptyLine())
          setLineas(aplicarCuentasPorDefecto(padded))
        }
        onEditLoaded?.(a.periodoId)
      } catch (e: unknown) {
        showError(e instanceof Error ? e.message : 'No se pudo cargar el asiento')
        onLoadEditError?.()
      } finally {
        if (!cancel) setFetchingEdit(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [mode, asientoId, onLoadEditError, onEditLoaded, aplicarCuentasPorDefecto])

  const resetCreate = useCallback(() => {
    setFecha(toDatetimeLocalValue(new Date().toISOString()))
    setConcepto('')
    setTipoMov('DIARIO')
    setComprobante('')
    setLineas(aplicarCuentasPorDefecto([emptyLine(), emptyLine()]))
  }, [aplicarCuentasPorDefecto])

  const addLinea = () => setLineas((prev) => [...prev, aplicarCuentasPorDefecto([emptyLine()])[0]])
  const removeLinea = (idx: number) => {
    setLineas((prev) => {
      if (prev.length <= 2) return prev
      return prev.filter((_, i) => i !== idx)
    })
  }

  const updateLinea = (idx: number, patch: Partial<LineaAsientoForm>) => {
    setLineas((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)))
  }

  const validate = useCallback((): CreateAsientoPayload | null => {
    if (!concepto.trim()) {
      showError('El concepto es obligatorio.')
      return null
    }
    if (lineas.length < 2) {
      showError('Debe haber al menos dos líneas contables.')
      return null
    }
    for (let i = 0; i < lineas.length; i++) {
      const L = lineas[i]
      if (!L.cuentaId) {
        showError(`Seleccione la cuenta en la línea ${i + 1}.`)
        return null
      }
      const debe = Number(L.debe)
      const haber = Number(L.haber)
      if (Number.isNaN(debe) || Number.isNaN(haber) || debe < 0 || haber < 0) {
        showError(`Importes inválidos en la línea ${i + 1}.`)
        return null
      }
    }
    const detalles: CreateDetalleAsientoPayload[] = lineas.map((L) => ({
      cuentaId: L.cuentaId,
      debe: Number(L.debe),
      haber: Number(L.haber),
      ...(L.referencia.trim() ? { referencia: L.referencia.trim() } : {}),
    }))
    const modelo = modeloFromTipoSelect(tipoMov)
    return {
      fecha: toIsoFromDatetimeLocal(fecha),
      concepto: concepto.trim(),
      periodoId,
      creadoPorId: userId,
      ...(modelo ? { modelo } : {}),
      ...(comprobante.trim() ? { comprobante: comprobante.trim() } : {}),
      detalles,
    }
  }, [concepto, lineas, fecha, periodoId, userId, tipoMov, comprobante])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = validate()
    if (!payload) return
    if (!periodoId) {
      showError('Seleccione un periodo contable válido.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'create') {
        await crearAsiento(payload)
        showSuccess('Asiento creado correctamente.')
      } else if (asientoId) {
        await actualizarAsiento(asientoId, {
          fecha: payload.fecha,
          concepto: payload.concepto,
          modelo: payload.modelo,
          comprobante: payload.comprobante,
          detalles: payload.detalles,
        })
        showSuccess('Asiento actualizado.')
      }
      onSubmitSuccess()
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      const msg =
        ax.response?.data?.message ||
        (err instanceof Error ? err.message : 'No se pudo guardar el asiento.')
      showError(String(msg))
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    fetchingEdit,
    fecha,
    setFecha,
    concepto,
    setConcepto,
    tipoMov,
    setTipoMov,
    comprobante,
    setComprobante,
    lineas,
    addLinea,
    removeLinea,
    updateLinea,
    handleSubmit,
    resetCreate,
  }
}
