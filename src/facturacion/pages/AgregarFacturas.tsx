import { SubTitle, Title, CardSlot } from "../../shared/components";
import { TablaConceptos } from "../components/TablaConceptos";
import { FacturaHeader } from "../components/FacturaHeader";
import { FacturaFormContent } from "../components/FacturaForm";
import { useFacturaForm } from "../hooks/useFacturaForm";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AddClienteModal } from "../../Clientes/mod/AddClienteModal";
import { Cliente } from "../../Clientes/types/cliente";
import { useClientePorCedula } from "../hooks/useClientePorCedula";
import api from "../../shared/api";
import { authService } from "../../auth/Services/auth.service";
import { useBranchSelection } from "../hooks/useBranchSelection";

export default function AgregarFacturas() {
  // IMPORTANTE: Todos los hooks deben llamarse en el mismo orden en cada renderizado
  // 1. Hooks de React
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState('Usuario');
  const [nuevoCliente, setNuevoCliente] = useState<Cliente>({
    id: '0',
    identificacion: '',
    razonSocial: '',
    direccion: '',
    telefono1: '',
    correo: ''
  });

  // 2. Hooks personalizados
  // Usar los hooks personalizados para manejar el estado y la lógica
  const {
    formData,
    conceptos,
    saving,
    saveError,
    handleInputChange,
    handleConceptoSelect,
    handleConceptoChange,
    handleConceptoDelete,
    handleOpenCodigoModal,
    saveFactura,
    resetForm
  } = useFacturaForm();

  // Obtener el estado del cliente y el modal desde el hook useClientePorCedula
  const {
    error: clienteError,
    showAddClienteModal,
    handleAddCliente,
    handleCloseAddClienteModal,
    handleClienteAdded // <-- importar del hook
  } = useClientePorCedula(formData.cedula);

  // Actualizar la cédula del nuevo cliente cuando cambia el formulario
  useEffect(() => {
    setNuevoCliente((prev: Cliente) => ({
      ...prev,
      identificacion: formData.cedula
    }));
  }, [formData.cedula]);

  // Usar el hook para manejar la selección de sucursales
  const { 
    branches, 
    selectedBranch, 
    loadingBranches, 
    branchesError, 
    handleBranchChange 
  } = useBranchSelection();

  // Seleccionar automáticamente la primera sucursal si no hay ninguna seleccionada
  useEffect(() => {
    if (!loadingBranches && branches.length > 0 && !selectedBranch) {
      // Simular la selección de la primera sucursal
      const event = {
        target: { value: branches[0].id }
      } as React.ChangeEvent<HTMLSelectElement>;
      handleBranchChange(event);
    }
  }, [branches, loadingBranches, selectedBranch]);

  // Obtener el nombre del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const response = await api.get('/auth/me');
          if (response.data) {
            const nombreCompleto = `${response.data.NOMBRE} ${response.data.APELLIDO}`.trim();
            setUserName(nombreCompleto || 'Usuario');
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Manejar el guardado de la factura
  const handleSaveFactura = async () => {
    setErrorMessage(null);

    // Si no hay sucursal seleccionada pero hay sucursales disponibles, seleccionar la primera
    if (!selectedBranch && branches.length > 0) {
      const event = {
        target: { value: branches[0].id }
      } as React.ChangeEvent<HTMLSelectElement>;
      handleBranchChange(event);
      // Continuar con la ejecución sin retornar
    } else if (!selectedBranch) {
      setErrorMessage('Debe seleccionar una sucursal');
      return;
    }

    // Encontrar el ID de la sucursal seleccionada
    const selectedBranchObj = branches.find(branch => branch.id === selectedBranch);
    if (!selectedBranchObj) {
      setErrorMessage('Sucursal no válida');
      return;
    }

    const success = await saveFactura(parseInt(selectedBranchObj.id));
    if (!success && saveError) {
      setErrorMessage(saveError);
    }
  };

  // Manejar la cancelación
  const handleCancel = () => {
    // Restablecer el formulario a su estado inicial
    resetForm();
    // Limpiar cualquier mensaje de error
    setErrorMessage(null);
  };

  // Calcular totales incluyendo descuento total
  const { subtotal, descuentoTotal, total } = useMemo(() => {
    // Calcular subtotal sin descuentos (precio * cantidad)
    const subtotalSinDescuento = conceptos.reduce((sum, concepto) => 
      sum + (concepto.precio * concepto.cantidad), 0
    );
    
    // Calcular descuento total aplicado
    const descuento = conceptos.reduce((sum, concepto) => 
      sum + (concepto.descuento * concepto.cantidad), 0
    );
    
    // Calcular subtotal con descuentos aplicados
    const subtotalConDescuento = conceptos.reduce((sum, concepto) => 
      sum + (concepto.subtotal || 0), 0
    );

    return {
      subtotal: subtotalSinDescuento,
      descuentoTotal: descuento,
      total: subtotalConDescuento 
    };
  }, [conceptos]);

  return (
    <>
      <Link
        to="/junta/facturas"
        className="inline-flex items-center gap-2 text-white btn btn-primary hover:bg-blue-600 hover:border-blue-600"
      >
        <FaArrowLeft />
        Regresar
      </Link>      
      <Title title="Facturación" />
      <SubTitle title="Servicio de Mantenimiento" />

      <div className="space-y-6">
        {/* Información del facturador */}
        <FacturaHeader
          facturador={userName}
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          loadingBranches={loadingBranches}
          branchesError={branchesError}
        />

        {/* Formulario principal */}
        <CardSlot>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <FacturaFormContent
            formData={formData}
            clienteError={clienteError}
            total={total}
            onInputChange={handleInputChange}
            onOpenCodigoModal={handleOpenCodigoModal}
            onConceptoSelect={handleConceptoSelect}
            onAddCliente={() => {
              // Actualizar la cédula en el estado del nuevo cliente
              setNuevoCliente(prev => ({
                ...prev,
                identificacion: formData.cedula
              }));
              // Abrir el modal
              handleAddCliente();
            }}
            onSave={handleSaveFactura}
            onCancel={handleCancel}
            saving={saving}
          />
        </CardSlot>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:w-3/4 overflow-x-auto">
          <TablaConceptos
            conceptos={conceptos}
            onChange={handleConceptoChange}
            onDelete={handleConceptoDelete}
          />
        </div>

        <div className="w-full lg:w-1/4 min-w-[300px]">
          <div className="sticky top-4">
            <CardSlot>
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">Resumen de Factura</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {descuentoTotal > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Descuento total:</span>
                      <span>-${descuentoTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardSlot>
          </div>
        </div>
      </div>

      {/* Modal para agregar cliente */}
      <AddClienteModal
        id="add_cliente_modal"
        isOpen={showAddClienteModal}
        cliente={nuevoCliente}
        onChange={(updatedCliente) => {
          setNuevoCliente(updatedCliente);
        }}
        onCancel={() => {
          handleCloseAddClienteModal();
          setNuevoCliente({
            id: '0',
            identificacion: formData.cedula,
            razonSocial: '',
            direccion: '',
            telefono1: '',
            correo: ''
          });
        }}
        onSave={async () => {
          try {
            // Formatear los datos del cliente para la API
            const formatClienteForAPI = (cliente: Cliente) => ({
              identificacion: cliente.identificacion,
              razonSocial: cliente.razonSocial,
              nombreComercial: cliente.nombreComercial || 'Sin Nombre Comercial',
              direccion: cliente.direccion,
              telefono1: cliente.telefono1 || '',
              telefono2: cliente.telefono2 || '',
              correo: cliente.correo || '',
              tarifa: cliente.tarifa || '',
              grupo: cliente.grupo || '',
              zona: cliente.zona || '',
              ruta: cliente.ruta || '',
              vendedor: cliente.vendedor || '',
              cobrador: cliente.cobrador || '',
              provincia: cliente.provincia || '',
              ciudad: cliente.ciudad || '',
              parroquia: cliente.parroquia || ''
            });

            const formattedCliente = formatClienteForAPI(nuevoCliente);
            
            // Enviar la petición para guardar el cliente
            await api.post('/clientes', formattedCliente);
            
            // Mostrar mensaje de éxito
            alert('Cliente agregado exitosamente');
            
            // Cerrar el modal y limpiar el formulario
            handleCloseAddClienteModal();
            setNuevoCliente({
              id: '0',
              identificacion: formData.cedula,
              razonSocial: '',
              direccion: '',
              telefono1: '',
              correo: ''
            });
            
            // Actualizar el formulario con los datos del nuevo cliente
            handleInputChange({
              target: {
                name: 'cliente',
                value: nuevoCliente.razonSocial
              }
            } as React.ChangeEvent<HTMLInputElement>);

            // Llamar a handleClienteAdded para refrescar el estado y ocultar el botón
            if (typeof handleClienteAdded === 'function') {
              handleClienteAdded();
            }
          } catch (error) {
            console.error('Error al guardar el cliente:', error);
            alert('No se pudo guardar el cliente');
          }
        }}
      />
    </>
  );
}