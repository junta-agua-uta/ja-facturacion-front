// src/components/modals/EditClienteModal.tsx
import { useState, useEffect } from "react";
import { Cliente } from "../types/cliente";

type EditClienteModalProps = {
  readonly id: string;
  readonly title: string;
  readonly cliente: Cliente | null;
  readonly onChange: (cliente: Cliente) => void;
  readonly onCancel: () => void;
  readonly onSave: () => void;
};

export function EditClienteModal({
  id,
  title,
  cliente,
  onChange,
  onCancel,
  onSave,
}: EditClienteModalProps) {
  if (!cliente) return null;
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Validate fields when they change
  useEffect(() => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate identification (10 or 13 digits)
    if (cliente.identificacion && !/^\d{10}(\d{3})?$/.test(cliente.identificacion)) {
      newErrors.identificacion = 'La identificación debe tener 10 o 13 dígitos';
    }
    
    // Validate phone (must start with 09 and be 10 digits)
    if (cliente.telefono1 && !/^09\d{8}$/.test(cliente.telefono1)) {
      newErrors.telefono1 = 'El teléfono debe comenzar con 09 y tener 10 dígitos';
    }
    
    // Validate email format
    if (cliente.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) {
      newErrors.correo = 'Ingrese un correo electrónico válido';
    }
    
    setErrors(newErrors);
  }, [cliente.identificacion, cliente.telefono1, cliente.correo]);
  
  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg">{title}</h3>
        
        <form method="dialog" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Identificación *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.identificacion ? 'input-error' : ''}`}
                value={cliente.identificacion}
                onChange={(e) => onChange({ ...cliente, identificacion: e.target.value })}
                pattern="\d{10}(\d{3})?"
                title="La identificación debe tener 10 o 13 dígitos"
                required
              />
              {errors.identificacion && (
                <div className="text-error text-sm mt-1">{errors.identificacion}</div>
              )}
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Razón Social *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.razonSocial}
                onChange={(e) => onChange({ ...cliente, razonSocial: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Nombre Comercial</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.nombreComercial || ''}
                onChange={(e) => onChange({ ...cliente, nombreComercial: e.target.value })}
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Dirección *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.direccion}
                onChange={(e) => onChange({ ...cliente, direccion: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Teléfono 1 *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.telefono1 ? 'input-error' : ''}`}
                value={cliente.telefono1 || ''}
                onChange={(e) => onChange({ 
                  ...cliente, 
                  telefono1: e.target.value,
                  telefonoNro1: e.target.value
                })}
                pattern="09\d{8}"
                title="El teléfono debe comenzar con 09 y tener 10 dígitos"
                required
              />
              {errors.telefono1 && (
                <div className="text-error text-sm mt-1">{errors.telefono1}</div>
              )}
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Correo Electrónico *</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${errors.correo ? 'input-error' : ''}`}
                value={cliente.correo || ''}
                onChange={(e) => onChange({ 
                  ...cliente, 
                  correo: e.target.value,
                  correoElectronico: e.target.value
                })}
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                title="Ingrese un correo electrónico válido"
                required
              />
              {errors.correo && (
                <div className="text-error text-sm mt-1">{errors.correo}</div>
              )}
            </div>
          </div>
          
          <div className="modal-action flex gap-2">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                onCancel();
                (document.getElementById(id) as HTMLDialogElement)?.close();
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onSave();
              }}
              disabled={!cliente.identificacion || !cliente.razonSocial || !cliente.direccion || !cliente.telefono1 || !cliente.correo || Object.keys(errors).length > 0}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}