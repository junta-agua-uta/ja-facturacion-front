export type Branch = {
  id: string;
  nombre: string;
  ubicacion: string;
  puntoEmision: string;
};

export type BranchFilter = {
  nombre?: string;
  ubicacion?: string;
  puntoEmision?: string;
};