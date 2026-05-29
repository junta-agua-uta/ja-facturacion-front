type EstadoAsiento = 'PENDIENTE' | 'APROBADO'
type EstadoPeriodo = 'ABIERTO' | 'CERRADO'

type Props =
  | { kind: 'asiento'; value: EstadoAsiento }
  | { kind: 'periodo'; value: EstadoPeriodo }

const styles: Record<string, string> = {
  PENDIENTE: 'badge badge-warning text-warning-content',
  APROBADO: 'badge badge-success',
  ABIERTO: 'badge badge-success',
  CERRADO: 'badge badge-ghost',
}

const labels: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  ABIERTO: 'Abierto',
  CERRADO: 'Cerrado',
}

export default function StatusBadge(props: Props) {
  const value = props.value
  return <span className={styles[value] ?? 'badge'}>{labels[value] ?? value}</span>
}
