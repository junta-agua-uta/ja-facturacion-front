import { Medicion } from "../types/medicion";


type EditModalProps = {
  readonly id: string;
  readonly title: string;
  readonly medicion: Medicion | null;
  readonly onChange: (medicion: Medicion) => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
};

export default function EditModal({
  id,
  title,
  medicion,
  onChange,
  onCancel,
  onSave,
}: EditModalProps) {
  if (!medicion) return null;

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>

        <form method="dialog" className="space-y-4 mt-4">
          <div>
            <label className="label">
              <span className="label-text">Número de medidor</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.numeroMedidor}
              onChange={(e) => onChange({ ...medicion, numeroMedidor: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Cédula</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.cedula}
              onChange={(e) => onChange({ ...medicion, cedula: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Fecha de lectura</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={medicion.fechaLectura}
              onChange={(e) => onChange({ ...medicion, fechaLectura: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Consumo (m3)</span>
            </label>
            <input
              type="number"
              step="0.1"
              className="input input-bordered w-full"
              value={medicion.consumo}
              onChange={(e) => onChange({ ...medicion, consumo: Number(e.target.value) })}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Mes facturado</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.mesFacturado}
              onChange={(e) => onChange({ ...medicion, mesFacturado: e.target.value })}
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