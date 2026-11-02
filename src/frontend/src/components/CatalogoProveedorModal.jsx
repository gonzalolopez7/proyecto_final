import { useEffect, useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  Search,
  Truck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  obtenerVariantesPorProveedor,
  altaVarianteProveedor,
  modificarVarianteProveedor,
  eliminarVarianteProveedor,
} from '../services/varianteProveedorService';
import { obtenerProductos } from '../services/productoService';
import { obtenerVariantesPorProducto } from '../services/varianteService';
import { formatoMoneda } from '../utils/numeroALetras';
import { expandirHexColor, formatearCuit } from '../utils/validaciones';
import { mensajeDeError } from '../services/errores';
import AlertBanner from './AlertBanner';

const FORM_INICIAL = {
  idProducto: '',
  idVariante: '',
  codigoProveedor: '',
  costo: 0,
};

export default function CatalogoProveedorModal({ proveedor, onClose }) {
  const [catalogo, setCatalogo] = useState([]);
  const [productos, setProductos] = useState([]);
  const [variantesProducto, setVariantesProducto] = useState([]);
  const [cargandoVariantesProd, setCargandoVariantesProd] = useState(false);

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [editandoItem, setEditandoItem] = useState(null);
  const [form, setForm] = useState(FORM_INICIAL);

  async function recargarCatalogo() {
    if (!proveedor?.id) return;
    try {
      setLoading(true);
      const lista = await obtenerVariantesPorProveedor(proveedor.id);
      setCatalogo(lista);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo cargar el catálogo del proveedor.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      if (!proveedor?.id) return;
      try {
        setLoading(true);
        setError('');
        const [listaCatalogo, respProductos] = await Promise.all([
          obtenerVariantesPorProveedor(proveedor.id),
          obtenerProductos({ page: 1, pageSize: 100 }),
        ]);

        if (!activo) return;
        setCatalogo(listaCatalogo);
        const itemsProd = respProductos?.items || [];
        setProductos(itemsProd);

        const primerProdId = itemsProd[0]?.id || '';
        if (primerProdId) {
          const vars = await obtenerVariantesPorProducto(primerProdId);
          if (!activo) return;
          setVariantesProducto(vars);
          setForm({
            idProducto: primerProdId,
            idVariante: vars[0]?.id || '',
            codigoProveedor: '',
            costo: 0,
          });
        }
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudo inicializar el catálogo del proveedor.'));
      } finally {
        if (activo) setLoading(false);
      }
    }

    inicializar();
    return () => {
      activo = false;
    };
  }, [proveedor?.id]);

  async function handleCambioProducto(nuevoIdProducto) {
    setForm((actual) => ({
      ...actual,
      idProducto: nuevoIdProducto,
      idVariante: '',
    }));

    if (!nuevoIdProducto) {
      setVariantesProducto([]);
      return;
    }

    try {
      setCargandoVariantesProd(true);
      const vars = await obtenerVariantesPorProducto(nuevoIdProducto);
      setVariantesProducto(vars);
      setForm((actual) => ({
        ...actual,
        idProducto: nuevoIdProducto,
        idVariante: vars[0]?.id || '',
      }));
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar las variantes del producto seleccionado.'));
    } finally {
      setCargandoVariantesProd(false);
    }
  }

  function sugerirCodigoProveedor() {
    if (editandoItem) {
      setForm((actual) => ({
        ...actual,
        codigoProveedor: editandoItem.sku || actual.codigoProveedor,
      }));
      return;
    }
    const varSeleccionada = variantesProducto.find((v) => v.id === form.idVariante);
    if (varSeleccionada?.sku) {
      setForm((actual) => ({
        ...actual,
        codigoProveedor: varSeleccionada.sku,
      }));
    }
  }

  function limpiarFormulario() {
    setEditandoItem(null);
    setForm((actual) => ({
      ...actual,
      idVariante: variantesProducto[0]?.id || '',
      codigoProveedor: '',
      costo: 0,
    }));
  }

  function abrirEdicion(item) {
    setEditandoItem(item);
    setError('');
    setMensaje('');
    setForm((actual) => ({
      ...actual,
      idVariante: item.idVariante,
      codigoProveedor: item.codigoProveedor || '',
      costo: item.costo ?? 0,
    }));
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!editandoItem && !form.idVariante) {
      setError('Seleccioná una variante de producto para vincular al proveedor.');
      return;
    }
    if (!form.codigoProveedor.trim()) {
      setError('El código del proveedor es obligatorio.');
      return;
    }
    if (Number(form.costo) < 0) {
      setError('El costo no puede ser negativo.');
      return;
    }

    try {
      setGuardando(true);

      if (editandoItem) {
        await modificarVarianteProveedor(editandoItem.id, {
          codigoProveedor: form.codigoProveedor,
          costo: form.costo,
        });
        setMensaje(`Costo y código actualizados para la variante ${editandoItem.sku}.`);
      } else {
        await altaVarianteProveedor({
          idVariante: form.idVariante,
          idProveedor: proveedor.id,
          codigoProveedor: form.codigoProveedor,
          costo: form.costo,
        });
        setMensaje('Variante vinculada exitosamente al catálogo del proveedor.');
      }

      limpiarFormulario();
      await recargarCatalogo();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo guardar la relación con el proveedor.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(item) {
    if (
      !window.confirm(
        `¿Seguro que desea desvincular la variante "${item.sku}" (${item.productoNombre || ''}) de este proveedor?`
      )
    ) {
      return;
    }

    try {
      setError('');
      setMensaje('');
      await eliminarVarianteProveedor(item.id);
      setMensaje(`Variante "${item.sku}" desvinculada del proveedor.`);
      if (editandoItem?.id === item.id) {
        limpiarFormulario();
      }
      await recargarCatalogo();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo desvincular la variante.'));
    }
  }

  const catalogoFiltrado = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return catalogo;
    return catalogo.filter(
      (item) =>
        item.sku?.toLowerCase().includes(q) ||
        item.codigoProveedor?.toLowerCase().includes(q) ||
        item.productoNombre?.toLowerCase().includes(q) ||
        item.talleNombre?.toLowerCase().includes(q) ||
        item.colorNombre?.toLowerCase().includes(q)
    );
  }, [catalogo, busqueda]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalogo-prov-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2 id="catalogo-prov-titulo">
              Catálogo y Costos — {proveedor?.nombre}
            </h2>
            <div className="variante-header-meta">
              <span className="category-pill category-pill-icon">
                <Truck size={12} />
                {proveedor?.razonSocial || proveedor?.nombre}
                {proveedor?.cuit ? ` · CUIT ${formatearCuit(proveedor.cuit)}` : ''}
              </span>
              <span className="category-pill category-pill-icon">
                <Calendar size={12} />
                Plazo: <strong>{proveedor?.diasPago ? `${proveedor.diasPago} días` : 'Contado'}</strong>
              </span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body-padded">
          <AlertBanner tipo="success" mensaje={mensaje} onClose={() => setMensaje('')} />
          <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')} />

          {/* Formulario de vinculación o edición de costo/código */}
          <form onSubmit={handleGuardar} className="modal-form variante-inline-form">
            <fieldset className="form-section">
              <legend>
                {editandoItem
                  ? `Modificar costo / código de ${editandoItem.productoNombre || ''} (${editandoItem.sku})`
                  : 'Vincular variante al proveedor'}
              </legend>

              {productos.length === 0 && !loading ? (
                <p className="muted text-sm">
                  No hay productos registrados en el sistema. Creá un producto y sus variantes primero.
                </p>
              ) : (
                <>
                  <div className="catalogo-prov-form-grid">
                    {editandoItem ? (
                      <label className="grid-span-2">
                        Variante seleccionada
                        <input
                          type="text"
                          value={`${editandoItem.productoNombre || 'Producto'} — ${editandoItem.sku} (Talle ${editandoItem.talleNombre || '—'} / ${editandoItem.colorNombre || '—'})`}
                          disabled
                        />
                      </label>
                    ) : (
                      <>
                        <label>
                          Producto *
                          <select
                            value={form.idProducto}
                            onChange={(e) => handleCambioProducto(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Seleccione un producto...
                            </option>
                            {productos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Variante (Talle / Color / SKU) *
                          <select
                            value={form.idVariante}
                            onChange={(e) => setForm({ ...form, idVariante: e.target.value })}
                            disabled={cargandoVariantesProd || variantesProducto.length === 0}
                            required
                          >
                            {cargandoVariantesProd ? (
                              <option value="">Cargando variantes...</option>
                            ) : variantesProducto.length === 0 ? (
                              <option value="">Sin variantes en este producto</option>
                            ) : (
                              <>
                                <option value="" disabled>
                                  Seleccione una variante...
                                </option>
                                {variantesProducto.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.talleNombre} · {v.colorNombre} ({v.sku})
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </label>
                      </>
                    )}

                    <label>
                      Código del proveedor *
                      <div className="sku-input-group">
                        <input
                          type="text"
                          maxLength={50}
                          value={form.codigoProveedor}
                          onChange={(e) =>
                            setForm({ ...form, codigoProveedor: e.target.value.toUpperCase() })
                          }
                          placeholder="Ej. ART-4020-M"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={sugerirCodigoProveedor}
                          title="Usar el SKU interno como código de proveedor"
                        >
                          <Sparkles size={14} /> Usar SKU
                        </button>
                      </div>
                    </label>

                    <label>
                      Costo unitario ($) *
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.costo}
                        onChange={(e) => setForm({ ...form, costo: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </label>
                  </div>

                  <div className="variante-form-actions">
                    {editandoItem && (
                      <button
                        type="button"
                        className="btn btn-small"
                        onClick={limpiarFormulario}
                      >
                        Cancelar edición
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary btn-small"
                      disabled={guardando || (!editandoItem && variantesProducto.length === 0)}
                    >
                      <Plus size={14} />
                      {guardando
                        ? 'Guardando...'
                        : editandoItem
                          ? 'Guardar cambios'
                          : 'Vincular variante'}
                    </button>
                  </div>
                </>
              )}
            </fieldset>
          </form>

          {/* Listado de variantes que provee este proveedor */}
          <div className="variantes-list-section">
            <header className="variantes-list-head variantes-list-head-split">
              <h3>
                <Layers size={16} />
                Variantes provistas ({catalogoFiltrado.length})
              </h3>
              {catalogo.length > 0 && (
                <div className="filter-search-box">
                  <Search size={14} className="filter-icon" />
                  <input
                    type="text"
                    placeholder="Filtrar por producto, SKU, código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              )}
            </header>

            {loading ? (
              <p className="loading-state">Cargando catálogo del proveedor...</p>
            ) : catalogoFiltrado.length === 0 ? (
              <div className="empty-state empty-state-compact">
                <Layers size={36} className="empty-icon" />
                <p className="muted text-sm">
                  {busqueda
                    ? `No hay variantes que coincidan con "${busqueda}".`
                    : 'Este proveedor aún no tiene variantes ni costos asociados.'}
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">PRODUCTO</th>
                      <th scope="col">SKU INTERNO</th>
                      <th scope="col">TALLE / COLOR</th>
                      <th scope="col">CÓD. PROVEEDOR</th>
                      <th scope="col" className="num">COSTO</th>
                      <th scope="col" className="actions-header">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogoFiltrado.map((item) => (
                      <tr
                        key={item.id}
                        className={`table-row-hover${editandoItem?.id === item.id ? ' row-editing' : ''}`}
                      >
                        <th scope="row" className="row-title">
                          <strong className="row-primary-text">{item.productoNombre || '—'}</strong>
                        </th>
                        <td>
                          <code>{item.sku}</code>
                        </td>
                        <td>
                          <div className="variante-chips-inline">
                            <span className="talle-pill">{item.talleNombre || '—'}</span>
                            <span className="color-cell-chip">
                              <input
                                type="color"
                                className="color-swatch-dot"
                                value={expandirHexColor(item.colorCodigoHex)}
                                readOnly
                                tabIndex={-1}
                                aria-hidden="true"
                              />
                              <span>{item.colorNombre || '—'}</span>
                            </span>
                          </div>
                        </td>
                        <td>
                          <code>{item.codigoProveedor}</code>
                        </td>
                        <td className="num font-mono font-bold">
                          {formatoMoneda(item.costo)}
                        </td>
                        <td className="actions">
                          <button
                            type="button"
                            className="btn btn-icon"
                            onClick={() => abrirEdicion(item)}
                            title="Editar código o costo"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon danger"
                            onClick={() => handleEliminar(item)}
                            title="Desvincular variante"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

