import React, { useState } from "react";
import { CODIGOS, MESES } from "../types/factura";

interface SelectCodigoModalProps {
  id: string;
  onSelect: (codigo: string, mes?: string) => void;
  onCancel: () => void;
}

export const SelectCodigoModal: React.FC<SelectCodigoModalProps> = ({ id, onSelect, onCancel }) => {
  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("ninguno");

  const handleCodigoClick = (codigo: string) => {
    setCodigoSeleccionado(codigo);
    setMesSeleccionado("ninguno");
    if (codigo !== "EXCEDENTE" && codigo !== "TARIFA BASICA") {
      onSelect(codigo);
      (document.getElementById(id) as HTMLDialogElement)?.close();
    }
  };

  const handleMesSelect = () => {
    if (codigoSeleccionado) {
      onSelect(codigoSeleccionado, mesSeleccionado);
      (document.getElementById(id) as HTMLDialogElement)?.close();
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Seleccionar Código</h3>
        <div className="flex flex-col gap-3">
          {CODIGOS.map((codigo) => (
            <div key={codigo}>
              <button
                className={`btn w-full ${codigoSeleccionado === codigo ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleCodigoClick(codigo)}
                type="button"
              >
                {codigo}
              </button>
              {((codigo === "EXCEDENTE" || codigo === "TARIFA BASICA") && codigoSeleccionado === codigo) && (
                <div className="mt-2 flex gap-2 items-center">
                  <label className="label">Mes:</label>
                  <select
                    className="select select-bordered"
                    value={mesSeleccionado}
                    onChange={e => setMesSeleccionado(e.target.value)}
                  >
                    {MESES.map(mes => (
                      <option key={mes} value={mes}>{mes}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-success ml-2"
                    onClick={handleMesSelect}
                  >
                    Seleccionar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="modal-action mt-6">
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
        </div>
      </div>
    </dialog>
  );
};
