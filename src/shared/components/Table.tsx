import { FaTrash, FaEdit, FaPrint, FaBan } from 'react-icons/fa';
import Pagination from './Pagination';

interface Column<T> {
  header: string;
  accessor: keyof T;
  Cell?: ({ value }: { value: any }) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onPrint?: (item: T) => void; // Nueva prop para imprimir
  onAnular?: (item: T) => void; // Nueva prop para anular
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  showDelete?: boolean;
  showPrint?: boolean; // Nueva prop para controlar visibilidad del botón de imprimir
  showAnular?: boolean; // Nueva prop para controlar visibilidad del botón de anular
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  pagination,
  onEdit,
  onDelete,
  onPrint, // Nueva prop
  onAnular, // Nueva prop para anular
  onPageChange,
  showActions = true,
  showDelete = true,
  showPrint = true, // Nueva prop con valor por defecto
  showAnular = false // Nueva prop con valor por defecto
}: TableProps<T>) {
  return (
    <>
      <div className="overflow-x-auto mt-6 border rounded-md">
        <table className="table table-zebra w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.header}</th>
              ))}
              {showActions && (onEdit || onDelete || onPrint || onAnular) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showActions && (onEdit || onDelete || onPrint || onAnular) ? 1 : 0)} className="text-center py-8 text-gray-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            ) : (
              data.map(item => (
                <tr key={item.id}>
                  {columns.map((column, index) => (
                    <td key={index}>
                      {column.Cell
                        ? column.Cell({ value: item[column.accessor] })
                        : String(item[column.accessor])}
                    </td>
                  ))}
                  {showActions && (onEdit || onDelete || onPrint || onAnular) && (
                    <td className="align-middle">
                      <div className="flex gap-2 justify-center items-center">
                        {onEdit && (
                          <button
                            className="btn btn-xs btn-circle btn-outline"
                            onClick={() => onEdit(item)}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {onPrint && showPrint && (
                          <button
                            className="btn btn-xs btn-circle btn-outline btn-info"
                            onClick={() => onPrint(item)}
                            title="Imprimir"
                          >
                            <FaPrint />
                          </button>
                        )}
                        {onAnular && showAnular && (
                          <button
                            className="btn btn-xs btn-circle btn-outline btn-warning"
                            onClick={() => onAnular(item)}
                            title="Anular Factura"
                          >
                            <FaBan />
                          </button>
                        )}
                        {onDelete && showDelete && (
                          <button
                            className="btn btn-xs btn-circle btn-outline btn-error"
                            onClick={() => onDelete(item.id)}
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}