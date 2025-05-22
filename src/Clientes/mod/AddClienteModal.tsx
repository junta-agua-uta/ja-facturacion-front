// src/components/modals/AddClienteModal.tsx
import { Cliente } from "../types/cliente";
import { useState } from "react";

type AddClienteModalProps = {
  id: string;
  cliente: Cliente;
  onChange: (cliente: Cliente) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function AddClienteModal({
  id,
  cliente,
  onChange,
  onCancel,
  onSave,
}: AddClienteModalProps) {
  const [errors, setErrors] = useState({
    cedula: "",
    telefono1: "",
    telefono2: "",
    correo: "",
    razonSocial: "",
    direccion: ""
  });

  // Función para validar cédula ecuatoriana
  const validarCedulaEcuatoriana = (cedula: string): boolean => {
    // Verificar que tenga 10 dígitos
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }

    // Los dos primeros dígitos deben estar entre 01 y 24 (provincias de Ecuador)
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      return false;
    }

    // El tercer dígito debe ser menor a 6 (para personas naturales)
    const tercerDigito = parseInt(cedula.charAt(2));
    if (tercerDigito >= 6) {
      return false;
    }

    // Algoritmo de validación del dígito verificador
    const digitos = cedula.split('').map(Number);
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let producto = digitos[i] * coeficientes[i];
      if (producto >= 10) {
        producto = producto - 9;
      }
      suma += producto;
    }

    const digitoVerificador = digitos[9];
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === digitoVerificador;
  };

  // Función para validar teléfonos ecuatorianos
  const validarTelefonoEcuatoriano = (telefono: string): boolean => {
    if (!telefono) return true; // Campo opcional
    
    // Remover espacios y caracteres especiales
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que tenga 10 dígitos y empiece con 0
    if (!/^0\d{9}$/.test(telefonoLimpio)) {
      return false;
    }

    // Verificar que sea celular (09) o convencional (02-07)
    const prefijo = telefonoLimpio.substring(0, 2);
    const prefijosValidos = ['02', '03', '04', '05', '06', '07', '09'];
    
    return prefijosValidos.includes(prefijo);
  };

  // Función para validar correo electrónico
  const validarCorreo = (correo: string): boolean => {
    if (!correo) return true; // Campo opcional
    
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(correo);
  };

  // Función para manejar cambios en el campo de identificación
  const handleIdentificacionChange = (value: string) => {
    // Solo permitir números
    const soloNumeros = value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    const cedulaLimitada = soloNumeros.slice(0, 10);
    
    // Actualizar el cliente
    onChange({ ...cliente, identificacion: cedulaLimitada });
    
    // Validar
    let errorCedula = "";
    if (cedulaLimitada.length === 0) {
      errorCedula = "La cédula es obligatoria";
    } else if (cedulaLimitada.length < 10) {
      errorCedula = "La cédula debe tener 10 dígitos";
    } else if (!validarCedulaEcuatoriana(cedulaLimitada)) {
      errorCedula = "La cédula ingresada no es válida";
    }
    
    setErrors(prev => ({ ...prev, cedula: errorCedula }));
  };

  // Función para manejar cambios en teléfonos
  const handleTelefonoChange = (field: 'telefono1' | 'telefono2', value: string) => {
    // Solo permitir números y algunos caracteres especiales
    const valorLimpio = value.replace(/[^\d\s\-\(\)]/g, '');
    
    // Limitar a 15 caracteres (incluyendo espacios y guiones)
    const valorLimitado = valorLimpio.slice(0, 15);
    
    // Actualizar el cliente
    if (field === 'telefono1') {
      onChange({ 
        ...cliente, 
        telefono1: valorLimitado,
        telefonoNro1: valorLimitado
      });
    } else {
      onChange({ 
        ...cliente, 
        telefono2: valorLimitado,
        telefonoNro2: valorLimitado
      });
    }
    
    // Validar
    let errorTelefono = "";
    if (valorLimitado && !validarTelefonoEcuatoriano(valorLimitado)) {
      errorTelefono = "Formato inválido. Debe tener 10 dígitos y empezar con 0";
    }
    
    setErrors(prev => ({ 
      ...prev, 
      [field]: errorTelefono 
    }));
  };

  // Función para manejar cambios en el correo
  const handleCorreoChange = (value: string) => {
    // Actualizar el cliente
    onChange({ 
      ...cliente, 
      correo: value,
      correoElectronico: value
    });
    
    // Validar
    let errorCorreo = "";
    if (value && !validarCorreo(value)) {
      errorCorreo = "Formato de correo electrónico inválido";
    }
    
    setErrors(prev => ({ ...prev, correo: errorCorreo }));
  };

  // Función para manejar cambios en razón social
  const handleRazonSocialChange = (value: string) => {
    onChange({ ...cliente, razonSocial: value });
    
    let errorRazonSocial = "";
    if (!value.trim()) {
      errorRazonSocial = "La razón social es obligatoria";
    } else if (value.trim().length < 3) {
      errorRazonSocial = "La razón social debe tener al menos 3 caracteres";
    }
    
    setErrors(prev => ({ ...prev, razonSocial: errorRazonSocial }));
  };

  // Función para manejar cambios en dirección
  const handleDireccionChange = (value: string) => {
    onChange({ ...cliente, direccion: value });
    
    let errorDireccion = "";
    if (!value.trim()) {
      errorDireccion = "La dirección es obligatoria";
    } else if (value.trim().length < 5) {
      errorDireccion = "La dirección debe tener al menos 5 caracteres";
    }
    
    setErrors(prev => ({ ...prev, direccion: errorDireccion }));
  };

  const isFormValid = () => {
    return cliente.identificacion && 
           cliente.razonSocial && 
           cliente.direccion && 
           cliente.identificacion.length === 10 && 
           validarCedulaEcuatoriana(cliente.identificacion) &&
           cliente.razonSocial.trim().length >= 3 &&
           cliente.direccion.trim().length >= 5 &&
           (!cliente.telefono1 || validarTelefonoEcuatoriano(cliente.telefono1)) &&
           (!cliente.telefono2 || validarTelefonoEcuatoriano(cliente.telefono2)) &&
           (!cliente.correo || validarCorreo(cliente.correo)) &&
           !Object.values(errors).some(error => error !== "");
  };

  const resetErrors = () => {
    setErrors({
      cedula: "",
      telefono1: "",
      telefono2: "",
      correo: "",
      razonSocial: "",
      direccion: ""
    });
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg">Nuevo Cliente</h3>
        
        <form className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Cédula de Identidad </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.cedula ? 'input-error' : ''}`}
                value={cliente.identificacion}
                onChange={(e) => handleIdentificacionChange(e.target.value)}
                placeholder="1809876543"
                maxLength={10}
                required
              />
              {errors.cedula && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.cedula}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  Cédula ecuatoriana válida 
                </span>
              </label>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Razón Social </span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.razonSocial ? 'input-error' : ''}`}
                value={cliente.razonSocial}
                onChange={(e) => handleRazonSocialChange(e.target.value)}
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
                onChange={(e) => handleDireccionChange(e.target.value)}
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
                <span className="label-text">Teléfono 1</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.telefono1 ? 'input-error' : ''}`}
                value={cliente.telefono1 || ''}
                onChange={(e) => handleTelefonoChange('telefono1', e.target.value)}
                placeholder="0981122334"
                maxLength={15}
              />
              {errors.telefono1 && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.telefono1}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  {/* Formato: 09XXXXXXXX o 0XXXXXXXX */}
                </span>
              </label>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Teléfono 2</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.telefono2 ? 'input-error' : ''}`}
                value={cliente.telefono2 || ''}
                onChange={(e) => handleTelefonoChange('telefono2', e.target.value)}
                placeholder="0977665544"
                maxLength={15}
              />
              {errors.telefono2 && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.telefono2}</span>
                </label>
              )}
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  {/* Formato: 09XXXXXXXX o 0XXXXXXXX */}
                </span>
              </label>
            </div>
            
            <div>
              <label className="label">
                <span className="label-text">Correo Electrónico</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${errors.correo ? 'input-error' : ''}`}
                value={cliente.correo || ''}
                onChange={(e) => handleCorreoChange(e.target.value)}
                placeholder="contacto@andinamarket.com"
              />
              {errors.correo && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.correo}</span>
                </label>
              )}
            </div>

            <div>
              <label className="label">
                <span className="label-text">Tarifa</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.tarifa || ''}
                onChange={(e) => onChange({ ...cliente, tarifa: e.target.value })}
                placeholder="Tarifa B"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Grupo</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.grupo || ''}
                onChange={(e) => onChange({ ...cliente, grupo: e.target.value })}
                placeholder="Grupo 2"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Zona</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.zona || ''}
                onChange={(e) => onChange({ ...cliente, zona: e.target.value })}
                placeholder="Zona Sur"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Ruta</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.ruta || ''}
                onChange={(e) => onChange({ ...cliente, ruta: e.target.value })}
                placeholder="Ruta 3"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Vendedor</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.vendedor || ''}
                onChange={(e) => onChange({ ...cliente, vendedor: e.target.value })}
                placeholder="Carlos Martínez"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Cobrador</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.cobrador || ''}
                onChange={(e) => onChange({ ...cliente, cobrador: e.target.value })}
                placeholder="Ana Torres"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Provincia</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.provincia || ''}
                onChange={(e) => onChange({ ...cliente, provincia: e.target.value })}
                placeholder="Azuay"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Ciudad</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.ciudad || ''}
                onChange={(e) => onChange({ ...cliente, ciudad: e.target.value })}
                placeholder="Cuenca"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Parroquia</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={cliente.parroquia || ''}
                onChange={(e) => onChange({ ...cliente, parroquia: e.target.value })}
                placeholder="El Vecino"
              />
            </div>
          </div>
          
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                onCancel();
                resetErrors();
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
              disabled={!isFormValid()}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}