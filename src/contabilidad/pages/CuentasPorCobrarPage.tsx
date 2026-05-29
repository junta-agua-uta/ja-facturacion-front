import { useState, useEffect } from 'react';
import { Title, SubTitle, CardSlot } from '../../shared/components';
import { abonosService, CuentaPorCobrar } from '../services/abonos.service';
import CuentaAbonosModal from '../components/CuentaAbonosModal';

export default function CuentasPorCobrarPage() {
  const [cuentas, setCuentas] = useState<CuentaPorCobrar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await abonosService.obtenerCuentasPendientes();
      setCuentas(data);
    } catch (err: any) {
      console.error('Error al cargar cuentas:', err);
      setError(err.response?.data?.message || 'Error al cargar las cuentas por cobrar');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cuenta: CuentaPorCobrar) => {
    setSelectedCuenta(cuenta);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCuenta(null);
  };

  const handleAbonoCreated = () => {
    // Refresh the accounts list in case the account is fully paid and changes status
    cargarCuentas();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <Title title="Contabilidad" />
          <SubTitle title="Cuentas por Cobrar (Pendientes)" />
        </div>
        <button 
          onClick={cargarCuentas}
          className="btn btn-outline btn-sm h-10 px-4"
          disabled={loading}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      <CardSlot>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="overflow-x-auto min-h-[400px]">
          <table className="table table-zebra w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-4">ID</th>
                <th className="py-4">Fecha Emisión</th>
                <th className="py-4">Cliente</th>
                <th className="py-4 text-center">Identificación</th>
                <th className="py-4 text-center">Estado</th>
                <th className="py-4 text-right">Deuda Original</th>
                <th className="py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <span className="loading loading-spinner text-primary loading-lg"></span>
                  </td>
                </tr>
              ) : cuentas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 italic">
                    No hay cuentas por cobrar pendientes.
                  </td>
                </tr>
              ) : (
                cuentas.map((cuenta) => (
                  <tr key={cuenta.ID} className="hover:bg-blue-50/50 transition-colors">
                    <td className="font-medium text-gray-600">#{cuenta.ID}</td>
                    <td>{new Date(cuenta.FECHA_EMISION).toLocaleDateString()}</td>
                    <td className="font-medium text-gray-800">{cuenta.cliente?.RAZON_SOCIAL}</td>
                    <td className="text-center font-mono text-xs">{cuenta.cliente?.IDENTIFICACION}</td>
                    <td className="text-center">
                      <span className="badge badge-warning badge-sm font-semibold text-xs py-2 px-3">
                        {cuenta.ESTADO}
                      </span>
                    </td>
                    <td className="text-right font-bold text-gray-700">
                      ${Number(cuenta.VALOR).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleOpenModal(cuenta)}
                        className="btn btn-sm btn-primary btn-outline"
                      >
                        Ver Abonos
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardSlot>

      <CuentaAbonosModal
        cuenta={selectedCuenta}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAbonoCreated={handleAbonoCreated}
      />
    </div>
  );
}
