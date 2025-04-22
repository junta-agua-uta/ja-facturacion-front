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
                type="text"
                className="input input-bordered w-full"
                value={cliente.razonSocial}
                onChange={(e) => onChange({ ...cliente, razonSocial: e.target.value })}
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