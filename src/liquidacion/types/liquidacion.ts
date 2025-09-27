export interface LiquidacionForm {
  id?: number;
  fechaEmision?: string;
  dirEstablecimiento?: string;
  tipoIdentificacionProveedor?: string;
  razonSocialProveedor?: string;
  identificacionProveedor?: string;
  direccionProveedor?: string;
  importeTotal?: number;
  estadoSri?: string;
}

export interface ConceptoCobro {
  codigoPrincipal: string;
  codigoAuxiliar?: string;
  descripcion: string;
  unidadMedida?: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
  codigoImpuesto: string;
  codigoPorcentajeImpuesto: string;
  tarifaImpuesto: number;
  baseImponible: number;
  valorImpuesto: number;
}

export const crearConcepto = (
  descripcion: string,
  precioUnitario: number = 0,
  cantidad: number = 1,
  descuento: number = 0
): ConceptoCobro => {
  const precioTotalSinImpuesto = (precioUnitario - descuento) * cantidad;
  const baseImponible = precioTotalSinImpuesto;
  const tarifaImpuesto = 12;
  const valorImpuesto = baseImponible * (tarifaImpuesto / 100);

  return {
    codigoPrincipal: `PROD${String(Date.now()).slice(-6)}`,
    codigoAuxiliar: undefined,
    descripcion,
    unidadMedida: "UN",
    cantidad,
    precioUnitario,
    descuento,
    precioTotalSinImpuesto,
    codigoImpuesto: "2",
    codigoPorcentajeImpuesto: "2",
    tarifaImpuesto,
    baseImponible,
    valorImpuesto,
  };
};