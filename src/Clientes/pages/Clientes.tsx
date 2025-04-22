import React, { useState, useEffect } from 'react';
import Table from '../../shared/components/Table';
import { FaSearch } from 'react-icons/fa';

interface Cliente {
  id: string;
  identificacion: string;
  razonSocial: string | number;
  direccion: string;
  telefonoNro1: string | number;
  telefonoNro2: string | number;
  correoElectronico: string | number;
}

const Clientes: React.FC = () => {
  const [filtro, setFiltro] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Datos de ejemplo
  useEffect(() => {
    // En una aplicación real, estos datos vendrían de una API
    const clientesData: Cliente[] = [
      {
        id: 'VER001',
        identificacion: 'Vertiente',
        razonSocial: 1,
        direccion: '12.40',
        telefonoNro1: '1.10',
        telefonoNro2: '0.0',
        correoElectronico: '11.30'
      },
      {
        id: 'VER001',
        identificacion: 'Vertiente',
        razonSocial: 1,
        direccion: '12.40',
        telefonoNro1: '1.10',
        telefonoNro2: '0.0',
        correoElectronico: '11.30'
      },
      {
        id: 'VER001',
        identificacion: 'Vertiente',
        razonSocial: 1,
        direccion: '12.40',
        telefonoNro1: '1.10',
        telefonoNro2: '0.0',
        correoElectronico: '11.30'
      }
    ];
    
    setClientes(clientesData);
    setClientesFiltrados(clientesData);
    setTotalPages(Math.ceil(clientesData.length / 10));
  }, []);

  // Columnas para la tabla
  const columns = [
    { header: 'ID', accessor: 'id' as keyof Cliente },
    { header: 'Identificación', accessor: 'identificacion' as keyof Cliente },
    { header: 'Razón Social', accessor: 'razonSocial' as keyof Cliente },
    { header: 'Dirección', accessor: 'direccion' as keyof Cliente },
    { header: 'Teléfono Nro 1', accessor: 'telefonoNro1' as keyof Cliente },
    { header: 'Teléfono Nro 2', accessor: 'telefonoNro2' as keyof Cliente },
    { header: 'Correo Electrónico', accessor: 'correoElectronico' as keyof Cliente }
  ];

  const handleSearch = () => {
    if (!filtro.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.id.toLowerCase().includes(filtro.toLowerCase()) ||
        cliente.identificacion.toLowerCase().includes(filtro.toLowerCase()) ||
        String(cliente.razonSocial).toLowerCase().includes(filtro.toLowerCase())
      );
      setClientesFiltrados(filtered);
      setTotalPages(Math.ceil(filtered.length / 10));
      setCurrentPage(1);
    }
  };

  const handleClearFilters = () => {
    setFiltro('');
    setClientesFiltrados(clientes);
    setCurrentPage(1);
    setTotalPages(Math.ceil(clientes.length / 10));
  };

  const handleEdit = (cliente: Cliente) => {
    console.log('Editar cliente:', cliente);
    // Implementar lógica para editar
  };

  const handleDelete = (id: string) => {
    console.log('Eliminar cliente con ID:', id);
    // Implementar lógica para eliminar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900">CLIENTES</h1>
      
      {/* Filtros de búsqueda */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-blue-900">Filtros de búsqueda</h2>
        
        <div className="mt-4">
          <label className="block text-blue-900">Número de cédula o razón social:</label>
          <div className="flex gap-4 mt-2">
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar por cédula o razón social"
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            />
            
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-900 text-white rounded-md flex items-center gap-2"
            >
              <FaSearch />
              Buscar
            </button>
            
            <button 
              onClick={handleClearFilters}
              className="px-4 py-2 bg-blue-900 text-white rounded-md"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabla de clientes */}
      <Table
        data={clientesFiltrados}
        columns={columns}
        pagination={{
          currentPage,
          totalPages
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Clientes;