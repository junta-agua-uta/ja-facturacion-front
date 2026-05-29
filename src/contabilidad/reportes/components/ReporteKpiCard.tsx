import type { ReactNode } from 'react'

type Props = {
  label: string
  value: string
  subtext?: string
  subtextClass?: string
  icon?: ReactNode
  variant?: 'default' | 'primary'
}

export default function ReporteKpiCard({
  label,
  value,
  subtext,
  subtextClass,
  icon,
  variant = 'default',
}: Props) {
  const isPrimary = variant === 'primary'
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        isPrimary
          ? 'border-primary bg-primary text-primary-content'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              isPrimary ? 'text-primary-content/80' : 'text-gray-500'
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-2 text-2xl font-bold tabular-nums ${
              isPrimary ? 'text-primary-content' : 'text-primary'
            }`}
          >
            {value}
          </p>
          {subtext && (
            <p
              className={`mt-1 text-xs ${
                isPrimary ? 'text-primary-content/80' : subtextClass ?? 'text-gray-500'
              }`}
            >
              {subtext}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isPrimary ? 'bg-primary-content/15 text-primary-content' : 'bg-primary/10 text-primary'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
