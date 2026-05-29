import Pagination from '../../../shared/components/Pagination'

type Props = {
  currentPage: number
  totalPages: number
  shown: number
  total: number
  onPageChange: (page: number) => void
  label?: string
  notaFiltroLocal?: string
}

export default function ReporteTablaPaginacion({
  currentPage,
  totalPages,
  shown,
  total,
  onPageChange,
  label = 'registros',
  notaFiltroLocal,
}: Props) {
  if (total <= 0) return null

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Mostrando {shown} de {total.toLocaleString('es-EC')} {label}
        {notaFiltroLocal ? ` (${notaFiltroLocal})` : ''}
      </p>
      <div className="flex flex-col items-center gap-2 sm:items-end">
        <Pagination pagination={{ currentPage, totalPages }} onPageChange={onPageChange} />
        <p className="text-xs text-base-content/60">
          Página {currentPage} de {totalPages}
        </p>
      </div>
    </div>
  )
}
