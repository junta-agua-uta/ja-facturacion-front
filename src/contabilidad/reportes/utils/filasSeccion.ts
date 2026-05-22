export type FilaCuentaConSeccion<T> = {
  section: string
  cuenta: T
  key: string
}

export function aplanarCuentasPorSeccion<T extends { cuentaId: number }>(
  bloques: { titulo: string; cuentas: T[] }[],
): FilaCuentaConSeccion<T>[] {
  const filas: FilaCuentaConSeccion<T>[] = []
  for (const bloque of bloques) {
    for (const cuenta of bloque.cuentas) {
      filas.push({
        section: bloque.titulo,
        cuenta,
        key: `${bloque.titulo}-${cuenta.cuentaId}`,
      })
    }
  }
  return filas
}

export function seccionVisibleEnPagina(
  index: number,
  filas: FilaCuentaConSeccion<unknown>[],
): boolean {
  if (index === 0) return true
  return filas[index].section !== filas[index - 1].section
}
