import { SubTitle, Title, CardSlot } from "../../shared/components";
import { useState, useEffect } from "react";
import { InputSlot } from "../components";
import api from '../../shared/api';
import { FacturaForm } from "../../shared/components/interfaces/factura.interface";
import { Branch } from "../../sucursales/types/sucursal";


export default function AgregarFacturas() {
  const [formData, setFormData] = useState<FacturaForm>({
    cedula: '',
    cliente: '',
    codigo: '',
    emision: '',
    vencimiento: '',
    serie: '001',
    numero: '300',
    secuencia: '000001219',
    concepto: ''
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [loadingBranches, setLoadingBranches] = useState<boolean>(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true);
      setBranchesError(null);
      try {
        const response = await api.get('/sucursales');
        const data = response.data;
        const mappedBranches = data.data.map((branch: any) => ({
          id: branch.ID.toString(),
          nombre: branch.NOMBRE,
          ubicacion: branch.UBICACION,
          puntoEmision: branch.PUNTO_EMISION,
        }));
        setBranches(mappedBranches);
        if (mappedBranches.length > 0) {
          setSelectedBranch(mappedBranches[0].id);
        }
      } catch (error) {
        setBranchesError("No se pudo cargar la lista de sucursales");
      } finally {
        setLoadingBranches(false);
      }
    };
    fetchBranches();
  }, []);

  // Debounce timeout para búsqueda de cliente por cédula
  const [cedulaTimeout, setCedulaTimeout] = useState<ReturnType<typeof setTimeout>| null>(null);
  const [clienteError, setClienteError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si el campo editado es la cédula, buscar el cliente automáticamente
    if (name === 'cedula') {
      setClienteError(null);
      // Limpiar timeout anterior
      if (cedulaTimeout) clearTimeout(cedulaTimeout);
      // Solo buscar si la cédula tiene al menos 10 caracteres
      if (value.length >= 10) {
        const timeout = setTimeout(async () => {
          try {
            const response = await api.get(`/clientes/buscarCedula`, { params: { cedula: value } });
            const clientes = response.data;
            if (Array.isArray(clientes) && clientes.length > 0 && clientes[0].RAZON_SOCIAL) {
              setFormData(prev => ({ ...prev, cliente: clientes[0].RAZON_SOCIAL }));
            } else {
              setFormData(prev => ({ ...prev, cliente: '' }));
              setClienteError('Cliente no encontrado');
            }
          } catch (error) {
            setFormData(prev => ({ ...prev, cliente: '' }));
            setClienteError('Error al buscar cliente');
          }
        }, 500); // 500ms debounce
        setCedulaTimeout(timeout);
      } else {
        setFormData(prev => ({ ...prev, cliente: '' }));
      }
    }
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
          <div className="text-lg font-semibold text-gray-600 flex items-center gap-2">
            Sucursal:
            {loadingBranches ? (
              <span className="text-blue-500 font-bold">Cargando...</span>
            ) : branchesError ? (
              <span className="text-red-500 font-bold">{branchesError}</span>
            ) : (
              <select
                className="select select-bordered font-bold text-blue-500"
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
              >
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
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
                  readOnly
                />
                {clienteError && (
                  <div className="text-xs text-red-500 mt-1">{clienteError}</div>
                )}
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

