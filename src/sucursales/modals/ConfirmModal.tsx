// src/components/modals/ConfirmModal.tsx
type ConfirmModalProps = {
  readonly id: string
  readonly title: string
  readonly message: string
  readonly onConfirm: () => void
  readonly onCancel: () => void
  readonly confirmLabel?: string
  readonly confirmClassName?: string
}

export default function ConfirmModal({
  id,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Eliminar',
  confirmClassName = 'btn btn-error',
}: ConfirmModalProps) {
  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-primary">{title}</h3>
        <p className="py-4 text-base-content/80">{message}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancelar
            </button>
            <button type="button" className={confirmClassName} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onCancel}>
          cerrar
        </button>
      </form>
    </dialog>
  )
}
  