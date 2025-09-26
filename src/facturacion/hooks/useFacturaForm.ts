import { useState, useEffect, useCallback } from "react";
import { FacturaForm } from "../../shared/components/interfaces/factura.interface";
import { useClientePorCedula } from "./useClientePorCedula";
import { DEFAULTS } from "../types/factura";
import { ConceptoCobro } from "../components/TablaConceptos";
import { CodigoConcepto, CONFIGURACION_CONCEPTOS, crearConcepto } from "../types/factura";
import api from "../../shared/api";
import { authService } from "../../auth/Services/auth.service";
import { useNavigate } from "react-router-dom";

export const useFacturaForm = () => {
  // IMPORTANTE: Todos los hooks deben llamarse en el mismo orden en cada renderizado
  // 1. Hooks de React
  const navigate = useNavigate();
  
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Valores iniciales del formulario
  const initialFormState: FacturaForm = {
    cedula: '',
    cliente: '',
    codigo: '',
    emision: getCurrentDate(), // Establecer fecha actual por defecto
    vencimiento: '',
    serie: DEFAULTS.serie,
    numero: DEFAULTS.numero,
    secuencia: '', // Inicialmente vacío, se actualizará con la última secuencia
    concepto: ''
  };
  
  // 2. Estados (useState hooks)
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Estado del formulario con valores iniciales
  const [formData, setFormData] = useState<FacturaForm>(initialFormState);

  // Estado para la tabla de conceptos
  const [conceptos, setConceptos] = useState<ConceptoCobro[]>([]);

  // Obtener cliente por cédula
  const { 
    cliente, 
    clienteId, 
    error: clienteError, 
    resetCliente, 
    showAddButton 
  } = useClientePorCedula(formData.cedula);

  // Actualizar cliente automáticamente cuando cambia el resultado del hook
  useEffect(() => {
    if (cliente && formData.cliente !== cliente) {
      setFormData(prev => ({ ...prev, cliente }));
    }
  }, [cliente, formData.cliente]);

  // Obtener la última secuencia al cargar el componente
  useEffect(() => {
    const fetchLastSequence = async () => {
      try {
        const response = await api.get('/facturas/all', {
          params: { page: 1, limit: 1 }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          const lastFactura = response.data.data[0];
          const nextSequence = (parseInt(lastFactura.SECUENCIA) + 1).toString().padStart(7, '0');
          setFormData(prev => ({
            ...prev,
            secuencia: nextSequence
          }));
        }
      } catch (error) {
        console.error('Error al obtener la última secuencia:', error);
      }
    };

    fetchLastSequence();
  }, []);

  // Manejador de cambios en el formulario
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Manejador para selección de conceptos (solo dinámicos de la API)
  const handleConceptoSelect = useCallback((conceptoData: any, mes?: string) => {
    console.log("🎯 Seleccionando concepto dinámico:", { conceptoData, mes });
    
    // Buscar cuántos conceptos ya existen con ese código base
    const count = conceptos.filter(c => c.codigo === conceptoData.codigo).length;
    console.log("📊 Conceptos existentes con el mismo código:", count);
    
    // Generar código único si hay duplicados
    const codigoFinal = count > 0 ? `${conceptoData.codigo}_${count + 1}` : conceptoData.codigo;
    
    // Crear descripción con mes si es necesario
    const descripcion = mes && mes !== 'ninguno' 
      ? `${conceptoData.desc} - ${mes}` 
      : conceptoData.desc;
    
    console.log("📝 Descripción final:", descripcion);
    
    // Crear nuevo concepto dinámico con precio base de la API
    const nuevoConcepto = crearConcepto(
      codigoFinal,
      descripcion,
      conceptoData.precioBase || 0 // Usar precio base de la API
    );
    
    console.log("🆕 Nuevo concepto dinámico creado:", nuevoConcepto);
    
    // Agregar a la lista de conceptos
    setConceptos(prev => {
      const updated = [...prev, nuevoConcepto];
      console.log("📋 Lista actualizada de conceptos:", updated);
      return updated;
    });
  }, [conceptos]);

  // Manejador para actualizar conceptos
  const handleConceptoChange = useCallback((idx: number, updated: ConceptoCobro) => {
    setConceptos(prev => prev.map((c, i) => i === idx ? updated : c));
  }, []); 

  // Manejador para eliminar conceptos
  const handleConceptoDelete = useCallback((idx: number) => {
    setConceptos(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // Manejador para abrir el modal de selección de código
  const handleOpenCodigoModal = useCallback(() => {
    const dialog = document.getElementById('select_codigo_modal') as HTMLDialogElement;
    dialog?.showModal();
  }, []);

  // Función para guardar la factura
  const saveFactura = useCallback(async (idSucursal: number) => {
    if (!clienteId) {
      setSaveError('No se ha seleccionado un cliente válido');
      return false;
    }

    if (conceptos.length === 0) {
      setSaveError('Debe agregar al menos un concepto a la factura');
      return false;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      setSaveError('No se ha iniciado sesión');
      return false;
    }

    // Calcular totales
    const subtotal = conceptos.reduce((sum, concepto) => sum + (concepto.subtotal || 0), 0);

    try {
      setSaving(true);
      setSaveError(null);

      const facturaData = {
        idSucursal: idSucursal,
        idUsuario: parseInt(currentUser.id),
        idCliente: clienteId,
        idMedidor: 1, // Valor fijo como se solicitó
        tipoPago: 'EFECTIVO', // Valor fijo como se solicitó
        valorSinImpuesto: subtotal,
        secuencia: parseInt(formData.secuencia),
        // iva: ,
        // total: total,
        detalles: conceptos.map(c => ({
          descripcion: c.descripcion,
          // codigo: c.codigo,
          idRazon:1,
          cantidad: c.cantidad,
          // precioUnitario: c.precio,
          subtotal: c.subtotal,
          descuento: c.descuento,
        }))
      };

      await api.post('/facturas/crear', facturaData);
      
      // Redireccionar a la lista de facturas
      navigate('/junta/facturas');
      return true;
    } catch (error: any) {
      console.error('Error al guardar factura:', error);
      setSaveError(error.response?.data?.message || 'Error al guardar la factura');
      return false;
    } finally {
      setSaving(false);
    }
  }, [clienteId, conceptos, navigate]);

  // Función para restablecer el formulario a su estado inicial
  const resetForm = useCallback(() => {
    // Reiniciar el estado del cliente en el hook useClientePorCedula
    resetCliente();
    
    // Restablecer el formulario a su estado inicial
    setFormData(initialFormState);
    
    // Limpiamos los conceptos y errores
    setConceptos([]);
    setSaveError(null);
  }, [initialFormState, resetCliente]);

  // Estado para controlar la visibilidad del modal de agregar cliente
  const [showAddClienteModal, setShowAddClienteModal] = useState(false);

  // Función para manejar el clic en el botón de agregar cliente
  const handleAddClienteClick = useCallback(() => {
    setShowAddClienteModal(true);
  }, []);

  // Función para manejar el cierre del modal
  const handleCloseAddClienteModal = useCallback(() => {
    setShowAddClienteModal(false);
  }, []);

  // Función para manejar el guardado exitoso del cliente
  const handleClienteAdded = useCallback(() => {
    // Cerrar el modal
    setShowAddClienteModal(false);
    // Aquí podrías implementar lógica adicional después de agregar un cliente
    // como por ejemplo, volver a buscar el cliente por cédula
  }, []);

  return {
    formData,
    conceptos,
    clienteError,
    showAddButton,
    showAddClienteModal,
    saving,
    saveError,
    handleInputChange,
    handleConceptoSelect,
    handleConceptoChange,
    handleConceptoDelete,
    handleOpenCodigoModal,
    handleAddCliente: handleAddClienteClick,
    handleCloseAddClienteModal,
    handleClienteAdded,
    saveFactura,
    resetForm
  };
};
