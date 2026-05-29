type EstadoLibroDiario = 'PENDIENTE' | 'APROBADO'

const styles: Record<EstadoLibroDiario, string> = {
  PENDIENTE: 'inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200',
  APROBADO: 'inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 border border-emerald-200',
}

const labels: Record<EstadoLibroDiario, string> = {
  PENDIENTE: 'Pendiente',
  APROBADO: 'Contabilizado',
}

export default function LibroDiarioEstadoBadge({ value }: { value: EstadoLibroDiario }) {
  return <span className={styles[value]}>{labels[value]}</span>
}
