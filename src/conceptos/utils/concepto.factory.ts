import { ConceptoCobro } from '../../facturacion/components/TablaConceptos';

export const crearConcepto = (
  codigo: string,
  descripcion: string,
  precio: number = 0,
  cantidad: number = 1,
  descuento: number = 0
): ConceptoCobro => {
  const subtotal = (precio - descuento) * cantidad;
  return {
    codigo,
    descripcion,
    cantidad,
    precio,
    descuento,
    subtotal: +subtotal,
    total: +subtotal,
  };
};
