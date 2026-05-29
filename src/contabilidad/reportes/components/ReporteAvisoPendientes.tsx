import { Link } from 'react-router-dom'

type Props = {
  pendientes: number
  periodoId?: number
}

export default function ReporteAvisoPendientes({ pendientes, periodoId }: Props) {
  if (pendientes <= 0) return null

  const asientosUrl = periodoId
    ? `/junta/contabilidad/asientos?periodoId=${periodoId}`
    : '/junta/contabilidad/asientos'

  return (
    <div role="status" className="alert alert-info mb-4 text-sm">
      <div>
        <p className="font-medium">
          Hay {pendientes} asiento{pendientes !== 1 ? 's' : ''} pendiente{pendientes !== 1 ? 's' : ''}{' '}
          en este periodo.
        </p>
        <p className="mt-1 opacity-90">
          Los reportes contables (Libro Mayor, balances, etc.) solo incluyen asientos{' '}
          <strong>contabilizados (aprobados)</strong>. Aprueba el asiento en{' '}
          <Link to={asientosUrl} className="link link-primary font-medium">
            Asientos contables
          </Link>{' '}
          y vuelve a cargar esta pantalla.
        </p>
      </div>
    </div>
  )
}
