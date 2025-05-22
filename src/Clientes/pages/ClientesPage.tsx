import { useEffect, useState } from 'react';
 
import { Cliente, ClienteFilter } from '../types/cliente';
import { ClienteFilters, ClienteTable } from '../components';
import { AddClienteModal, EditClienteModal, ConfirmModal } from '../mod';
import { PAGE_SIZE } from '../../shared/utils/constants';
import { Title, SubTitle, EndSlot, CardSlot } from '../../shared/components';
import api from '../../shared/api';

interface ApiCliente {
  ID: number;
  IDENTIFICACION: string;
  RAZON_SOCIAL: string;
  NOMBRE_COMERCIAL: string;
  DIRECCION: string;
  TELEFONO1: string;
  TELEFONO2: string;
  CORREO: string;
  TARIFA: string;
  GRUPO: string;
  ZONA: string;
  RUTA: string;
  VENDEDOR: string;
  COBRADOR: string;
  PROVINCIA: string;
  CIUDAD: string;
  PARROQUIA: string;
  FECHA_CREACION: string;
}

interface ApiResponse {
  data: ApiCliente[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filters, setFilters] = useState<ClienteFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ ,setClienteToEdit] = useState<Cliente | null>(null);
  const [editForm, setEditForm] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);


  const defaultNewCliente: Cliente = {
    id: '',
    identificacion: '',
    razonSocial: '',
    nombreComercial: '',
    direccion: '',
    telefono1: '',
    telefono2: '',
    correo: '',
    tarifa: '',
    grupo: '',
    zona: '',
    ruta: '',
    vendedor: '',
    cobrador: '',
    provincia: '',
    ciudad: '',
    parroquia: '',
    telefonoNro1: '',
    telefonoNro2: '',
    correoElectronico: ''
  };

  const [newCliente, setNewCliente] = useState<Cliente>(defaultNewCliente);


const convertApiToCliente = (apiCliente: ApiCliente): Cliente => {
  return {
    id: apiCliente.ID.toString(),
    identificacion: apiCliente.IDENTIFICACION,
    razonSocial: apiCliente.RAZON_SOCIAL,
    nombreComercial: apiCliente.NOMBRE_COMERCIAL,
    direccion: apiCliente.DIRECCION,
    telefono1: apiCliente.TELEFONO1,
    telefono2: apiCliente.TELEFONO2,
    correo: apiCliente.CORREO,
    tarifa: apiCliente.TARIFA,
    grupo: apiCliente.GRUPO,
    zona: apiCliente.ZONA,
    ruta: apiCliente.RUTA,
    vendedor: apiCliente.VENDEDOR,
    cobrador: apiCliente.COBRADOR,
    provincia: apiCliente.PROVINCIA,
    ciudad: apiCliente.CIUDAD,
    parroquia: apiCliente.PARROQUIA,
    telefonoNro1: apiCliente.TELEFONO1,
    telefonoNro2: apiCliente.TELEFONO2,
    correoElectronico: apiCliente.CORREO
  };
};

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get<ApiResponse>('https://juntaagua.onrender.com/apiV2/clientes');
        
        const convertedClientes = response.data.data.map(convertApiToCliente);
        setClientes(convertedClientes);
        
        // Si la API no devuelve paginación, calcular manualmente
        setTotalItems(response.data.totalItems || convertedClientes.length);
        setTotalPages(response.data.totalPages || Math.ceil(convertedClientes.length / PAGE_SIZE));
        setCurrentPage(response.data.currentPage || 1);
      } catch (error) {
        console.error('Error fetching clientes:', error);
        setError('No se pudo cargar la lista de clientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, [currentPage, filters]);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Format client data for API
  const formatClienteForAPI = (cliente: Cliente) => {
    return {
      identificacion: cliente.identificacion,
      razonSocial: cliente.razonSocial,
      nombreComercial: cliente.nombreComercial || '',
      direccion: cliente.direccion,
      telefono1: cliente.telefono1 || cliente.telefonoNro1 || '',
      telefono2: cliente.telefono2 || cliente.telefonoNro2 || '',
      correo: cliente.correo || cliente.correoElectronico || '',
      tarifa: cliente.tarifa || '',
      grupo: cliente.grupo || '',
      zona: cliente.zona || '',
      ruta: cliente.ruta || '',
      vendedor: cliente.vendedor || '',
      cobrador: cliente.cobrador || '',
      provincia: cliente.provincia || '',
      ciudad: cliente.ciudad || '',
      parroquia: cliente.parroquia || '',
      ...(cliente.id && !isNaN(parseInt(cliente.id)) ? { id: parseInt(cliente.id) } : {})
    };
  };

  // Handle adding a new cliente
const handleAddCliente = async () => {
    if (newCliente.identificacion && newCliente.razonSocial && newCliente.direccion) {
      setIsLoading(true);
      setError(null);
      try {
        const formattedCliente = formatClienteForAPI(newCliente);
        
        await api.post('https://juntaagua.onrender.com/apiV2/clientes', formattedCliente);
        
        // Refetch the data to get the updated list
        const fetchResponse = await api.get<ApiResponse>('https://juntaagua.onrender.com/apiV2/clientes');
        const convertedClientes = fetchResponse.data.data.map(convertApiToCliente);
        setClientes(convertedClientes);
        
        setNewCliente(defaultNewCliente);
        (document.getElementById('add_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error adding cliente:', error);
        setError('No se pudo agregar el cliente');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle editing a cliente
  const handleEdit = async () => {
    if (editForm && editForm.id) {
      setIsLoading(true);
      setError(null);
      try {
        const formattedCliente = formatClienteForAPI(editForm);
        
        await api.put(`https://juntaagua.onrender.com/apiV2/clientes/${editForm.id}`, formattedCliente);

        // Update local state
        setClientes(prev =>
          prev.map(c => (c.id === editForm.id ? { ...editForm } : c))
        );
        
        setClienteToEdit(null);
        setEditForm(null);
        (document.getElementById('edit_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error updating cliente:', error);
        setError('No se pudo actualizar el cliente');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle deleting a cliente
  const handleDelete = async () => {
    if (clienteToDelete && clienteToDelete.id) {
      setIsLoading(true);
      setError(null);
      try {
        await api.delete(`https://juntaagua.onrender.com/apiV2/clientes/${clienteToDelete.id}`);

        setClientes(prev => prev.filter(c => c.id !== clienteToDelete.id));
        setClienteToDelete(null);
        (document.getElementById('delete_modal') as HTMLDialogElement)?.close();
      } catch (error) {
        console.error('Error deleting cliente:', error);
        setError('No se pudo eliminar el cliente');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setClienteToEdit(null);
    setEditForm(null);
  };

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
          <ClienteTable
            data={clientes}
            pagination={{
              currentPage,
              totalPages,
              pageSize: PAGE_SIZE,
              totalItems,
            }}
            onPageChange={setCurrentPage}
            onEdit={(cliente) => {
              setClienteToEdit(cliente);
              setEditForm({ ...cliente });
              (document.getElementById('edit_modal') as HTMLDialogElement)?.showModal();
            }}
            onDelete={(clienteId) => {
              const cliente = clientes.find(c => c.id === clienteId);
              setClienteToDelete(cliente ?? null);
              (document.getElementById('delete_modal') as HTMLDialogElement)?.showModal();
            }}
          />
        )}
      </CardSlot>

      <ConfirmModal
        id="delete_modal"
        title="Confirmar eliminación"
        message={`¿Está seguro que desea eliminar el cliente "${clienteToDelete?.razonSocial}"?`}
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
        onCancel={() => setNewCliente(defaultNewCliente)}
        onSave={handleAddCliente}
      />
    </>
  );
}