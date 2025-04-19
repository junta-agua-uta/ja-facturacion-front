export type Branch = {
    id: string;
    name: string;
    address: string;
    code: string | number;
  };
  
  export type BranchFilter = {
    name?: string;
  };
  
  export type Pagination = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
  
  export type BranchTableActions = {
    onEdit: (branch: Branch) => void;
    onDelete: (branchId: string) => void;
  };
  
  export type BranchTableProps = {
    data: Branch[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
  } & BranchTableActions;
  