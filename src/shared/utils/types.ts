export type Pagination = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
};


export type TableActions <T> = {
    onEdit?: (branch: T) => void;
    onDelete?: (branchId: string) => void;
};

export type TableProps<T> = {
    data: T[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
} & TableActions<T>;