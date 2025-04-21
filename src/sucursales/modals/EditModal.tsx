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
              value={branch.name}
              onChange={(e) => onChange({ ...branch, name: e.target.value })}
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
              value={branch.address}
              onChange={(e) => onChange({ ...branch, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Código</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={branch.code}
              onChange={(e) => onChange({ ...branch, code: Number(e.target.value) })}
              required
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
