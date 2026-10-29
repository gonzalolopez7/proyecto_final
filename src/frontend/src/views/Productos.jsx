import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Shirt,
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  FolderTree,
  Tags,
  Layers,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';
import {
  obtenerProductos,
  altaProducto,
  modificarProducto,
  eliminarProducto,
  restaurarProducto,
} from '../services/productoService';
import {
  obtenerCategorias,
  altaCategoria,
  modificarCategoria,
  eliminarCategoria,
} from '../services/categoriaService';
import {
  obtenerGeneros,
  altaGenero,
  modificarGenero,
  eliminarGenero,
  obtenerTemporadas,
  altaTemporada,
  modificarTemporada,
  eliminarTemporada,
  obtenerFits,
  altaFit,
  modificarFit,
  eliminarFit,
  obtenerMateriales,
  altaMaterial,
  modificarMaterial,
  eliminarMaterial,
} from '../services/atributoService';
import { mensajeDeError, codigoDeError } from '../services/errores';

export default function Productos() {
  // Pestaña principal: 'productos' | 'categorias' | 'atributos'
  const [pestanaActiva, setPestanaActiva] = useState('productos');

  // Mensajes globales de feedback
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // ==========================================
  // ESTADOS: PRODUCTOS
  // ==========================================
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productoRestaurable, setProductoRestaurable] = useState(null);

  // Paginación y filtros de productos
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina] = useState(12);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroTemporada, setFiltroTemporada] = useState('');
  const [filtroFit, setFiltroFit] = useState('');
  const [filtroMaterial, setFiltroMaterial] = useState('');

  // Modal Producto
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [editandoProductoId, setEditandoProductoId] = useState(null);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    descripcion: '',
    idCategoria: '',
    idGenero: '',
    idTemporada: '',
    idFit: '',
    idMaterial: '',
  });

  // ==========================================
  // ESTADOS: CATEGORÍAS
  // ==========================================
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [busquedaCategoria, setBusquedaCategoria] = useState('');

  // Modal Categoría
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [editandoCategoriaId, setEditandoCategoriaId] = useState(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    idPadre: '',
  });

  // ==========================================
  // ESTADOS: ATRIBUTOS (GÉNERO, TEMPORADA, FIT, MATERIAL)
  // ==========================================
  const [tipoAtributo, setTipoAtributo] = useState('generos'); // 'generos' | 'temporadas' | 'fits' | 'materiales'
  const [generos, setGeneros] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [fits, setFits] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loadingAtributos, setLoadingAtributos] = useState(false);
  const [busquedaAtributo, setBusquedaAtributo] = useState('');

  // Modal Atributo
  const [modalAtributoAbierto, setModalAtributoAbierto] = useState(false);
  const [editandoAtributoId, setEditandoAtributoId] = useState(null);
  const [guardandoAtributo, setGuardandoAtributo] = useState(false);
  const [formAtributo, setFormAtributo] = useState({
    nombre: '',
  });

  // ==========================================
  // CARGAS DE DATOS
  // ==========================================

  // Cargar Catálogos maestros (Categorías y Atributos para selects)
  const cargarCatalogosMaestros = useCallback(async () => {
    try {
      const [cats, gens, temps, fts, mats] = await Promise.all([
        obtenerCategorias(),
        obtenerGeneros(),
        obtenerTemporadas(),
        obtenerFits(),
        obtenerMateriales(),
      ]);
      setCategorias(cats);
      setGeneros(gens);
      setTemporadas(temps);
      setFits(fts);
      setMateriales(mats);
    } catch (err) {
      console.error('Error al cargar catálogos auxiliares:', err);
    }
  }, []);

  // Cargar Productos paginados
  const cargarProductos = useCallback(async (pag = 1) => {
    try {
      setLoadingProductos(true);
      setError('');
      setProductoRestaurable(null);

      const params = {
        page: pag,
        pageSize: tamanoPagina,
        search: busqueda,
        idCategoria: filtroCategoria,
        idGenero: filtroGenero,
        idTemporada: filtroTemporada,
        idFit: filtroFit,
        idMaterial: filtroMaterial,
      };

      const data = await obtenerProductos(params);
      setProductos(data.items || []);
      setTotalPaginas(data.totalPages || 1);
      setTotalItems(data.totalCount || 0);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los productos.'));
    } finally {
      setLoadingProductos(false);
    }
  }, [tamanoPagina, busqueda, filtroCategoria, filtroGenero, filtroTemporada, filtroFit, filtroMaterial]);

  // Carga inicial
  useEffect(() => {
    cargarCatalogosMaestros();
  }, [cargarCatalogosMaestros]);

  useEffect(() => {
    cargarProductos(pagina);
  }, [cargarProductos, pagina]);

  // ==========================================
  // ACCIONES: PRODUCTOS
  // ==========================================

  function abrirNuevoProducto() {
    setEditandoProductoId(null);
    setFormProducto({
      nombre: '',
      descripcion: '',
      idCategoria: categorias.length > 0 ? categorias[0].id : '',
      idGenero: '',
      idTemporada: '',
      idFit: '',
      idMaterial: '',
    });
    setProductoRestaurable(null);
    setError('');
    setModalProductoAbierto(true);
  }

  function abrirEditarProducto(prod) {
    setEditandoProductoId(prod.id);
    setFormProducto({
      nombre: prod.nombre || '',
      descripcion: prod.descripcion || '',
      idCategoria: prod.idCategoria || '',
      idGenero: prod.idGenero || '',
      idTemporada: prod.idTemporada || '',
      idFit: prod.idFit || '',
      idMaterial: prod.idMaterial || '',
    });
    setProductoRestaurable(null);
    setError('');
    setModalProductoAbierto(true);
  }

  async function handleGuardarProducto(e) {
    e.preventDefault();
    if (!formProducto.nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    if (!formProducto.descripcion.trim()) {
      setError('La descripción del producto es obligatoria.');
      return;
    }
    if (!formProducto.idCategoria) {
      setError('Debe seleccionar una categoría para el producto.');
      return;
    }

    try {
      setGuardandoProducto(true);
      setError('');
      setProductoRestaurable(null);

      if (editandoProductoId) {
        await modificarProducto(editandoProductoId, formProducto);
        setMensaje('Producto modificado exitosamente.');
      } else {
        await altaProducto(formProducto);
        setMensaje('Producto registrado con éxito.');
      }

      setModalProductoAbierto(false);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = err.response?.data;
      if (cod === 'Producto.SoftDeletedName') {
        const idBaja = data?.id || data?.extensions?.id;
        const nombreBaja = data?.nombre || data?.extensions?.nombre || formProducto.nombre;
        setProductoRestaurable({ id: idBaja, nombre: nombreBaja });
      }
      setError(mensajeDeError(err, 'Error al guardar el producto.'));
    } finally {
      setGuardandoProducto(false);
    }
  }

  async function handleRestaurarProducto(id, nombre) {
    try {
      setLoadingProductos(true);
      setError('');
      await restaurarProducto(id);
      setMensaje(`Producto "${nombre}" restaurado exitosamente.`);
      setProductoRestaurable(null);
      setModalProductoAbierto(false);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restaurar el producto.'));
    } finally {
      setLoadingProductos(false);
    }
  }

  async function handleEliminarProducto(id, nombre) {
    if (!window.confirm(`¿Seguro que desea dar de baja al producto "${nombre}"?`)) return;
    try {
      setError('');
      await eliminarProducto(id);
      setMensaje('Producto dado de baja correctamente.');
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el producto.'));
    }
  }

  // ==========================================
  // ACCIONES: CATEGORÍAS
  // ==========================================

  function abrirNuevaCategoria() {
    setEditandoCategoriaId(null);
    setFormCategoria({
      nombre: '',
      idPadre: '',
    });
    setError('');
    setModalCategoriaAbierto(true);
  }

  function abrirEditarCategoria(cat) {
    setEditandoCategoriaId(cat.id);
    setFormCategoria({
      nombre: cat.nombre || '',
      idPadre: cat.idPadre || '',
    });
    setError('');
    setModalCategoriaAbierto(true);
  }

  async function handleGuardarCategoria(e) {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setGuardandoCategoria(true);
      setError('');

      if (editandoCategoriaId) {
        await modificarCategoria(editandoCategoriaId, formCategoria);
        setMensaje('Categoría modificada con éxito.');
      } else {
        await altaCategoria(formCategoria);
        setMensaje('Categoría creada con éxito.');
      }

      setModalCategoriaAbierto(false);
      const catsActualizadas = await obtenerCategorias();
      setCategorias(catsActualizadas);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'Error al guardar la categoría.'));
    } finally {
      setGuardandoCategoria(false);
    }
  }

  async function handleEliminarCategoria(id, nombre) {
    if (!window.confirm(`¿Seguro que desea eliminar la categoría "${nombre}"?`)) return;
    try {
      setError('');
      await eliminarCategoria(id);
      setMensaje(`Categoría "${nombre}" eliminada correctamente.`);
      const catsActualizadas = await obtenerCategorias();
      setCategorias(catsActualizadas);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar la categoría.'));
    }
  }

  const categoriasFiltradas = useMemo(() => {
    if (!busquedaCategoria.trim()) return categorias;
    const txt = busquedaCategoria.toLowerCase();
    return categorias.filter((c) =>
      c.nombre?.toLowerCase().includes(txt) ||
      c.padreNombre?.toLowerCase().includes(txt)
    );
  }, [categorias, busquedaCategoria]);

  // ==========================================
  // ACCIONES: ATRIBUTOS
  // ==========================================

  const listaAtributosActual = useMemo(() => {
    switch (tipoAtributo) {
      case 'generos': return generos;
      case 'temporadas': return temporadas;
      case 'fits': return fits;
      case 'materiales': return materiales;
      default: return [];
    }
  }, [tipoAtributo, generos, temporadas, fits, materiales]);

  const atributosFiltrados = useMemo(() => {
    if (!busquedaAtributo.trim()) return listaAtributosActual;
    const txt = busquedaAtributo.toLowerCase();
    return listaAtributosActual.filter((a) => a.nombre?.toLowerCase().includes(txt));
  }, [listaAtributosActual, busquedaAtributo]);

  function abrirNuevoAtributo() {
    setEditandoAtributoId(null);
    setFormAtributo({ nombre: '' });
    setError('');
    setModalAtributoAbierto(true);
  }

  function abrirEditarAtributo(item) {
    setEditandoAtributoId(item.id);
    setFormAtributo({ nombre: item.nombre || '' });
    setError('');
    setModalAtributoAbierto(true);
  }

  async function handleGuardarAtributo(e) {
    e.preventDefault();
    if (!formAtributo.nombre.trim()) {
      setError('El nombre del atributo es obligatorio.');
      return;
    }

    try {
      setGuardandoAtributo(true);
      setError('');

      if (tipoAtributo === 'generos') {
        if (editandoAtributoId) await modificarGenero(editandoAtributoId, formAtributo.nombre);
        else await altaGenero(formAtributo.nombre);
        setGeneros(await obtenerGeneros());
      } else if (tipoAtributo === 'temporadas') {
        if (editandoAtributoId) await modificarTemporada(editandoAtributoId, formAtributo.nombre);
        else await altaTemporada(formAtributo.nombre);
        setTemporadas(await obtenerTemporadas());
      } else if (tipoAtributo === 'fits') {
        if (editandoAtributoId) await modificarFit(editandoAtributoId, formAtributo.nombre);
        else await altaFit(formAtributo.nombre);
        setFits(await obtenerFits());
      } else if (tipoAtributo === 'materiales') {
        if (editandoAtributoId) await modificarMaterial(editandoAtributoId, formAtributo.nombre);
        else await altaMaterial(formAtributo.nombre);
        setMateriales(await obtenerMateriales());
      }

      setMensaje('Atributo guardado exitosamente.');
      setModalAtributoAbierto(false);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'Error al guardar el atributo.'));
    } finally {
      setGuardandoAtributo(false);
    }
  }

  async function handleEliminarAtributo(id, nombre) {
    if (!window.confirm(`¿Seguro que desea eliminar "${nombre}"?`)) return;
    try {
      setError('');
      if (tipoAtributo === 'generos') {
        await eliminarGenero(id);
        setGeneros(await obtenerGeneros());
      } else if (tipoAtributo === 'temporadas') {
        await eliminarTemporada(id);
        setTemporadas(await obtenerTemporadas());
      } else if (tipoAtributo === 'fits') {
        await eliminarFit(id);
        setFits(await obtenerFits());
      } else if (tipoAtributo === 'materiales') {
        await eliminarMaterial(id);
        setMateriales(await obtenerMateriales());
      }

      setMensaje(`Atributo "${nombre}" eliminado correctamente.`);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el atributo.'));
    }
  }

  const tituloAtributoSingular = useMemo(() => {
    switch (tipoAtributo) {
      case 'generos': return 'género';
      case 'temporadas': return 'temporada';
      case 'fits': return 'fit / calce';
      case 'materiales': return 'material';
      default: return 'atributo';
    }
  }, [tipoAtributo]);

  return (
    <main className="view productos-view">
      {/* Cabecera de Página */}
      <header className="page-head">
        <article>
          <h1>Catálogo de Productos</h1>
          <p>
            Gestión integral de artículos textiles, líneas de prendas, categorías y atributos de diseño.
          </p>
        </article>

        {pestanaActiva === 'productos' && (
          <button type="button" className="btn btn-primary" onClick={abrirNuevoProducto}>
            <Plus size={16} />
            Nuevo producto
          </button>
        )}

        {pestanaActiva === 'categorias' && (
          <button type="button" className="btn btn-primary" onClick={abrirNuevaCategoria}>
            <Plus size={16} />
            Nueva categoría
          </button>
        )}

        {pestanaActiva === 'atributos' && (
          <button type="button" className="btn btn-primary" onClick={abrirNuevoAtributo}>
            <Plus size={16} />
            Nuevo {tituloAtributoSingular}
          </button>
        )}
      </header>

      {/* Alertas Globales */}
      {mensaje && (
        <div className="alert-banner alert-success">
          <Check size={18} />
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje('')} className="btn-close-alert">
            <X size={14} />
          </button>
        </div>
      )}
      {error && !modalProductoAbierto && !modalCategoriaAbierto && !modalAtributoAbierto && (
        <div className="alert-banner alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="btn-close-alert">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Selector de Pestañas Superiores */}
      <nav className="compras-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-line, #CBD5E1)', paddingBottom: '8px' }}>
        <button
          type="button"
          className={`btn ${pestanaActiva === 'productos' ? 'btn-primary' : ''}`}
          onClick={() => { setPestanaActiva('productos'); setError(''); }}
        >
          <Shirt size={16} />
          Productos ({totalItems})
        </button>
        <button
          type="button"
          className={`btn ${pestanaActiva === 'categorias' ? 'btn-primary' : ''}`}
          onClick={() => { setPestanaActiva('categorias'); setError(''); }}
        >
          <FolderTree size={16} />
          Categorías ({categorias.length})
        </button>
        <button
          type="button"
          className={`btn ${pestanaActiva === 'atributos' ? 'btn-primary' : ''}`}
          onClick={() => { setPestanaActiva('atributos'); setError(''); }}
        >
          <Tags size={16} />
          Atributos
        </button>
      </nav>

      {/* =========================================================
          CONTENIDO: PESTAÑA PRODUCTOS
          ========================================================= */}
      {pestanaActiva === 'productos' && (
        <>
          {/* Filtros de Productos */}
          <section className="catalog-filters" style={{ marginBottom: '16px' }}>
            <div className="filter-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <div className="filter-search-box" style={{ flex: '1 1 260px' }}>
                <Search size={14} className="filter-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción de producto..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(1);
                  }}
                />
              </div>

              {/* Filtro por Categoría */}
              <select
                value={filtroCategoria}
                onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1); }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              {/* Filtro por Género */}
              <select
                value={filtroGenero}
                onChange={(e) => { setFiltroGenero(e.target.value); setPagina(1); }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Todos los géneros</option>
                {generos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>

              {/* Filtro por Temporada */}
              <select
                value={filtroTemporada}
                onChange={(e) => { setFiltroTemporada(e.target.value); setPagina(1); }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Todas las temporadas</option>
                {temporadas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>

              {/* Filtro por Fit */}
              <select
                value={filtroFit}
                onChange={(e) => { setFiltroFit(e.target.value); setPagina(1); }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Todos los fits</option>
                {fits.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>

              {/* Filtro por Material */}
              <select
                value={filtroMaterial}
                onChange={(e) => { setFiltroMaterial(e.target.value); setPagina(1); }}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13px', background: '#fff' }}
              >
                <option value="">Todos los materiales</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>

              {(busqueda || filtroCategoria || filtroGenero || filtroTemporada || filtroFit || filtroMaterial) && (
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => {
                    setBusqueda('');
                    setFiltroCategoria('');
                    setFiltroGenero('');
                    setFiltroTemporada('');
                    setFiltroFit('');
                    setFiltroMaterial('');
                    setPagina(1);
                  }}
                  title="Limpiar filtros"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          </section>

          {/* Tabla de Productos */}
          <section className="card">
            <header className="card-head">
              <h2>
                <Shirt size={18} />
                Artículos Registrados ({totalItems})
              </h2>
              <span className="muted text-sm">Prendas y modelos textiles activos</span>
            </header>

            {loadingProductos ? (
              <p className="loading-state">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <Shirt size={48} className="empty-icon" />
                <h3>No se encontraron productos</h3>
                <p>Comenzá registrando el primer artículo o modificá los criterios de búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">PRODUCTO / DESCRIPCIÓN</th>
                        <th scope="col">CATEGORÍA</th>
                        <th scope="col">ATRIBUTOS DE PRENDA</th>
                        <th scope="col" className="actions-header">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((prod) => (
                        <tr key={prod.id} className="table-row-hover">
                          <th scope="row" className="row-title">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <strong style={{ fontSize: '14px', color: 'var(--ink, #0f172a)' }}>{prod.nombre}</strong>
                              <span className="muted text-sm" style={{ fontWeight: 'normal', color: 'var(--ink-muted, #64748b)' }}>
                                {prod.descripcion}
                              </span>
                            </div>
                          </th>
                          <td>
                            <span className="category-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#F1F5F9', color: '#334155', fontWeight: 500 }}>
                              <FolderTree size={12} />
                              {prod.categoriaNombre}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {prod.generoNombre && (
                                <span className="term-badge" title="Género">
                                  {prod.generoNombre}
                                </span>
                              )}
                              {prod.temporadaNombre && (
                                <span className="barcode-badge" title="Temporada">
                                  {prod.temporadaNombre}
                                </span>
                              )}
                              {prod.fitNombre && (
                                <span className="term-badge" title="Calce / Fit">
                                  Fit: {prod.fitNombre}
                                </span>
                              )}
                              {prod.materialNombre && (
                                <span className="barcode-badge" title="Material">
                                  {prod.materialNombre}
                                </span>
                              )}
                              {!prod.generoNombre && !prod.temporadaNombre && !prod.fitNombre && !prod.materialNombre && (
                                <span className="muted text-sm">—</span>
                              )}
                            </div>
                          </td>
                          <td className="actions">
                            <button
                              type="button"
                              className="btn btn-icon"
                              onClick={() => abrirEditarProducto(prod)}
                              title="Editar producto"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-icon danger"
                              onClick={() => handleEliminarProducto(prod.id, prod.nombre)}
                              title="Dar de baja producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación de Productos */}
                {totalPaginas > 1 && (
                  <footer className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                    <span className="muted text-sm">
                      Página {pagina} de {totalPaginas} ({totalItems} productos en total)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-small"
                        disabled={pagina <= 1}
                        onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={14} /> Anterior
                      </button>
                      <button
                        type="button"
                        className="btn btn-small"
                        disabled={pagina >= totalPaginas}
                        onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                      >
                        Siguiente <ChevronRight size={14} />
                      </button>
                    </div>
                  </footer>
                )}
              </>
            )}
          </section>
        </>
      )}

      {/* =========================================================
          CONTENIDO: PESTAÑA CATEGORÍAS
          ========================================================= */}
      {pestanaActiva === 'categorias' && (
        <section className="card">
          <header className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>
                <FolderTree size={18} />
                Gestión de Categorías ({categorias.length})
              </h2>
              <span className="muted text-sm">Estructura jerárquica de prendas y rubros textiles</span>
            </div>

            <div className="filter-search-box" style={{ maxWidth: '300px' }}>
              <Search size={14} className="filter-icon" />
              <input
                type="text"
                placeholder="Filtrar categorías..."
                value={busquedaCategoria}
                onChange={(e) => setBusquedaCategoria(e.target.value)}
              />
            </div>
          </header>

          {categoriasFiltradas.length === 0 ? (
            <div className="empty-state">
              <FolderTree size={48} className="empty-icon" />
              <h3>No se encontraron categorías</h3>
              <p>Creá categorías y subcategorías (ej. Remeras, Pantalones, Camperas) para clasificar los productos.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">NOMBRE DE CATEGORÍA</th>
                    <th scope="col">CATEGORÍA PADRE (JERARQUÍA)</th>
                    <th scope="col" className="actions-header">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriasFiltradas.map((cat) => (
                    <tr key={cat.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <strong>{cat.nombre}</strong>
                      </th>
                      <td>
                        {cat.padreNombre ? (
                          <span className="category-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#F1F5F9', color: '#334155' }}>
                            <FolderTree size={12} /> {cat.padreNombre}
                          </span>
                        ) : (
                          <span className="muted text-sm font-semibold" style={{ color: 'var(--primary, #4F46E5)' }}>
                            ● Categoría Principal
                          </span>
                        )}
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => abrirEditarCategoria(cat)}
                          title="Editar categoría"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                          title="Eliminar categoría"
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
        </section>
      )}

      {/* =========================================================
          CONTENIDO: PESTAÑA ATRIBUTOS
          ========================================================= */}
      {pestanaActiva === 'atributos' && (
        <section className="card">
          <header className="card-head" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <h2>
                <Tags size={18} />
                Atributos de Producto ({listaAtributosActual.length})
              </h2>
              <span className="muted text-sm">Tablas maestras de clasificación: Géneros, Temporadas, Fits y Materiales</span>
            </div>

            <div className="filter-search-box" style={{ maxWidth: '280px' }}>
              <Search size={14} className="filter-icon" />
              <input
                type="text"
                placeholder={`Buscar en ${tipoAtributo}...`}
                value={busquedaAtributo}
                onChange={(e) => setBusquedaAtributo(e.target.value)}
              />
            </div>
          </header>

          {/* Sub-selector de Atributo */}
          <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', background: '#F8FAFC', borderBottom: '1px solid var(--border-line)' }}>
            <button
              type="button"
              className={`btn btn-small ${tipoAtributo === 'generos' ? 'btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('generos'); setBusquedaAtributo(''); }}
            >
              Géneros ({generos.length})
            </button>
            <button
              type="button"
              className={`btn btn-small ${tipoAtributo === 'temporadas' ? 'btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('temporadas'); setBusquedaAtributo(''); }}
            >
              Temporadas ({temporadas.length})
            </button>
            <button
              type="button"
              className={`btn btn-small ${tipoAtributo === 'fits' ? 'btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('fits'); setBusquedaAtributo(''); }}
            >
              Fits / Calces ({fits.length})
            </button>
            <button
              type="button"
              className={`btn btn-small ${tipoAtributo === 'materiales' ? 'btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('materiales'); setBusquedaAtributo(''); }}
            >
              Materiales ({materiales.length})
            </button>
          </div>

          {atributosFiltrados.length === 0 ? (
            <div className="empty-state">
              <Tags size={48} className="empty-icon" />
              <h3>No se encontraron registros de {tipoAtributo}</h3>
              <p>Hacé clic en "Nuevo {tituloAtributoSingular}" para agregar el primer registro a este catálogo.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">NOMBRE DE {tituloAtributoSingular.toUpperCase()}</th>
                    <th scope="col" className="actions-header">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {atributosFiltrados.map((item) => (
                    <tr key={item.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <strong>{item.nombre}</strong>
                      </th>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => abrirEditarAtributo(item)}
                          title={`Editar ${tituloAtributoSingular}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminarAtributo(item.id, item.nombre)}
                          title={`Eliminar ${tituloAtributoSingular}`}
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
        </section>
      )}

      {/* =========================================================
          MODAL: PRODUCTO (ALTA / EDICIÓN / RESTAURACIÓN)
          ========================================================= */}
      {modalProductoAbierto && (
        <div className="modal-backdrop" onClick={() => setModalProductoAbierto(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoProductoId ? 'Modificar Producto' : 'Nuevo Producto Textil'}</h2>
              <button type="button" className="btn-close" onClick={() => setModalProductoAbierto(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarProducto} className="modal-form">
              {error && (
                <div className="alert-banner alert-danger">
                  <AlertTriangle size={16} />
                  <div style={{ flex: 1 }}>
                    <span>{error}</span>
                    {productoRestaurable && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => handleRestaurarProducto(productoRestaurable.id, productoRestaurable.nombre)}
                        >
                          <RotateCcw size={14} /> Restaurar producto existente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row-2">
                <label>
                  Nombre del Producto *
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                    placeholder="Ej. Remera Básica Cuello Redondo"
                    required
                  />
                </label>

                <label>
                  Categoría Textil *
                  <select
                    value={formProducto.idCategoria}
                    onChange={(e) => setFormProducto({ ...formProducto, idCategoria: e.target.value })}
                    required
                  >
                    <option value="" disabled>Seleccione una categoría...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.padreNombre ? `${c.padreNombre} > ${c.nombre}` : c.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Descripción del Producto *
                <textarea
                  rows={2}
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                  placeholder="Detalles de diseño, composición, confección o acabados..."
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-line)', fontSize: '13.5px', resize: 'vertical' }}
                />
              </label>

              <div className="form-row-2">
                <label>
                  Género (opcional)
                  <select
                    value={formProducto.idGenero}
                    onChange={(e) => setFormProducto({ ...formProducto, idGenero: e.target.value })}
                  >
                    <option value="">Sin especificar</option>
                    {generos.map((g) => (
                      <option key={g.id} value={g.id}>{g.nombre}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Temporada (opcional)
                  <select
                    value={formProducto.idTemporada}
                    onChange={(e) => setFormProducto({ ...formProducto, idTemporada: e.target.value })}
                  >
                    <option value="">Sin especificar</option>
                    {temporadas.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  Fit / Calce (opcional)
                  <select
                    value={formProducto.idFit}
                    onChange={(e) => setFormProducto({ ...formProducto, idFit: e.target.value })}
                  >
                    <option value="">Sin especificar</option>
                    {fits.map((f) => (
                      <option key={f.id} value={f.id}>{f.nombre}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Material principal (opcional)
                  <select
                    value={formProducto.idMaterial}
                    onChange={(e) => setFormProducto({ ...formProducto, idMaterial: e.target.value })}
                  >
                    <option value="">Sin especificar</option>
                    {materiales.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalProductoAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardandoProducto}>
                  {guardandoProducto ? 'Guardando...' : editandoProductoId ? 'Guardar cambios' : 'Registrar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CATEGORÍA (ALTA / EDICIÓN)
          ========================================================= */}
      {modalCategoriaAbierto && (
        <div className="modal-backdrop" onClick={() => setModalCategoriaAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoCategoriaId ? 'Modificar Categoría' : 'Nueva Categoría'}</h2>
              <button type="button" className="btn-close" onClick={() => setModalCategoriaAbierto(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarCategoria} className="modal-form">
              {error && (
                <div className="alert-banner alert-danger">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <label>
                Nombre de la categoría *
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                  placeholder="Ej. Remeras, Pantalones, Accesorios..."
                  required
                />
              </label>

              <label>
                Categoría Padre (opcional)
                <select
                  value={formCategoria.idPadre}
                  onChange={(e) => setFormCategoria({ ...formCategoria, idPadre: e.target.value })}
                >
                  <option value="">Ninguna (Categoría Principal / Raíz)</option>
                  {categorias
                    .filter((c) => !editandoCategoriaId || c.id !== editandoCategoriaId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.padreNombre ? `${c.padreNombre} > ${c.nombre}` : c.nombre}
                      </option>
                    ))}
                </select>
              </label>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalCategoriaAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardandoCategoria}>
                  {guardandoCategoria ? 'Guardando...' : editandoCategoriaId ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: ATRIBUTO (ALTA / EDICIÓN)
          ========================================================= */}
      {modalAtributoAbierto && (
        <div className="modal-backdrop" onClick={() => setModalAtributoAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>
                {editandoAtributoId ? `Modificar ${tituloAtributoSingular}` : `Nuevo ${tituloAtributoSingular}`}
              </h2>
              <button type="button" className="btn-close" onClick={() => setModalAtributoAbierto(false)}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarAtributo} className="modal-form">
              {error && (
                <div className="alert-banner alert-danger">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <label>
                Nombre del {tituloAtributoSingular} *
                <input
                  type="text"
                  value={formAtributo.nombre}
                  onChange={(e) => setFormAtributo({ ...formAtributo, nombre: e.target.value })}
                  placeholder={
                    tipoAtributo === 'generos' ? 'Ej. Masculino, Femenino, Unisex...' :
                    tipoAtributo === 'temporadas' ? 'Ej. Verano 2026, Invierno 2026...' :
                    tipoAtributo === 'fits' ? 'Ej. Regular, Slim Fit, Oversize...' :
                    'Ej. Algodón 100%, Lino, Denim...'
                  }
                  required
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalAtributoAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardandoAtributo}>
                  {guardandoAtributo ? 'Guardando...' : editandoAtributoId ? 'Guardar cambios' : 'Crear atributo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

