import type { ReactNode } from 'react'
import {
  FaListUl,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExchangeAlt,
} from 'react-icons/fa'

export type LibroDiarioKpis = {
  totalAsientos: number
  asientosCuadrados: number
  asientosDescuadre: number
  totalMovimientos: number | null
  statsAproximados?: boolean
}

type KpiItem = {
  icon: ReactNode
  label: string
  value: string
  subtext: string
  subtextClass?: string
}

function KpiCard({ icon, label, value, subtext, subtextClass }: KpiItem) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-primary tabular-nums">{value}</p>
          <p className={`mt-1 text-xs ${subtextClass ?? 'text-gray-500'}`}>{subtext}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function LibroDiarioKpiCards({ kpis, loading }: { kpis: LibroDiarioKpis | null; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-base-200 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!kpis) return null

  const pctCuadrado =
    kpis.totalAsientos > 0
      ? ((kpis.asientosCuadrados / kpis.totalAsientos) * 100).toFixed(1)
      : '0'

  const items: KpiItem[] = [
    {
      icon: <FaListUl className="h-5 w-5" />,
      label: 'Total asientos',
      value: kpis.totalAsientos.toLocaleString('es-EC'),
      subtext: 'En el rango filtrado',
    },
    {
      icon: <FaCheckCircle className="h-5 w-5" />,
      label: 'Asientos cuadrados',
      value: kpis.asientosCuadrados.toLocaleString('es-EC'),
      subtext: `${pctCuadrado}% del total`,
      subtextClass: 'text-emerald-600',
    },
    {
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      label: 'Asientos con descuadre',
      value: kpis.asientosDescuadre.toLocaleString('es-EC'),
      subtext: kpis.asientosDescuadre > 0 ? 'Acción requerida' : 'Sin descuadres',
      subtextClass: kpis.asientosDescuadre > 0 ? 'text-red-600' : 'text-gray-500',
    },
    {
      icon: <FaExchangeAlt className="h-5 w-5" />,
      label: 'Total movimientos',
      value:
        kpis.totalMovimientos != null
          ? kpis.totalMovimientos.toLocaleString('es-EC')
          : '—',
      subtext: kpis.statsAproximados ? 'Estimado (muestra)' : 'Líneas de detalle',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  )
}
