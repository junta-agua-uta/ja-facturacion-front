import { ConceptoCobro } from "../components/TablaConceptos";


export interface Liquidacion {
    id: string;
    NombreComercial: string;
    Cedula: string;
    Concepto: string;
    FechaEmision: Date;
    Total: string;
    Estado: string;
    // Campos adicionales de la API
    Sucursal?: string;
    Usuario?: string;
     serie?: string;
    numero?: string;
    
}


export type LiquidacionCedula = {
    Cedula?: string;
}
export type LiquidacionFechaEmisionFilter = {
    FechaEmisionDesde: Date;
    FechaEmisionHasta: Date;
}


export type CodigoConcepto =
    | 'EXCEDENTE'
    | 'TARIFA BASICA'
    | 'MORA'
    | 'MULTA'
    | 'REBAJA'
    | 'ABONO'
    | 'CUOTA PROYECTOS'
    | 'VERTIENTE'
    | 'OTROS';

export const DEFAULTS = {
    serie: '001',
    numero: '300'
};

export const CONFIGURACION_CONCEPTOS: Record<CodigoConcepto, {
  codInterno: string;
  desc: string;
  precioBase?: number;
  requiereMes?: boolean;
}> = {
  'EXCEDENTE': { 
    codInterno: 'EXC001', 
    desc: 'Excedente', 
    requiereMes: true 
  },
  'TARIFA BASICA': { 
    codInterno: 'TB001', 
    desc: 'Tarifa Básica', 
    precioBase: 3, 
    requiereMes: true 
  },
  'MORA': { 
    codInterno: 'MOR001', 
    desc: 'Mora', 
    precioBase: 25 
  },
  'MULTA': { 
    codInterno: 'MUL001', 
    desc: 'Multa' 
  },
  'REBAJA': { 
    codInterno: 'REB001', 
    desc: 'Rebaja' 
  },
  'ABONO': { 
    codInterno: 'ABO001', 
    desc: 'Abono' 
  },
  'CUOTA PROYECTOS': { 
    codInterno: 'CP001', 
    desc: 'Cuota Proyectos' 
  },
  'VERTIENTE': { 
    codInterno: 'VER001', 
    desc: 'Vertiente' 
  },
  'OTROS': { 
    codInterno: 'OTR001', 
    desc: 'Otros' 
  }
};

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
    total: +(subtotal)
  };
};

export const CODIGOS = [
  "EXCEDENTE",
  "TARIFA BASICA",
  "MORA",
  "MULTA",
  "REBAJA",
  "ABONO",
  "CUOTA PROYECTOS",
  "VERTIENTE",
  "OTROS"
];

export const MESES = [
  "ninguno",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];
