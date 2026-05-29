import { useEffect, useState } from 'react'
import { listarAsientos } from '../../services/asientos.service'
import type { FiltrosReporteBody } from '../types/reportes'

export function useAsientosPendientesPeriodo(
  filtrosApi: FiltrosReporteBody,
  enabled: boolean,
) {
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    if (!enabled || !filtrosApi.periodoId) {
      setPendientes(0)
      return
    }
    void listarAsientos({
      periodoId: filtrosApi.periodoId,
      page: 1,
      limit: 1,
      estado: 'PENDIENTE',
    })
      .then((res) => setPendientes(res.total))
      .catch(() => setPendientes(0))
  }, [enabled, filtrosApi.periodoId])

  return pendientes
}
