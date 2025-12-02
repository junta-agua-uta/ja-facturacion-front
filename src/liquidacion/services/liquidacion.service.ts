import api from '../../shared/api';

export interface AnularLiquidacionResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    estadoSri: string;
    motivoAnulacion?: string;
    fechaAnulacion?: string;
  };
}

export const anularLiquidacion = async (id: number): Promise<AnularLiquidacionResponse> => {
  try {
    const response = await api.patch<AnularLiquidacionResponse>(`/liquidacion-compra/${id}/anular`, {
      motivoAnulacion: 'Anulación realizada desde el sistema',
      usuarioAnulacion: 'Usuario Sistema'
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al anular la liquidación.');
  }
};

export interface LiquidacionesAnuladasResponse {
  data: any[];
  totalPages: number;
  total: number;
  currentPage: number;
}

export const obtenerLiquidacionesAnuladas = async (
  page: number = 1,
  limit: number = 10
): Promise<LiquidacionesAnuladasResponse> => {
  try {
    const response = await api.get<LiquidacionesAnuladasResponse>(
      '/liquidacion-compra/anuladas',
      {
        params: { page, limit }
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener liquidaciones anuladas.');
  }
};
