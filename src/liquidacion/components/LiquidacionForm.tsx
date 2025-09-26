import { ChangeEvent } from "react";
import { LiquidacionForm } from "../types/liquidacion";

interface LiquidacionFormContentProps {
  formData: LiquidacionForm;
  total: number;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onAddConcepto: () => void;
  onOpenCodigoModal: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

export const LiquidacionFormContent: React.FC<LiquidacionFormContentProps> = ({
  formData,
  total,
  onInputChange,
  onAddConcepto,
  onOpenCodigoModal,
  onSave,
  onCancel,
  saving,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Identificación Proveedor</label>
          <input
            type="text"
            name="identificacionProveedor"
            value={formData.identificacionProveedor}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="0102030405"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Razón Social Proveedor</label>
          <input
            type="text"
            name="razonSocialProveedor"
            value={formData.razonSocialProveedor}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Proveedor de Prueba"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tipo Identificación</label>
          <select
            name="tipoIdentificacionProveedor"
            value={formData.tipoIdentificacionProveedor}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="05">Cédula</option>
            <option value="04">RUC</option>
            <option value="06">Pasaporte</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Dirección Establecimiento</label>
          <input
            type="text"
            name="dirEstablecimiento"
            value={formData.dirEstablecimiento}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Av. Siempre Viva 123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Dirección Proveedor (Opcional)</label>
          <input
            type="text"
            name="direccionProveedor"
            value={formData.direccionProveedor}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Av. Proveedor 123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Moneda</label>
          <select
            name="moneda"
            value={formData.moneda}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="DOLAR">Dólar</option>
            <option value="EURO">Euro</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha Emisión</label>
          <input
            type="text"
            name="fechaEmision"
            value={formData.fechaEmision}
            onChange={onInputChange}
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="DD/MM/YYYY"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Concepto</label>
          <div className="flex gap-2">
            <input
              type="text"
              value="Selecciona un concepto"
              disabled
              className="mt-1 block w-full border rounded-md p-2 bg-gray-100"
            />
            <button
              onClick={onOpenCodigoModal}
              className="mt-1 btn btn-primary"
            >
              Seleccionar
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={onAddConcepto} className="btn btn-primary">
          Agregar Concepto
        </button>
        <div className="flex gap-4">
          <button onClick={onCancel} className="btn btn-secondary" disabled={saving}>
            Cancelar
          </button>
          <button onClick={onSave} className="btn btn-primary" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};