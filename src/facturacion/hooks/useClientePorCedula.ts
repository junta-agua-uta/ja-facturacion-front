import { useState, useEffect, useCallback } from "react";
import api from "../../shared/api";

interface ClienteResponse {
  ID: number;
  RAZON_SOCIAL: string;
  // Otros campos del cliente que puedan ser necesarios
}

export function useClientePorCedula(cedula: string) {
  const [cliente, setCliente] = useState("");
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddButton, setShowAddButton] = useState(false);
  const [showAddClienteModal, setShowAddClienteModal] = useState(false);

  // Función para reiniciar el estado del cliente
  const resetCliente = useCallback(() => {
    setCliente("");
    setClienteId(null);
    setError(null);
    setShowAddButton(false);
  }, []);

  // Función para manejar el clic en el botón de agregar cliente
  const handleAddCliente = useCallback(() => {
    setShowAddClienteModal(true);
  }, []);

  // Función para cerrar el modal
  const handleCloseAddClienteModal = useCallback(() => {
    setShowAddClienteModal(false);
  }, []);

  // Función para manejar cuando se agrega un cliente exitosamente
  const handleClienteAdded = useCallback(() => {
    setShowAddClienteModal(false);
    // Aquí podrías implementar lógica adicional después de agregar el cliente
  }, []);

  //Funcion de validacion de cedula ecuatoriana
  function validarCedulaEcuatoriana(cedula: string): boolean {
    if (!/^\d{10}$/.test(cedula)) return false;

    const provincia = parseInt(cedula.slice(0, 2), 10);
    const tercerDigito = parseInt(cedula[2], 10);
    if (!(provincia >= 1 && provincia <= 24) || tercerDigito > 6) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula[i]) * coeficientes[i];
      if (valor > 9) valor -= 9;
      suma += valor;
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    return digitoVerificador === parseInt(cedula[9]);
  }

  //Funcion para validad el RUC
  function validarRucEcuatoriano(ruc: string): boolean {
    if (!/^\d{13}$/.test(ruc)) return false;

    const cedula = ruc.slice(0, 10);
    const establecimiento = ruc.slice(10);

    if (establecimiento !== "001") return false;

    const tercerDigito = parseInt(ruc[2], 10);

    if (tercerDigito < 6) {
      // Persona natural → validar como cédula
      return validarCedulaEcuatoriana(cedula);
    } else if (tercerDigito === 6) {
      // Entidad pública
      const coef = [3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 8; i++) {
        suma += parseInt(ruc[i], 10) * coef[i];
      }
      const verificador = suma % 11 === 0 ? 0 : 11 - (suma % 11);
      return verificador === parseInt(ruc[8], 10);
    } else if (tercerDigito === 9) {
      // Sociedad privada
      const coef = [4, 3, 2, 7, 6, 5, 4, 3, 2];
      let suma = 0;
      for (let i = 0; i < 9; i++) {
        suma += parseInt(ruc[i], 10) * coef[i];
      }
      const verificador = suma % 11 === 0 ? 0 : 11 - (suma % 11);
      return verificador === parseInt(ruc[9], 10);
    }

    return false;
  }

  useEffect(() => {
    // Si la cédula está vacía o es muy corta, limpiamos los datos del cliente
    if (!cedula || cedula.length < 10) {
      setCliente("");
      setClienteId(null);
      setError(null);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const response = await api.get("/clientes/buscarCedula", {
          params: { cedula },
        });
        const clientes = response.data;
        if (
          Array.isArray(clientes) &&
          clientes.length > 0 &&
          clientes[0].RAZON_SOCIAL
        ) {
          const clienteData = clientes[0] as ClienteResponse;
          setCliente(clienteData.RAZON_SOCIAL);
          setClienteId(clienteData.ID);
          setError(null);
          setShowAddButton(false);
        } else {
          setCliente("");
          setClienteId(null);
          setError("Cliente no encontrado");
          // Mostrar el botón de agregar solo si la cédula tiene un formato válido o el RUC tiene 13 dígitos
          setShowAddButton(
            validarCedulaEcuatoriana(cedula) || validarRucEcuatoriano(cedula)
          );
        }
      } catch (error) {
        console.error("Error al buscar cliente:", error);
        setCliente("");
        setClienteId(null);
        setError("Error al buscar cliente");
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [cedula]);

  return {
    cliente,
    clienteId,
    error,
    resetCliente,
    showAddButton,
    showAddClienteModal,
    handleAddCliente,
    handleCloseAddClienteModal,
    handleClienteAdded,
  };
}
