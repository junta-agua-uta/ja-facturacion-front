import { SubTitle, Title, CardSlot } from "../../shared/components";
import { useState } from "react";
import { InputSlot } from "../components";

interface FacturaForm {
  cedula: string;
  cliente: string;
  codigo: string;
  emision: string;
  vencimiento: string;
  serie: string;
  numero: string;
  secuencia: string;
  concepto: string;
}

export default function AgregarFacturas() {
  const [formData, setFormData] = useState<FacturaForm>({
    cedula: '',
    cliente: '',
    codigo: '',
    emision: '',
    vencimiento: '',
    serie: '',
    numero: '',
    secuencia: '',
    concepto: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Title title="Facturación" />
      <SubTitle title="Servicio de Mantenimiento" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold text-gray-600">
            Facturador: <span className="font-bold text-blue-500">Jhon Doe</span>
          </p>
          <p className="text-lg font-semibold text-gray-600">
            Sucursal: <span className="font-bold text-blue-500">Junta Administradora de Agua Potable Miñarica San / Santa Rosa</span>
          </p>
        </div>

        <CardSlot>
          <form className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <InputSlot label="C.I/RUC" >
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Ingrese CI/RUC"
                />
              </InputSlot>

              <InputSlot label="Cliente" >
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Nombre del cliente"
                />
              </InputSlot>

              <InputSlot label="Código" >
                <button className="btn btn-primary w-full">
                  Seleccionar Código
                </button>
              </InputSlot>
            </div>

            <div className="space-y-4">
              <InputSlot label="Emisión" >
                <input
                  type="date"
                  name="emision"
                  value={formData.emision}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </InputSlot>

              <InputSlot label="Serie" >
                <input
                  type="text"
                  name="serie"
                  value={formData.serie}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="Serie"
                />
              </InputSlot>

              <InputSlot label="Concepto" >
                <textarea
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full resize-none"
                  placeholder="Concepto de la factura"
                  rows={3}
                />  
              </InputSlot>
            </div>

            <div className="space-y-4">
              <InputSlot label="Vencimiento" >
                <input
                  type="date"
                  name="vencimiento"
                  value={formData.vencimiento}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                />
              </InputSlot>

              <div className="grid grid-cols-2 gap-4">
                <InputSlot label="Número" >
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Número"
                  />
                </InputSlot>

                <InputSlot label="Secuencia" >
                  <input
                    type="text"
                    name="secuencia"
                    value={formData.secuencia}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                    placeholder="Secuencia"
                  />
                </InputSlot>
              </div>

              <div className="flex justify-end gap-4 pt-8">
                <button className="btn btn-outline">
                  Cancelar
                </button>
                <button className="btn btn-primary hover:bg-blue-600 hover:border-blue-600">
                  Guardar
                </button>
                <button className="btn btn-secondary">
                  Generar...
                </button>
              </div>
            </div>
          </form>
        </CardSlot>
      </div>
    </>
  );
}

