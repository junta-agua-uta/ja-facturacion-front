import { useEffect, useMemo, useState } from 'react';
import { Title, CardSlot, EndSlot, Table } from '../../shared/components';
import { empresaService, EmpresaApiResponse } from '../services/empresa.service';
import EditEmpresaModal from '../modals/EditEmpresaModal';

type EmpresaViewModel = {
  id: number;
  nombre: string;
  email: string;
  ruc: string;
  direccion: string;
  telefono: string;
  moneda: string;
  representanteLegal: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));

const resolveLogoSrc = (logo: string | null) => {
  if (!logo) {
    return null;
  }

  const normalized = logo.trim();

  // En algunos entornos se guarda literalmente "logo", lo tratamos como logo por defecto.
  if (!normalized || normalized.toLowerCase() === 'logo') {
    return '/logo_agua.svg';
  }

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:image/')
  ) {
    return normalized;
  }

  const apiBase = import.meta.env.VITE_API_URL as string | undefined;

  if (!apiBase) {
    return normalized;
  }

  try {
    return new URL(normalized, apiBase).toString();
  } catch {
    return normalized;
  }
};

const EmpresaPage = () => {
  const [empresa, setEmpresa] = useState<EmpresaViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EmpresaViewModel | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(false);

  useEffect(() => {
    const fetchEmpresa = async () => {
      setLoading(true);
      setError(null);

      try {
        const data: EmpresaApiResponse = await empresaService.obtenerEmpresa();
        setEmpresa(data);
        if (data.id) {
          fetchUsuarios(data.id);
        }
      } catch (err) {
        console.error('Error al cargar empresa:', err);
        setError('No se pudo cargar la información de la empresa.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, []);

  const fetchUsuarios = async (empresaId: number) => {
    setUsuariosLoading(true);
    try {
      const usersData = await empresaService.obtenerUsuariosEmpresa(empresaId);
      // El backend devuelve un objeto paginado: { total, data: [...] }
      setUsuarios(usersData.data || []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setUsuariosLoading(false);
    }
  };

  const handleEditClick = () => {
    if (empresa) {
      setEditForm({ ...empresa });
      const dialog = document.getElementById('edit_empresa_modal') as HTMLDialogElement;
      dialog?.showModal();
    }
  };

  const handleCancelEdit = () => {
    setEditForm(null);
  };

  const handleUpdateEmpresa = async () => {
    if (!editForm) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await empresaService.actualizarEmpresa(editForm.id, {
        nombre: editForm.nombre,
        email: editForm.email,
        ruc: editForm.ruc,
        direccion: editForm.direccion,
        telefono: editForm.telefono,
        moneda: editForm.moneda,
        representanteLegal: editForm.representanteLegal,
        logo: editForm.logo,
      });

      setEmpresa(updated);
      setEditForm(null);
      (document.getElementById('edit_empresa_modal') as HTMLDialogElement)?.close();
    } catch (err) {
      console.error('Error al actualizar empresa:', err);
      setError('No se pudo actualizar la empresa.');
    } finally {
      setLoading(false);
    }
  };

  const initials = useMemo(() => {
    if (!empresa?.nombre) {
      return 'E';
    }

    return empresa.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  }, [empresa]);

  const logoSrc = useMemo(() => resolveLogoSrc(empresa?.logo ?? null), [empresa?.logo]);

  useEffect(() => {
    setLogoError(false);
  }, [logoSrc]);

  if (loading) {
    return (
      <>
        <Title title="Empresa" />
        <CardSlot>
          <div className="flex items-center justify-center py-16">
            <span className="loading loading-spinner loading-lg text-blue-900"></span>
          </div>
        </CardSlot>
      </>
    );
  }

  if (error || !empresa) {
    return (
      <>
        <Title title="Empresa" />
        <CardSlot>
          <div className="alert alert-error">
            <span>{error ?? 'No hay información disponible.'}</span>
          </div>
        </CardSlot>
      </>
    );
  }

  const details = [
    { label: 'RUC', value: empresa.ruc },
    { label: 'Correo', value: empresa.email },
    { label: 'Teléfono', value: empresa.telefono },
    { label: 'Moneda', value: empresa.moneda },
    { label: 'Representante legal', value: empresa.representanteLegal },
    { label: 'Dirección', value: empresa.direccion },
  ];

  return (
    <>
      <Title title="Empresa" />

      <CardSlot>
        <EndSlot>
          <button
            className="btn btn-primary"
            onClick={handleEditClick}
          >
            Editar
          </button>
        </EndSlot>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-900 text-2xl font-bold text-white shadow-lg">
              {logoSrc && !logoError ? (
                <img
                  src={logoSrc}
                  alt={empresa.nombre}
                  className="h-full w-full rounded-2xl bg-white p-2 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 sm:text-sm sm:tracking-[0.3em]">Registro principal</p>
              <h2 className="mt-1 break-words text-2xl font-bold text-slate-900">{empresa.nombre}</h2>
              <p className="mt-1 text-sm text-gray-500">Información institucional de la empresa conectada al sistema.</p>
            </div>
          </div>

          <EndSlot>
            <div className="rounded-2xl bg-blue-50 px-7 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-blue-900">ID</p>
              <p className="text-lg font-semibold text-slate-900">#{empresa.id}</p>
            </div>
          </EndSlot>
        </div>
      </CardSlot>

      <CardSlot>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">{detail.label}</p>
              <p className="mt-2 break-words text-base text-slate-700">{detail.value || 'Sin información'}</p>
            </div>
          ))}

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">Creado</p>
            <p className="mt-2 text-base text-slate-700">{formatDate(empresa.createdAt)}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">Actualizado</p>
            <p className="mt-2 text-base text-slate-700">{formatDate(empresa.updatedAt)}</p>
          </div>
        </div>
      </CardSlot>

      <CardSlot>
        <div className="collapse collapse-arrow border border-gray-200 bg-white shadow-sm rounded-2xl">
          <input type="checkbox" name="my-accordion-2" />
          <div className="collapse-title text-xl font-semibold text-slate-900">
            Usuarios de la Empresa
          </div>
          <div className="collapse-content overflow-x-auto">
            {usuariosLoading ? (
              <div className="flex justify-center p-4">
                <span className="loading loading-spinner text-blue-900"></span>
              </div>
            ) : usuarios && usuarios.length > 0 ? (
              <div className="mt-4">
                <Table
                  data={usuarios.map(u => ({
                    id: String(u.ID || Math.random()),
                    nombreCompleto: `${u.NOMBRE || ''} ${u.APELLIDO || ''}`.trim() || 'N/A',
                    correo: u.CORREO,
                    rol: u.ROL || 'N/A'
                  }))}
                  columns={[
                    { header: 'Nombre', accessor: 'nombreCompleto' },
                    { header: 'Email', accessor: 'correo' },
                    { header: 'Rol', accessor: 'rol' }
                  ]}
                  showActions={false}
                />
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No se encontraron usuarios vinculados a esta empresa.</p>
            )}
          </div>
        </div>
      </CardSlot>

      <EditEmpresaModal
        id="edit_empresa_modal"
        title="Editar Empresa"
        empresa={editForm}
        onChange={setEditForm}
        onCancel={handleCancelEdit}
        onSave={handleUpdateEmpresa}
      />
    </>
  );
};

export default EmpresaPage;