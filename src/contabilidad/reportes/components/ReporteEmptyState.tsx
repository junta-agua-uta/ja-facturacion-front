type Props = {
  title?: string
  message: string
}

export default function ReporteEmptyState({
  title = 'Sin datos',
  message,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-6 py-12 text-center">
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  )
}
