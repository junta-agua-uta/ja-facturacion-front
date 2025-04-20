export interface Factura {
    id: string;
    NombreComercial: string;
    Cedula: string;
    Concepto: string;
    FechaEmision: Date;
    Total: string;
    Estado: string;
}


//TODD: Agregar el tipo para el filtro de la tabla cedula
export type FacturacionCedula= {
    Cedula?: string;
}
//TODO: Agregar el tipo para el filtro de la tabla fecha emision desde y hasta
export type FacturacionFechaEmisionFilter = {
    FechaEmisionDesde: Date;
    FechaEmisionHasta: Date;
}
