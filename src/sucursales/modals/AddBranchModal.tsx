import { Branch } from "../../sucursales/types/sucursal";

type AddBranchModalProps = {
  id: string;
  branch: Branch;
  onChange: (branch: Branch) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function AddBranchModal({
  id,
  branch,
  onChange,
  onCancel,
  onSave,
}: AddBranchModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Nueva Sucursal</h3>

        <form className="space-y-4 mt-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={branch.name}
              onChange={(e) => onChange({ ...branch, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Dirección</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={branch.address}
              onChange={(e) => onChange({ ...branch, address: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Código</label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={branch.code}
              onChange={(e) =>
                onChange({ ...branch, code: Number(e.target.value) })
              }
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
