import { useEffect, useState } from 'react';
import { Branch, BranchFilter } from '../types/sucursal';
import BranchFilters from '../features/sucursales/components/BranchFilters';
import BranchTable from '../features/sucursales/components/BranchTable';
import ConfirmModal from '../components/modals/ConfirmModal';
import EditModal from '../components/modals/EditModal';
import AddBranchModal from '../components/modals/AddBranchModal';


const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'Junta Administradora de Agua Potable La Esperanza',
    address: 'Quito',
    code: 101,
  },
  {
    id: '2',
    name: 'Junta de Agua Potable San Miguel',
    address: 'Guayaquil',
    code: 102,
  },
  {
    id: '3',
    name: 'Agua Potable El Progreso',
    address: 'Cuenca',
    code: 103,
  },
  {
    id: '4',
    name: 'Comité de Agua Potable Los Andes',
    address: 'Ambato',
    code: 104,
  },
  {
    id: '5',
    name: 'Sistema Comunitario de Agua La Paz',
    address: 'Loja',
    code: 105,
  },
  {
    id: '6',
    name: 'Junta Administradora El Valle',
    address: 'Manta',
    code: 106,
  },

  {
    id: '7',
    name: 'Agua Potable San Juan',
    address: 'Machala',
    code: 107,
  },
  {
    id: '8',
    name: 'Comité de Agua Potable La Libertad',
    address: 'Esmeraldas',
    code: 108,
  },
  {
    id: '9',
    name: 'Sistema Comunitario de Agua El Sol',
    address: 'Ibarra',
    code: 109,
  },
  {
    id: '10',
    name: 'Junta Administradora de Agua Potable Santa Rosa',
    address: 'Quito',
    code: 110,
  },
];


const PAGE_SIZE = 6;

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [filters, setFilters] = useState<BranchFilter>({});
  const [currentPage, setCurrentPage] = useState(1);

  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<Branch | null>(null);

  const [newBranch, setNewBranch] = useState<Branch>({
    id: '',
    name: '',
    address: '',
    code: 0,
  });


  const filteredBranches = branches.filter(branch =>
    filters.name ? branch.name.toLowerCase().includes(filters.name.toLowerCase()) : true
  );

  const totalPages = Math.ceil(filteredBranches.length / PAGE_SIZE);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleAddBranch = () => {
    if (newBranch.name && newBranch.address && newBranch.code) {
      setBranches(prev => [
        ...prev,
        { ...newBranch, id: (prev.length + 1).toString() },
      ]);
      setNewBranch({ id: '', name: '', address: '', code: 0 });
      (document.getElementById('add_modal') as HTMLDialogElement)?.close();
    }
  };


  const handleDelete = () => {
    if (branchToDelete) {
      setBranches(prev => prev.filter(b => b.id !== branchToDelete.id));
      setBranchToDelete(null);
    }
  };

  const handleEdit = () => {
    if (editForm) {
      setBranches(prev =>
        prev.map(b => (b.id === editForm.id ? { ...editForm } : b))
      );
      setBranchToEdit(null); // Cierra el modal
      setEditForm(null); // Limpia el formulario
      (document.getElementById('edit_modal') as HTMLDialogElement)?.close(); // Cierra el modal explícitamente
    }
  };

  const handleCancelEdit = () => {
    setBranchToEdit(null);
    setEditForm(null);
  };

  useEffect(() => {
    setCurrentPage(1);

  }, [filters]);

  useEffect(() => {
    if (editForm) {
      (document.getElementById('edit_modal') as HTMLDialogElement)?.showModal();
    }
  }, [editForm]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Sucursales</h1>

      <div className="card bg-base-100 shadow-lg p-6">
        <h2 className="text-xl font-semibold text-secondary">Filtros de búsqueda</h2>
        <BranchFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
      </div>

      <div className="card bg-base-100 shadow-lg p-6">
        <div className="flex justify-end mb-4">
          <button
            className="btn btn-primary"
            onClick={() => {
              const dialog = document.getElementById('add_modal') as HTMLDialogElement;
              dialog?.showModal();
            }}
          >
            Añadir sucursal
          </button>
        </div>

        <BranchTable
          data={paginatedBranches}
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems: filteredBranches.length,
          }}
          onPageChange={setCurrentPage}
          onEdit={(branch) => {
            setBranchToEdit(branch);
            setEditForm({ ...branch });
          }}
          onDelete={(branchId) => {
            const branch = branches.find(b => b.id === branchId);
            setBranchToDelete(branch ?? null);
            (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
          }}
        />
      </div>

      <ConfirmModal
        id="delete_modal"
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la sucursal "${branchToDelete?.name}"?`}
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
        onCancel={() => setNewBranch({ id: '', name: '', address: '', code: 0 })}
        onSave={handleAddBranch}
      />

    </div>
  );
}
