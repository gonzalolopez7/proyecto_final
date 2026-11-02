import { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  X,
  RotateCcw,
  Sparkles,
  Ruler,
  FolderTree,
} from 'lucide-react';
import {
  obtenerVariantesPorProducto,
  altaVariante,
  modificarVariante,
  eliminarVariante,
  restaurarVariante,
} from '../services/varianteService';
import { obtenerTallesPorEscala } from '../services/atributoService';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import { expandirHexColor, resumirTallesEscala } from '../utils/validaciones';
import AlertBanner from './AlertBanner';

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

export default function VariantesProductoModal({
  producto,
  colores = [],
  onClose,
}) {
  const [variantes, setVariantes] = useState([]);
  const [tallesEscala, setTallesEscala] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [varianteRestaurable, setVarianteRestaurable] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VARIANTE_INICIAL);

  async function cargarDatosProducto() {
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

      setForm((actual) => ({
        ...actual,
        idTalle: actual.idTalle || listaTalles[0]?.id || '',
        idColor: actual.idColor || colores[0]?.id || '',
      }));
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
        setForm({
          sku: '',
          idTalle: listaTalles[0]?.id || '',
          idColor: colores[0]?.id || '',
          stockMinimo: 0,
        });
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
  }, [producto?.id, producto?.idEscalaTalle, colores]);

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

  function limpiarFormulario() {
    setEditandoId(null);
    setVarianteRestaurable(null);
    setForm({
      sku: '',
      idTalle: tallesEscala[0]?.id || '',
      idColor: colores[0]?.id || '',
      stockMinimo: 0,
    });
  }

  function abrirEditarVariante(variante) {
    setEditandoId(variante.id);
    setVarianteRestaurable(null);
    setError('');
    setMensaje('');
    setForm({
      sku: variante.sku || '',
      idTalle: variante.idTalle || '',
      idColor: variante.idColor || '',
      stockMinimo: variante.stockMinimo ?? 0,
    });
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

      limpiarFormulario();
      await cargarDatosProducto();
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = datosDeError(err);

      if (cod === 'Variante.SoftDeletedSku' || cod === 'Variante.SoftDeletedCombination') {
        const idBaja = data?.id || data?.extensions?.id;
        const etiqueta =
          cod === 'Variante.SoftDeletedSku'
            ? `SKU ${data?.sku || form.sku.toUpperCase()}`
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
      limpiarFormulario();
      await cargarDatosProducto();
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
        limpiarFormulario();
      }
      await cargarDatosProducto();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo dar de baja la variante.'));
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="variantes-modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <h2 id="variantes-modal-titulo">
              Variantes de {producto?.nombre}
            </h2>
            <div className="variante-header-meta">
              <span className="category-pill category-pill-icon">
                <FolderTree size={12} />
                {producto?.categoriaNombre || 'Sin categoría'}
              </span>
              <span className="category-pill category-pill-icon">
                <Ruler size={12} />
                Escala: <strong>{producto?.escalaTalleNombre || 'Sin escala'}</strong>
                {tallesEscala.length > 0 && (
                  <span>({resumirTallesEscala(tallesEscala, 3)})</span>
                )}
              </span>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body-padded">
          <AlertBanner
            tipo="success"
            mensaje={mensaje}
            onClose={() => setMensaje('')}
          />

          <AlertBanner
            tipo="danger"
            mensaje={error}
            onClose={() => setError('')}
          >
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

          {/* Formulario de Alta / Edición de Variante */}
          <form onSubmit={handleGuardarVariante} className="modal-form variante-inline-form">
            <fieldset className="form-section">
              <legend>
                {editandoId ? 'Modificar variante seleccionada' : 'Agregar nueva variante'}
              </legend>

              {colores.length === 0 ? (
                <p className="muted text-sm">
                  No hay colores registrados en el catálogo. Creá al menos un color en la pestaña &quot;Atributos &gt; Colores&quot; para poder registrar variantes.
                </p>
              ) : tallesEscala.length === 0 && !loading ? (
                <p className="muted text-sm">
                  El producto no tiene una escala de talles válida con talles asociados. Editá el producto y asignale una escala de talles.
                </p>
              ) : (
                <>
                  <div className="variante-form-grid">
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

                    <label>
                      SKU *
                      <div className="sku-input-group">
                        <input
                          type="text"
                          maxLength={50}
                          value={form.sku}
                          onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                          placeholder="Ej. REM-NEG-M"
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

                  <div className="variante-form-actions">
                    {editandoId && (
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
                      disabled={guardando}
                    >
                      <Plus size={14} />
                      {guardando
                        ? 'Guardando...'
                        : editandoId
                          ? 'Guardar cambios'
                          : 'Agregar variante'}
                    </button>
                  </div>
                </>
              )}
            </fieldset>
          </form>

          {/* Listado de Variantes del Producto */}
          <div className="variantes-list-section">
            <header className="variantes-list-head">
              <h3>
                <Layers size={16} />
                Variantes registradas ({variantes.length})
              </h3>
            </header>

            {loading ? (
              <p className="loading-state">Cargando variantes...</p>
            ) : variantes.length === 0 ? (
              <div className="empty-state empty-state-compact">
                <Layers size={36} className="empty-icon" />
                <p className="muted text-sm">
                  Este producto todavía no tiene variantes de talle y color registradas.
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
