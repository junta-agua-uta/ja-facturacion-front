import api from '../../shared/api';

export interface Abono {
  ID: number;
  VALOR_ABONO: number;
  FECHA_ABONO: string;
  CODIGO: string;
  DESCRIPCION: string;
  ID_CUENTA: number;
  asientoId?: number;
}

export interface CuentaPorCobrar {
  ID: number;
  FECHA_EMISION: string;
  VALOR: number;
  ESTADO: string;
  ID_CLIENTE: number;
  ABONOS?: Abono[];
  cliente?: {
    ID: number;
    RAZON_SOCIAL: string;
    IDENTIFICACION: string;
  };
}

export interface CreateAbonoDto {
  idCuenta: number;
  valorAbono: number;
  descripcion: string;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  usuarioId: number;
  empresaId: number;
}

export const abonosService = {
  async obtenerCuentasPendientes(): Promise<CuentaPorCobrar[]> {
    const response = await api.get('/abonos/cuentas/activas');
    return response.data;
  },

  async obtenerCuentasPorCliente(idCliente: number): Promise<CuentaPorCobrar[]> {
    const response = await api.get(`/abonos/cuentas/cliente/${idCliente}`);
    return response.data;
  },

  async listarAbonosDeCuenta(idCuenta: number): Promise<Abono[]> {
    const response = await api.get(`/abonos/cuenta/${idCuenta}`);
    return response.data;
  },

  async crearAbono(data: CreateAbonoDto): Promise<Abono> {
    const response = await api.post('/abonos', data);
    return response.data;
  }
};
