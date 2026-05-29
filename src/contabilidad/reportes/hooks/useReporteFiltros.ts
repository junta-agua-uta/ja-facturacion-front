import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { listarPeriodos } from '../../services/periodos.service'
import { defaultRangoAnioActual, isoDateEnd, isoDateStart } from '../utils/reporteUi'
import type { FiltrosReporteBody } from '../types/reportes'

export type ReporteFiltrosUi = {
  buscar: string
  fechaDesde: string
  fechaHasta: string
  periodoId: number | null
}

function buildDefault(periodo?: { fechaInicio: string; fechaFin: string; id: number } | null): ReporteFiltrosUi {
  if (periodo) {
    return {
      buscar: '',
      fechaDesde: periodo.fechaInicio.slice(0, 10),
      fechaHasta: periodo.fechaFin.slice(0, 10),
      periodoId: periodo.id,
    }
  }
  const { desde, hasta } = defaultRangoAnioActual()
  return { buscar: '', fechaDesde: desde, fechaHasta: hasta, periodoId: null }
}

export function useReporteFiltros() {
  const [searchParams] = useSearchParams()
  const periodoIdParam = searchParams.get('periodoId')
  const { loading: userLoading, empresaId, userId } = useCurrentUser()
  const [filters, setFilters] = useState<ReporteFiltrosUi>(() => buildDefault())
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!periodoIdParam || initialized || userLoading) return
    const id = Number(periodoIdParam)
    if (Number.isNaN(id)) return
    void listarPeriodos({ page: 1, limit: 100, empresaId }).then((res) => {
      const p = res.data.find((x) => x.id === id)
      if (p) {
        setFilters(buildDefault({ fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, id: p.id }))
      }
      setInitialized(true)
    })
  }, [periodoIdParam, initialized, userLoading, empresaId])

  const filtrosApi = useMemo((): FiltrosReporteBody => {
    const body: FiltrosReporteBody = { empresaId }
    if (filters.periodoId) body.periodoId = filters.periodoId
    else if (periodoIdParam && !Number.isNaN(Number(periodoIdParam))) {
      body.periodoId = Number(periodoIdParam)
    }
    if (filters.fechaDesde) body.fechaInicio = isoDateStart(filters.fechaDesde)
    if (filters.fechaHasta) body.fechaFin = isoDateEnd(filters.fechaHasta)
    return body
  }, [empresaId, filters.periodoId, filters.fechaDesde, filters.fechaHasta, periodoIdParam])

  const clearFilters = useCallback(() => {
    if (periodoIdParam && !Number.isNaN(Number(periodoIdParam))) {
      const id = Number(periodoIdParam)
      void listarPeriodos({ page: 1, limit: 100, empresaId }).then((res) => {
        const p = res.data.find((x) => x.id === id)
        setFilters(buildDefault(p ? { fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, id: p.id } : null))
      })
      return
    }
    setFilters(buildDefault())
  }, [periodoIdParam, empresaId])

  /** Evita consultar el API antes de aplicar fechas del periodo (?periodoId=) */
  const filtrosListos = useMemo(() => {
    if (userLoading) return false
    if (periodoIdParam && !Number.isNaN(Number(periodoIdParam))) {
      return initialized
    }
    return true
  }, [userLoading, periodoIdParam, initialized])

  return {
    userLoading,
    userId,
    empresaId,
    filters,
    setFilters,
    filtrosApi,
    filtrosListos,
    clearFilters,
  }
}
