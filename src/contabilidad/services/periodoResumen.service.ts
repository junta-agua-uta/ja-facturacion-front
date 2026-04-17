import api from '../../shared/api';
import type { PeriodoContableDto } from '../types/periodoContable';

export function isoDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

export type PeriodoResumen = {
  totalFacturas: number;
  totalCompras: number;
  totalAsientos: number;
  totalIngresos: number;
  totalGastos: number;
};

function parseLiquidacionFecha(s: string): Date | null {
  const t = s?.trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parts = t.split(/[/\-]/).map((p) => p.trim());
  if (parts.length !== 3) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  const c = Number(parts[2]);
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return null;
  if (c > 31) return new Date(c, b - 1, a);
  return new Date(c, b - 1, a);
}

function inPeriodo(d: Date, ini: Date, fin: Date): boolean {
  const t = d.getTime();
  return t >= ini.getTime() && t <= fin.getTime();
}

export async function cargarResumenPeriodo(
  periodo: PeriodoContableDto,
): Promise<PeriodoResumen> {
  const fechaInicio = isoDateOnly(periodo.fechaInicio);
  const fechaFin = isoDateOnly(periodo.fechaFin);
  const ini = new Date(periodo.fechaInicio);
  const fin = new Date(periodo.fechaFin);
  fin.setHours(23, 59, 59, 999);

  let totalFacturas = 0;
  let totalIngresos = 0;
  let page = 1;
  const limit = 100;
  while (true) {
    const { data } = await api.get('/facturas/fecha', {
      params: { fechaInicio, fechaFin, page, limit },
    });
    const rows = data.data ?? [];
    if (page === 1) totalFacturas = Number(data.totalItems ?? 0);
    for (const row of rows) {
      totalIngresos += Number(row.TOTAL) || 0;
    }
    if (rows.length < limit || page * limit >= totalFacturas) break;
    page += 1;
  }

  const asientosRes = await api.get('/asientos', {
    params: { periodoId: periodo.id, page: 1, limit: 1 },
  });
  const totalAsientos = Number(asientosRes.data?.total ?? 0);

  let totalCompras = 0;
  let totalGastos = 0;
  let liqPage = 1;
  const liqLimit = 200;
  let liqTotal = Infinity;
  while (liqPage === 1 || (liqPage - 1) * liqLimit < liqTotal) {
    const { data } = await api.get('/liquidacion-compra/all', {
      params: { page: liqPage, limit: liqLimit },
    });
    const rows = data.data ?? [];
    if (liqPage === 1) liqTotal = Number(data.total ?? 0);
    for (const row of rows) {
      const fd = parseLiquidacionFecha(String(row.fechaEmision ?? ''));
      if (fd && inPeriodo(fd, ini, fin)) {
        totalCompras += 1;
        totalGastos += Number(row.importeTotal) || 0;
      }
    }
    if (rows.length < liqLimit) break;
    liqPage += 1;
  }

  return {
    totalFacturas,
    totalCompras,
    totalAsientos,
    totalIngresos,
    totalGastos,
  };
}
