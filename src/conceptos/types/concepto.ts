export interface Concepto {
  id: string;
  codigo: string;       // ej. "EXCEDENTE"
  codInterno: string;   // ej. "EXC001"
  desc: string;         // ej. "Excedente"
  precioBase?: number;
  requiereMes?: boolean;
}

export interface ConceptoFilter {
  desc?: string;
  codigo?: string;
  codInterno?: string;
}

export const generarCodigos = (descripcion: string, existentes: string[]) => {
  if (!descripcion || !descripcion.trim()) {
    throw new Error("La descripción no puede estar vacía");
  }

  const codigo = descripcion
    .normalize("NFD")            // separa caracteres + tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .toUpperCase()  
  const palabras = codigo.split(/\s+/);
  

  // Define la base del codInterno
  let base = palabras.length === 1
    ? palabras[0].slice(0, 3)            
    : palabras[0][0] + palabras[1][0];  

  let contador = 1;
  let codInterno = `${base}${String(contador).padStart(3, "0")}`;

  // Incrementa contador hasta si existe en la lista
  while (existentes.includes(codInterno)) {
    contador++;
    codInterno = `${base}${String(contador).padStart(3, "0")}`;
  }

  return { codigo, codInterno };
};

