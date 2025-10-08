import React, { useState } from "react";
import { MESES } from "../types/factura";
import { useConceptos } from "../hooks/useConceptos";

interface SelectCodigoModalProps {
  id: string;
  onSelect: (concepto: any, mes?: string) => void;
  onCancel: () => void;
}

export const SelectCodigoModal: React.FC<SelectCodigoModalProps> = ({ id, onSelect, onCancel }) => {
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<any>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState<string>("ninguno");

  // const handleCodigoClick = (codigo: string) => {
  //   setCodigoSeleccionado(codigo);
  //   setMesSeleccionado("ninguno");
  //   if (codigo !== "EXCEDENTE" && codigo !== "TARIFA BASICA") {
  //     onSelect(codigo);
  //     (document.getElementById(id) as HTMLDialogElement)?.close();
  //   }
  // };

  // carga de conceptos desde el hook
  const { conceptos, loading, error } = useConceptos();

  const handleCodigoClick = (concepto: any) => {
    console.log("🖱️ Click en concepto:", concepto);
    setConceptoSeleccionado(concepto);
    setMesSeleccionado("ninguno");
    if (!concepto.requiereMes) {
      console.log("✅ Concepto sin mes, seleccionando directamente:", concepto);
      onSelect({
        ...concepto,
        codigo: concepto.codInterno,
      });
      (document.getElementById(id) as HTMLDialogElement)?.close();
    } else {
      console.log("⏳ Concepto requiere mes, esperando selección de mes");
    }
  };


  const handleMesSelect = () => {
    if (conceptoSeleccionado) {
      console.log("📅 Seleccionando concepto con mes:", { conceptoSeleccionado, mesSeleccionado });
      onSelect({
        ...conceptoSeleccionado,
        codigo: conceptoSeleccionado.codInterno,
      }, mesSeleccionado);
      (document.getElementById(id) as HTMLDialogElement)?.close();
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Seleccionar Concepto</h3>

        {loading && <p>Cargando conceptos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col gap-3">
            {conceptos.map((c) => (
              <div key={c.id}>
                <button
                  className={`btn w-full ${conceptoSeleccionado?.codigo === c.codigo ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleCodigoClick(c)}
                  type="button"
                >
                  {c.desc}
                </button>
                {c.requiereMes && conceptoSeleccionado?.codigo === c.codigo && (
                  <div className="mt-2 flex gap-2 items-center">
                    <label className="label">Mes:</label>
                    <select
                      className="select select-bordered"
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(e.target.value)}
                    >
                      {MESES.map((mes) => (
                        <option key={mes} value={mes}>
                          {mes}
                        </option>
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
        )}

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
