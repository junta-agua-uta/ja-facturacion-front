import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  FaArrowLeft,
  FaBan,
  FaBook,
  FaFileAlt,
  FaFileInvoiceDollar,
  FaLock,
  FaShoppingCart,
  FaChartLine,
  FaSpinner,
} from 'react-icons/fa';
import { Title, CardSlot } from '../../shared/components';
import { authService } from '../../auth/Services/auth.service';
import { periodosContablesService } from '../services/periodosContables.service';
import {
  cargarResumenPeriodo,
  type PeriodoResumen,
} from '../services/periodoResumen.service';
import type { PeriodoContableDto } from '../types/periodoContable';
import ConfirmPeriodoModal from '../modals/ConfirmPeriodoModal';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function tituloMesAnio(iso: string): string {
  const [y, m] = iso.slice(0, 7).split('-').map(Number);
  return `${MESES[m - 1]} ${y}`;
}

function formatFechaCorta(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(n: number): string {
  return n.toLocaleString('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRolFromToken(): string | null {
  const token = authService.getToken();
  if (!token) return null;
  return authService.decodeToken(token)?.rol ?? null;
}

const MODAL_DETALLE_ID = 'confirm_periodo_detalle_modal';

type LocationState = { periodo?: PeriodoContableDto };

function parseError(err: unknown, fallback: string): string {
  if (isAxiosError(err) && err.response?.data) {
    const data = err.response.data as { message?: string | string[] };
    if (data.message) {
      return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
    }
  }
  return fallback;
}

export default function PeriodoDetallePage() {
  const { periodoId } = useParams<{ periodoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const idNum = Number(periodoId);

  const [periodo, setPeriodo] = useState<PeriodoContableDto | null>(null);
  const [resumen, setResumen] = useState<PeriodoResumen | null>(null);
  const [loadingPeriodo, setLoadingPeriodo] = useState(true);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingVariante, setPendingVariante] = useState<'cerrar' | 'abrir'>('cerrar');
  const [rol, setRol] = useState<string | null>(null);

  const esContador = rol === 'CONTADOR';
  const esAdmin = rol === 'ADMIN';
  const cerrado = periodo?.estado === 'CERRADO';

  const cargarPeriodo = useCallback(async () => {
    if (!periodoId || Number.isNaN(idNum)) {
      setPeriodo(null);
      setLoadingPeriodo(false);
      return;
    }
    setLoadingPeriodo(true);
    setError(null);
    const st = (location.state as LocationState | null)?.periodo;
    if (st && st.id === idNum) {
      setPeriodo(st);
      setLoadingPeriodo(false);
      return;
    }
    try {
      const res = await periodosContablesService.listar(1, 500, 1);
      const found = res.data.find((p) => p.id === idNum) ?? null;
      setPeriodo(found);
      if (!found) setError('No se encontró este periodo. Vuelve a la lista y elige uno de la tabla.');
    } catch (e) {
      if (isAxiosError(e) && e.response?.data) {
        const m = (e.response.data as { message?: string }).message;
        setError(typeof m === 'string' ? m : 'Error al cargar el periodo.');
      } else setError('Error al cargar el periodo.');
      setPeriodo(null);
    } finally {
      setLoadingPeriodo(false);
    }
  }, [periodoId, idNum, location.state]);

  useEffect(() => {
    setRol(getRolFromToken());
  }, []);

  useEffect(() => {
    cargarPeriodo();
  }, [cargarPeriodo]);

  useEffect(() => {
    if (!periodo) {
      setResumen(null);
      return;
    }
    let cancelled = false;
    setLoadingResumen(true);
    cargarResumenPeriodo(periodo)
      .then((r) => {
        if (!cancelled) setResumen(r);
      })
      .catch(() => {
        if (!cancelled) setResumen(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingResumen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodo]);

  const fechaDesde = periodo ? periodo.fechaInicio.slice(0, 10) : '';
  const fechaHasta = periodo ? periodo.fechaFin.slice(0, 10) : '';

  const irFacturas = () => {
    navigate('/junta/facturas', {
      state: { FechaEmisionDesde: fechaDesde, FechaEmisionHasta: fechaHasta },
    });
  };

  const irCompras = () => {
    navigate('/junta/liquidacion', {
      state: { FechaEmisionDesde: fechaDesde, FechaEmisionHasta: fechaHasta },
    });
  };

  const irAsientos = () => {
    navigate(`/junta/contabilidad/asientos?periodoId=${periodo?.id ?? ''}`);
  };

  const openModal = (variante: 'cerrar' | 'abrir') => {
    setPendingVariante(variante);
    setActionError(null);
    (document.getElementById(MODAL_DETALLE_ID) as HTMLDialogElement)?.showModal();
  };
  const closeModal = () =>
    (document.getElementById(MODAL_DETALLE_ID) as HTMLDialogElement)?.close();

  const handleConfirm = async () => {
    if (!periodo) return;
    setActionLoading(true);
    try {
      const updated =
        pendingVariante === 'cerrar'
          ? await periodosContablesService.cerrar(periodo.id, periodo.empresaId)
          : await periodosContablesService.abrir(periodo.id, periodo.empresaId);
      setPeriodo(updated);
      closeModal();
    } catch (err) {
      setActionError(parseError(err, 'Ocurrió un error al procesar la acción.'));
      closeModal();
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = () => closeModal();

  const tituloReabrir = useMemo(() => {
    if (!cerrado) return '';
    if (!esAdmin) return 'Solo un ADMIN puede reabrir un periodo cerrado.';
    return 'Reabrir este periodo';
  }, [cerrado, esAdmin]);

  const tituloCerrar = useMemo(
    () => esContador ? 'Cerrar este periodo' : 'Solo un CONTADOR puede cerrar un periodo.',
    [esContador],
  );

  const modalTitle = pendingVariante === 'cerrar' ? 'Confirmar cierre de periodo' : 'Confirmar reapertura de periodo';
  const modalMessage =
    pendingVariante === 'cerrar'
      ? `¿Estás seguro de que deseas cerrar el periodo "${periodo?.nombre}"? Esta acción bloqueará modificaciones.`
      : `¿Estás seguro de que deseas reabrir el periodo "${periodo?.nombre}"?`;

  if (loadingPeriodo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-sm text-gray-500">Cargando periodo…</p>
      </div>
    );
  }

  if (error || !periodo) {
    return (
      <div className="space-y-4">
        <Title title="Detalle del periodo" />
        <CardSlot>
          <div className="alert alert-warning text-sm">
            <span>{error ?? 'Periodo no disponible.'}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline mt-4 gap-2"
            onClick={() => navigate('/junta/contabilidad/periodos')}
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            Volver a periodos
          </button>
        </CardSlot>
      </div>
    );
  }

  const subtitulo = `Detalle del Periodo - ${tituloMesAnio(periodo.fechaInicio)}`;

  return (
    <>
      <div className="rounded-xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-6 pb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 [&_h1]:my-2">
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-blue-900 mb-1 block text-left w-fit"
            onClick={() => navigate('/junta/contabilidad/periodos')}
          >
            Contabilidad — Periodo
          </button>
          <Title title={subtitulo} />
          <p className="text-sm text-gray-500">
            {periodo.nombre} · {formatFechaCorta(periodo.fechaInicio)} —{' '}
            {formatFechaCorta(periodo.fechaFin)}
          </p>
        </div>
        <div className="shrink-0">
          {cerrado ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-4 py-2 text-sm font-medium border border-slate-200">
              <FaBan className="w-4 h-4 text-slate-500 shrink-0" />
              Periodo Cerrado
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-800 px-4 py-2 text-sm font-medium border border-emerald-200">
              Periodo Abierto
            </span>
          )}
        </div>
      </div>

      {loadingResumen ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-base-200 animate-pulse" />
          ))}
        </div>
      ) : resumen ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            icon={<FaFileInvoiceDollar className="w-5 h-5 text-blue-700" />}
            label="Total facturas"
            value={String(resumen.totalFacturas)}
          />
          <KpiCard
            icon={<FaShoppingCart className="w-5 h-5 text-indigo-700" />}
            label="Total compras"
            value={String(resumen.totalCompras)}
            hint="Compras registradas en las fechas de este periodo"
          />
          <KpiCard
            icon={<FaBook className="w-5 h-5 text-sky-700" />}
            label="Total asientos"
            value={String(resumen.totalAsientos)}
          />
          <KpiCard
            icon={<FaChartLine className="w-5 h-5 text-emerald-700" />}
            label="Total ingresos"
            value={formatMoney(resumen.totalIngresos)}
            hint="Facturación del periodo"
          />
          <KpiCard
            icon={<FaFileAlt className="w-5 h-5 text-amber-700" />}
            label="Total gastos"
            value={formatMoney(resumen.totalGastos)}
            hint="Compras del periodo"
          />
        </div>
      ) : null}

      <div className="grid md:grid-cols-3 gap-4">
        <AccionCard
          titulo="Facturas"
          texto={`${resumen?.totalFacturas ?? '—'} facturas registradas en este periodo.`}
          boton="Ver facturas del periodo"
          onClick={irFacturas}
        />
        <AccionCard
          titulo="Compras"
          texto={`${resumen?.totalCompras ?? '—'} compras registradas en este periodo.`}
          boton="Ver compras del periodo"
          onClick={irCompras}
        />
        <AccionCard
          titulo="Asientos"
          texto={`${resumen?.totalAsientos ?? '—'} asientos contables en este periodo.`}
          boton="Ver asientos del periodo"
          onClick={irAsientos}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-blue-950 mb-3">Reportes</h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 opacity-60 cursor-not-allowed"
            disabled
            title="Disponible próximamente"
          >
            Libro Diario
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 opacity-60 cursor-not-allowed"
            disabled
            title="Disponible próximamente"
          >
            Libro Mayor
          </button>
          <button
            type="button"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 opacity-60 cursor-not-allowed"
            disabled
            title="Disponible próximamente"
          >
            Balance de comprobación
          </button>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          className="rounded-md bg-gray-200 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 border-0"
          onClick={() => navigate('/junta/contabilidad/periodos')}
        >
          Volver
        </button>
        {cerrado ? (
          <button
            type="button"
            className={`rounded-md border border-blue-950 bg-blue-950 px-5 py-2.5 text-sm font-medium text-white gap-2 inline-flex items-center ${
              !esAdmin || actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
            }`}
            disabled={!esAdmin || actionLoading}
            title={tituloReabrir}
            onClick={() => openModal('abrir')}
          >
            {actionLoading ? (
              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FaLock className="w-3.5 h-3.5" />
            )}
            Reabrir periodo
          </button>
        ) : (
          <button
            type="button"
            className={`rounded-md border border-blue-950 bg-blue-950 px-5 py-2.5 text-sm font-medium text-white gap-2 inline-flex items-center ${
              !esContador || actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
            }`}
            disabled={!esContador || actionLoading}
            title={tituloCerrar}
            onClick={() => openModal('cerrar')}
          >
            {actionLoading ? (
              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FaBan className="w-3.5 h-3.5" />
            )}
            Cerrar periodo
          </button>
        )}
      </div>
      </div>

      <ConfirmPeriodoModal
        id={MODAL_DETALLE_ID}
        title={modalTitle}
        message={modalMessage}
        variante={pendingVariante}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      title={hint}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-semibold text-gray-900 tabular-nums leading-tight">{value}</p>
    </div>
  );
}

function AccionCard({
  titulo,
  texto,
  boton,
  onClick,
}: {
  titulo: string;
  texto: string;
  boton: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      <h4 className="font-semibold text-blue-950">{titulo}</h4>
      <p className="text-sm text-gray-600 flex-1">{texto}</p>
      <button
        type="button"
        className="w-full rounded-full border border-gray-300 bg-gray-200/90 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 sm:w-auto"
        onClick={onClick}
      >
        {boton}
      </button>
    </div>
  );
}
