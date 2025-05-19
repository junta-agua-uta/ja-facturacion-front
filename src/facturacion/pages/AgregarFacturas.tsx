import { SubTitle, Title, CardSlot } from "../../shared/components";
import { TablaConceptos } from "../components/TablaConceptos";
import { FacturaHeader } from "../components/FacturaHeader";
import { FacturaFormContent } from "../components/FacturaForm";
import { useFacturaForm } from "../hooks/useFacturaForm";
import { useBranchSelection } from "../hooks/useBranchSelection";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function AgregarFacturas() {
  // IMPORTANTE: Todos los hooks deben llamarse en el mismo orden en cada renderizado
  // 1. Hooks de React
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. Hooks personalizados
  // Usar los hooks personalizados para manejar el estado y la lógica
  const {
    formData,
    conceptos,
    clienteError,
    saving,
    saveError,
    handleInputChange,
    handleConceptoSelect,
    handleConceptoChange,
    handleConceptoDelete,
    handleOpenCodigoModal,
    saveFactura
  } = useFacturaForm();

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
  }, [branches, loadingBranches, selectedBranch, handleBranchChange]);

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
    navigate('/junta/facturas');
  };

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
          facturador="Jhon Doe"
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
            onInputChange={handleInputChange}
            onOpenCodigoModal={handleOpenCodigoModal}
            onConceptoSelect={handleConceptoSelect}
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
              </div>
            </CardSlot>
          </div>
        </div>
      </div>
    </>
  );
}