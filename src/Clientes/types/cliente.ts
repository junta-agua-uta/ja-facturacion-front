// src/types/cliente.ts
export interface Cliente {
  id: string;
  identificacion: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion: string;
  telefono1?: string;
  telefono2?: string;
  correo?: string;
  tarifa?: string;
  grupo?: string;
  zona?: string;
  ruta?: string;
  vendedor?: string;
  cobrador?: string;
  provincia?: string;
  ciudad?: string;
  parroquia?: string;
  
  // Aliases para compatibilidad con diferentes formatos
  telefonoNro1?: string;
  telefonoNro2?: string;
  correoElectronico?: string;
}

export interface ClienteFilter {
  identificacion?: string;
  razonSocial?: string;
  nombreComercial?: string;
  direccion?: string;
  telefono1?: string;
  telefono2?: string;
  correo?: string;
  tarifa?: string;
  grupo?: string;
  zona?: string;
  ruta?: string;
  vendedor?: string;
  cobrador?: string;
  provincia?: string;
  ciudad?: string;
  parroquia?: string;
}