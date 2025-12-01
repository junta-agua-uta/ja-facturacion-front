import { useEffect } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface AnularLiquidacionModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  liquidacion: {
    razonSocialProveedor?: string;
    identificacionProveedor?: string;
    fechaEmision?: string;
    importeTotal?: number;
  } | null;
  isLoading: boolean;
}

export default function AnularLiquidacionModal({
  id,
  isOpen,
  onClose,
  onConfirm,
  liquidacion,
  isLoading,
}: AnularLiquidacionModalProps) {
  const dialogRef = (element: HTMLDialogElement | null) => {
    if (element) {
      if (isOpen) {
        element.showModal();
      } else {
        element.close();
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  return (
    <dialog id={id} className="modal" ref={dialogRef}>
      <div className="modal-box max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-red-200">
          <h3 className="font-bold text-lg flex items-center gap-2 text-red-600">
            <FaExclamationTriangle className="text-red-500" />
            Advertencia: Anular Liquidación de Compra
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Información de la liquidación */}
        {liquidacion && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold text-gray-600">Proveedor:</span>
                <p className="text-gray-800">{liquidacion.razonSocialProveedor}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">RUC:</span>
                <p className="text-gray-800">{liquidacion.identificacionProveedor}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Fecha:</span>
                <p className="text-gray-800">{liquidacion.fechaEmision}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Total:</span>
                <p className="text-gray-800 font-bold">
                  ${liquidacion.importeTotal?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Advertencia principal */}
          <div className="alert alert-warning shadow-sm py-2">
            <FaExclamationTriangle className="text-yellow-600 flex-shrink-0" />
            <span className="text-xs">
              Esta acción <strong>ÚNICAMENTE</strong> anulará la liquidación de compra en el sistema local.
              <strong> NO anula en el SRI.</strong>
            </span>
          </div>

          {/* Lista de verificación */}
          <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-2 text-sm">
              ✓ Verificación Obligatoria
            </h4>
            <ul className="space-y-1.5 text-xs text-red-700">
              <li className="flex items-start gap-1.5">
                <span className="font-bold min-w-[16px]">1.</span>
                <span>Verifiqué que la liquidación fue anulada en el portal del SRI</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold min-w-[16px]">2.</span>
                <span>Confirmé que el estado en el SRI es "ANULADO"</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold min-w-[16px]">3.</span>
                <span>Entiendo que esta acción es irreversible</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold min-w-[16px]">4.</span>
                <span>Tengo autorización para esta operación</span>
              </li>
            </ul>
          </div>

          {/* Mensaje de confirmación final */}
          <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
            <p className="text-xs text-orange-800 text-center font-semibold">
              ⚠️ ¿Está completamente seguro de que desea anular esta liquidación?
            </p>
            <p className="text-xs text-orange-700 text-center mt-1">
              Si se equivocó o tiene dudas, presione "Cancelar"
            </p>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="modal-action">
          <form method="dialog" className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-outline flex-1"
              disabled={isLoading}
            >
              <FaTimes />
              No, Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="btn btn-sm btn-error flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Anulando...
                </>
              ) : (
                <>
                  <FaExclamationTriangle />
                  Sí, Anular
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} disabled={isLoading}>close</button>
      </form>
    </dialog>
  );
}
