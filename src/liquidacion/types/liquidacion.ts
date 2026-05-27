export interface LiquidacionForm {
  id: string;
  fechaEmision?: string;
  dirEstablecimiento?: string;
  tipoIdentificacionProveedor?: string;
  razonSocialProveedor?: string;
  identificacionProveedor?: string;
  direccionProveedor?: string;
  importeTotal?: number;
  estadoSri?: string;
  Estado?: string; // Estado de la liquidación (AUTORIZADO, ANULADO, etc.)
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
  // tarifaImpuesto: number;
  baseImponible: number;
  valorImpuesto: number;
  tarifaIVA: number; // 0, 12, 15
}

export const crearConcepto = (
  descripcion: string,
  precioUnitario: number = 0,
  cantidad: number = 1,
  descuento: number = 0
): ConceptoCobro => {
  const precioTotalSinImpuesto = (precioUnitario - descuento) * cantidad;
  const baseImponible = precioTotalSinImpuesto;
  const tarifaIVA = 0; // 👈 por defecto SIN IVA
  const valorImpuesto = 0;
  const codigoPorcentajeImpuesto =
    tarifaIVA === 0 ? "0" :
      tarifaIVA === 12 ? "2" :
        tarifaIVA === 15 ? "4" : "2";
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
    codigoPorcentajeImpuesto,
    tarifaIVA,
    baseImponible,
    valorImpuesto,
  };
};