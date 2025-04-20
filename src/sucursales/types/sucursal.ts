export type Branch = {
  id: string;
  name: string;
  address: string;
  code: string | number;
};

export type BranchFilter = {
  name?: string;
};
