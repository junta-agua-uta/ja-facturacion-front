import React, { useState } from 'react';
import { InputSlot } from '../components';
import { SelectCodigoModal } from '../modals/SelectCodigoModal';
import { PrintPreviewModal } from './Ticket';
import { FacturaForm as FacturaFormType } from '../../shared/components/interfaces/factura.interface';

interface FacturaFormProps {
  formData: FacturaFormType;
  clienteError: string | null;
  total?: number; // Agregamos el total como prop
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenCodigoModal: () => void;
  onConceptoSelect: (codigo: string, mes?: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
}

export const FacturaFormContent: React.FC<FacturaFormProps> = ({
  formData,
  clienteError,
  total = 0,
  onInputChange,
  onOpenCodigoModal,
  onConceptoSelect,
  onSave,
  onCancel,
  saving = false
}) => {
  // Estado para controlar el modal de vista previa
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  const handleClosePrintPreview = () => {
    setIsPrintPreviewOpen(false);
  };

  const handlePrint = () => {
    // Aquí puedes agregar lógica adicional después de imprimir si es necesario
    console.log('Documento enviado a imprimir');
    setIsPrintPreviewOpen(false);
  };

  // Función para verificar si todos los campos están llenos
  const isFormValid = () => {
    return (
      formData.cedula?.trim() !== '' &&
      formData.cliente?.trim() !== '' &&
      formData.emision?.trim() !== '' &&
      formData.serie?.trim() !== '' &&
      formData.concepto?.trim() !== '' &&
      formData.vencimiento?.trim() !== '' &&
      formData.numero?.trim() !== '' &&
      formData.secuencia?.trim() !== '' &&
      total > 0
    );
  };

  return (
    <>
      <form className="grid grid-cols-3 gap-6">
        {/* Primera columna */}
        <div className="space-y-4">
          <InputSlot label="C.I/RUC">
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={onInputChange}
              className="input input-bordered w-full"
              placeholder="Ingrese CI/RUC"
            />
          </InputSlot>

          <InputSlot label="Cliente">
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={onInputChange}
              className="input input-bordered w-full"
              placeholder="Nombre del cliente"
              readOnly
            />
            {clienteError && (
              <div className="text-xs text-red-500 mt-1">{clienteError}</div>
            )}
          </InputSlot>

          <InputSlot label="Código">
            <div className="flex">
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={onOpenCodigoModal}
              >
                Seleccionar Código
              </button>
            </div>
            <SelectCodigoModal
              id="select_codigo_modal"
              onSelect={onConceptoSelect}
              onCancel={() => {}}
            />
          </InputSlot>
        </div>

        {/* Segunda columna */}
        <div className="space-y-4">
          <InputSlot label="Emisión">
            <input
              type="date"
              name="emision"
              value={formData.emision}
              onChange={onInputChange}
              className="input input-bordered w-full"
            />
          </InputSlot>

          <InputSlot label="Serie">
            <input
              type="text"
              name="serie"
              value={formData.serie}
              onChange={onInputChange}
              className="input input-bordered w-full"
              placeholder="Serie"
            />
          </InputSlot>

          <InputSlot label="Concepto">
            <textarea
              name="concepto"
              value={formData.concepto}
              onChange={onInputChange}
              className="textarea textarea-bordered w-full resize-none"
              placeholder="Concepto de la factura"
              rows={3}
            />
          </InputSlot>
        </div>

        {/* Tercera columna */}
        <div className="space-y-4">
          <InputSlot label="Vencimiento">
            <input
              type="date"
              name="vencimiento"
              value={formData.vencimiento}
              onChange={onInputChange}
              className="input input-bordered w-full"
            />
          </InputSlot>

          <div className="grid grid-cols-2 gap-4">
            <InputSlot label="Número">
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={onInputChange}
                className="input input-bordered w-full"
                placeholder="Número"
              />
            </InputSlot>

            <InputSlot label="Secuencia">
              <input
                type="text"
                name="secuencia"
                value={formData.secuencia}
                onChange={onInputChange}
                className="input input-bordered w-full"
                placeholder="Secuencia"
              />
            </InputSlot>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-8">
            <button 
              className="btn btn-outline" 
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary hover:bg-blue-600 hover:border-blue-600" 
              type="button"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                  Guardando...
                </>
              ) : 'Guardar'}
            </button>
            <button 
              className={`btn btn-secondary ${!isFormValid() ? 'btn-disabled' : ''}`}
              type="button"
              onClick={handleOpenPrintPreview}
              disabled={saving }
            >
              Generar...
            </button>
          </div>
        </div>
      </form>

      {/* Modal de vista previa para imprimir */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        formData={formData}
        total={total}
        onClose={handleClosePrintPreview}
        onPrint={handlePrint}
      />
    </>
  );
};