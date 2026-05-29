import api from '../../shared/api'
import type { PlanCuentaRow, PlanCuentasPlanoResponse } from '../types/planCuenta'

export async function listarCuentasDetalle(
  empresaId: number,
  limit = 500,
): Promise<PlanCuentaRow[]> {
  const { data } = await api.get<PlanCuentasPlanoResponse>('/plan-cuentas', {
    params: { page: 1, limit, formato: 'plano', empresaId },
  })
  return data.data.filter((c) => c.esDetalle && c.activo)
}

export async function eliminarPlanCuenta(
  id: number,
  empresaId: number,
): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/plan-cuentas/${id}`, {
    params: { empresaId },
  })
  return data
}

