import React from 'react';

type PaginationProps = {
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  return (
    <div className="flex justify-center items-center mt-4 px-4 gap-x-4">
      <button
        className="btn btn-outline bg-blue-900 text-white"
        disabled={pagination.currentPage === 1}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        Anterior
      </button>

      <div className="join">
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`join-item btn ${page === pagination.currentPage ? 'btn-active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="btn btn-outline bg-blue-900 text-white"
        disabled={pagination.currentPage === pagination.totalPages}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Siguiente
      </button>
    </div>
  );
};

export default Pagination; 