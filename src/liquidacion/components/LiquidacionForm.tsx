import React, { useState } from 'react';
import { InputSlot } from '../components';
import { SelectCodigoModal } from '../modals/SelectCodigoModal';
import { PrintPreviewModal } from './Ticket';
import { LiquidacionForm as LiquidacionFormType } from '../../shared/components/interfaces/liquidacion.interface';
import { validarCedulaEcuatoriana } from '../../shared/utils/validateCedula';

interface LiquidacionFormProps {
  formData: LiquidacionFormType;
  proveedorError: string | null;
  total?: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onOpenCodigoModal: () => void;
  onConceptoSelect: (codigo: string, mes?: string) => void;
  onAddProveedor?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  saving?: boolean;
}

export const LiquidacionFormContent: React.FC<LiquidacionFormProps> = ({
  formData,
  proveedorError,
  total = 0,
  onInputChange,
  onOpenCodigoModal,
  onConceptoSelect,
  onAddProveedor,
  onSave,
  onCancel,
  saving = false
}) => {
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  const handleOpenPrintPreview = () => setIsPrintPreviewOpen(true);
  const handleClosePrintPreview = () => setIsPrintPreviewOpen(false);
  const handlePrint = () => setIsPrintPreviewOpen(false);

  const isFormValid = () => {
    return (
      validarIdentificacion(formData.cedula || '') &&
      formData.cedula?.trim() !== '' &&
      formData.cliente?.trim() !== '' &&
      formData.emision?.trim() !== '' &&
      formData.serie?.trim() !== '' &&
      formData.concepto?.trim() !== '' &&
      formData.vencimiento?.trim() !== '' &&
      formData.numero?.trim() !== '' &&
      formData.secuencia?.trim() !== '' &&
      formData.formaPago?.trim() !== '' &&
      total > 0
    );
  };

  function validarIdentificacion(identificacion: string): boolean {
    const soloNumeros = /^\d{10}$/.test(identificacion);
    const esRUC = /^\d{13}$/.test(identificacion);

    if (identificacion === '9999999999' || identificacion === '9999999999999') return true;

    if (soloNumeros) return validarCedulaEcuatoriana(identificacion);

    if (esRUC) {
      const sufijo = identificacion.slice(10);
      return identificacion.length === 13 && sufijo === '001';
    }

    return false;
  }

  return (
    <>
      <form className="grid grid-cols-3 gap-6">
        {/* Columna 1 */}
        <div className="space-y-4">
          <InputSlot label="RUC / Cédula">
            <div className="w-full">
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '').slice(0, 13);
                  const syntheticEvent = {
                    ...e,
                    target: { ...e.target, name: 'cedula', value: numericValue }
                  };
                  onInputChange(syntheticEvent);
                }}
                className={`input input-bordered w-full ${formData.cedula &&
                  (formData.cedula.length < 10 || formData.cedula.length > 13)
                  ? 'input-error border-red-500'
                  : ''}`}
                placeholder="Ingrese CI/RUC"
                minLength={10}
                maxLength={13}
              />
              {formData.cedula && formData.cedula.length > 0 && formData.cedula.length < 10 && (
                <span className="text-red-500 text-sm mt-1 block">
                  La cédula/RUC debe tener al menos 10 dígitos
                </span>
              )}
            </div>
          </InputSlot>

          <InputSlot label="Nombre">
            <input
              type="text"
              name="cliente"
              value={formData.cliente}
              onChange={onInputChange}
              className="input input-bordered w-full"
              placeholder="Razón Social"
              readOnly
            />
            <div className="flex flex-col gap-2 mt-1">
              {proveedorError && (
                <div className="text-xs text-red-500">{proveedorError}</div>
              )}
              <button
                type="button"
                onClick={onAddProveedor}
                className={`btn btn-sm btn-outline btn-primary w-full ${!proveedorError
                  ? 'btn-disabled opacity-50 pointer-events-none'
                  : ''}`}
                disabled={!proveedorError}
              >
                + Agregar Adquiriente
              </button>
            </div>
          </InputSlot>

          <InputSlot label="Código Concepto">
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
              onCancel={() => { }}
            />
          </InputSlot>
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <InputSlot label="Fecha de Emisión">
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
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '');
                const syntheticEvent = {
                  ...e,
                  target: { ...e.target, name: 'serie', value: numericValue }
                };
                onInputChange(syntheticEvent);
              }}
              className="input input-bordered w-full"
              placeholder="Serie"
            />
          </InputSlot>

          <InputSlot label="Detalle / Concepto">
            <textarea
              name="concepto"
              value={formData.concepto}
              onChange={onInputChange}
              className="textarea textarea-bordered w-full resize-none"
              placeholder="Detalle de la liquidación"
              rows={3}
            />
          </InputSlot>
        </div>

        {/* Columna 3 */}
        <div className="space-y-4">
          <InputSlot label="Fecha de Vencimiento">
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
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  const syntheticEvent = {
                    ...e,
                    target: { ...e.target, name: 'numero', value: numericValue }
                  };
                  onInputChange(syntheticEvent);
                }}
                className="input input-bordered w-full"
                placeholder="Número"
              />
            </InputSlot>

            <InputSlot label="Secuencia">
              <input
                type="text"
                name="secuencia"
                value={formData.secuencia}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  const syntheticEvent = {
                    ...e,
                    target: { ...e.target, name: 'secuencia', value: numericValue }
                  };
                  onInputChange(syntheticEvent);
                }}
                className="input input-bordered w-full"
                placeholder="Secuencia"
              />
            </InputSlot>
          </div>

          {/* Forma de Pago */}
          <InputSlot label="Forma de Pago">
            <select
              name="formaPago"
              value={formData.formaPago || ''}
              onChange={onInputChange}
              className="select select-bordered w-full"
            >
              <option value="" disabled>Seleccione una opción</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta Crédito/Débito</option>
              <option value="Otros">Otros</option>
            </select>
          </InputSlot>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4">
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
              disabled={saving}
            >
              Imprimir
            </button>
          </div>
        </div>
      </form>

      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        formData={formData}
        total={total}
        onClose={handleClosePrintPreview}
        onPrint={handlePrint}
        showVencimiento={true}
      />
    </>
  );
};
