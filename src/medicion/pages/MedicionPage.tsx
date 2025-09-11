import { useEffect, useState } from 'react';
import { Medicion, MedicionFilter } from '../types/medicion';
import { MedicionesFilters, MedicionesTable } from '../components';
import { EditModal, ConfirmModal, AddModal } from '../modals';
import { PAGE_SIZE } from '../../shared/utils/constants';
import { Title, SubTitle, EndSlot, CardSlot } from '../../shared/components';

const mockMediciones: Medicion[] = [
  {
    id: '1',
    numeroMedidor: 'M001',
    cedula: '1723456789',
    fechaLectura: '2025-01-12',
    consumo: 15.5,
    mesFacturado: 'Enero',
  },
  {
    id: '2',
    numeroMedidor: 'M002',
    cedula: '1734567890',
    fechaLectura: '2025-01-13',
    consumo: 20.0,
    mesFacturado: 'Enero',
  },
  {
    id: '3',
    numeroMedidor: 'M003',
    cedula: '1745678901',
    fechaLectura: '2025-01-14',
    consumo: 12.3,
    mesFacturado: 'Enero',
  },
  {
    id: '4',
    numeroMedidor: 'M004',
    cedula: '1756789012',
    fechaLectura: '2025-01-15',
    consumo: 18.7,
    mesFacturado: 'Enero',
  },
  {
    id: '5',
    numeroMedidor: 'M005',
    cedula: '1767890123',
    fechaLectura: '2025-01-16',
    consumo: 22.1,
    mesFacturado: 'Enero',
  },
  {
    id: '6',
    numeroMedidor: 'M006',
    cedula: '1778901234',
    fechaLectura: '2025-02-10',
    consumo: 17.8,
    mesFacturado: 'Febrero',
  },
  {
    id: '7',
    numeroMedidor: 'M007',
    cedula: '1789012345',
    fechaLectura: '2025-02-11',
    consumo: 19.4,
    mesFacturado: 'Febrero',
  },
  {
    id: '8',
    numeroMedidor: 'M008',
    cedula: '1790123456',
    fechaLectura: '2025-02-12',
    consumo: 14.9,
    mesFacturado: 'Febrero',
  },
  {
    id: '9',
    numeroMedidor: 'M009',
    cedula: '1701234567',
    fechaLectura: '2025-03-01',
    consumo: 21.2,
    mesFacturado: 'Marzo',
  },
  {
    id: '10',
    numeroMedidor: 'M010',
    cedula: '1712345678',
    fechaLectura: '2025-03-02',
    consumo: 16.6,
    mesFacturado: 'Marzo',
  },
];

export default function MedicionesPage() {
  const [mediciones, setMediciones] = useState<Medicion[]>(mockMediciones);
  const [filters, setFilters] = useState<MedicionFilter>({});
  const [currentPage, setCurrentPage] = useState(1);

  const [medicionToDelete, setMedicionToDelete] = useState<Medicion | null>(null);
  const [editForm, setEditForm] = useState<Medicion | null>(null);

  const [newMedicion, setNewMedicion] = useState<Medicion>({
    id: '',
    numeroMedidor: '',
    cedula: '',
    fechaLectura: '',
    consumo: 0,
    mesFacturado: '',
  });

  const filteredMediciones = mediciones.filter(medicion => {
    let matches = true;
    if (filters.numeroMedidor) {
      matches = matches && medicion.numeroMedidor.toLowerCase().includes(filters.numeroMedidor.toLowerCase());
    }
    if (filters.fechaDesde) {
      matches = matches && medicion.fechaLectura >= filters.fechaDesde;
    }
    if (filters.fechaHasta) {
      matches = matches && medicion.fechaLectura <= filters.fechaHasta;
    }
    return matches;
  });

  const totalPages = Math.ceil(filteredMediciones.length / PAGE_SIZE);
  const paginatedMediciones = filteredMediciones.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleAddMedicion = () => {
    if (
      newMedicion.numeroMedidor &&
      newMedicion.cedula &&
      newMedicion.fechaLectura &&
      newMedicion.consumo &&
      newMedicion.mesFacturado
    ) {
      setMediciones(prev => [
        ...prev,
        { ...newMedicion, id: (prev.length + 1).toString() },
      ]);
      setNewMedicion({
        id: '',
        numeroMedidor: '',
        cedula: '',
        fechaLectura: '',
        consumo: 0,
        mesFacturado: '',
      });
    }
  };

  const handleDelete = () => {
    if (medicionToDelete) {
      setMediciones(prev => prev.filter(m => m.id !== medicionToDelete.id));
      setMedicionToDelete(null);
    }
  };

  const handleEdit = () => {
    if (editForm) {
      setMediciones(prev =>
        prev.map(m => (m.id === editForm.id ? { ...editForm } : m))
      );
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
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
    <>
      <Title title="Mediciones" />
      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <MedicionesFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
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
            Añadir medición
          </button>
        </EndSlot>

        <MedicionesTable
          data={paginatedMediciones}
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems: filteredMediciones.length,
          }}
          onPageChange={setCurrentPage}
          onEdit={(medicion) => {
            setEditForm({ ...medicion });
          }}
          onDelete={(medicionId) => {
            const medicion = mediciones.find(m => m.id === medicionId);
            setMedicionToDelete(medicion ?? null);
            (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
          }}
        />
      </CardSlot>

      <ConfirmModal
        id="delete_modal"
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar la medición con número de medidor "${medicionToDelete?.numeroMedidor}"?`}
        onConfirm={handleDelete}
        onCancel={() => setMedicionToDelete(null)}
      />

      <EditModal
        id="edit_modal"
        title="Editar medición"
        medicion={editForm}
        onChange={setEditForm}
        onCancel={handleCancelEdit}
        onSave={handleEdit}
      />

      <AddModal
        id="add_modal"
        medicion={newMedicion}
        onChange={setNewMedicion}
        onCancel={() =>
          setNewMedicion({
            id: '',
            numeroMedidor: '',
            cedula: '',
            fechaLectura: '',
            consumo: 0,
            mesFacturado: '',
          })
        }
        onSave={handleAddMedicion}
      />
    </>
  );
}