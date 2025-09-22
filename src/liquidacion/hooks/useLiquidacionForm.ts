import { useState, useEffect, useCallback } from "react";
import { LiquidacionForm } from "../../shared/components/interfaces/liquidacion.interface";
import { useClientePorCedula } from "./useClientePorCedula";
import { DEFAULTS } from "../types/liquidacion";
import { ConceptoCobro } from "../components/TablaConceptos";
import { CodigoConcepto, CONFIGURACION_CONCEPTOS, crearConcepto } from "../types/liquidacion";
import api from "../../shared/api";
import { authService } from "../../auth/Services/auth.service";
import { useNavigate } from "react-router-dom";

export const useLiquidacionForm = () => {
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Estado inicial de la liquidación
  const initialFormState: LiquidacionForm = {
    cedula: "",
    cliente: "",
    codigo: "",
    emision: getCurrentDate(),
    vencimiento: "",
    serie: DEFAULTS.serie,
    numero: DEFAULTS.numero,
    secuencia: "",
    concepto: "",
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LiquidacionForm>(initialFormState);
  const [conceptos, setConceptos] = useState<ConceptoCobro[]>([]);

  // Hook para obtener cliente (proveedor) por cédula
  const {
    cliente,
    clienteId,
    error: clienteError,
    resetCliente,
    showAddButton,
  } = useClientePorCedula(formData.cedula);

  // Actualizar automáticamente cliente cuando cambia
  useEffect(() => {
    if (cliente && formData.cliente !== cliente) {
      setFormData((prev) => ({ ...prev, cliente }));
    }
  }, [cliente, formData.cliente]);

  // Obtener la última secuencia de liquidación
  useEffect(() => {
    const fetchLastSequence = async () => {
      try {
        const response = await api.get("/liquidaciones/all", {
          params: { page: 1, limit: 1 },
        });

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          const lastLiquidacion = response.data.data[0];
          const nextSequence = (
            parseInt(lastLiquidacion.SECUENCIA) + 1
          )
            .toString()
            .padStart(7, "0");
          setFormData((prev) => ({
            ...prev,
            secuencia: nextSequence,
          }));
        }
      } catch (error) {
        console.error("Error al obtener la última secuencia:", error);
      }
    };

    fetchLastSequence();
  }, []);

  // Manejador de inputs
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  // Selección de conceptos
  const handleConceptoSelect = useCallback(
    (codigo: string, mes?: string) => {
      const tipoConcepto = codigo as CodigoConcepto;
      const config = CONFIGURACION_CONCEPTOS[tipoConcepto];
      if (!config) return;

      if (config.requiereMes && (!mes || mes === "ninguno")) return;

      const count = conceptos.filter((c) =>
        c.codigo.startsWith(config.codInterno.slice(0, 3))
      ).length;

      const codigoIncremental = `${config.codInterno.slice(0, 3)}${String(
        count + 1
      ).padStart(3, "0")}`;

      const descripcion = config.requiereMes
        ? `${config.desc} - ${mes}`
        : config.desc;

      const nuevoConcepto = crearConcepto(
        codigoIncremental,
        descripcion,
        config.precioBase || 0
      );

      setConceptos((prev) => [...prev, nuevoConcepto]);
      setFormData(prev => ({
        ...prev,
        items: [nuevoConcepto]
      }))
    },
    [conceptos]
  );

  // Cambiar concepto
  const handleConceptoChange = useCallback(
    (idx: number, updated: ConceptoCobro) => {
      setConceptos((prev) => prev.map((c, i) => (i === idx ? updated : c)));
    },
    []
  );

  // Eliminar concepto
  const handleConceptoDelete = useCallback((idx: number) => {
    setConceptos((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Abrir modal de código
  const handleOpenCodigoModal = useCallback(() => {
    const dialog = document.getElementById(
      "select_codigo_modal"
    ) as HTMLDialogElement;
    dialog?.showModal();
  }, []);

  // Guardar liquidación
  const saveLiquidacion = useCallback(
    async (idSucursal: number) => {
      if (!clienteId) {
        setSaveError("No se ha seleccionado un proveedor válido");
        return false;
      }

      if (conceptos.length === 0) {
        setSaveError("Debe agregar al menos un concepto a la liquidación");
        return false;
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setSaveError("No se ha iniciado sesión");
        return false;
      }

      const subtotal = conceptos.reduce(
        (sum, concepto) => sum + (concepto.subtotal || 0),
        0
      );
      const iva = subtotal * 0.15; 
      const total = subtotal + iva;

      try {
        setSaving(true);
        setSaveError(null);

        const liquidacionData = {
          idSucursal: idSucursal,
          idUsuario: parseInt(currentUser.id),
          idProveedor: clienteId,
          valorSinImpuesto: subtotal,
          iva,
          total,
          secuencia: parseInt(formData.secuencia),
          detalles: conceptos.map((c) => ({
            descripcion: c.descripcion,
            idRazon: 1, // fijo, depende tu backend
            cantidad: c.cantidad,
            subtotal: c.subtotal,
            descuento: c.descuento,
          })),
        };

        await api.post("/liquidaciones/crear", liquidacionData);

        navigate("/junta/liquidaciones");
        return true;
      } catch (error: any) {
        console.error("Error al guardar liquidación:", error);
        setSaveError(
          error.response?.data?.message || "Error al guardar la liquidación"
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [clienteId, conceptos, formData.secuencia, navigate]
  );

  // Resetear formulario
  const resetForm = useCallback(() => {
    resetCliente();
    setFormData(initialFormState);
    setConceptos([]);
    setSaveError(null);
  }, [initialFormState, resetCliente]);

  // Modal agregar proveedor
  const [showAddClienteModal, setShowAddClienteModal] = useState(false);

  const handleAddClienteClick = useCallback(() => {
    setShowAddClienteModal(true);
  }, []);

  const handleCloseAddClienteModal = useCallback(() => {
    setShowAddClienteModal(false);
  }, []);

  const handleClienteAdded = useCallback(() => {
    setShowAddClienteModal(false);
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
    saveLiquidacion,
    resetForm,
  };
};
