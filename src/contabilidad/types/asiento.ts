/** Respuesta listado GET /asientos */
export interface AsientoListItem {
  id: number
  numero: number
  fecha: string
  nombre: string
  concepto: string
  estado: 'PENDIENTE' | 'APROBADO'
  descuadre: string | number
  modelo?: string | null
  comprobante?: string | null
  periodoId: number
  creadoPorId: number
  periodo?: {
    id: number
    nombre: string
    estado: 'ABIERTO' | 'CERRADO'
    fechaInicio: string
    fechaFin: string
  }
  creadoPor?: {
    ID: number
    NOMBRE: string
    APELLIDO: string
    ROL: string
  },
  totalDebe: number,
  totalHaber: number
}

export interface AsientosListResponse {
  page: number
  limit: number
  total: number
  totalPages: number
  data: AsientoListItem[]
}

export interface DetalleAsientoRow {
  id: number
  no: number
  codcta: string
  nombre: string
  referencia?: string | null
  descta?: string | null
  debe: string | number
  haber: string | number
  cuentaId: number
  cuenta?: {
    id: number
    codigo: string
    nombre: string
    esDetalle: boolean
  }
}

export interface AsientoDetalle extends AsientoListItem {
  detallesAsiento: DetalleAsientoRow[]
  aprobadoPor?: {
    ID: number
    NOMBRE: string
    APELLIDO: string
    ROL: string
  } | null
}

export interface CreateDetalleAsientoPayload {
  cuentaId: number
  debe: number
  haber: number
  referencia?: string
  descta?: string
}

export interface CreateAsientoPayload {
  fecha: string
  concepto: string
  periodoId: number
  creadoPorId: number
  modelo?: string
  comprobante?: string
  detalles: CreateDetalleAsientoPayload[]
}

export type TipoMovimientoUi = 'VENTA' | 'COMPRA' | 'MANUAL'
