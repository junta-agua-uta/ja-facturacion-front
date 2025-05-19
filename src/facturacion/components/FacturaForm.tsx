import React from 'react';
import { InputSlot } from '../components';
import { SelectCodigoModal } from '../modals/SelectCodigoModal';
import { FacturaForm as FacturaFormType } from '../../shared/components/interfaces/factura.interface';

interface FacturaFormProps {
  formData: FacturaFormType;
  clienteError: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenCodigoModal: () => void;
  onConceptoSelect: (codigo: string, mes?: string) => void;
}

export const FacturaFormContent: React.FC<FacturaFormProps> = ({
  formData,
  clienteError,
  onInputChange,
  onOpenCodigoModal,
  onConceptoSelect
}) => {
  return (
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
          <button className="btn btn-outline" type="button">
            Cancelar
          </button>
          <button className="btn btn-primary hover:bg-blue-600 hover:border-blue-600" type="button">
            Guardar
          </button>
          <button className="btn btn-secondary" type="button">
            Generar...
          </button>
        </div>
      </div>
    </form>
  );
};
