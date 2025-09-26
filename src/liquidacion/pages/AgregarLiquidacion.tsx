import { SubTitle, Title, CardSlot } from "../../shared/components";
import { TablaConceptos } from "../components/TablaConceptos";
import { LiquidacionHeader } from "../components/LiquidacionHeader";
import { LiquidacionFormContent } from "../components/LiquidacionForm";
import { useLiquidacionForm } from "../hooks/useLiquidacionForm";
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../shared/api";
import { authService } from "../../auth/Services/auth.service";
import { useBranchSelection } from "../hooks/useBranchSelection";

export default function AgregarLiquidacion() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState("Usuario");

  const {
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
  } = useLiquidacionForm();

  const {
    branches,
    selectedBranch,
    loadingBranches,
    branchesError,
    handleBranchChange,
  } = useBranchSelection();

  useEffect(() => {
    if (!loadingBranches && branches.length > 0 && !selectedBranch) {
      const event = {
        target: { value: branches[0].id },
      } as React.ChangeEvent<HTMLSelectElement>;
      handleBranchChange(event);
    }
  }, [branches, loadingBranches, selectedBranch, handleBranchChange]);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const response = await api.get("/auth/me");
          if (response.data) {
            const nombreCompleto = `${response.data.NOMBRE} ${response.data.APELLIDO}`.trim();
            setUserName(nombreCompleto || "Usuario");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSaveLiquidacion = async () => {
    setErrorMessage(null);
    if (!selectedBranch && branches.length > 0) {
      const event = {
        target: { value: branches[0].id },
      } as React.ChangeEvent<HTMLSelectElement>;
      handleBranchChange(event);
    } else if (!selectedBranch) {
      setErrorMessage("Debe seleccionar una sucursal");
      return;
    }

    const selectedBranchObj = branches.find((branch) => branch.id === selectedBranch);
    if (!selectedBranchObj) {
      setErrorMessage("Sucursal no válida");
      return;
    }

    const success = await saveLiquidacion(parseInt(selectedBranchObj.id));
    if (!success && saveError) {
      setErrorMessage(saveError);
    }
  };

  const handleCancel = () => {
    resetForm();
    setErrorMessage(null);
  };

  const { subtotal, descuentoTotal, total } = useMemo(() => {
    const subtotalSinDescuento = conceptos.reduce(
      (sum, concepto) => sum + concepto.precioUnitario * concepto.cantidad,
      0
    );
    const descuento = conceptos.reduce(
      (sum, concepto) => sum + concepto.descuento * concepto.cantidad,
      0
    );
    const totalConImpuestos = conceptos.reduce(
      (sum, concepto) => sum + concepto.precioTotalSinImpuesto + concepto.valorImpuesto,
      0
    );

    return {
      subtotal: subtotalSinDescuento,
      descuentoTotal: descuento,
      total: totalConImpuestos,
    };
  }, [conceptos]);

  return (
    <>
      <Link
        to="/junta/liquidacion"
        className="inline-flex items-center gap-2 text-white btn btn-primary hover:bg-blue-600 hover:border-blue-600"
      >
        <FaArrowLeft />
        Regresar
      </Link>
      <Title title="Liquidación de Compras" />
      <SubTitle title="Gestión de Proveedores y Compras" />

      <div className="space-y-6">
        <LiquidacionHeader
          liquidador={userName}
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          loadingBranches={loadingBranches}
          branchesError={branchesError}
        />

        <CardSlot>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          <LiquidacionFormContent
            formData={formData}
            total={total}
            onInputChange={handleInputChange}
            onAddConcepto={handleAddConcepto}
            onOpenCodigoModal={handleOpenCodigoModal}
            onSave={handleSaveLiquidacion}
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
                <h3 className="text-lg font-semibold">Resumen de Liquidación</h3>
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

      <dialog id="select_codigo_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Agregar Concepto</h3>
          <p className="py-4">Haz clic en "Agregar Concepto" para añadir un nuevo concepto manualmente.</p>
          <div className="modal-action">
            <button onClick={handleAddConcepto} className="btn btn-primary">
              Agregar Concepto
            </button>
            <button
              onClick={() => {
                const dialog = document.getElementById("select_codigo_modal") as HTMLDialogElement;
                dialog?.close();
              }}
              className="btn btn-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};