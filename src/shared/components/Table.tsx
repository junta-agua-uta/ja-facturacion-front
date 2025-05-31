import { FaTrash, FaEdit, FaPrint } from 'react-icons/fa';
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
  onPageChange?: (page: number) => void;
  showActions?: boolean;
  showDelete?: boolean;
  showPrint?: boolean; // Nueva prop para controlar visibilidad del botón de imprimir
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  pagination,
  onEdit,
  onDelete,
  onPrint, // Nueva prop
  onPageChange,
  showActions = true,
  showDelete = true,
  showPrint = true // Nueva prop con valor por defecto
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
              {showActions && (onEdit || onDelete || onPrint) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                {columns.map((column, index) => (
                  <td key={index}>
                    {column.Cell
                      ? column.Cell({ value: item[column.accessor] })
                      : String(item[column.accessor])}
                  </td>
                ))}
                {showActions && (onEdit || onDelete || onPrint) && (
                  <td className="align-middle">
                    <div className="flex gap-2 justify-center items-center"></div>
                    {onEdit && (
                      <button
                        className="btn btn-xs btn-circle btn-outline"
                        onClick={() => onEdit(item)}
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
                    {onDelete && showDelete && (
                      <button
                        className="btn btn-xs btn-circle btn-outline btn-error"
                        onClick={() => onDelete(item.id)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
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