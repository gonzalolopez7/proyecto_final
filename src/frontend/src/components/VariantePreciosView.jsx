import { useEffect, useState } from 'react';
import {
  Truck,
  Plus,
  Edit3,
  Trash2,
  Award,
  Shirt,
  Lock,
  RefreshCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  obtenerProveedoresPorVariante,
  altaVarianteProveedor,
  modificarVarianteProveedor,
  eliminarVarianteProveedor,
} from '../services/varianteProveedorService';
import { obtenerProveedores } from '../services/proveedorService';
import { formatoMoneda } from '../utils/numeroALetras';
import { expandirHexColor } from '../utils/validaciones';
import { mensajeDeError } from '../services/errores';
import { obtenerSesion } from '../services/authService';
import { PERMISOS, tienePermiso } from '../config/permisos';
import AlertBanner from './AlertBanner';

const FORM_PROV_INICIAL = {
  idProveedor: '',
  codigoProveedor: '',
  costo: 0,
};

export default function VariantePreciosView({
  producto,
  variante,
  onVolver,
}) {
  const sesion = obtenerSesion();
  const puedeVerProveedores = tienePermiso(sesion?.user?.role, PERMISOS.proveedores);

  const [proveedoresVariante, setProveedoresVariante] = useState([]);
  const [catalogoProveedores, setCatalogoProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [editandoRelacionId, setEditandoRelacionId] = useState(null);
  const [formProv, setFormProv] = useState(FORM_PROV_INICIAL);
  const [modalPrecioAbierto, setModalPrecioAbierto] = useState(false);

  async function recargarDatos() {
    if (!variante?.id) return;
    try {
      setLoading(true);
      setError('');
      const [listaRelaciones, respProveedores] = await Promise.all([
        obtenerProveedoresPorVariante(variante.id),
        obtenerProveedores({ page: 1, pageSize: 100 }),
      ]);
      setProveedoresVariante(listaRelaciones);
      const provs = respProveedores?.items || [];
      setCatalogoProveedores(provs);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los proveedores de la variante.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      if (!variante?.id || !puedeVerProveedores) return;
      try {
        setLoading(true);
        setError('');
        const [listaRelaciones, respProveedores] = await Promise.all([
          obtenerProveedoresPorVariante(variante.id),
          obtenerProveedores({ page: 1, pageSize: 100 }),
        ]);
        if (!activo) return;
        setProveedoresVariante(listaRelaciones);
        const provs = respProveedores?.items || [];
        setCatalogoProveedores(provs);

        setFormProv({
          idProveedor: provs[0]?.id || '',
          codigoProveedor: variante.sku || '',
          costo: 0,
        });
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudieron cargar los proveedores de la variante.'));
      } finally {
        if (activo) setLoading(false);
      }
    }

    inicializar();
    return () => {
      activo = false;
    };
  }, [variante?.id, variante?.sku, puedeVerProveedores]);

  function abrirNuevoProveedor() {
    setEditandoRelacionId(null);
    setFormProv({
      idProveedor: catalogoProveedores[0]?.id || '',
      codigoProveedor: variante?.sku || '',
      costo: 0,
    });
    setError('');
    setMensaje('');
    setModalPrecioAbierto(true);
  }

  function abrirEditarRelacion(rel) {
    setEditandoRelacionId(rel.id);
    setFormProv({
      idProveedor: rel.idProveedor,
      codigoProveedor: rel.codigoProveedor || '',
      costo: rel.costo ?? 0,
    });
    setError('');
    setMensaje('');
    setModalPrecioAbierto(true);
  }

  function cancelarFormulario() {
    setEditandoRelacionId(null);
    setModalPrecioAbierto(false);
    setFormProv({
      idProveedor: catalogoProveedores[0]?.id || '',
      codigoProveedor: variante?.sku || '',
      costo: 0,
    });
  }

  async function handleGuardarProveedor(e) {
    e.preventDefault();
    if (!variante?.id) return;

    setError('');
    setMensaje('');

    if (!editandoRelacionId && !formProv.idProveedor) {
      setError('Seleccioná un proveedor para vincular.');
      return;
    }
    if (!formProv.codigoProveedor.trim()) {
      setError('El código del proveedor es obligatorio.');
      return;
    }
    if (Number(formProv.costo) < 0) {
      setError('El costo no puede ser negativo.');
      return;
    }

    try {
      setGuardando(true);

      if (editandoRelacionId) {
        await modificarVarianteProveedor(editandoRelacionId, {
          codigoProveedor: formProv.codigoProveedor.trim(),
          costo: Number(formProv.costo),
        });
        setMensaje('Costo y código del proveedor actualizados con éxito.');
      } else {
        await altaVarianteProveedor({
          idVariante: variante.id,
          idProveedor: formProv.idProveedor,
          codigoProveedor: formProv.codigoProveedor.trim(),
          costo: Number(formProv.costo),
        });
        setMensaje(`Proveedor vinculado con éxito a la variante ${variante.sku}.`);
      }

      cancelarFormulario();
      const actualizados = await obtenerProveedoresPorVariante(variante.id);
      setProveedoresVariante(actualizados);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo guardar la relación con el proveedor.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminarRelacion(rel) {
    if (
      !window.confirm(
        `¿Seguro que desea desvincular al proveedor "${rel.proveedorNombre || ''}" de la variante "${variante?.sku}"?`
      )
    ) {
      return;
    }

    try {
      setError('');
      setMensaje('');
      await eliminarVarianteProveedor(rel.id);
      setMensaje('Proveedor desvinculado correctamente.');
      if (editandoRelacionId === rel.id) {
        cancelarFormulario();
      }
      const actualizados = await obtenerProveedoresPorVariante(variante.id);
      setProveedoresVariante(actualizados);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo desvincular el proveedor.'));
    }
  }

  // Verificación de autorización de roles
  if (!puedeVerProveedores) {
    return (
      <div className="card">
        <div className="empty-state">
          <Lock size={48} className="empty-icon text-danger" />
          <h3>Acceso Restringido</h3>
          <p className="muted">
            Tu rol de usuario no tiene permisos para consultar o modificar proveedores y costos de adquisición.
          </p>
          <button type="button" className="btn btn-primary" onClick={onVolver}>
            Volver a Variantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="drilldown-view-container">
      {/* Resumen de la Variante seleccionada */}
      <section className="drilldown-summary-card card">
        <div className="drilldown-summary-header">
          <div className="drilldown-summary-titles">
            <span className="drilldown-parent-badge">
              <Shirt size={14} /> {producto?.nombre}
            </span>
            <h2>
              Variante <code>{variante?.sku}</code>
            </h2>
          </div>

          <div className="page-head-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNuevoProveedor}
            >
              <Plus size={16} /> Registrar precio
            </button>
            <button
              type="button"
              className="btn"
              onClick={recargarDatos}
              disabled={loading}
              title="Actualizar listado"
            >
              <RefreshCcw size={16} /> Actualizar
            </button>
          </div>
        </div>

        <div className="drilldown-meta-grid">
          <div className="drilldown-meta-item">
            <span className="meta-label">Talle</span>
            <span className="talle-pill">{variante?.talleNombre || '—'}</span>
          </div>

          <div className="drilldown-meta-item">
            <span className="meta-label">Color</span>
            <span className="color-cell-chip">
              <input
                type="color"
                className="color-swatch-dot"
                value={expandirHexColor(variante?.colorCodigoHex)}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
              />
              <strong>{variante?.colorNombre || '—'}</strong>
            </span>
          </div>

          <div className="drilldown-meta-item">
            <span className="meta-label">Stock mínimo</span>
            <span className="font-mono">{variante?.stockMinimo ?? 0} u.</span>
          </div>
        </div>
      </section>

      <AlertBanner tipo="success" mensaje={mensaje} onClose={() => setMensaje('')} />
      {!modalPrecioAbierto && (
        <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')} />
      )}

      {/* Modal de Alta / Modificación de Costo */}
      {modalPrecioAbierto && (
        <div className="modal-backdrop" onClick={cancelarFormulario}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>
                {editandoRelacionId
                  ? 'Modificar costo y código de proveedor'
                  : 'Vincular proveedor a la variante'}
              </h2>
              <button
                type="button"
                className="btn-close"
                onClick={cancelarFormulario}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            {catalogoProveedores.length === 0 ? (
              <div style={{ padding: '20px' }}>
                <div className="empty-state empty-state-compact">
                  <AlertCircle size={32} className="empty-icon" />
                  <p className="muted text-sm">
                    No hay proveedores registrados en el sistema. Creá un proveedor en el módulo de Proveedores para asociar costos.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn" onClick={cancelarFormulario}>
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGuardarProveedor} className="modal-form">
                <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')} />

                <label>
                  Proveedor *
                  <select
                    value={formProv.idProveedor}
                    onChange={(e) => setFormProv({ ...formProv, idProveedor: e.target.value })}
                    disabled={Boolean(editandoRelacionId)}
                    required
                  >
                    <option value="" disabled>Seleccione un proveedor...</option>
                    {catalogoProveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} {p.razonSocial ? `(${p.razonSocial})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="form-row-2">
                  <label>
                    Código en el proveedor *
                    <input
                      type="text"
                      maxLength={50}
                      value={formProv.codigoProveedor}
                      onChange={(e) =>
                        setFormProv({ ...formProv, codigoProveedor: e.target.value.toUpperCase() })
                      }
                      placeholder="Ej. COD-PROV-01"
                      required
                    />
                  </label>

                  <label>
                    Costo unitario ($) *
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formProv.costo}
                      onChange={(e) => setFormProv({ ...formProv, costo: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={cancelarFormulario}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={guardando}
                  >
                    {guardando
                      ? 'Guardando...'
                      : editandoRelacionId
                        ? 'Actualizar relación'
                        : 'Guardar vinculación'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tabla comparativa de Proveedores */}
      <section className="card">
        <header className="card-head">
          <div>
            <h2>
              <Truck size={18} />
              Precios registrados ({proveedoresVariante.length})
            </h2>
          </div>
        </header>

        {loading ? (
          <p className="loading-state">Cargando costos de proveedores...</p>
        ) : proveedoresVariante.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} className="empty-icon" />
            <h3>No hay precios registrados</h3>
            <p className="muted">
              Comenzá registrando el primer precio.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">PROVEEDOR</th>
                  <th scope="col">CÓDIGO PROVEEDOR</th>
                  <th scope="col" className="num">PRECIO UNITARIO</th>
                  <th scope="col" className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresVariante.map((rel, idx) => {
                  const esMejorPrecio = idx === 0 && proveedoresVariante.length > 1;

                  return (
                    <tr
                      key={rel.id}
                      className={`table-row-hover${editandoRelacionId === rel.id ? ' row-editing' : ''}`}
                    >
                      <th scope="row" className="row-title">
                        <div className="row-stack">
                          <span className="variante-prov-name-row">
                            <strong className="row-primary-text">{rel.proveedorNombre || '—'}</strong>
                            {esMejorPrecio && (
                              <span className="best-cost-badge" title="Proveedor con el menor costo registrado para esta variante">
                                <Award size={12} /> Mejor precio
                              </span>
                            )}
                          </span>
                          {rel.proveedorRazonSocial && (
                            <span className="row-secondary-text">{rel.proveedorRazonSocial}</span>
                          )}
                        </div>
                      </th>
                      <td>
                        <code>{rel.codigoProveedor}</code>
                      </td>
                      <td className="num font-mono font-bold">
                        {formatoMoneda(rel.costo)}
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => abrirEditarRelacion(rel)}
                          title="Modificar código o costo"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminarRelacion(rel)}
                          title="Desvincular proveedor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
