import { FaTrash, FaEdit } from 'react-icons/fa';
import { BranchTableProps } from '../../../types/sucursal';
import Pagination from './Pagination';

export default function BranchTable({
  data,
  pagination,
  onEdit,
  onDelete,
  onPageChange
}: BranchTableProps) {
  return (
    <>
      <div className="overflow-x-auto mt-6 border rounded-md">
        <table className="table table-zebra w-full">
          <thead className="bg-blue-900 text-white">
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Código</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(branch => (
              <tr key={branch.id}>
                <td>{branch.name}</td>
                <td>{branch.address}</td>
                <td>{branch.code}</td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-xs btn-circle btn-outline"
                    onClick={() => onEdit(branch)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-xs btn-circle btn-outline btn-error"
                    onClick={() => onDelete(branch.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <Pagination
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </>
  );
}
