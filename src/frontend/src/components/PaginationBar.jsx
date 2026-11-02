import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationBar({
  pagina,
  totalPaginas,
  totalItems,
  etiquetaItem = 'registros',
  onPageChange,
}) {
  if (totalPaginas <= 1) return null;

  return (
    <footer className="pagination-bar">
      <span className="muted text-sm">
        Página {pagina} de {totalPaginas} ({totalItems} {etiquetaItem} en total)
      </span>
      <div className="pagination-actions">
        <button
          type="button"
          className="btn btn-small"
          disabled={pagina <= 1}
          onClick={() => onPageChange(Math.max(1, pagina - 1))}
        >
          <ChevronLeft size={14} /> Anterior
        </button>
        <button
          type="button"
          className="btn btn-small"
          disabled={pagina >= totalPaginas}
          onClick={() => onPageChange(Math.min(totalPaginas, pagina + 1))}
        >
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </footer>
  );
}

