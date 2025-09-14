import { useState } from "react";
import { Concepto } from "../types/concepto";

type ConceptoModalProps = {
  id: string;
  concepto: Concepto;
  onChange: (concepto: Concepto) => void;
  onCancel: () => void;
  onSave: () => void;
  isEditing?: boolean;
};

export default function AddConceptoModal({
  id,
  concepto,
  onChange,
  onCancel,
  onSave,
  isEditing = false,
}: ConceptoModalProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
  const newErrors: { [key: string]: string } = {};

  if (!concepto.desc || !concepto.desc.trim()) {
    newErrors.desc = "La descripción es obligatoria.";
  }

  if (concepto.precioBase === undefined || isNaN(Number(concepto.precioBase))) {
    newErrors.precioBase = "El precio base debe ser un número.";
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
        <h3 className="font-bold text-lg">{isEditing ? "Editar Concepto" : "Nuevo Concepto"}</h3>
        <form className="space-y-4 mt-4">
          <div>
            <label className="label">Descripción</label>
            <input
              type="text"
              className={`input input-bordered w-full ${errors.desc ? "input-error" : ""
                }`}
              value={concepto.desc}
              onChange={(e) => onChange({ ...concepto, desc: e.target.value })}
            />
            {errors.desc && (
              <p className="text-red-500 text-sm mt-1">{errors.desc}</p>
            )}
          </div>

          <div>
            <label className="label">Precio Base</label>
            <input
              type="number"
              className={`input input-bordered w-full ${errors.precioBase ? "input-error" : ""}`}
              value={concepto.precioBase === undefined || concepto.precioBase === null ? "" : concepto.precioBase}
              onChange={(e) =>
                onChange({
                  ...concepto,
                  precioBase: e.target.value === "" ? undefined : Number(e.target.value),
                })
              }
            />

            {errors.precioBase && (
              <p className="text-red-500 text-sm mt-1">{errors.precioBase}</p>
            )}
          </div>

          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={concepto.requiereMes ?? false}
                onChange={(e) =>
                  onChange({ ...concepto, requiereMes: e.target.checked })
                }
              />
              <span className="ml-2">Requiere Mes</span>
            </label>
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
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
