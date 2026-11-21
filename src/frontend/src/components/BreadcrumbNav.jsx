import { ChevronRight, ArrowLeft } from 'lucide-react';

/**
 * Componente de navegación secuencial / migas de pan (Breadcrumbs)
 *
 * @param {Array<{ label: string, onClick?: () => void, icon?: any }>} items
 * @param {() => void} [onBack] Función para volver un nivel atrás (opcional)
 */
export default function BreadcrumbNav({ items = [], onBack }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumb-nav" aria-label="Migas de pan">
      {onBack && (
        <button
          type="button"
          className="btn btn-small breadcrumb-back-btn"
          onClick={onBack}
          title="Volver al nivel anterior"
        >
          <ArrowLeft size={15} />
          <span>Volver</span>
        </button>
      )}

      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const esUltimo = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="breadcrumb-item-wrapper">
              {index > 0 && (
                <ChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
              )}

              {esUltimo || !item.onClick ? (
                <span className={`breadcrumb-item ${esUltimo ? 'breadcrumb-current' : ''}`} aria-current={esUltimo ? 'page' : undefined}>
                  {Icon && <Icon size={14} className="breadcrumb-item-icon" />}
                  <span>{item.label}</span>
                </span>
              ) : (
                <button
                  type="button"
                  className="breadcrumb-item breadcrumb-link"
                  onClick={item.onClick}
                >
                  {Icon && <Icon size={14} className="breadcrumb-item-icon" />}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
