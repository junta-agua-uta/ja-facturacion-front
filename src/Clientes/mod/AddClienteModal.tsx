// src/components/modals/AddClienteModal.tsx
import { useState, useEffect } from "react";
import { Cliente } from "../types/cliente";

type AddClienteModalProps = {
  id: string;
  isOpen: boolean;
  cliente: Cliente;
  onChange: (cliente: Cliente) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function AddClienteModal({
  id,
  isOpen,
  cliente,
  onChange,
  onCancel,
  onSave,
}: AddClienteModalProps) {
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
  // Controlar la visibilidad del modal
  useEffect(() => {
    const dialog = document.getElementById(id) as HTMLDialogElement;
    if (isOpen) {
      dialog?.showModal();
    } else {
      dialog?.close();
    }
  }, [isOpen, id]);

  // Manejar el cierre del modal
  const handleCancel = () => {
    const dialog = document.getElementById(id) as HTMLDialogElement;
    dialog?.close();
    onCancel();
    setErrors({});
  };

  // Manejar el cierre del modal al hacer clic fuera del contenido
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <dialog 
      id={id} 
      className="modal"
      onClick={handleBackdropClick}
    >
      <div className="modal-box max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">Nuevo Cliente</h3>
        
        <form className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Cédula de Identidad </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.identificacion ? 'input-error' : ''}`}
                value={cliente.identificacion}
                onChange={(e) => {
                  // Solo permitir números y limitar a 13 caracteres
                  const value = e.target.value.replace(/\D/g, '').slice(0, 13);
                  onChange({ ...cliente, identificacion: value });
                }}
                pattern="\d{10}(\d{3})?"
                title="La identificación debe tener 10 o 13 dígitos"
                minLength={10}
                maxLength={13}
                required
              />
              {errors.identificacion && (
                <div className="text-error text-sm mt-1">{errors.identificacion}</div>
              )}
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Razón Social </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.razonSocial ? 'input-error' : ''}`}
                value={cliente.razonSocial}
                onChange={(e) => {
                  // Solo permitir letras y espacios
                  const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                  onChange({ ...cliente, razonSocial: value });
                }}
                placeholder="Distribuidora Andina Cía. Ltda."
                required
              />
              {errors.razonSocial && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.razonSocial}</span>
                </label>
              )}
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
                placeholder="Andina Market"
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Dirección </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.direccion ? 'input-error' : ''}`}
                value={cliente.direccion}
                onChange={(e) => onChange({ ...cliente, direccion: e.target.value })}
                placeholder="Calle 10 de Agosto y Bolívar"
                required
              />
              {errors.direccion && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.direccion}</span>
                </label>
              )}
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Teléfono 1 *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.telefono1 ? 'input-error' : ''}`}
                value={cliente.telefono1 || ''}
                onChange={(e) => {
                  // Solo permitir números y limitar a 10 caracteres
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  onChange({ 
                    ...cliente, 
                    telefono1: value,
                    telefonoNro1: value
                  });
                }}
                pattern="09\d{8}"
                title="El teléfono debe comenzar con 09 y tener 10 dígitos"
                maxLength={10}
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
          
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}