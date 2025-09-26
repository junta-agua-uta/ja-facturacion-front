import { useState, useCallback } from "react";
import { LiquidacionForm, ConceptoCobro, crearConcepto } from "../types/liquidacion";
import api from "../../shared/api";
import { authService } from "../../auth/Services/auth.service";
import { useNavigate } from "react-router-dom";

// Definir la interfaz para el tipo de retorno del hook
interface UseLiquidacionFormReturn {
  formData: LiquidacionForm;
  conceptos: ConceptoCobro[];
  saving: boolean;
  saveError: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleConceptoChange: (idx: number, updated: ConceptoCobro) => void;
  handleConceptoDelete: (idx: number) => void;
  handleAddConcepto: () => void;
  handleOpenCodigoModal: () => void;
  saveLiquidacion: (idSucursal: number) => Promise<boolean>;
  resetForm: () => void;
}

export const useLiquidacionForm = (): UseLiquidacionFormReturn => {
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`; // Formato DD/MM/YYYY
  };

  const initialFormState: LiquidacionForm = {
    fechaEmision: getCurrentDate(),
    dirEstablecimiento: "",
    tipoIdentificacionProveedor: "05",
    razonSocialProveedor: "",
    identificacionProveedor: "",
    moneda: "DOLAR",
    direccionProveedor: "",
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LiquidacionForm>(initialFormState);
  const [conceptos, setConceptos] = useState<ConceptoCobro[]>([]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleConceptoChange = useCallback(
    (idx: number, updated: ConceptoCobro) => {
      setConceptos((prev) => prev.map((c, i) => (i === idx ? updated : c)));
    },
    []
  );

  const handleConceptoDelete = useCallback((idx: number) => {
    setConceptos((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAddConcepto = useCallback(() => {
    const nuevoConcepto = crearConcepto(
      `PROD${String(conceptos.length + 1).padStart(3, "0")}`,
      "Producto de ejemplo"
    );
    setConceptos((prev) => [...prev, nuevoConcepto]);
  }, [conceptos]);

  const handleOpenCodigoModal = useCallback(() => {
    const dialog = document.getElementById("select_codigo_modal") as HTMLDialogElement;
    dialog?.showModal();
  }, []);

  const saveLiquidacion = useCallback(
    async (idSucursal: number) => {
      if (!formData.identificacionProveedor) {
        setSaveError("Debe ingresar la identificación del proveedor");
        return false;
      }
      if (!formData.razonSocialProveedor) {
        setSaveError("Debe ingresar la razón social del proveedor");
        return false;
      }
      if (!formData.dirEstablecimiento) {
        setSaveError("Debe ingresar la dirección del establecimiento");
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

      const totalSinImpuestos = conceptos.reduce(
        (sum, c) => sum + c.precioTotalSinImpuesto,
        0
      );
      const totalDescuento = conceptos.reduce(
        (sum, c) => sum + c.descuento * c.cantidad,
        0
      );
      const importeTotal = conceptos.reduce(
        (sum, c) => sum + c.precioTotalSinImpuesto + c.valorImpuesto,
        0
      );

      const liquidacionData = {
        infoLiquidacionCompra: {
          fechaEmision: formData.fechaEmision,
          dirEstablecimiento: formData.dirEstablecimiento,
          tipoIdentificacionProveedor: formData.tipoIdentificacionProveedor,
          razonSocialProveedor: formData.razonSocialProveedor,
          identificacionProveedor: formData.identificacionProveedor,
          totalSinImpuestos,
          totalDescuento,
          importeTotal,
          moneda: formData.moneda,
          direccionProveedor: formData.direccionProveedor || undefined,
        },
        detalles: conceptos.map((c) => ({
          codigoPrincipal: c.codigoPrincipal,
          codigoAuxiliar: c.codigoAuxiliar || undefined,
          descripcion: c.descripcion,
          unidadMedida: c.unidadMedida || undefined,
          cantidad: c.cantidad,
          precioUnitario: c.precioUnitario,
          descuento: c.descuento,
          precioTotalSinImpuesto: c.precioTotalSinImpuesto,
          codigoImpuesto: c.codigoImpuesto,
          codigoPorcentajeImpuesto: c.codigoPorcentajeImpuesto,
          tarifaImpuesto: c.tarifaImpuesto,
          baseImponible: c.baseImponible,
          valorImpuesto: c.valorImpuesto,
        })),
      };

      try {
        setSaving(true);
        setSaveError(null);
        await api.post("/liquidacion-compra/crear", liquidacionData);
        navigate("/junta/liquidaciones");
        return true;
      } catch (error: any) {
        console.error("Error al guardar liquidación:", error);
        setSaveError(error.response?.data?.message || "Error al guardar la liquidación");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [formData, conceptos, navigate]
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setConceptos([]);
    setSaveError(null);
  }, []);

  return {
    formData,
    conceptos,
    saving,
    saveError,
    handleInputChange,
    handleConceptoChange,
    handleConceptoDelete,
    handleAddConcepto,
    handleOpenCodigoModal,
    saveLiquidacion,
    resetForm,
  };
};