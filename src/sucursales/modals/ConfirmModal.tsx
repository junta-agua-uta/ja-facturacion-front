// src/components/modals/ConfirmModal.tsx
type ConfirmModalProps = {
    readonly id: string;
    readonly title: string;
    readonly message: string;
    readonly onConfirm: () => void;
    readonly onCancel: () => void;
  };
  
  export default function ConfirmModal({
    id,
    title,
    message,
    onConfirm,
    onCancel,
  }: ConfirmModalProps) {
    return (
      <dialog id={id} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-4">{message}</p>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-outline" onClick={onCancel}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={onConfirm}>
                Eliminar
              </button>
            </form>
          </div>
        </div>
      </dialog>
    );
  }
  