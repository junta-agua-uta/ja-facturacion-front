import { FaFilePdf } from 'react-icons/fa'

type Props = {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function ExportarPdfButton({ loading, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      className="btn btn-outline border-primary text-primary hover:bg-primary/10 gap-2"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <span className="loading loading-spinner loading-sm" /> : <FaFilePdf />}
      Exportar PDF
    </button>
  )
}
