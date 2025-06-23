import React, { useState } from 'react';
import { InputSlot } from '../components';
import { SelectCodigoModal } from '../modals/SelectCodigoModal';
import { PrintPreviewModal } from './Ticket';
import { FacturaForm as FacturaFormType } from '../../shared/components/interfaces/factura.interface';
import { validarCedulaEcuatoriana } from '../../shared/utils/validateCedula';

interface FacturaFormProps {
  formData: FacturaFormType;
  clienteError: string | null;
  total?: number; // Agregamos el total como prop
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenCodigoModal: () => void;
  onConceptoSelect: (codigo: string, mes?: string) => void;
  onAddCliente?: () => void;
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
  onAddCliente,
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
    setIsPrintPreviewOpen(false);
  };

  // Función para verificar si todos los campos están llenos
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
      total > 0
    );
  };

  //Funcion para validar el RUC
  function validarIdentificacion(identificacion: string): boolean {
    const soloNumeros = /^\d{10}$/.test(identificacion);
    const esRUC = /^\d{13}$/.test(identificacion);

    if (identificacion === '9999999999' || identificacion === '9999999999999') {
      return true;
    }

    if (soloNumeros) {
      return validarCedulaEcuatoriana(identificacion);
    }

    if (esRUC) {
      const sufijo = identificacion.slice(10);
      return identificacion.length == 13 && sufijo === '001';
    }

    return false;
  }


  return (
    <>
      <form className="grid grid-cols-3 gap-6">
        {/* Primera columna */}
        <div className="space-y-4">
          <InputSlot label="C.I/RUC">
            <div className="w-full">
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permitir números
                  const numericValue = value.replace(/\D/g, '');
                  // Limitar a máximo 13 caracteres
                  const limitedValue = numericValue.slice(0, 13);

                  // Crear evento sintético con el valor validado
                  const syntheticEvent = {
                    ...e,
                    target: {
                      ...e.target,
                      name: 'cedula',
                      value: limitedValue
                    }
                  };

                  onInputChange(syntheticEvent);
                }}
                className={`input input-bordered w-full ${formData.cedula && (formData.cedula.length < 10 || formData.cedula.length > 13)
                  ? 'input-error border-red-500'
                  : ''
                  }`}
                placeholder="Ingrese CI/RUC (10-13 dígitos)"
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
            <div className="flex flex-col gap-2 mt-1">
              {clienteError && (
                <div className="text-xs text-red-500">{clienteError}</div>
              )}
              <button
                type="button"
                onClick={onAddCliente}
                className={`btn btn-sm btn-outline btn-primary w-full ${!clienteError ? 'btn-disabled opacity-50 pointer-events-none' : ''
                  }`}
                disabled={!clienteError}
              >
                + Agregar Cliente
              </button>
            </div>
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
              onCancel={() => { }}
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
              onChange={(e) => {
                const value = e.target.value;
                const numericValue = value.replace(/\D/g, '');
                const syntheticEvent = {
                  ...e,
                  target: {
                    ...e.target,
                    name: 'serie',
                    value: numericValue
                  }
                };
                onInputChange(syntheticEvent);
              }}
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
                onChange={(e) => {
                  const value = e.target.value;
                  const numericValue = value.replace(/\D/g, '');
                  const syntheticEvent = {
                    ...e,
                    target: {
                      ...e.target,
                      name: 'numero',
                      value: numericValue
                    }
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
                  const value = e.target.value;
                  const numericValue = value.replace(/\D/g, '');
                  const syntheticEvent = {
                    ...e,
                    target: {
                      ...e.target,
                      name: 'secuencia',
                      value: numericValue
                    }
                  };
                  onInputChange(syntheticEvent);
                }}
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
              disabled={saving}
            >
              Imprimir
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