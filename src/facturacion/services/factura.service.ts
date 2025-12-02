import api from '../../shared/api';

export interface AnularFacturaResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    claveAcceso: string;
    fechaEmision: Date;
    clienteNombre: string;
    clienteIdentificacion: string;
    total: number;
    estadoFactura: string;
  };
}

/**
 * Servicio para anular una factura en el sistema
 * IMPORTANTE: Solo anula la factura en el sistema local
 * El usuario debe verificar que la factura ya esté anulada en el SRI
 * @param id ID de la factura a anular
 * @returns Respuesta del servidor con el resultado de la operación
 */
export const anularFactura = async (id: string): Promise<AnularFacturaResponse> => {
  try {
    const response = await api.patch<AnularFacturaResponse>(`/facturas/${id}/anular`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Error al anular la factura. Por favor, intente nuevamente.'
    );
  }
};

/**
 * Servicio para desanular una factura (reversar anulación)
 * IMPORTANTE: Solo cambia el estado en el sistema local
 * Usar con precaución y solo en caso de error
 * @param id ID de la factura a desanular
 * @returns Respuesta del servidor con el resultado de la operación
 */
export const desanularFactura = async (id: string): Promise<AnularFacturaResponse> => {
  try {
    const response = await api.patch<AnularFacturaResponse>(`/facturas/${id}/desanular`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Error al desanular la factura. Por favor, intente nuevamente.'
    );
  }
};

/**
 * Obtiene todas las facturas anuladas del sistema
 * @param page Número de página
 * @param limit Cantidad de resultados por página
 * @returns Lista paginada de facturas anuladas
 */
export const obtenerFacturasAnuladas = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await api.get('/facturas/anuladas', {
      params: { page, limit }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 
      'Error al obtener las facturas anuladas.'
    );
  }
};
