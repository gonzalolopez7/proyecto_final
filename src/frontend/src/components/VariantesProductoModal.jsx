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
  Truck,
  Award,
  MapPin,
} from 'lucide-react';
import {
  obtenerVariantesPorProducto,
  altaVariante,
  modificarVariante,
  eliminarVariante,
  restaurarVariante,
} from '../services/varianteService';
import {
  obtenerProveedoresPorVariante,
  altaVarianteProveedor,
  modificarVarianteProveedor,
  eliminarVarianteProveedor,
} from '../services/varianteProveedorService';
import { obtenerProveedores } from '../services/proveedorService';
import { obtenerTallesPorEscala } from '../services/atributoService';
import { formatoMoneda } from '../utils/numeroALetras';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import { expandirHexColor, resumirTallesEscala } from '../utils/validaciones';
import AlertBanner from './AlertBanner';
import UbicacionVarianteModal from './UbicacionVarianteModal';

const VARIANTE_INICIAL = {
  sku: '',
  idTalle: '',
  idColor: '',
  stockMinimo: 0,
};

const FORM_PROV_INICIAL = {
  idProveedor: '',
  codigoProveedor: '',
  costo: 0,
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
  const [catalogoProveedores, setCatalogoProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [varianteRestaurable, setVarianteRestaurable] = useState(null);

  const [varianteUbicando, setVarianteUbicando] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VARIANTE_INICIAL);

  // Estados para el panel de Proveedores y Costos de una variante seleccionada
  const [varianteProveedoresActiva, setVarianteProveedoresActiva] = useState(null);
  const [proveedoresVariante, setProveedoresVariante] = useState([]);
  const [loadingProveedoresVar, setLoadingProveedoresVar] = useState(false);
  const [guardandoProveedorVar, setGuardandoProveedorVar] = useState(false);
  const [editandoRelacionId, setEditandoRelacionId] = useState(null);
  const [formProv, setFormProv] = useState(FORM_PROV_INICIAL);

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
        const [listaVariantes, listaTalles, respProveedores] = await Promise.all([
          obtenerVariantesPorProducto(producto.id),
          obtenerTallesPorEscala(producto.idEscalaTalle),
          obtenerProveedores({ page: 1, pageSize: 100 }),
        ]);
        if (!activo) return;
        setVariantes(listaVariantes);
        setTallesEscala(listaTalles);
        const itemsProv = respProveedores?.items || [];
        setCatalogoProveedores(itemsProv);

        setForm({
          sku: '',
          idTalle: listaTalles[0]?.id || '',
          idColor: colores[0]?.id || '',
          stockMinimo: 0,
        });
        setFormProv({
          idProveedor: itemsProv[0]?.id || '',
          codigoProveedor: '',
          costo: 0,
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
      if (varianteProveedoresActiva?.id === id) {
        setVarianteProveedoresActiva(null);
      }
      await cargarDatosProducto();
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo dar de baja la variante.'));
    }
  }

  // =========================================================
  // GESTIÓN DE PROVEEDORES Y COSTOS POR VARIANTE
  // =========================================================
  async function cargarProveedoresDeVariante(idVariante) {
    if (!idVariante) return;
    try {
      setLoadingProveedoresVar(true);
      const lista = await obtenerProveedoresPorVariante(idVariante);
      setProveedoresVariante(lista);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los proveedores de la variante.'));
    } finally {
      setLoadingProveedoresVar(false);
    }
  }

  async function toggleProveedoresVariante(variante) {
    if (varianteProveedoresActiva?.id === variante.id) {
      setVarianteProveedoresActiva(null);
      setEditandoRelacionId(null);
      return;
    }

    setVarianteProveedoresActiva(variante);
    setEditandoRelacionId(null);
    setError('');
    setMensaje('');
    setFormProv({
      idProveedor: catalogoProveedores[0]?.id || '',
      codigoProveedor: variante.sku || '',
      costo: 0,
    });
    await cargarProveedoresDeVariante(variante.id);
  }

  function limpiarFormProv() {
    setEditandoRelacionId(null);
    setFormProv({
      idProveedor: catalogoProveedores[0]?.id || '',
      codigoProveedor: varianteProveedoresActiva?.sku || '',
      costo: 0,
    });
  }

  function abrirEditarRelacion(rel) {
    setEditandoRelacionId(rel.id);
    setError('');
    setMensaje('');
    setFormProv({
      idProveedor: rel.idProveedor,
      codigoProveedor: rel.codigoProveedor || '',
      costo: rel.costo ?? 0,
    });
  }

  async function handleGuardarProveedorVariante(e) {
    e.preventDefault();
    if (!varianteProveedoresActiva) return;

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
      setGuardandoProveedorVar(true);

      if (editandoRelacionId) {
        await modificarVarianteProveedor(editandoRelacionId, {
          codigoProveedor: formProv.codigoProveedor,
          costo: formProv.costo,
        });
        setMensaje('Costo y código del proveedor actualizados.');
      } else {
        await altaVarianteProveedor({
          idVariante: varianteProveedoresActiva.id,
          idProveedor: formProv.idProveedor,
          codigoProveedor: formProv.codigoProveedor,
          costo: formProv.costo,
        });
        setMensaje(`Proveedor vinculado a la variante ${varianteProveedoresActiva.sku}.`);
      }

      limpiarFormProv();
      await cargarProveedoresDeVariante(varianteProveedoresActiva.id);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo guardar la relación con el proveedor.'));
    } finally {
      setGuardandoProveedorVar(false);
    }
  }

  async function handleEliminarRelacion(rel) {
    if (
      !window.confirm(
        `¿Seguro que desea desvincular al proveedor "${rel.proveedorNombre || ''}" de la variante "${varianteProveedoresActiva?.sku}"?`
      )
    ) {
      return;
    }

    try {
      setError('');
      setMensaje('');
      await eliminarVarianteProveedor(rel.id);
      setMensaje('Proveedor desvinculado de la variante.');
      if (editandoRelacionId === rel.id) {
        limpiarFormProv();
      }
      await cargarProveedoresDeVariante(varianteProveedoresActiva.id);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo desvincular el proveedor.'));
    }
  }

  return (
    <>
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
                    {variantes.map((v) => {
                      const proveedoresAbiertos = varianteProveedoresActiva?.id === v.id;
                      return (
                        <tr
                          key={v.id}
                          className={`table-row-hover${editandoId === v.id || proveedoresAbiertos ? ' row-editing' : ''}`}
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
                              className={`btn btn-small${proveedoresAbiertos ? ' btn-primary' : ''}`}
                              onClick={() => toggleProveedoresVariante(v)}
                              title="Ver y gestionar proveedores y costos de esta variante"
                            >
                              <Truck size={14} />
                              Proveedores
                            </button>
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
                              title="Ver y asignar ubicación física"
                            >
                              <MapPin size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Panel desplegable: Proveedores y Costos de la Variante seleccionada */}
          {varianteProveedoresActiva && (
            <section className="variante-proveedores-panel">
              <header className="variante-proveedores-head">
                <div className="variante-proveedores-title">
                  <h3>
                    <Truck size={16} />
                    Proveedores y costos de <code>{varianteProveedoresActiva.sku}</code>
                  </h3>
                  <span className="talle-pill">{varianteProveedoresActiva.talleNombre}</span>
                  <span className="color-cell-chip text-sm">
                    <input
                      type="color"
                      className="color-swatch-dot"
                      value={expandirHexColor(varianteProveedoresActiva.colorCodigoHex)}
                      readOnly
                      tabIndex={-1}
                      aria-hidden="true"
                    />
                    <span>{varianteProveedoresActiva.colorNombre}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => setVarianteProveedoresActiva(null)}
                >
                  <X size={14} /> Cerrar panel
                </button>
              </header>

              {/* Formulario de vinculación / edición de costo por proveedor */}
              <form onSubmit={handleGuardarProveedorVariante} className="modal-form variante-inline-form">
                <fieldset className="form-section">
                  <legend>
                    {editandoRelacionId
                      ? 'Modificar código y costo del proveedor'
                      : 'Vincular proveedor a esta variante'}
                  </legend>

                  {catalogoProveedores.length === 0 ? (
                    <p className="muted text-sm">
                      No hay proveedores registrados. Creá un proveedor desde el módulo Proveedores para asociar costos.
                    </p>
                  ) : (
                    <>
                      <div className="variante-prov-form-grid">
                        <label>
                          Proveedor *
                          <select
                            value={formProv.idProveedor}
                            onChange={(e) => setFormProv({ ...formProv, idProveedor: e.target.value })}
                            disabled={Boolean(editandoRelacionId)}
                            required
                          >
                            <option value="" disabled>
                              Seleccione un proveedor...
                            </option>
                            {catalogoProveedores.map((prov) => (
                              <option key={prov.id} value={prov.id}>
                                {prov.nombre} ({prov.razonSocial})
                              </option>
                            ))}
                          </select>
                        </label>

                        <label>
                          Código en el proveedor *
                          <input
                            type="text"
                            maxLength={50}
                            value={formProv.codigoProveedor}
                            onChange={(e) =>
                              setFormProv({
                                ...formProv,
                                codigoProveedor: e.target.value.toUpperCase(),
                              })
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

                      <div className="variante-form-actions">
                        {editandoRelacionId && (
                          <button
                            type="button"
                            className="btn btn-small"
                            onClick={limpiarFormProv}
                          >
                            Cancelar edición
                          </button>
                        )}
                        <button
                          type="submit"
                          className="btn btn-primary btn-small"
                          disabled={guardandoProveedorVar}
                        >
                          <Plus size={14} />
                          {guardandoProveedorVar
                            ? 'Guardando...'
                            : editandoRelacionId
                              ? 'Actualizar costo / código'
                              : 'Asociar proveedor'}
                        </button>
                      </div>
                    </>
                  )}
                </fieldset>
              </form>

              {/* Tabla comparativa de proveedores (ordenada de menor a mayor costo) */}
              {loadingProveedoresVar ? (
                <p className="loading-state">Cargando costos por proveedor...</p>
              ) : proveedoresVariante.length === 0 ? (
                <div className="empty-state empty-state-compact">
                  <Truck size={32} className="empty-icon" />
                  <p className="muted text-sm">
                    Ningún proveedor está vinculado todavía a la variante <strong>{varianteProveedoresActiva.sku}</strong>.
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">PROVEEDOR</th>
                        <th scope="col">CÓD. PROVEEDOR</th>
                        <th scope="col" className="num">COSTO UNITARIO</th>
                        <th scope="col" className="actions-header">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proveedoresVariante.map((rel, idx) => {
                        const esMejorCosto = idx === 0 && proveedoresVariante.length > 1;
                        
                        return (
                          <tr
                            key={rel.id}
                            className={`table-row-hover${editandoRelacionId === rel.id ? ' row-editing' : ''}`}
                          >
                            <th scope="row" className="row-title">
                              <div className="row-stack">
                                <span className="variante-prov-name-row">
                                  <strong className="row-primary-text">{rel.proveedorNombre || '—'}</strong>
                                  {esMejorCosto && (
                                    <span className="best-cost-badge" title="Proveedor con el menor costo registrado para esta variante">
                                      <Award size={12} /> Mejor costo
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
          )}
        </div>
      </div>
    </div>
    {varianteUbicando && (
      <UbicacionVarianteModal
        variante={varianteUbicando}
        onClose={() => setVarianteUbicando(null)}
      /> 
      )}
    </>
  );
  
}
