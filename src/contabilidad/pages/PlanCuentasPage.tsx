import { useEffect, useMemo, useState } from 'react';
import Title from '../../shared/components/Title';
import api from '../../shared/api';
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronRight,
  FiFilter,
  FiSearch,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanCuentas = async (): Promise<void> => {
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
    };

    void fetchPlanCuentas();
  }, []);

  const filteredRows = useMemo(() => {
    const text = searchTerm.trim().toLowerCase();
    if (!text) {
      return rows;
    }

    return rows.filter(
      (account) =>
        account.nombre.toLowerCase().includes(text) ||
        account.codigo.toLowerCase().includes(text),
    );
  }, [rows, searchTerm]);

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

        <section className="mt-8 grid gap-4 xl:grid-cols-[1.5fr_1fr] xl:items-end">
          <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-slate-500 shadow-sm">
            <FiSearch className="h-5 w-5 shrink-0" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Buscar por nombre de la cuenta o código ..."
            />
          </label>

          <div className="flex xl:justify-end">
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[color:var(--color-primary)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Limpiar Filtros
            </button>
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-xl border border-[color:var(--color-primary)]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr className="bg-[color:var(--color-primary)] text-left text-[12px] font-semibold text-white">
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
      </div>
    </div>
  );
}
