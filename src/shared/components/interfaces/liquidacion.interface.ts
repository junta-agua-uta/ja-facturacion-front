export interface LiquidacionItem {
  descripcion?: string;
  nombre?: string;
  codigo?: string;
  cantidad?: number | string;
  precioUnitario?: number | string;
  precio?: number | string;
  subtotal?: number;
  iva?: number;
}

export interface LiquidacionForm {
  cedula?: string;                // Cliente
  cliente?: string;               // Nombre del cliente
  codigo?: string;                // Código general o del documento
  emision?: string;               // Fecha de emisión
  vencimiento?: string;           // Fecha de vencimiento
  serie?: string;                 // Serie del documento
  numero?: string;                // Número de documento
  secuencia?: string;             // Secuencia alternativa
  concepto?: string;              // Concepto de la liquidación

  // Totales
  subtotal?: number;
  iva?: number;
  ivaPorcentaje?: number | string;
  descuento?: number;
  total?: number;

  // Items
  items?: LiquidacionItem[];

  // Empresa / Sucursal
  rucEmisor?: string;
  empresaDireccion?: string;
  sucursalDireccion?: string;

  // Cliente / comprador
  rucComprador?: string;
  nombre?: string;
  direccion?: string;
  lugarOperacion?: string;

  // Pago
  formaPago?: string;
  valorPago?: number;

  // Imprenta / Datos de impresión
  imprentaNombre?: string;
  imprentaRuc?: string;
  imprentaAutorizacion?: string;

  // Autorizaciones
  autorizacion?: string;
  fechaAutorizacion?: string;
}
