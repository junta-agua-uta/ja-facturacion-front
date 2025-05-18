import { useEffect, useState } from 'react';
import api from '../../shared/api';
import { Branch, BranchFilter } from '../types/sucursal';
import { BranchFilters, BranchTable } from '../components';
import { AddBranchModal, EditModal, ConfirmModal } from '../modals';
import { PAGE_SIZE } from '../../shared/utils/constants';
import { Title, SubTitle, EndSlot, CardSlot } from '../../shared/components';

interface ApiBranch {
  ID: number;
  NOMBRE: string;
  UBICACION: string;
  PUNTO_EMISION: string;
}

interface ApiResponse {
  data: ApiBranch[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}


export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filters, setFilters] = useState<BranchFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<Branch | null>(null);

  const [newBranch, setNewBranch] = useState<Branch>({
    id: '',
    nombre: '',
    ubicacion: '',
    puntoEmision: '',
  });

  useEffect(() => {
    const fetchBranches = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/sucursales', {
          params: {
            ...filters,
            page: currentPage,
            pageSize: PAGE_SIZE,
          },
        });

        const data: ApiResponse = response.data;
        const mappedBranches = data.data.map(branch => ({
          id: branch.ID.toString(),
          nombre: branch.NOMBRE,
          ubicacion: branch.UBICACION,
          puntoEmision: branch.PUNTO_EMISION,
        }));

        setBranches(mappedBranches);
        setTotalItems(data.totalItems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setError('No se pudo cargar la lista de sucursales');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, [currentPage, filters]);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleAddBranch = async () => {
    if (newBranch.nombre && newBranch.ubicacion && newBranch.puntoEmision) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post('/sucursales', {
          nombre: newBranch.nombre,
          ubicacion: newBranch.ubicacion,
          punto_emision: newBranch.puntoEmision,
        });

        const addedBranch = response.data;
        setBranches(prev => [
          ...prev,
          {
            id: addedBranch.ID.toString(),
            nombre: addedBranch.NOMBRE,
            ubicacion: addedBranch.UBICACION,
            puntoEmision: addedBranch.PUNTO_EMISION,
          },
        ]);

        setNewBranch({ id: '', nombre: '', ubicacion: '', puntoEmision: '' });
        (document.getElementById('add_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error adding branch:', error);
        setError('No se pudo agregar la sucursal');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (branchToDelete) {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`/sucursales/${branchToDelete.id}`);

        setBranches(prev => prev.filter(b => b.id !== branchToDelete.id));
        setBranchToDelete(null);
        (document.getElementById('delete_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error deleting branch:', error);
        setError('No se pudo eliminar la sucursal');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEdit = async () => {
    if (editForm) {
      setIsLoading(true);
      setError(null);
      try {
        await api.put(`/sucursales/${editForm.id}`, {
          ID: parseInt(editForm.id),
          NOMBRE: editForm.nombre,
          UBICACION: editForm.ubicacion,
          PUNTO_EMISION: editForm.puntoEmision,
        });

        setBranches(prev =>
          prev.map(b => (b.id === editForm.id ? { ...editForm } : b))
        );
        setBranchToEdit(null);
        setEditForm(null);
        (document.getElementById('edit_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error updating branch:', error);
        setError('No se pudo actualizar la sucursal');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setBranchToEdit(null);
    setEditForm(null);
  };

  return (
    <>
      <Title title="Sucursales" />
      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <BranchFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      </CardSlot>

      <CardSlot>
        <EndSlot>
          <button
            className="btn btn-primary"
            onClick={() => {
              const dialog = document.getElementById('add_modal') as HTMLDialogElement;
              dialog?.showModal();
            }}
          >
            Añadir sucursal
          </button>
        </EndSlot>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <BranchTable
            data={branches}
            pagination={{
              currentPage,
              totalPages,
              pageSize: PAGE_SIZE,
              totalItems,
            }}
            onPageChange={setCurrentPage}
            onEdit={(branch) => {
              setBranchToEdit(branch);
              setEditForm({ ...branch });
              (document.getElementById('edit_modal') as HTMLDialogElement)?.showModal(); // Esta línea faltaba
            }}
            onDelete={(branchId) => {
              const branch = branches.find(b => b.id === branchId);
              setBranchToDelete(branch ?? null);
              (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
            }}
          />
        )}
      </CardSlot>

      <ConfirmModal
        id="delete_modal"
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la sucursal "${branchToDelete?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setBranchToDelete(null)}
      />

      <EditModal
        id="edit_modal"
        title="Editar sucursal"
        branch={editForm}
        onChange={setEditForm}
        onCancel={handleCancelEdit}
        onSave={handleEdit}
      />

      <AddBranchModal
        id="add_modal"
        branch={newBranch}
        onChange={setNewBranch}
        onCancel={() => setNewBranch({ id: '', nombre: '', ubicacion: '', puntoEmision: '' })}
        onSave={handleAddBranch}
      />
    </>
  );
}