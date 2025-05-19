import { useState, useEffect, useCallback } from "react";
import { FacturaForm } from "../../shared/components/interfaces/factura.interface";
import { useClientePorCedula } from "./useClientePorCedula";
import { DEFAULTS } from "../types/factura";
import { ConceptoCobro } from "../components/TablaConceptos";
import { CodigoConcepto, CONFIGURACION_CONCEPTOS, crearConcepto } from "../types/factura";

export const useFacturaForm = () => {
  // Estado del formulario con valores iniciales
  const [formData, setFormData] = useState<FacturaForm>({
    cedula: '',
    cliente: '',
    codigo: '',
    emision: '',
    vencimiento: '',
    serie: DEFAULTS.serie,
    numero: DEFAULTS.numero,
    secuencia: DEFAULTS.secuencia,
    concepto: ''
  });

  // Estado para la tabla de conceptos
  const [conceptos, setConceptos] = useState<ConceptoCobro[]>([]);

  // Obtener cliente por cédula
  const { cliente, error: clienteError } = useClientePorCedula(formData.cedula);

  // Actualizar cliente automáticamente cuando cambia el resultado del hook
  useEffect(() => {
    if (cliente && formData.cliente !== cliente) {
      setFormData(prev => ({ ...prev, cliente }));
    }
  }, [cliente, formData.cliente]);

  // Manejador de cambios en el formulario
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Manejador para selección de conceptos
  const handleConceptoSelect = useCallback((codigo: string, mes?: string) => {
    // Verificar si el código existe en nuestra configuración
    const tipoConcepto = codigo as CodigoConcepto;
    const config = CONFIGURACION_CONCEPTOS[tipoConcepto];
    
    if (!config) return;
    
    // Verificar si requiere mes
    if (config.requiereMes && (!mes || mes === 'ninguno')) return;
    
    // Crear descripción con mes si es necesario
    const descripcion = config.requiereMes 
      ? `${config.desc} - ${mes}` 
      : config.desc;
    
    // Crear nuevo concepto usando la función factory
    const nuevoConcepto = crearConcepto(
      config.codInterno,
      descripcion,
      config.precioBase || 0
    );
    
    // Agregar a la lista de conceptos
    setConceptos(prev => [...prev, nuevoConcepto]);
  }, []);

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

  return {
    formData,
    setFormData,
    conceptos,
    clienteError,
    handleInputChange,
    handleConceptoSelect,
    handleConceptoChange,
    handleConceptoDelete,
    handleOpenCodigoModal
  };
};
