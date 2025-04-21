import { Medicion } from "../types/medicion";

type AddMedicionModalProps = {
  id: string;
  medicion: Medicion;
  onChange: (medicion: Medicion) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function AddMedicionModal({
  id,
  medicion,
  onChange,
  onCancel,
  onSave,
}: AddMedicionModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Nueva Medición</h3>

        <form className="space-y-4 mt-4">
          <div>
            <label className="label">Número de medidor</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.numeroMedidor}
              onChange={(e) => onChange({ ...medicion, numeroMedidor: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Cédula</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.cedula}
              onChange={(e) => onChange({ ...medicion, cedula: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Fecha de lectura</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={medicion.fechaLectura}
              onChange={(e) => onChange({ ...medicion, fechaLectura: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Consumo (m3)</label>
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
            <label className="label">Mes facturado</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={medicion.mesFacturado}
              onChange={(e) => onChange({ ...medicion, mesFacturado: e.target.value })}
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