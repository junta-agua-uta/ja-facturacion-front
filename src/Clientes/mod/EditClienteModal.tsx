// src/components/modals/EditClienteModal.tsx
import { useState, useEffect } from "react";
import { Cliente } from "../types/cliente";
import { validarCedulaEcuatoriana } from "../../shared/utils/validateCedula";


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
  const [errors, setErrors] = useState({
    telefono1: "",
    telefono2: "",
    correo: "",
    razonSocial: "",
    direccion: "",
    identificacion: ""
  });

  // Resetear errores cuando cambie el cliente
  useEffect(() => {
    if (cliente) {
      setErrors({
        telefono1: "",
        telefono2: "",
        correo: "",
        razonSocial: "",
        direccion: "",
        identificacion: ""
      });
    }
  }, [cliente]);

  // Validate fields when they change
  useEffect(() => {
    if (!cliente) return;
    
    // Inicializar con valores vacíos
    const newErrors = {
      telefono1: "",
      telefono2: "",
      correo: "",
      razonSocial: "",
      direccion: "",
      identificacion: ""
    };
    
    // Validate phone (must start with 09 and be 10 digits)
    if (cliente.telefono1 && !/^09\d{8}$/.test(cliente.telefono1)) {
      newErrors.telefono1 = 'El teléfono debe comenzar con 09 y tener 10 dígitos';
    }
    
    // Validate email format
    if (cliente.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) {
      newErrors.correo = 'Ingrese un correo electrónico válido';
    }

    // Validar identificación si tiene 10 digitos sino comprobar con 13
    const id = cliente.identificacion;
    if (id.length === 10) {
      if (!validarCedulaEcuatoriana(id)) {
        newErrors.identificacion = 'Cédula de identidad inválida';
      }
    } else if (id.length === 13) {
      if (!/^\d{13}$/.test(id)) {
        newErrors.identificacion = 'La identificación debe tener 10 o 13 dígitos';
      }
    } else {
      newErrors.identificacion = 'La identificación debe tener 10 o 13 dígitos';
    }
    
    setErrors(newErrors);
  }, [cliente, cliente?.telefono1, cliente?.correo]);
  
  if (!cliente) return null;
  
  
  
  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg">{title}</h3>
        
        <form className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Cédula de Identidad *</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
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
                readOnly
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
                onChange={(e) => {
                  // Solo permitir letras y espacios
                  const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                  onChange({ ...cliente, razonSocial: value });
                }}
                placeholder="Distribuidora Andina Cía. Ltda."
                readOnly
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
                placeholder="Andina Market"
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
                placeholder="Calle 10 de Agosto y Bolívar"
                required
              />
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Teléfono 1 *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full`}
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
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Correo Electrónico *</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full`}
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
              disabled={!cliente.identificacion || !cliente.razonSocial || !cliente.direccion || !cliente.telefono1 || !cliente.correo || Object.values(errors).some(error => error !== "")}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}