import { Branch } from "../../sucursales/types/sucursal";

type EditModalProps = {
  readonly id: string;
  readonly title: string;
  readonly branch: Branch | null;
  readonly onChange: (branch: Branch) => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
};

export default function EditModal({
  id,
  title,
  branch,
  onChange,
  onCancel,
  onSave,
}: EditModalProps) {
  if (!branch) return null;

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <form method="dialog" className="space-y-4 mt-4">
          <div>
            <label className="label">
              <span className="label-text">Nombre</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={branch.nombre}
              onChange={(e) => onChange({ ...branch, nombre: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Ubicación</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={branch.ubicacion}
              onChange={(e) => onChange({ ...branch, ubicacion: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Punto de Emisión</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={branch.puntoEmision}
              onChange={(e) => onChange({ ...branch, puntoEmision: e.target.value })}
              required
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