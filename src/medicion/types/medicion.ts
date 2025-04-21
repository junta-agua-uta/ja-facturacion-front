export type Medicion = {
    id: string; // Puede ser un UUID o string único
    numeroMedidor: string;
    cedula: string;
    fechaLectura: string; // ISO 8601 (ej. "2025-01-12")
    consumo: number; // en m3
    mesFacturado: string; // Ej. "Enero"
  };
  
  export interface MedicionFilter {
    numeroMedidor?: string;
    fechaDesde?: string; // formato YYYY-MM-DD
    fechaHasta?: string;
  }
  