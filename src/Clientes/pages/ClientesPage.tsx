import { useEffect, useState } from 'react';
import { Cliente, ClienteFilter } from '../types/cliente';
import { ClienteFilters, ClienteTable } from '../components';
import { AddClienteModal, EditClienteModal, ConfirmModal } from '../mod'
import { PAGE_SIZE } from '../../shared/utils/constants';
import { Title, SubTitle, EndSlot, CardSlot } from '../../shared/components';

const mockClientes: Cliente[] = [
  {
    id: 'VER001',
    identificacion: '1401234567',
    razonSocial: 'Vertiente',
    direccion: 'Av.Ambato',
    telefonoNro1: '09123456789',
    telefonoNro2: '09123456789',
    correoElectronico: 'example@gmail.com'
  },
  {
    id: 'VER002',
    identificacion: '1801234567',
    razonSocial: 'Vertiente',
    direccion: 'Av.Ambato',
    telefonoNro1: '09123456789',
    telefonoNro2: '09123456789',
    correoElectronico: 'example@gmail.com'
  },
  {
    id: 'VER003',
    identificacion: '1501234567',
    razonSocial: 'Vertiente',
    direccion: 'Av.Ambato',
    telefonoNro1: '09123456789',
    telefonoNro2: '09123456789',
    correoElectronico: 'example@gmail.com'
  },
  {
    id: 'VER004',
    identificacion: '1601234567',
    razonSocial: 'Vertiente',
    direccion: 'Av.Ambato',
    telefonoNro1: '09123456789',
    telefonoNro2: '09123456789',
    correoElectronico: 'example@gmail.com'
  },
  {
    id: 'VER005',
    identificacion: '1701234567',
    razonSocial: 'Vertiente',
    direccion: 'Av.Ambato',
    telefonoNro1: '09123456789',
    telefonoNro2: '09123456789',
    correoElectronico: 'example@gmail.com'
  }
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [filters, setFilters] = useState<ClienteFilter>({});
  const [currentPage, setCurrentPage] = useState(1);

  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState<Cliente | null>(null);

  const [newCliente, setNewCliente] = useState<Cliente>({
    id: '',
    identificacion: '',
    razonSocial: '',
    direccion: '',
    telefonoNro1: '',
    telefonoNro2: '',
    correoElectronico: ''
  });

  const filteredClientes = clientes.filter(cliente =>
    filters.identificacion ? cliente.identificacion.toLowerCase().includes(filters.identificacion.toLowerCase()) : true
  );

  const totalPages = Math.ceil(filteredClientes.length / PAGE_SIZE);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleAddCliente = () => {
    if (newCliente.identificacion && newCliente.direccion) {
      setClientes(prev => [
        ...prev,
        { ...newCliente, id: `VER${(prev.length + 1).toString().padStart(3, '0')}` },
      ]);
      setNewCliente({
        id: '',
        identificacion: '',
        razonSocial: '',
        direccion: '',
        telefonoNro1: '',
        telefonoNro2: '',
        correoElectronico: ''
      });
    }
  };

  const handleDelete = () => {
    if (clienteToDelete) {
      setClientes(prev => prev.filter(c => c.id !== clienteToDelete.id));
      setClienteToDelete(null);
    }
  };

  const handleEdit = () => {
    if (editForm) {
      setClientes(prev =>
        prev.map(c => (c.id === editForm.id ? { ...editForm } : c))
      );
      setClienteToEdit(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setClienteToEdit(null);
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
      <Title title="CLIENTES" />
      <CardSlot>
        <SubTitle title="Filtros de búsqueda" />
        <ClienteFilters filters={filters} onChange={setFilters} onClear={handleClearFilters} />
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
            Añadir cliente
          </button>
        </EndSlot>

        <ClienteTable
          data={paginatedClientes}
          pagination={{
            currentPage,
            totalPages,
            pageSize: PAGE_SIZE,
            totalItems: filteredClientes.length,
          }}
          onPageChange={setCurrentPage}
          onEdit={(cliente) => {
            setClienteToEdit(cliente);
            setEditForm({ ...cliente });
          }}
          onDelete={(clienteId) => {
            const cliente = clientes.find(c => c.id === clienteId);
            setClienteToDelete(cliente ?? null);
            (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
          }}
        />
      </CardSlot>

      <ConfirmModal
        id="delete_modal"
        title="Confirmar eliminación"
        message={`¿Estás seguro de que deseas eliminar el cliente "${clienteToDelete?.identificacion}"?`}
        onConfirm={handleDelete}
        onCancel={() => setClienteToDelete(null)}
      />

      <EditClienteModal
        id="edit_modal"
        title="Editar cliente"
        cliente={editForm}
        onChange={setEditForm}
        onCancel={handleCancelEdit}
        onSave={handleEdit}
      />

      <AddClienteModal
        id="add_modal"
        cliente={newCliente}
        onChange={setNewCliente}
        onCancel={() => setNewCliente({
          id: '',
          identificacion: '',
          razonSocial: '',
          direccion: '',
          telefonoNro1: '',
          telefonoNro2: '',
          correoElectronico: ''
        })}
        onSave={handleAddCliente}
      />
    </>
  );
}