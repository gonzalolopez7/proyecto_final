import { Check, AlertTriangle, X } from 'lucide-react';

export default function AlertBanner({
  tipo = 'danger',
  mensaje,
  onClose,
  className = '',
  children,
}) {
  if (!mensaje && !children) return null;

  const esExito = tipo === 'success';
  const Icono = esExito ? Check : AlertTriangle;
  const claseAlerta = `alert-banner ${esExito ? 'alert-success' : 'alert-danger'}${className ? ` ${className}` : ''}`;

  return (
    <div className={claseAlerta} role="alert">
      <Icono size={18} />
      <div className="alert-banner-content">
        {mensaje && <span>{mensaje}</span>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn-close-alert"
          aria-label="Cerrar alerta"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

