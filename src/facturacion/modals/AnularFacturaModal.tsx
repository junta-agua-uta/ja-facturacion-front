import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface AnularFacturaModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  factura: {
    id: string;
    NombreComercial: string;
    Cedula: string;
    Total: string;
    claveAcceso?: string;
    Concepto: string;
  } | null;

  isLoading?: boolean;
}

export default function AnularFacturaModal({
  id,
  isOpen,
  onClose,
  onConfirm,
  factura,
  isLoading = false
}: AnularFacturaModalProps) {
  if (!factura) return null;

  // Abrir/cerrar el modal usando el API nativo de dialog
  const dialogRef = (element: HTMLDialogElement | null) => {
    if (element && isOpen && !element.open) {
      element.showModal();
    } else if (element && !isOpen && element.open) {
      element.close();
    }
  };

  return (
    <dialog id={id} className="modal" ref={dialogRef}>
      <div className="modal-box max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icono de advertencia y botón cerrar */}
        <div className="bg-red-600 text-white p-4 rounded-t-lg relative -mx-6 -mt-6 mb-4">
          <form method="dialog">
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white"
              disabled={isLoading}
            >
              <FaTimes />
            </button>
          </form>
          <div className="flex items-center gap-2 pr-8">
            <FaExclamationTriangle className="text-2xl flex-shrink-0" />
            <h3 className="text-lg font-bold">Advertencia de Anulación</h3>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="space-y-4">
          {/* Mensaje principal de advertencia */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <div className="flex gap-2">
              <FaExclamationTriangle className="text-yellow-400 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Anulación Manual en el Sistema
                </h3>
                <p className="text-xs text-yellow-700 mb-1">
                  Esta acción <strong>ÚNICAMENTE anulará la factura en el sistema local</strong>.
                </p>
                <p className="text-xs text-yellow-700 font-semibold">
                  Solo proceda si verificó que la factura ya está anulada en el SRI.
                </p>
              </div>
            </div>
          </div>

          {/* Información de la factura */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Datos de la Factura:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <p className="text-gray-800">{factura.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Cliente:</span>
                <p className="text-gray-800">{factura.Concepto || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Cédula/RUC:</span>
                <p className="text-gray-800">{factura.Cedula}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total:</span>
                <p className="text-gray-800 font-bold">{factura.Total}</p>
              </div>
            </div>
          </div>

          {/* Lista de verificación */}
          <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50">
            <h4 className="font-semibold text-red-800 mb-2 text-sm">
              ✓ Verificación Obligatoria
            </h4>
            <ul className="space-y-1.5 text-xs text-red-700">
              <li className="flex items-start gap-1.5">
                <span className="font-bold min-w-[16px]">1.</span>
                <span>Verifiqué que la factura fue anulada en el portal del SRI</span>
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
              ¿Está completamente seguro de que desea anular esta factura?
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
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
