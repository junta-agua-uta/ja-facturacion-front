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
  const [newCliente, setNewCliente] = useState<Cliente>({
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
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


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
        let response;
        let apiData;

        // Si hay un filtro por identificación, usar el endpoint de búsqueda por cédula
        if (filters.identificacion && filters.identificacion.trim() !== '') {
          response = await api.get(`/clientes/buscarCedula?cedula=${filters.identificacion.trim()}`);
          apiData = response.data; // Este endpoint devuelve un array directamente
        } 
        // Si hay un filtro por razón social, usar el endpoint de búsqueda por nombre
        else if (filters.razonSocial && filters.razonSocial.trim() !== '') {
          response = await api.get(`/clientes/buscar?nombre=${filters.razonSocial.trim()}`);
          apiData = response.data; // Este endpoint devuelve un array directamente
        } 
        // Si no hay filtros, obtener todos los clientes
        else {
          response = await api.get<ApiResponse>('/clientes');
          apiData = response.data.data; // Este endpoint devuelve {data: [...], totalItems, etc.}
        }
        
        // Convertir los datos de la API al formato interno
        const convertedClientes = Array.isArray(apiData) 
          ? apiData.map(convertApiToCliente)
          : [];
        
        setClientes(convertedClientes);
        
        // Calcular paginación localmente
        const totalItems = convertedClientes.length;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        
        setTotalItems(totalItems);
        setTotalPages(totalPages);
        setCurrentPage(1); // Resetear a la primera página cuando cambien los filtros
      } catch (error) {
        console.error('Error fetching clientes:', error);
        setError('No se pudo cargar la lista de clientes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, [filters]);

  // Obtener datos para la página actual
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    return clientes.slice(startIndex, endIndex);
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Format client data for API
  const formatClienteForAPI = (cliente: Cliente) => {
    return {
      identificacion: cliente.identificacion,
      razonSocial: cliente.razonSocial,
      nombreComercial: cliente.nombreComercial || 'Sin Nombre Comercial',
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
        
        await api.post('/clientes', formattedCliente);
        
        // Refetch the data to get the updated list
        const fetchResponse = await api.get<ApiResponse>('/clientes');
        const convertedClientes = fetchResponse.data.data.map(convertApiToCliente);
        setClientes(convertedClientes);
        
        setNewCliente(defaultNewCliente);
        setIsAddModalOpen(false);
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
        
        await api.put(`/clientes/${editForm.id}`, formattedCliente);

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
        await api.delete(`/clientes/${clienteToDelete.id}`);

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

  const handleAddClick = () => {
    setNewCliente({
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
    });
    setIsAddModalOpen(true);
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
            onClick={handleAddClick}
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
            data={getCurrentPageData()}
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
        onCancel={() => setIsAddModalOpen(false)}
        onSave={handleAddCliente}
        isOpen={isAddModalOpen}
      />
    </>
  );
}