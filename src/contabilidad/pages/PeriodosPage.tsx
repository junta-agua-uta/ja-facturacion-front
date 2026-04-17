import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { FaEye, FaLock, FaBan, FaSpinner } from 'react-icons/fa';
import { Title, SubTitle, CardSlot } from '../../shared/components';
import Pagination from '../../shared/components/Pagination';
import { PAGE_SIZE } from '../../shared/utils/constants';
import { authService } from '../../auth/Services/auth.service';
import {
  periodosContablesService,
  type EstadoPeriodoFiltro,
} from '../services/periodosContables.service';
import type { PeriodoContableDto } from '../types/periodoContable';
import ConfirmPeriodoModal from '../modals/ConfirmPeriodoModal';
import CrearAnioFiscalModal from '../modals/CrearAnioFiscalModal';

const MODAL_ID = 'confirm_periodo_modal';
const MODAL_ANIO_ID = 'crear_anio_fiscal_modal';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function fechaToAnioMes(iso: string): { anio: number; mes: string } {
  const [anio, mes] = iso.slice(0, 7).split('-').map(Number);
  return { anio, mes: MESES[mes - 1] };
}

function formatFecha(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-EC', {
    day: '2-digit', month: 'numeric', year: 'numeric',
  });
}

function estadoLabel(estado: string): string {
  return estado === 'CERRADO' ? 'Cerrado' : 'Abierto';
}

function parseError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data) {
    const data = err.response.data as { message?: string | string[] };
    if (data.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
    }
  }
  return fallback;
}

function getRolFromToken(): string | null {
  const token = authService.getToken();
  if (!token) return null;
  return authService.decodeToken(token)?.rol ?? null;
}

function getUserInfoFromToken(): { cedula: string; rol: string } | null {
  const token = authService.getToken();
  if (!token) return null;
  const payload = authService.decodeToken(token);
  if (!payload?.cedula) return null;
  return { cedula: payload.cedula, rol: payload.rol ?? '' };
}

type Confirm = {
  periodo: PeriodoContableDto;
  variante: 'cerrar' | 'abrir';
};

export default function PeriodosPage() {
  const navigate = useNavigate();
  const [periodos, setPeriodos] = useState<PeriodoContableDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<'' | EstadoPeriodoFiltro>('');
  const [usuarioActual, setUsuarioActual] = useState<{ cedula: string; rol: string } | null>(null);
  const [anioModalKey, setAnioModalKey] = useState(0);

  const esContador = rol === 'CONTADOR';
  const esAdmin = rol === 'ADMIN';

  const openModal = () =>
    (document.getElementById(MODAL_ID) as HTMLDialogElement)?.showModal();
  const closeModal = () =>
    (document.getElementById(MODAL_ID) as HTMLDialogElement)?.close();

  const openAnioModal = () => setAnioModalKey((k) => k + 1);
  const closeAnioModal = () =>
    (document.getElementById(MODAL_ANIO_ID) as HTMLDialogElement)?.close();

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await periodosContablesService.listar(page, PAGE_SIZE, 1, filtroEstado || undefined);
      setPeriodos(res.data);
      setTotalPages(Math.max(1, res.totalPages));
      setTotal(res.total);
    } catch (e) {
      setError(parseError(e, 'No se pudo cargar la lista de periodos.'));
      setPeriodos([]);
    } finally {
      setLoading(false);
    }
  }, [page, filtroEstado]);

  useEffect(() => {
    setRol(getRolFromToken());
    setUsuarioActual(getUserInfoFromToken());
  }, []);
  useEffect(() => { cargar(); }, [cargar]);
  useEffect(() => { setPage(1); }, [filtroEstado]);

  const irADetalle = (p: PeriodoContableDto) =>
    navigate(`/junta/contabilidad/periodos/${p.id}`, { state: { periodo: p } });

  // Abre el modal con los datos del periodo y la acción
  const pedirConfirmacion = (periodo: PeriodoContableDto, variante: 'cerrar' | 'abrir') => {
    setConfirm({ periodo, variante });
    setActionError(null);
    openModal();
  };

  // Ejecuta la acción real tras confirmación en el modal
  const handleConfirm = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { periodo, variante } = confirm;
      const updated =
        variante === 'cerrar'
          ? await periodosContablesService.cerrar(periodo.id, periodo.empresaId)
          : await periodosContablesService.abrir(periodo.id, periodo.empresaId);
      setPeriodos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      closeModal();
      setConfirm(null);
    } catch (err) {
      setActionError(parseError(err, 'Ocurrió un error al procesar la acción.'));
      closeModal();
      setConfirm(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => {
    closeModal();
    setConfirm(null);
  };

  const modalTitle = confirm?.variante === 'cerrar' ? 'Confirmar cierre de periodo' : 'Confirmar reapertura de periodo';
  const modalMessage =
    confirm?.variante === 'cerrar'
      ? `¿Estás seguro de que deseas cerrar el periodo "${confirm.periodo.nombre}"? Esta acción bloqueará modificaciones.`
      : `¿Estás seguro de que deseas reabrir el periodo "${confirm?.periodo.nombre}"?`;

  return (
    <>
      <Title title="Cierre Contable" />

      <CardSlot>
        <SubTitle title="Gestión de Periodos" />

        {error && (
          <div className="alert alert-error mt-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            <span>{actionError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-3 mt-4 mb-2">
          <label className="form-control w-full max-w-xs">
            <span className="label-text text-sm font-medium">Filtrar por estado</span>
            <select
              className="select select-bordered select-sm"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado((e.target.value as '' | EstadoPeriodoFiltro) || '')}
            >
              <option value="">Todos</option>
              <option value="ABIERTO">Abierto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </label>

          {esContador && (
            <button
              type="button"
              className="btn btn-sm btn-outline border-blue-900 text-blue-900 gap-2"
              onClick={openAnioModal}
            >
              <span className="text-base leading-none">+</span>
              Crear Año Fiscal
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Total: {total} periodo{total !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-2 border border-gray-200 rounded-lg">
              <table className="table w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="text-white font-semibold">Año</th>
                    <th className="text-white font-semibold">Mes</th>
                    <th className="text-white font-semibold">Estado</th>
                    <th className="text-white font-semibold">Fecha cierre</th>
                    <th className="text-white font-semibold">Usuario</th>
                    <th className="text-white font-semibold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {periodos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500">
                        No hay periodos contables para este filtro.
                      </td>
                    </tr>
                  ) : (
                    periodos.map((p) => {
                      const { anio, mes } = fechaToAnioMes(p.fechaInicio);
                      const cerrado = p.estado === 'CERRADO';
                      return (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="font-medium">{anio}</td>
                          <td>{mes}</td>
                          <td>
                            <span
                              className={`badge ${cerrado ? 'badge-neutral' : 'badge-success'} badge-outline font-medium`}
                            >
                              {estadoLabel(p.estado)}
                            </span>
                          </td>
                          <td>{cerrado ? formatFecha(p.fechaFin) : '—'}</td>
                          <td className="text-gray-600 text-sm">
                            {usuarioActual ? (
                              <span title={`Rol: ${usuarioActual.rol}`}>
                                {usuarioActual.cedula}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-ghost btn-circle text-blue-900"
                                title="Ver detalle del periodo"
                                onClick={() => irADetalle(p)}
                              >
                                <FaEye className="w-4 h-4" />
                              </button>

                              {cerrado ? (
                                esAdmin ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline border-blue-900 text-blue-900 gap-1"
                                    title="Reabrir este periodo"
                                    disabled={actionLoading}
                                    onClick={() => pedirConfirmacion(p, 'abrir')}
                                  >
                                    {actionLoading ? (
                                      <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <FaLock className="w-3.5 h-3.5" />
                                    )}
                                    Reabrir
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline border-blue-900 text-blue-900 gap-1 opacity-50 cursor-not-allowed"
                                    title="Solo un ADMIN puede reabrir un periodo cerrado"
                                    disabled
                                  >
                                    <FaLock className="w-3.5 h-3.5" />
                                    Reabrir
                                  </button>
                                )
                              ) : (
                                esContador ? (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline border-amber-700 text-amber-800 gap-1"
                                    title="Cerrar este periodo"
                                    disabled={actionLoading}
                                    onClick={() => pedirConfirmacion(p, 'cerrar')}
                                  >
                                    {actionLoading ? (
                                      <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <FaBan className="w-3.5 h-3.5" />
                                    )}
                                    Cerrar
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline border-amber-700 text-amber-800 gap-1 opacity-50 cursor-not-allowed"
                                    title="Solo un CONTADOR puede cerrar un periodo"
                                    disabled
                                  >
                                    <FaBan className="w-3.5 h-3.5" />
                                    Cerrar
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                pagination={{ currentPage: page, totalPages }}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </CardSlot>

      <ConfirmPeriodoModal
        id={MODAL_ID}
        title={modalTitle}
        message={modalMessage}
        variante={confirm?.variante ?? 'cerrar'}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {anioModalKey > 0 && (
        <CrearAnioFiscalModal
          key={anioModalKey}
          id={MODAL_ANIO_ID}
          onCreados={cargar}
          onCancel={closeAnioModal}
        />
      )}
    </>
  );
}
