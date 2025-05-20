export interface Cliente {
  id: string;
  identificacion: string;
  razonSocial: string;
  direccion: string;
  telefonoNro1: string;
  telefonoNro2: string;
  correoElectronico: string;
}

export interface ClienteFilter {
  identificacion?: string;
}