type ConfirmPeriodoModalProps = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly variante: 'cerrar' | 'abrir';
  readonly loading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

export default function ConfirmPeriodoModal({
  id,
  title,
  message,
  variante,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmPeriodoModalProps) {
  const btnClass =
    variante === 'cerrar'
      ? 'btn btn-error text-white'
      : 'btn btn-primary text-white';

  const btnLabel = variante === 'cerrar' ? 'Cerrar periodo' : 'Reabrir periodo';

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-4 text-sm text-gray-600">{message}</p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline"
              disabled={loading}
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${btnClass}${loading ? ' loading' : ''}`}
              disabled={loading}
              onClick={onConfirm}
            >
              {btnLabel}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
