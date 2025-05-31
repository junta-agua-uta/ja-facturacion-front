import React from 'react';

type PaginationProps = {
  pagination: {
    currentPage: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination;
  const maxVisibleButtons = 5; // Número máximo de botones de página a mostrar
  
  // Calcular rango de páginas a mostrar
  let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
  
  // Ajustar si estamos cerca del final
  if (endPage - startPage + 1 < maxVisibleButtons && startPage > 1) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }
  
  // Crear array de páginas visibles
  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="flex justify-center items-center mt-4 px-4 gap-x-2">
      <button
        className="btn btn-sm btn-outline bg-blue-900 text-white"
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        title="Primera página"
      >
        «
      </button>
      
      <button
        className="btn btn-sm btn-outline bg-blue-900 text-white"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>

      <div className="join">
        {startPage > 1 && (
          <>
            <button
              className="join-item btn btn-sm"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="join-item btn btn-sm btn-disabled">...</span>}
          </>
        )}
        
        {visiblePages.map(page => (
          <button
            key={page}
            className={`join-item btn btn-sm ${page === currentPage ? 'btn-active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="join-item btn btn-sm btn-disabled">...</span>}
            <button
              className="join-item btn btn-sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="btn btn-sm btn-outline bg-blue-900 text-white"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </button>
      
      <button
        className="btn btn-sm btn-outline bg-blue-900 text-white"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        title="Última página"
      >
        »
      </button>
    </div>
  );
};

export default Pagination;