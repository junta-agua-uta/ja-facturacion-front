import { useCallback, useEffect, useMemo, useState } from 'react';
import Title from '../../shared/components/Title';
import api from '../../shared/api';
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiX,
} from 'react-icons/fi';

type PlanCuentaApiItem = {
  id: number;
  codigo: string;
  nombre: string;
  tipo: string;
  naturaleza: string;
  casillero: string | null;
  nivel: number;
  esDetalle: boolean;
  activo: boolean;
  padreId: number | null;
};

type PlanCuentaApiResponse = {
  data?: PlanCuentaApiItem[];
};

type RenderRow = {
  account: PlanCuentaApiItem;
  depth: number;
  hasChildren: boolean;
};

const toLabel = (value: string): string =>
  value
    .toLowerCase()
    .split('_')
    .join(' ')
    .replace(/(^\w|\s\w)/g, (match: string) => match.toUpperCase());

export default function PlanCuentasPage() {
  const [rows, setRows] = useState<PlanCuentaApiItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedNaturaleza, setSelectedNaturaleza] = useState('');
  const [selectedCasillero, setSelectedCasillero] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedActivo, setSelectedActivo] = useState('');
  const [selectedDetalle, setSelectedDetalle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    codigo: '',
    nombre: '',
    tipo: 'ACTIVO',
    naturaleza: 'DEUDORA',
    casillero: '',
  });

  const detectedParent = useMemo(() => {
    const codigo = createForm.codigo.trim();
    const lastDotIndex = codigo.lastIndexOf('.');

    if (lastDotIndex <= 0) {
      return null;
    }

    const parentCode = codigo.slice(0, lastDotIndex);
    return rows.find((account) => account.codigo === parentCode) ?? null;
  }, [createForm.codigo, rows]);

  const parentDisplayText = useMemo(() => {
    const codigo = createForm.codigo.trim();
    if (!codigo) {
      return 'Escribe un codigo para detectar la cuenta padre automaticamente.';
    }

    const lastDotIndex = codigo.lastIndexOf('.');
    if (lastDotIndex <= 0) {
      return 'Cuenta principal (sin padre).';
    }

    if (detectedParent) {
      return `Has elegido el nombre de la cuenta "${detectedParent.nombre}" como padre.`;
    }

    return 'No se encontro una cuenta padre valida con ese prefijo de codigo.';
  }, [createForm.codigo, detectedParent]);

  const loadPlanCuentas = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<PlanCuentaApiResponse>('/plan-cuentas', {
        params: {
          formato: 'plano',
          page: 1,
          limit: 1000,
        },
      });

      const items = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setRows(items);

      const parentIds = new Set(
        items
          .map((item) => item.padreId)
          .filter((id): id is number => id !== null),
      );

      setExpandedIds(parentIds);
    } catch {
      setError('No se pudo cargar el plan de cuentas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlanCuentas();
  }, [loadPlanCuentas]);

  const options = useMemo(() => {
    const tipos = Array.from(new Set(rows.map((account) => account.tipo)));
    const naturalezas = Array.from(
      new Set(rows.map((account) => account.naturaleza)),
    );
    const casilleros = Array.from(
      new Set(
        rows
          .map((account) => account.casillero)
          .filter((casillero): casillero is string => !!casillero),
      ),
    );
    const niveles = Array.from(new Set(rows.map((account) => account.nivel))).sort(
      (a, b) => a - b,
    );

    return {
      tipos,
      naturalezas,
      casilleros,
      niveles,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();
    const byDirectFilters = rows.filter((account) => {
      const matchesText =
        !text ||
        account.nombre.toLowerCase().includes(text) ||
        account.codigo.toLowerCase().includes(text);

      const matchesTipo = !selectedTipo || account.tipo === selectedTipo;
      const matchesNaturaleza =
        !selectedNaturaleza ||
        account.naturaleza === selectedNaturaleza;
      const matchesCasillero =
        !selectedCasillero || account.casillero === selectedCasillero;
      const matchesNivel =
        !selectedNivel || account.nivel === Number(selectedNivel);
      const matchesActivo =
        !selectedActivo ||
        (selectedActivo === 'ACTIVO' ? account.activo : !account.activo);
      const matchesDetalle =
        !selectedDetalle ||
        (selectedDetalle === 'DETALLE' ? account.esDetalle : !account.esDetalle);

      return (
        matchesText &&
        matchesTipo &&
        matchesNaturaleza &&
        matchesCasillero &&
        matchesNivel &&
        matchesActivo &&
        matchesDetalle
      );
    });

    const byId = new Map(rows.map((item) => [item.id, item]));
    const includedIds = new Set<number>();

    byDirectFilters.forEach((item) => {
      includedIds.add(item.id);

      let parentId = item.padreId;
      while (parentId !== null) {
        includedIds.add(parentId);
        parentId = byId.get(parentId)?.padreId ?? null;
      }
    });

    return rows.filter((item) => includedIds.has(item.id));
  }, [
    rows,
    searchTerm,
    selectedTipo,
    selectedNaturaleza,
    selectedCasillero,
    selectedNivel,
    selectedActivo,
    selectedDetalle,
  ]);

  const childrenMap = useMemo(() => {
    const map = new Map<number | null, PlanCuentaApiItem[]>();

    filteredRows.forEach((account) => {
      const key = account.padreId;
      const bucket = map.get(key) ?? [];
      bucket.push(account);
      map.set(key, bucket);
    });

    map.forEach((bucket) => {
      bucket.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));
    });

    return map;
  }, [filteredRows]);

  const visibleRows = useMemo(() => {
    const list: RenderRow[] = [];

    const walk = (parentId: number | null, depth: number): void => {
      const children = childrenMap.get(parentId) ?? [];

      children.forEach((child) => {
        const hasChildren = (childrenMap.get(child.id)?.length ?? 0) > 0;
        list.push({ account: child, depth, hasChildren });

        if (hasChildren && expandedIds.has(child.id)) {
          walk(child.id, depth + 1);
        }
      });
    };

    walk(null, 0);
    return list;
  }, [childrenMap, expandedIds]);

  const summaryCards = useMemo(() => {
    const totalActivos = rows.filter((account) => account.tipo === 'ACTIVO').length;
    const totalPasivos = rows.filter((account) => account.tipo === 'PASIVO').length;

    return [
      {
        title: 'Total Activos',
        value: String(totalActivos),
        icon: FiArrowUp,
      },
      {
        title: 'Total Pasivos',
        value: String(totalPasivos),
        icon: FiArrowDown,
      },
      {
        title: 'Cuentas detalle',
        value: String(rows.filter((account) => account.esDetalle).length),
        icon: FiFilter,
      },
      {
        title: 'Cuentas activas',
        value: String(rows.filter((account) => account.activo).length),
        icon: FiArrowUp,
      },
    ];
  }, [rows]);

  const toggleNode = (id: number): void => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const setFormField = (field: keyof typeof createForm, value: string): void => {
    setCreateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const closeCreateModal = (): void => {
    setIsCreateModalOpen(false);
    setCreateError(null);
    setCreateSuccess(null);
  };

  const handleCreateCuenta = async (): Promise<void> => {
    const empresaId = 1;
    const codigo = createForm.codigo.trim();
    const nombre = createForm.nombre.trim();

    let padreId: number | undefined;
    const lastDotIndex = codigo.lastIndexOf('.');

    if (lastDotIndex > 0) {
      const parentCode = codigo.slice(0, lastDotIndex);
      const parent = rows.find((account) => account.codigo === parentCode);

      if (!parent) {
        setCreateError(
          `No existe la cuenta padre con codigo ${parentCode}. Ejemplo correcto: padre 100, hijo 100.1, nieto 100.1.1`,
        );
        return;
      }

      padreId = parent.id;
    }

    if (!codigo || !nombre) {
      setCreateError('Codigo y nombre son obligatorios.');
      return;
    }

    setIsSaving(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      await api.post(
        '/plan-cuentas',
        {
          codigo,
          nombre,
          tipo: createForm.tipo,
          naturaleza: createForm.naturaleza,
          casillero: createForm.casillero.trim() || undefined,
          padreId,
        },
        {
          params: {
            empresaId,
          },
        },
      );

      setCreateSuccess('Cuenta creada correctamente.');
      setCreateForm({
        codigo: '',
        nombre: '',
        tipo: 'ACTIVO',
        naturaleza: 'DEUDORA',
        casillero: '',
      });

      await loadPlanCuentas();

      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccess(null);
      }, 600);
    } catch (requestError: unknown) {
      const maybeError = requestError as {
        response?: { data?: { message?: string | string[] } };
      };

      const message = maybeError?.response?.data?.message;
      if (Array.isArray(message)) {
        setCreateError(message.join(' | '));
      } else if (typeof message === 'string') {
        setCreateError(message);
      } else {
        setCreateError('No se pudo guardar la cuenta.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-5 sm:px-6 lg:px-8">
      <Title title="Plan de cuentas" />

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center shadow-[0_1px_0_rgba(16,77,115,0.04)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 text-[color:var(--color-primary)]">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="mt-2 text-2xl font-bold text-[color:var(--color-primary)]">
                  {card.value}
                </div>
                <div className="mt-1 text-sm text-slate-600">{card.title}</div>
              </article>
            );
          })}
        </div>

        <section className="mt-8 space-y-4">
          <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-slate-500 shadow-sm">
            <FiSearch className="h-5 w-5 shrink-0" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Buscar por nombre de la cuenta o código ..."
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="estado-filter">Estado</label>
            <select
              id="estado-filter"
              value={selectedActivo}
              onChange={(event) => setSelectedActivo(event.target.value)}
              className="h-11 min-w-[130px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Estados</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>

            <label className="sr-only" htmlFor="tipo-filter">Tipo</label>
            <select
              id="tipo-filter"
              value={selectedTipo}
              onChange={(event) => setSelectedTipo(event.target.value)}
              className="h-11 min-w-[130px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Tipo</option>
              {options.tipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {toLabel(tipo)}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="naturaleza-filter">Naturaleza</label>
            <select
              id="naturaleza-filter"
              value={selectedNaturaleza}
              onChange={(event) => setSelectedNaturaleza(event.target.value)}
              className="h-11 min-w-[140px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Naturaleza</option>
              {options.naturalezas.map((naturaleza) => (
                <option key={naturaleza} value={naturaleza}>
                  {toLabel(naturaleza)}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="casillero-filter">Casillero</label>
            <select
              id="casillero-filter"
              value={selectedCasillero}
              onChange={(event) => setSelectedCasillero(event.target.value)}
              className="h-11 min-w-[130px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Casillero</option>
              {options.casilleros.map((casillero) => (
                <option key={casillero} value={casillero}>
                  {casillero}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="nivel-filter">Nivel</label>
            <select
              id="nivel-filter"
              value={selectedNivel}
              onChange={(event) => setSelectedNivel(event.target.value)}
              className="h-11 min-w-[110px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Nivel</option>
              {options.niveles.map((nivel) => (
                <option key={nivel} value={String(nivel)}>
                  {nivel}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="detalle-filter">Es detalle</label>
            <select
              id="detalle-filter"
              value={selectedDetalle}
              onChange={(event) => setSelectedDetalle(event.target.value)}
              className="h-11 min-w-[130px] rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option value="" disabled hidden>Es detalle</option>
              <option value="DETALLE">Si</option>
              <option value="AGRUPADORA">No</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedTipo('');
                setSelectedNaturaleza('');
                setSelectedCasillero('');
                setSelectedNivel('');
                setSelectedActivo('');
                setSelectedDetalle('');
              }}
              className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 md:ml-auto"
            >
              Limpiar Filtros
            </button>
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-xl border border-[color:var(--color-primary)]">
          <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '470px' }}>
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="sticky top-0 z-10 bg-[color:var(--color-primary)] text-left text-[12px] font-semibold text-white">
                  <th className="px-4 py-3">Nombre de la cuenta</th>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Naturaleza</th>
                  <th className="px-4 py-3">Casillero</th>
                  <th className="px-4 py-3">Nivel</th>
                  <th className="px-4 py-3">Es detalle</th>
                  <th className="px-4 py-3">Activo</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                      Cargando plan de cuentas...
                    </td>
                  </tr>
                ) : null}

                {!loading && error ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : null}

                {!loading && !error && visibleRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-slate-500">
                      No se encontraron cuentas.
                    </td>
                  </tr>
                ) : null}

                {!loading && !error
                  ? visibleRows.map(({ account, depth, hasChildren }, index) => (
                      <tr
                        key={account.id}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-800">
                          <div
                            className="flex items-center gap-2"
                            style={{ paddingLeft: `${depth * 20}px` }}
                          >
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={() => toggleNode(account.id)}
                                className="rounded p-0.5 text-slate-900 transition hover:bg-slate-200"
                              >
                                {expandedIds.has(account.id) ? (
                                  <FiChevronDown className="h-4 w-4" />
                                ) : (
                                  <FiChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <span className="inline-block h-4 w-4" />
                            )}
                            <span className={depth === 0 ? 'font-semibold uppercase' : 'font-medium'}>
                              {account.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {account.codigo}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {toLabel(account.tipo)}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {toLabel(account.naturaleza)}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {account.casillero ?? '-'}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {account.nivel}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {account.esDetalle ? 'Si' : 'No'}
                        </td>
                        <td className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                          {account.activo ? 'Si' : 'No'}
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Agregar
          </button>
        </div>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/30 px-4 py-8 backdrop-blur-[1px]">
          <div className="w-full max-w-[672px] overflow-hidden rounded-lg border border-slate-200/20 bg-white shadow-[0px_12px_32px_rgba(0,41,68,0.08)]">
            <header className="flex items-start justify-between bg-gradient-to-r from-[#004065] to-[#26638A] px-8 py-7">
              <div>
                <h3 className="text-[36px] font-extrabold leading-none tracking-[-0.6px] text-white">
                  Nueva Cuenta
                </h3>
                <p className="mt-2 text-xs uppercase tracking-[1.2px] text-blue-200">
                  Definicion de cuenta contable
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="mt-1 text-white/70 transition hover:text-white"
                aria-label="Cerrar modal"
              >
                <FiX className="h-7 w-7" />
              </button>
            </header>

            <div className="px-8 pb-12 pt-8">
              <form className="space-y-8">
                {createError ? (
                  <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                ) : null}

                {createSuccess ? (
                  <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {createSuccess}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Codigo
                    </span>
                    <input
                      value={createForm.codigo}
                      onChange={(event) => setFormField('codigo', event.target.value)}
                      placeholder="1.1.1"
                      className="h-12 w-full rounded bg-[#E7E8E9] px-4 text-base text-slate-500 outline-none placeholder:text-slate-500"
                    />
                    <span className="block text-xs text-slate-500">
                      Ejemplo jerarquia: padre 100, hijo 100.1, nieto 100.1.1
                    </span>
                  </label>

                  <label className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Cuenta padre detectada
                    </span>
                    <div className="min-h-12 w-full rounded bg-slate-100 px-4 py-3 text-sm leading-5 text-slate-600 break-words whitespace-normal">
                      {parentDisplayText}
                    </div>
                  </label>

                  <label className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Nombre
                    </span>
                    <input
                      value={createForm.nombre}
                      onChange={(event) => setFormField('nombre', event.target.value)}
                      placeholder="Caja"
                      className="h-12 w-full rounded bg-[#E7E8E9] px-4 text-base text-slate-700 outline-none placeholder:text-slate-500"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Tipo
                    </span>
                    <select
                      value={createForm.tipo}
                      onChange={(event) => setFormField('tipo', event.target.value)}
                      className="h-12 w-full rounded bg-[#E7E8E9] px-4 text-base text-[#191C1D] outline-none"
                    >
                      <option value="ACTIVO">ACTIVO</option>
                      <option value="PASIVO">PASIVO</option>
                      <option value="PATRIMONIO">PATRIMONIO</option>
                      <option value="INGRESOS">INGRESOS</option>
                      <option value="GASTOS">GASTOS</option>
                      <option value="COSTOS">COSTOS</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Naturaleza
                    </span>
                    <select
                      value={createForm.naturaleza}
                      onChange={(event) => setFormField('naturaleza', event.target.value)}
                      className="h-12 w-full rounded bg-[#E7E8E9] px-4 text-base text-[#191C1D] outline-none"
                    >
                      <option value="DEUDORA">DEUDORA</option>
                      <option value="ACREEDORA">ACREEDORA</option>
                    </select>
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-[1px] text-slate-700">
                      Casillero
                    </span>
                    <input
                      value={createForm.casillero}
                      onChange={(event) => setFormField('casillero', event.target.value)}
                      placeholder="101"
                      className="h-12 w-full rounded bg-[#E7E8E9] px-4 text-base text-slate-700 outline-none placeholder:text-slate-500"
                    />
                  </label>
                </div>

                <footer className="flex justify-end gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="inline-flex h-10 items-center px-6 text-xs font-bold uppercase tracking-[1.2px] text-slate-500"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleCreateCuenta();
                    }}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center rounded bg-gradient-to-r from-[#002944] to-[#26638A] px-10 text-xs font-bold uppercase tracking-[1.2px] text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)]"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Cuenta'}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
