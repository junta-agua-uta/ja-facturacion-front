// src/components/modals/EditClienteModal.tsx
import { Cliente } from "../types/cliente";

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
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg">{title}</h3>
        
        <form method="dialog" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Identificación *</span>
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
                <span className="label-text">Razón Social *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.razonSocial}
                onChange={(e) => onChange({ ...cliente, razonSocial: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Nombre Comercial</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.nombreComercial || ''}
                onChange={(e) => onChange({ ...cliente, nombreComercial: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Dirección *</span>
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
                <span className="label-text">Teléfono 1</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.telefono1 || ''}
                onChange={(e) => onChange({ 
                  ...cliente, 
                  telefono1: e.target.value,
                  telefonoNro1: e.target.value
                })}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Teléfono 2</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.telefono2 || ''}
                onChange={(e) => onChange({ 
                  ...cliente, 
                  telefono2: e.target.value,
                  telefonoNro2: e.target.value
                })}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Correo Electrónico</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={cliente.correo || ''}
                onChange={(e) => onChange({ 
                  ...cliente, 
                  correo: e.target.value,
                  correoElectronico: e.target.value
                })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Tarifa</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.tarifa || ''}
                onChange={(e) => onChange({ ...cliente, tarifa: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Grupo</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.grupo || ''}
                onChange={(e) => onChange({ ...cliente, grupo: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Zona</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.zona || ''}
                onChange={(e) => onChange({ ...cliente, zona: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Ruta</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.ruta || ''}
                onChange={(e) => onChange({ ...cliente, ruta: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Vendedor</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.vendedor || ''}
                onChange={(e) => onChange({ ...cliente, vendedor: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Cobrador</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.cobrador || ''}
                onChange={(e) => onChange({ ...cliente, cobrador: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Provincia</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.provincia || ''}
                onChange={(e) => onChange({ ...cliente, provincia: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Ciudad</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.ciudad || ''}
                onChange={(e) => onChange({ ...cliente, ciudad: e.target.value })}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Parroquia</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.parroquia || ''}
                onChange={(e) => onChange({ ...cliente, parroquia: e.target.value })}
              />
            </div>
          </div>
          
          <div className="modal-action flex gap-2">
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
              }}
              disabled={!cliente.identificacion || !cliente.razonSocial || !cliente.direccion}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}