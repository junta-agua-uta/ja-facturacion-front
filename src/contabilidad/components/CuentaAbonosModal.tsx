import { useState, useEffect } from 'react';
import { abonosService, Abono, CuentaPorCobrar } from '../services/abonos.service';
import { authService } from '../../auth/Services/auth.service';
import { empresaService } from '../../empresa/services/empresa.service';

interface Props {
  cuenta: CuentaPorCobrar | null;
  isOpen: boolean;
  onClose: () => void;
  onAbonoCreated: () => void;
}

export default function CuentaAbonosModal({ cuenta, isOpen, onClose, onAbonoCreated }: Props) {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Formulario para nuevo abono
  const [valorAbono, setValorAbono] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA'>('EFECTIVO');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cuenta) {
      cargarAbonos();
      // Reset form
      setValorAbono('');
      setDescripcion('');
      setMetodoPago('EFECTIVO');
      setError(null);
    }
  }, [isOpen, cuenta]);

  const cargarAbonos = async () => {
    if (!cuenta) return;
    setLoading(true);
    try {
      const data = await abonosService.listarAbonosDeCuenta(cuenta.ID);
      setAbonos(data);
    } catch (err) {
      console.error('Error al cargar abonos:', err);
    } finally {
      setLoading(false);
    }
  };

  const calcularSaldoPendiente = () => {
    if (!cuenta) return 0;
    const totalAbonado = abonos.reduce((sum, abono) => sum + Number(abono.VALOR_ABONO), 0);
    return Math.max(0, Number(cuenta.VALOR) - totalAbonado);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuenta) return;

    const valor = parseFloat(valorAbono);
    if (isNaN(valor) || valor <= 0) {
      setError('El valor del abono debe ser mayor a 0');
      return;
    }

    const saldoPendiente = calcularSaldoPendiente();
    if (valor > saldoPendiente) {
      setError('El valor del abono no puede superar el saldo pendiente');
      return;
    }

    if (!descripcion.trim()) {
      setError('Debe ingresar una descripción');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const currentUser = authService.getCurrentUser();
      const empresaResponse = await empresaService.obtenerEmpresa();
      const empresaId = empresaResponse.id || 1;

      await abonosService.crearAbono({
        idCuenta: cuenta.ID,
        valorAbono: valor,
        descripcion,
        metodoPago,
        usuarioId: parseInt(currentUser?.id || '1', 10),
        empresaId: empresaId,
      });

      // Refrescar lista de abonos localmente
      await cargarAbonos();
      setValorAbono('');
      setDescripcion('');
      onAbonoCreated();
    } catch (err: any) {
      console.error('Error al registrar abono:', err);
      setError(err.response?.data?.message || 'Error al registrar el abono');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !cuenta) return null;

  const saldoPendiente = calcularSaldoPendiente();
  const totalAbonado = Number(cuenta.VALOR) - saldoPendiente;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Detalle de Cuenta: {cuenta.cliente?.RAZON_SOCIAL}
            </h3>
            <p className="text-sm text-gray-500">CI/RUC: {cuenta.cliente?.IDENTIFICACION}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Deuda Original</p>
              <p className="text-2xl font-bold text-blue-900">${Number(cuenta.VALOR).toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-600 font-medium">Total Abonado</p>
              <p className="text-2xl font-bold text-green-900">${totalAbonado.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <p className="text-sm text-orange-600 font-medium">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-orange-900">${saldoPendiente.toFixed(2)}</p>
            </div>
          </div>

          {/* Formulario de Nuevo Abono (solo si hay saldo) */}
          {saldoPendiente > 0 && (
            <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-4">Registrar Nuevo Abono</h4>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor a Abonar</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        max={saldoPendiente}
                        value={valorAbono}
                        onChange={(e) => setValorAbono(e.target.value)}
                        className="input input-bordered w-full pl-8"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value as any)}
                      className="select select-bordered w-full"
                    >
                      <option value="EFECTIVO">EFECTIVO</option>
                      <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Ej. Abono parcial de deuda"
                    required
                  />
                </div>
                
                {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
                
                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Procesando...' : 'Registrar Abono'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Historial de Abonos */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Historial de Abonos</h4>
            {loading ? (
              <div className="flex justify-center py-4"><span className="loading loading-spinner text-primary"></span></div>
            ) : abonos.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="table table-zebra w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th>Fecha</th>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abonos.map((abono) => (
                      <tr key={abono.ID}>
                        <td>{new Date(abono.FECHA_ABONO).toLocaleDateString()}</td>
                        <td><span className="badge badge-ghost text-xs">{abono.CODIGO}</span></td>
                        <td>{abono.DESCRIPCION}</td>
                        <td className="text-right font-medium text-green-600">${Number(abono.VALOR_ABONO).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4 italic">No se han registrado abonos en esta cuenta.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
