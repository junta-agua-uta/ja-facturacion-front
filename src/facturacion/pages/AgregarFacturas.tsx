import { SubTitle, Title, CardSlot } from "../../shared/components";
import { TablaConceptos } from "../components/TablaConceptos";
import { FacturaHeader } from "../components/FacturaHeader";
import { FacturaFormContent } from "../components/FacturaForm";
import { useFacturaForm } from "../hooks/useFacturaForm";
import { useBranchSelection } from "../hooks/useBranchSelection";

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

      <TablaConceptos
        conceptos={conceptos}
        onChange={handleConceptoChange}
        onDelete={handleConceptoDelete}
      />
    </>
  );
}