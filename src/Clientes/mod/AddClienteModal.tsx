// src/components/modals/AddClienteModal.tsx
import { Cliente } from "../types/cliente";

type AddClienteModalProps = {
  id: string;
  cliente: Cliente;
  onChange: (cliente: Cliente) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function AddClienteModal({
  id,
  cliente,
  onChange,
  onCancel,
  onSave,
}: AddClienteModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Nuevo Cliente</h3>
        
        <form className="space-y-4 mt-4">
          <div>
            <label className="label">Identificación</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.identificacion}
              onChange={(e) => onChange({ ...cliente, identificacion: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">Razón Social</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.razonSocial}
              onChange={(e) => onChange({ ...cliente, razonSocial: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">Dirección</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.direccion}
              onChange={(e) => onChange({ ...cliente, direccion: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">Teléfono Nro 1</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.telefonoNro1}
              onChange={(e) => onChange({ ...cliente, telefonoNro1: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">Teléfono Nro 2</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.telefonoNro2}
              onChange={(e) => onChange({ ...cliente, telefonoNro2: e.target.value })}
            />
          </div>
          
          <div>
            <label className="label">Correo Electrónico</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.correoElectronico}
              onChange={(e) => onChange({ ...cliente, correoElectronico: e.target.value })}
            />
          </div>
          
          <div className="modal-action">
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSave();
                (document.getElementById(id) as HTMLDialogElement)?.close();
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

// src/components/modals/EditClienteModal.tsx
type EditClienteModalProps = {
  readonly id: string;
  readonly title: string;
  readonly cliente: Cliente | null;
  readonly onChange: (cliente: Cliente) => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
};

export function EditClienteModal({
  id,
  title,
  cliente,
  onChange,
  onCancel,
  onSave,
}: EditClienteModalProps) {
  if (!cliente) return null;
  
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        
        <form method="dialog" className="space-y-4 mt-4">
          <div>
            <label className="label">
              <span className="label-text">Identificación</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.identificacion}
              onChange={(e) => onChange({ ...cliente, identificacion: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Razón Social</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={cliente.razonSocial}
              onChange={(e) => onChange({ ...cliente, razonSocial: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Dirección</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.direccion}
              onChange={(e) => onChange({ ...cliente, direccion: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Teléfono Nro 1</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.telefonoNro1}
              onChange={(e) => onChange({ ...cliente, telefonoNro1: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Teléfono Nro 2</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.telefonoNro2}
              onChange={(e) => onChange({ ...cliente, telefonoNro2: e.target.value })}
            />
          </div>
          
          <div>
            <label className="label">
              <span className="label-text">Correo Electrónico</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={cliente.correoElectronico}
              onChange={(e) => onChange({ ...cliente, correoElectronico: e.target.value })}
            />
          </div>
          
          <div className="modal-action flex gap-2">
            <button
              className="btn btn-outline"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={onSave}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

