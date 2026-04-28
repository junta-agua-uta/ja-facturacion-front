import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { FaCalendarPlus, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { periodosContablesService } from '../services/periodosContables.service';

const MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

const TODOS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

function generarPeriodos(anio: number) {
  return MESES.map((nombre, i) => {
    const mes = String(i + 1).padStart(2, '0');
    const ultimoDia = new Date(anio, i + 1, 0).getDate();
    const dia = String(ultimoDia).padStart(2, '0');
    return {
      nombre: `${nombre} ${anio}`,
      fechaInicio: `${anio}-${mes}-01`,
      fechaFin: `${anio}-${mes}-${dia}`,
    };
  });
}

type Estado = 'pendiente' | 'creando' | 'ok' | 'error';

type Props = {
  readonly id: string;
  readonly empresaId?: number;
  readonly onCreados: () => void;
  readonly onCancel: () => void;
};

export default function CrearAnioFiscalModal({ id, empresaId = 1, onCreados, onCancel }: Props) {
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set(TODOS));
  const [estados, setEstados] = useState<Estado[]>(Array(12).fill('pendiente'));
  const [errores, setErrores] = useState<string[]>(Array(12).fill(''));
  const [creando, setCreando] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const reset = () => {
    setAnio(anioActual);
    setSeleccionados(new Set(TODOS));
    setEstados(Array(12).fill('pendiente'));
    setErrores(Array(12).fill(''));
    setCreando(false);
    setTerminado(false);
  };

  const toggleMes = (i: number) => {
    if (creando) return;
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleTodos = () => {
    if (creando) return;
    setSeleccionados((prev) => (prev.size === 12 ? new Set() : new Set(TODOS)));
  };

  const handleCancel = () => {
    if (creando) return;
    reset();
    onCancel();
  };

  const handleCrear = async () => {
    if (seleccionados.size === 0) return;
    const periodos = generarPeriodos(anio);
    setCreando(true);

    const st: Estado[] = Array(12).fill('pendiente');
    const er: string[] = Array(12).fill('');

    for (let i = 0; i < 12; i++) {
      if (!seleccionados.has(i)) continue;

      st[i] = 'creando';
      setEstados([...st]);

      try {
        await periodosContablesService.crear(empresaId, periodos[i]);
        st[i] = 'ok';
      } catch (err) {
        st[i] = 'error';
        if (isAxiosError(err) && err.response?.data) {
          const msg = (err.response.data as { message?: string | string[] }).message;
          er[i] = msg ? (Array.isArray(msg) ? msg.join(', ') : String(msg)) : 'Error al crear';
        } else {
          er[i] = 'Error al crear';
        }
      }

      setEstados([...st]);
      setErrores([...er]);
    }

    setCreando(false);
    setTerminado(true);
    onCreados();
  };

  const exitosos = estados.filter((e) => e === 'ok').length;
  const conError = estados.filter((e) => e === 'error').length;
  const todosYaExisten = exitosos === 0 && conError > 0;

  useEffect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement | null;
    dialog?.showModal();
  }, [id]);

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg flex items-center gap-2 text-blue-900">
          <FaCalendarPlus className="w-5 h-5" />
          Crear Periodos Contables
        </h3>

        {!terminado ? (
          <>
            <div className="py-4 space-y-4">
              {/* Año */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Año fiscal</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={anio}
                  min={2000}
                  max={2100}
                  disabled={creando}
                  onChange={(e) => {
                    setAnio(Number(e.target.value));
                    setEstados(Array(12).fill('pendiente'));
                    setErrores(Array(12).fill(''));
                  }}
                />
              </div>

              {/* Selector de meses */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  <strong>{seleccionados.size}</strong> mes{seleccionados.size !== 1 ? 'es' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}:
                </span>
                <button
                  type="button"
                  className="text-xs text-blue-900 underline hover:no-underline disabled:opacity-40"
                  disabled={creando}
                  onClick={toggleTodos}
                >
                  {seleccionados.size === 12 ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {MESES.map((mes, i) => {
                  const est = estados[i];
                  const sel = seleccionados.has(i);
                  return (
                    <div
                      key={mes}
                      onClick={() => toggleMes(i)}
                      title={errores[i] || mes}
                      className={`flex items-center gap-1.5 px-2.5 py-2 rounded text-xs font-medium border transition-colors select-none ${
                        creando ? 'cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        est === 'ok'
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : est === 'error'
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : est === 'creando'
                              ? 'bg-blue-50 border-blue-300 text-blue-800'
                              : sel
                                ? 'bg-blue-900 border-blue-900 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {est === 'ok' && <FaCheck className="w-3 h-3 shrink-0" />}
                      {est === 'error' && <FaTimes className="w-3 h-3 shrink-0" />}
                      {est === 'creando' && <FaSpinner className="w-3 h-3 shrink-0 animate-spin" />}
                      {est === 'pendiente' && sel && <FaCheck className="w-3 h-3 shrink-0 opacity-60" />}
                      {est === 'pendiente' && !sel && <span className="w-3 h-3 shrink-0" />}
                      {mes}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={creando}
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary text-white gap-2"
                  disabled={creando || seleccionados.size === 0 || anio < 2000 || anio > 2100}
                  onClick={handleCrear}
                >
                  {creando && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                  {creando
                    ? 'Creando...'
                    : `Crear ${seleccionados.size} periodo${seleccionados.size !== 1 ? 's' : ''}`}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div
              className={`border rounded-lg px-4 py-3 text-sm ${
                conError === 0
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : todosYaExisten
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
            >
              {conError === 0
                ? `✅ ${exitosos} periodo${exitosos !== 1 ? 's' : ''} creado${exitosos !== 1 ? 's' : ''} correctamente.`
                : todosYaExisten
                  ? `ℹ️ Los periodos seleccionados del año ${anio} ya existían. No se crearon duplicados.`
                  : `⚠️ ${exitosos} creados. ${conError} ya existían o tuvieron un error.`}
            </div>

            {conError > 0 && !todosYaExisten && (
              <ul className="text-xs text-red-700 space-y-1 list-disc pl-4">
                {errores.map((e, i) =>
                  e ? <li key={i}>{MESES[i]}: {e}</li> : null,
                )}
              </ul>
            )}

            <div className="modal-action">
              <form method="dialog">
                <button type="button" className="btn btn-outline" onClick={handleCancel}>
                  Cerrar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
