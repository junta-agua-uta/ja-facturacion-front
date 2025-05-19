import { SubTitle, Title, CardSlot } from "../../shared/components";
import { TablaConceptos } from "../components/TablaConceptos";
import { FacturaHeader } from "../components/FacturaHeader";
import { FacturaFormContent } from "../components/FacturaForm";
import { useFacturaForm } from "../hooks/useFacturaForm";
import { useBranchSelection } from "../hooks/useBranchSelection";
import { useMemo } from "react";

export default function AgregarFacturas() {
  // Usar los hooks personalizados para manejar el estado y la lógica
  const {
    formData,
    conceptos,
    clienteError,
    handleInputChange,
    handleConceptoSelect,
    handleConceptoChange,
    handleConceptoDelete,
    handleOpenCodigoModal
  } = useFacturaForm();

  // Usar el hook para manejar la selección de sucursales
  const {
    branches,
    selectedBranch,
    loadingBranches,
    branchesError,
    handleBranchChange
  } = useBranchSelection();

  // Calcular totales
  const { subtotal, iva, total } = useMemo(() => {
    const sub = conceptos.reduce((sum, concepto) => sum + (concepto.subtotal || 0), 0);
    const ivaCalculado = conceptos.reduce((sum, concepto) => sum + (concepto.iva || 0), 0);
    return {
      subtotal: sub,
      iva: ivaCalculado,
      total: sub + ivaCalculado
    };
  }, [conceptos]);

  return (
    <>
      <Title title="Facturación" />
      <SubTitle title="Servicio de Mantenimiento" />

      <div className="space-y-6">
        {/* Información del facturador */}
        <FacturaHeader
          facturador="Jhon Doe"
          branches={branches}
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          loadingBranches={loadingBranches}
          branchesError={branchesError}
        />

        {/* Formulario principal */}
        <CardSlot>
          <FacturaFormContent
            formData={formData}
            clienteError={clienteError}
            onInputChange={handleInputChange}
            onOpenCodigoModal={handleOpenCodigoModal}
            onConceptoSelect={handleConceptoSelect}
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
                  <div className="flex justify-between">
                    <span>IVA (15%):</span>
                    <span>${iva.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                {/* <button 
                  className="btn btn-primary w-full mt-4"
                  disabled={conceptos.length === 0}
                >
                  Generar Factura
                </button> */}
              </div>
            </CardSlot>
          </div>
        </div>
      </div>
    </>
  );
}