import { useEffect, useMemo, useState } from 'react'
import { PAGE_SIZE } from '../../../shared/utils/constants'

export function usePaginacionCliente<T>(items: T[], depsReset: unknown[] = []) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reiniciar al cambiar filtros/datos
  }, depsReset)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginated = useMemo(
    () => items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [items, page],
  )

  return {
    page,
    setPage,
    total,
    totalPages,
    paginated,
    pageSize: PAGE_SIZE,
  }
}
