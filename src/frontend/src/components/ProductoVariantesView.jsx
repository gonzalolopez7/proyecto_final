import { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Sparkles,
  Ruler,
  FolderTree,
  Truck,
  MapPin,
  RefreshCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  obtenerVariantesPorProducto,
  altaVariante,
  modificarVariante,
  eliminarVariante,
  restaurarVariante,
} from '../services/varianteService';
import { obtenerTallesPorEscala } from '../services/atributoService';
import { expandirHexColor, resumirTallesEscala } from '../utils/validaciones';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import { obtenerSesion } from '../services/authService';
import { PERMISOS, tienePermiso } from '../config/permisos';
import AlertBanner from './AlertBanner';
import UbicacionVarianteModal from './UbicacionVarianteModal';

const VARIANTE_INICIAL = {
  sku: '',
  idTalle: '',
  idColor: '',
  stockMinimo: 0,
};

function generarPrefijoProducto(nombre = '') {
  const palabras = String(nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (palabras.length === 0) return 'PROD';
  if (palabras.length === 1) return palabras[0].slice(0, 4);
  return palabras
    .slice(0, 3)
    .map((p) => p.slice(0, 3))
    .join('');
}

export default function ProductoVariantesView({
  producto,
  colores = [],
  onIrACostos,
}) {
  const sesion = obtenerSesion();
  const puedeVerProveedores = tienePermiso(sesion?.user?.role, PERMISOS.proveedores);

  const [variantes, setVariantes] = useState([]);
  const [tallesEscala, setTallesEscala] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [varianteRestaurable, setVarianteRestaurable] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VARIANTE_INICIAL);
  const [modalVarianteAbierto, setModalVarianteAbierto] = useState(false);

  const [varianteUbicando, setVarianteUbicando] = useState(null);

  async function recargarDatos() {
    if (!producto?.id) return;
    try {
      setLoading(true);
      setError('');
      const [listaVariantes, listaTalles] = await Promise.all([
        obtenerVariantesPorProducto(producto.id),
        obtenerTallesPorEscala(producto.idEscalaTalle),
      ]);
      setVariantes(listaVariantes);
      setTallesEscala(listaTalles);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar las variantes del producto.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      if (!producto?.id) return;
      try {
        setLoading(true);
        setError('');
        const [listaVariantes, listaTalles] = await Promise.all([
          obtenerVariantesPorProducto(producto.id),
          obtenerTallesPorEscala(producto.idEscalaTalle),
        ]);
        if (!activo) return;
        setVariantes(listaVariantes);
        setTallesEscala(listaTalles);
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudieron cargar las variantes del producto.'));
      } finally {
        if (activo) setLoading(false);
      }
    }

    inicializar();
    return () => {
      activo = false;
    };
  }, [producto?.id, producto?.idEscalaTalle]);

  function armarSkuSugerido(idTalle = form.idTalle, idColor = form.idColor) {
    const prefijo = generarPrefijoProducto(producto?.nombre);
    const colorObj = colores.find((c) => c.id === idColor);
    const talleObj = tallesEscala.find((t) => t.id === idTalle);

    const codColor = (colorObj?.codigo || colorObj?.nombre?.slice(0, 3) || 'COL').toUpperCase();
    const codTalle = (talleObj?.nombre || 'T').toUpperCase().replace(/\s+/g, '');

    return `${prefijo}-${codColor}-${codTalle}`;
  }

  function sugerirSku() {
    setForm((actual) => ({
      ...actual,
      sku: armarSkuSugerido(actual.idTalle, actual.idColor),
    }));
  }

  function abrirNuevaVariante() {
    setEditandoId(null);
    setVarianteRestaurable(null);
    setError('');
    setMensaje('');
    const idT = tallesEscala[0]?.id || '';
    const idC = colores[0]?.id || '';
    setForm({
      sku: armarSkuSugerido(idT, idC),
      idTalle: idT,
      idColor: idC,
      stockMinimo: 0,
    });
    setModalVarianteAbierto(true);
  }

  function abrirEditarVariante(v) {
    setEditandoId(v.id);
    setVarianteRestaurable(null);
    setError('');
    setMensaje('');
    setForm({
      sku: v.sku || '',
      idTalle: v.idTalle || '',
      idColor: v.idColor || '',
      stockMinimo: v.stockMinimo ?? 0,
    });
    setModalVarianteAbierto(true);
  }

  function cancelarFormulario() {
    setEditandoId(null);
    setVarianteRestaurable(null);
    setModalVarianteAbierto(false);
    setForm(VARIANTE_INICIAL);
  }

  async function handleGuardarVariante(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!form.idTalle) {
      setError('Seleccioná un talle de la escala asignada al producto.');
      return;
    }
    if (!form.idColor) {
      setError('Seleccioná un color para la variante.');
      return;
    }
    if (!form.sku.trim()) {
      setError('El código SKU es obligatorio.');
      return;
    }
    if (Number(form.stockMinimo) < 0) {
      setError('El stock mínimo no puede ser negativo.');
      return;
    }

    try {
      setGuardando(true);
      setVarianteRestaurable(null);

      if (editandoId) {
        await modificarVariante(editandoId, form);
        setMensaje('Variante modificada con éxito.');
      } else {
        await altaVariante({
          idProducto: producto.id,
          ...form,
        });
        setMensaje('Variante registrada con éxito.');
      }

      cancelarFormulario();
      await recargarDatos();
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = datosDeError(err);

      if (cod === 'Variante.SoftDeletedSku' || cod === 'Variante.SoftDeletedCombination') {
        const idBaja = data?.id || data?.extensions?.id;
        const etiqueta =
          cod === 'Variante.SoftDeletedSku'
            ? `${data?.sku || form.sku.toUpperCase()}`
            : `${data?.color || ''} / Talle ${data?.talle || ''}`.trim();
        if (idBaja) {
          setVarianteRestaurable({ id: idBaja, etiqueta });
        }
      }

      setError(mensajeDeError(err, 'No se pudo guardar la variante.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleRestaurarVariante(id, etiqueta) {
    try {
      setGuardando(true);
      setError('');
      await restaurarVariante(id);
      setMensaje(`Variante (${etiqueta}) restaurada exitosamente.`);
      cancelarFormulario();
      await recargarDatos();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restaurar la variante.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminarVariante(id, sku) {
    if (!window.confirm(`¿Seguro que desea dar de baja la variante "${sku}"?`)) return;
    try {
      setError('');
      setMensaje('');
      await eliminarVariante(id);
      setMensaje(`Variante "${sku}" dada de baja correctamente.`);
      if (editandoId === id) {
        cancelarFormulario();
      }
      await recargarDatos();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo dar de baja la variante.'));
    }
  }

  return (
    <div className="drilldown-view-container">
      {/* Resumen del Producto seleccionado */}
      <section className="drilldown-summary-card card">
        <div className="drilldown-summary-header">
          <div className="drilldown-summary-titles">
            <span className="drilldown-parent-badge">
              <FolderTree size={14} /> {producto?.categoriaNombre || 'Sin categoría'}
            </span>
            <h2>{producto?.nombre}</h2>
            {producto?.descripcion && (
              <p className="muted text-sm">{producto.descripcion}</p>
            )}
          </div>

          <div className="page-head-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNuevaVariante}
            >
              <Plus size={16} /> Nueva variante
            </button>
            <button
              type="button"
              className="btn"
              onClick={recargarDatos}
              disabled={loading}
              title="Actualizar listado de variantes"
            >
              <RefreshCcw size={16} /> Actualizar
            </button>
          </div>
        </div>

        <div className="drilldown-meta-grid">
          <div className="drilldown-meta-item">
            <span className="meta-label">Escala de talles</span>
            <span className="category-pill category-pill-icon">
              <Ruler size={12} />
              <strong>{producto?.escalaTalleNombre || 'Sin escala'}</strong>
              {tallesEscala.length > 0 && (
                <span>({resumirTallesEscala(tallesEscala, 3)})</span>
              )}
            </span>
          </div>

          <div className="drilldown-meta-item">
            <span className="meta-label">Atributos</span>
            <div className="pill-list">
              {producto?.generoNombre && (
                <span className="category-pill">{producto.generoNombre}</span>
              )}
              {producto?.temporadaNombre && (
                <span className="category-pill">{producto.temporadaNombre}</span>
              )}
              {producto?.fitNombre && (
                <span className="category-pill">{producto.fitNombre}</span>
              )}
              {producto?.materialNombre && (
                <span className="category-pill">{producto.materialNombre}</span>
              )}
              {!producto?.generoNombre && !producto?.temporadaNombre && !producto?.fitNombre && !producto?.materialNombre && (
                <span className="muted text-sm">—</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <AlertBanner tipo="success" mensaje={mensaje} onClose={() => setMensaje('')} />
      {!modalVarianteAbierto && (
        <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')}>
          {varianteRestaurable && (
            <div className="alert-restore-actions">
              <button
                type="button"
                className="btn btn-small"
                disabled={guardando}
                onClick={() =>
                  handleRestaurarVariante(varianteRestaurable.id, varianteRestaurable.etiqueta)
                }
              >
                <RotateCcw size={14} /> Restaurar variante existente ({varianteRestaurable.etiqueta})
              </button>
            </div>
          )}
        </AlertBanner>
      )}

      {/* Modal de Alta / Modificación de Variante */}
      {modalVarianteAbierto && (
        <div className="modal-backdrop" onClick={cancelarFormulario}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoId ? 'Modificar variante' : 'Nueva variante'}</h2>
              <button
                type="button"
                className="btn-close"
                onClick={cancelarFormulario}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </header>

            {colores.length === 0 ? (
              <div style={{ padding: '20px' }}>
                <div className="empty-state empty-state-compact">
                  <AlertCircle size={32} className="empty-icon" />
                  <p className="muted text-sm">
                    No hay colores registrados en el catálogo. Creá al menos un color en la sección &quot;Talles y colores&quot; para poder registrar variantes.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn" onClick={cancelarFormulario}>
                    Cerrar
                  </button>
                </div>
              </div>
            ) : tallesEscala.length === 0 && !loading ? (
              <div style={{ padding: '20px' }}>
                <div className="empty-state empty-state-compact">
                  <AlertCircle size={32} className="empty-icon" />
                  <p className="muted text-sm">
                    El producto no tiene una escala de talles válida con talles asociados.
                  </p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn" onClick={cancelarFormulario}>
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGuardarVariante} className="modal-form">
                <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')}>
                  {varianteRestaurable && (
                    <div className="alert-restore-actions">
                      <button
                        type="button"
                        className="btn btn-small"
                        disabled={guardando}
                        onClick={() =>
                          handleRestaurarVariante(varianteRestaurable.id, varianteRestaurable.etiqueta)
                        }
                      >
                        <RotateCcw size={14} /> Restaurar variante existente ({varianteRestaurable.etiqueta})
                      </button>
                    </div>
                  )}
                </AlertBanner>

                <div className="form-row-2">
                  <label>
                    Talle ({producto?.escalaTalleNombre}) *
                    <select
                      value={form.idTalle}
                      onChange={(e) => setForm({ ...form, idTalle: e.target.value })}
                      required
                    >
                      <option value="" disabled>Seleccione un talle...</option>
                      {tallesEscala.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Color *
                    <select
                      value={form.idColor}
                      onChange={(e) => setForm({ ...form, idColor: e.target.value })}
                      required
                    >
                      <option value="" disabled>Seleccione un color...</option>
                      {colores.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre} ({c.codigo})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row-2">
                  <label>
                    SKU *
                    <div className="sku-input-group">
                      <input
                        type="text"
                        maxLength={50}
                        value={form.sku}
                        onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                        placeholder="Ej. CAM-AZ-M"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={sugerirSku}
                        title="Generar SKU sugerido según Producto, Color y Talle"
                      >
                        <Sparkles size={14} /> Sugerir
                      </button>
                    </div>
                  </label>

                  <label>
                    Stock mínimo *
                    <input
                      type="number"
                      min="0"
                      value={form.stockMinimo}
                      onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })}
                      placeholder="0"
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
                      : editandoId
                        ? 'Guardar cambios'
                        : 'Crear variante'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tabla de Variantes */}
      <section className="card">
        <header className="card-head">
          <div>
            <h2>
              <Layers size={18} />
              Variantes registradas ({variantes.length})
            </h2>
          </div>
        </header>

        {loading ? (
          <p className="loading-state">Cargando variantes...</p>
        ) : variantes.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} className="empty-icon" />
            <h3>No hay variantes registradas</h3>
            <p className="muted">
              Comenzá registrando la primera variante.
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <th scope="col">TALLE</th>
                  <th scope="col">COLOR</th>
                  <th scope="col" className="num">STOCK MÍNIMO</th>
                  <th scope="col" className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {variantes.map((v) => (
                  <tr
                    key={v.id}
                    className={`table-row-hover${editandoId === v.id ? ' row-editing' : ''}`}
                  >
                    <th scope="row" className="row-title">
                      <code>{v.sku}</code>
                    </th>
                    <td>
                      <span className="talle-pill">{v.talleNombre || '—'}</span>
                    </td>
                    <td>
                      <span className="color-cell-chip">
                        <input
                          type="color"
                          className="color-swatch-dot"
                          value={expandirHexColor(v.colorCodigoHex)}
                          readOnly
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <span>{v.colorNombre || '—'}</span>
                      </span>
                    </td>
                    <td className="num font-mono">
                      {v.stockMinimo} u.
                    </td>
                    <td className="actions">
                      {/* Botón hacia el nivel 3: Proveedores y costos (solo si tiene rol permitido) */}
                      {puedeVerProveedores && (
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => onIrACostos(v)}
                          title="Gestionar proveedores y costos de esta variante"
                        >
                          <Truck size={14} /> Proveedores
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => abrirEditarVariante(v)}
                        title="Editar variante"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-icon danger"
                        onClick={() => handleEliminarVariante(v.id, v.sku)}
                        title="Dar de baja variante"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => setVarianteUbicando(v)}
                        title="Ver y asignar ubicación física en depósito"
                      >
                        <MapPin size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal puntual para ubicación física en depósito */}
      {varianteUbicando && (
        <UbicacionVarianteModal
          variante={varianteUbicando}
          onClose={() => setVarianteUbicando(null)}
        />
      )}
    </div>
  );
}
