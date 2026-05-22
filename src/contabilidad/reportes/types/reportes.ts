export interface FiltrosReporteBody {
  empresaId: number
  periodoId?: number
  fechaInicio?: string
  fechaFin?: string
}

export interface FiltrosCarteraBody {
  empresaId: number
  clienteId?: number
  fechaInicio?: string
  fechaFin?: string
}

export interface FiltrosDetalleCuentaBody extends FiltrosReporteBody {
  cuentaId: number
}

// --- Libro Mayor ---
export interface LibroMayorCuentaResumen {
  cuentaId: number
  codigo: string
  nombre: string
  totalDebe: number
  totalHaber: number
  saldo: number
}

export interface LibroMayorMovimiento {
  fecha: string
  numero: number
  concepto: string
  debe: number
  haber: number
  saldo: number
}

export interface LibroMayorDetalleCuenta {
  cuentaId: number
  codigo: string
  nombre: string
  movimientos: LibroMayorMovimiento[]
}

// --- Balance de Comprobación ---
export interface BalanceComprobacionCuenta {
  cuentaId: number
  codigo: string
  nombre: string
  totalDebe: number
  totalHaber: number
  saldoDeudor: number
  saldoAcreedor: number
}

export interface BalanceComprobacionResponse {
  cuentas: BalanceComprobacionCuenta[]
  totales: {
    totalDebe: number
    totalHaber: number
  }
}

// --- Balance General ---
export interface BalanceGeneralCuenta {
  cuentaId: number
  codigo: string
  nombre: string
  tipo: string
  naturaleza: string
  totalDebe: number
  totalHaber: number
  saldo: number
}

export interface BalanceGeneralResponse {
  activos: BalanceGeneralCuenta[]
  pasivos: BalanceGeneralCuenta[]
  patrimonio: BalanceGeneralCuenta[]
  totales: {
    activos: number
    pasivos: number
    patrimonio: number
    pasivoMasPatrimonio: number
  }
}

// --- Estado de Resultados ---
export interface EstadoResultadosCuenta {
  cuentaId: number
  codigo: string
  nombre: string
  tipo: string
  naturaleza: string
  totalDebe: number
  totalHaber: number
  saldo: number
}

export interface EstadoResultadosResponse {
  ingresos: EstadoResultadosCuenta[]
  gastos: EstadoResultadosCuenta[]
  totales: {
    ingresos: number
    gastos: number
    utilidad: number
  }
}

// --- Cartera de Clientes ---
export interface CarteraCuentaItem {
  cuentaId: number
  fechaEmision: string
  valorOriginal: number
  abonos: number
  saldo: number
  estado: string
}

export interface CarteraClienteItem {
  clienteId: number
  identificacion: string
  razonSocial: string
  totalDebe: number
  totalAbonos: number
  saldoTotal: number
  cuentas: CarteraCuentaItem[]
}
