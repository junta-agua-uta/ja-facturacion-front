import { FaTrash, FaEdit } from 'react-icons/fa';
import { ReactNode } from 'react';
import Pagination from './Pagination';

interface Column<T> {
  header: string;
  accessor: keyof T;
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
  onPageChange?: (page: number) => void;
  showActions?: boolean;
}

export default function Table<T extends { id: string }>({
  data,
  columns,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  showActions = true
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
              {showActions && (onEdit || onDelete) && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                {columns.map((column, index) => (
                  <td key={index}>
                    {String(item[column.accessor])}
                  </td>
                ))}
                {showActions && (onEdit || onDelete) && (
                  <td className="flex gap-2">
                    {onEdit && (
                      <button
                        className="btn btn-xs btn-circle btn-outline"
                        onClick={() => onEdit(item)}
                      >
                        <FaEdit />
                      </button>
                    )}
                    {onDelete && (
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