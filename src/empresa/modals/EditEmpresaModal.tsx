import { useState } from 'react';

type EmpresaData = {
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

type EditEmpresaModalProps = {
  id: string;
  title: string;
  empresa: EmpresaData | null;
  onChange: (empresa: EmpresaData) => void;
  onCancel: () => void;
  onSave: () => void;
};

// Validadores específicos
const validadores = {
  telefonoOnly: (value: string) => {
    return value.replace(/[^0-9\s\-+]/g, '');
  },
  rucOnly: (value: string) => {
    return value.replace(/[^0-9\-]/g, '');
  },
  monedaOnly: (value: string) => {
    return value.replace(/[^A-Z]/g, '').slice(0, 3).toUpperCase();
  },
  emailValidator: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  telefonoValidator: (telefono: string) => {
    // Extraer solo dígitos para validar cantidad
    const soloDigitos = telefono.replace(/[^0-9]/g, '');
    // Validar que tenga 10
    return soloDigitos.length === 10;
  },
  rucValidator: (ruc: string) => {
    // Extraer solo dígitos para validar cantidad
    const soloDigitos = ruc.replace(/[^0-9]/g, '');
    // RUC en Ecuador tiene exactamente 13 dígitos
    return soloDigitos.length === 13;
  },
};

export default function EditEmpresaModal({
  id,
  title,
  empresa,
  onChange,
  onCancel,
  onSave,
}: EditEmpresaModalProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!empresa) {
    return (
      <dialog id={id} className="modal">
        <div className="modal-box max-w-2xl">
          <span>Cargando...</span>
        </div>
      </dialog>
    );
  }

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!empresa.nombre || !empresa.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio.';
    } else if (empresa.nombre.length > 191) {
      newErrors.nombre = 'El nombre no debe exceder 191 caracteres.';
    }

    if (!empresa.email || !empresa.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!validadores.emailValidator(empresa.email)) {
      newErrors.email = 'El email no es válido (ej: info@junta.com).';
    } else if (empresa.email.length > 191) {
      newErrors.email = 'El email no debe exceder 191 caracteres.';
    }

    if (!empresa.ruc || !empresa.ruc.trim()) {
      newErrors.ruc = 'El RUC es obligatorio.';
    } else if (!validadores.rucValidator(empresa.ruc)) {
      newErrors.ruc = 'El RUC debe contener exactamente 13 dígitos.';
    } else if (empresa.ruc.length > 191) {
      newErrors.ruc = 'El RUC no debe exceder 191 caracteres.';
    }

    if (!empresa.direccion || !empresa.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria.';
    } else if (empresa.direccion.length > 191) {
      newErrors.direccion = 'La dirección no debe exceder 191 caracteres.';
    }

    if (!empresa.telefono || !empresa.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (!validadores.telefonoValidator(empresa.telefono)) {
      newErrors.telefono = 'El teléfono debe contener 10 dígitos.';
    } else if (empresa.telefono.length > 191) {
      newErrors.telefono = 'El teléfono no debe exceder 191 caracteres.';
    }

    if (!empresa.moneda || !empresa.moneda.trim()) {
      newErrors.moneda = 'La moneda es obligatoria.';
    } else if (!/^[A-Z]{3}$/.test(empresa.moneda)) {
      newErrors.moneda = 'La moneda debe ser un código de 3 letras mayúsculas (ej: USD).';
    }

    if (!empresa.representanteLegal || !empresa.representanteLegal.trim()) {
      newErrors.representanteLegal = 'El representante legal es obligatorio.';
    } else if (empresa.representanteLegal.length > 191) {
      newErrors.representanteLegal = 'El representante legal no debe exceder 191 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave();
      (document.getElementById(id) as HTMLDialogElement)?.close();
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg">{title}</h3>
        <form className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">
                <span className="label-text font-semibold">Nombre</span>
              </label>
              <input
                type="text"
                maxLength={191}
                className={`input input-bordered w-full ${errors.nombre ? 'input-error' : ''}`}
                value={empresa.nombre}
                onChange={(e) => onChange({ ...empresa, nombre: e.target.value })}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>
              <input
                type="email"
                maxLength={191}
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={empresa.email}
                onChange={(e) => onChange({ ...empresa, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">RUC</span>
              </label>
              <input
                type="text"
                maxLength={191}
                className={`input input-bordered w-full ${errors.ruc ? 'input-error' : ''}`}
                placeholder="Ej: 1891809449001 (13 dígitos)"
                value={empresa.ruc}
                onChange={(e) => {
                  const filtered = validadores.rucOnly(e.target.value);
                  onChange({ ...empresa, ruc: filtered });
                }}
              />
              {errors.ruc && <p className="text-red-500 text-sm mt-1">{errors.ruc}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Teléfono</span>
              </label>
              <input
                type="text"
                maxLength={191}
                className={`input input-bordered w-full ${errors.telefono ? 'input-error' : ''}`}
                placeholder="0999999999 (10 dígitos)"
                value={empresa.telefono}
                onChange={(e) => {
                  const filtered = validadores.telefonoOnly(e.target.value);
                  onChange({ ...empresa, telefono: filtered });
                }}
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Moneda</span>
              </label>
              <input
                type="text"
                maxLength={3}
                className={`input input-bordered w-full uppercase ${errors.moneda ? 'input-error' : ''}`}
                placeholder="Ej: USD"
                value={empresa.moneda}
                onChange={(e) => {
                  const filtered = validadores.monedaOnly(e.target.value);
                  onChange({ ...empresa, moneda: filtered });
                }}
              />
              {errors.moneda && <p className="text-red-500 text-sm mt-1">{errors.moneda}</p>}
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold">Representante Legal</span>
              </label>
              <input
                type="text"
                maxLength={191}
                className={`input input-bordered w-full ${errors.representanteLegal ? 'input-error' : ''}`}
                value={empresa.representanteLegal}
                onChange={(e) => onChange({ ...empresa, representanteLegal: e.target.value })}
              />
              {errors.representanteLegal && (
                <p className="text-red-500 text-sm mt-1">{errors.representanteLegal}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Dirección</span>
            </label>
            <textarea
              maxLength={191}
              className={`textarea textarea-bordered w-full ${errors.direccion ? 'textarea-error' : ''}`}
              value={empresa.direccion}
              onChange={(e) => onChange({ ...empresa, direccion: e.target.value })}
              rows={3}
            />
            {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
          </div>

          <div className="modal-action mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                onCancel();
                (document.getElementById(id) as HTMLDialogElement)?.close();
              }}
            >
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
