import { useState } from "react";
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!branch.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!branch.ubicacion.trim()) newErrors.ubicacion = "La ubicación es obligatoria.";

    if (!branch.puntoEmision.toString().trim()) {
      newErrors.puntoEmision = "El punto de emisión es obligatorio.";
    } else if (isNaN(Number(branch.puntoEmision))) {
      newErrors.puntoEmision = "El punto de emisión debe ser un número.";
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
      <div className="modal-box">
        <h3 className="font-bold text-lg">Nueva Sucursal</h3>

        <form className="space-y-4 mt-4">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              className={`input input-bordered w-full ${errors.nombre ? "input-error" : ""}`}
              value={branch.nombre}
              onChange={(e) => onChange({ ...branch, nombre: e.target.value })}
            />
            {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="label">Ubicación</label>
            <input
              type="text"
              className={`input input-bordered w-full ${errors.ubicacion ? "input-error" : ""}`}
              value={branch.ubicacion}
              onChange={(e) => onChange({ ...branch, ubicacion: e.target.value })}
            />
            {errors.ubicacion && <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>}
          </div>

          <div>
            <label className="label">Punto de Emisión</label>
            <input
              type="number"
              className={`input input-bordered w-full ${errors.puntoEmision ? "input-error" : ""}`}
              value={branch.puntoEmision}
              onChange={(e) => onChange({ ...branch, puntoEmision: e.target.value })}
            />
            {errors.puntoEmision && (
              <p className="text-red-500 text-sm mt-1">{errors.puntoEmision}</p>
            )}
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
              onClick={handleSave}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
