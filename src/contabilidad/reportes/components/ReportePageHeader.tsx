import type { ReactNode } from 'react'
import { Title } from '../../../shared/components'

type Props = {
  title: string
  subtitle: string
  actions?: ReactNode
}

export default function ReportePageHeader({ title, subtitle, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Title title={title} />
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
