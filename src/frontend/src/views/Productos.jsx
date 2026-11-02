import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Shirt,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  FolderTree,
  Tags,
  RotateCcw,
  RefreshCcw,
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
  SERVICIOS_ATRIBUTO,
  obtenerGeneros,
  obtenerTemporadas,
  obtenerFits,
  obtenerMateriales,
} from '../services/atributoService';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import AlertBanner from '../components/AlertBanner';
import PaginationBar from '../components/PaginationBar';

const PRODUCTO_INICIAL = {
  nombre: '',
  descripcion: '',
  idCategoria: '',
  idGenero: '',
  idTemporada: '',
  idFit: '',
  idMaterial: '',
};

const CATEGORIA_INICIAL = {
  nombre: '',
  idPadre: '',
};

const ATRIBUTO_INICIAL = {
  nombre: '',
};

const META_ATRIBUTO = {
  generos: {
    singular: 'género',
    plural: 'Géneros',
    nuevoLabel: 'Nuevo género',
    campoLabel: 'Nombre del género',
    placeholder: 'Ej. Masculino, Femenino, Unisex...',
  },
  temporadas: {
    singular: 'temporada',
    plural: 'Temporadas',
    nuevoLabel: 'Nueva temporada',
    campoLabel: 'Nombre de la temporada',
    placeholder: 'Ej. Verano 2026, Invierno 2026...',
  },
  fits: {
    singular: 'fit',
    plural: 'Fits',
    nuevoLabel: 'Nuevo fit',
    campoLabel: 'Nombre del fit',
    placeholder: 'Ej. Regular, Slim, Oversize...',
  },
  materiales: {
    singular: 'material',
    plural: 'Materiales',
    nuevoLabel: 'Nuevo material',
    campoLabel: 'Nombre del material',
    placeholder: 'Ej. Algodón 100%, Lino, Denim...',
  },
};

const TAMANO_PAGINA = 12;

export default function Productos() {
  const [pestanaActiva, setPestanaActiva] = useState('productos');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  // ==========================================
  // ESTADOS: PRODUCTOS
  // ==========================================
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [productoRestaurable, setProductoRestaurable] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroTemporada, setFiltroTemporada] = useState('');
  const [filtroFit, setFiltroFit] = useState('');
  const [filtroMaterial, setFiltroMaterial] = useState('');

  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [editandoProductoId, setEditandoProductoId] = useState(null);
  const [guardandoProducto, setGuardandoProducto] = useState(false);
  const [formProducto, setFormProducto] = useState(PRODUCTO_INICIAL);

  // ==========================================
  // ESTADOS: CATEGORÍAS
  // ==========================================
  const [categorias, setCategorias] = useState([]);
  const [busquedaCategoria, setBusquedaCategoria] = useState('');

  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [editandoCategoriaId, setEditandoCategoriaId] = useState(null);
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);
  const [formCategoria, setFormCategoria] = useState(CATEGORIA_INICIAL);

  // ==========================================
  // ESTADOS: ATRIBUTOS (GÉNERO, TEMPORADA, FIT, MATERIAL)
  // ==========================================
  const [tipoAtributo, setTipoAtributo] = useState('generos');
  const [generos, setGeneros] = useState([]);
  const [temporadas, setTemporadas] = useState([]);
  const [fits, setFits] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [busquedaAtributo, setBusquedaAtributo] = useState('');

  const [modalAtributoAbierto, setModalAtributoAbierto] = useState(false);
  const [editandoAtributoId, setEditandoAtributoId] = useState(null);
  const [guardandoAtributo, setGuardandoAtributo] = useState(false);
  const [formAtributo, setFormAtributo] = useState(ATRIBUTO_INICIAL);

  // ==========================================
  // CARGAS DE DATOS
  // ==========================================
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

  const cargarProductos = useCallback(async (pag = 1) => {
    try {
      setLoadingProductos(true);
      setError('');
      setProductoRestaurable(null);

      const data = await obtenerProductos({
        page: pag,
        pageSize: TAMANO_PAGINA,
        search: busqueda,
        idCategoria: filtroCategoria,
        idGenero: filtroGenero,
        idTemporada: filtroTemporada,
        idFit: filtroFit,
        idMaterial: filtroMaterial,
      });

      setProductos(data.items);
      setTotalPaginas(data.totalPages);
      setTotalItems(data.totalCount);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los productos.'));
    } finally {
      setLoadingProductos(false);
    }
  }, [busqueda, filtroCategoria, filtroGenero, filtroTemporada, filtroFit, filtroMaterial]);

  useEffect(() => {
    let activo = true;

    async function inicializarCatalogos() {
      try {
        const [cats, gens, temps, fts, mats] = await Promise.all([
          obtenerCategorias(),
          obtenerGeneros(),
          obtenerTemporadas(),
          obtenerFits(),
          obtenerMateriales(),
        ]);
        if (!activo) return;
        setCategorias(cats);
        setGeneros(gens);
        setTemporadas(temps);
        setFits(fts);
        setMateriales(mats);
      } catch (err) {
        console.error('Error al cargar catálogos auxiliares:', err);
      }
    }

    inicializarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    async function inicializarProductos() {
      try {
        setLoadingProductos(true);
        setError('');
        setProductoRestaurable(null);

        const data = await obtenerProductos({
          page: pagina,
          pageSize: TAMANO_PAGINA,
          search: busqueda,
          idCategoria: filtroCategoria,
          idGenero: filtroGenero,
          idTemporada: filtroTemporada,
          idFit: filtroFit,
          idMaterial: filtroMaterial,
        });

        if (!activo) return;
        setProductos(data.items);
        setTotalPaginas(data.totalPages);
        setTotalItems(data.totalCount);
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudieron cargar los productos.'));
      } finally {
        if (activo) setLoadingProductos(false);
      }
    }

    inicializarProductos();
    return () => {
      activo = false;
    };
  }, [pagina, busqueda, filtroCategoria, filtroGenero, filtroTemporada, filtroFit, filtroMaterial]);

  // ==========================================
  // ACCIONES: PRODUCTOS
  // ==========================================
  function abrirNuevoProducto() {
    setEditandoProductoId(null);
    const primerHoja = categorias.find((c) => !categorias.some((sub) => sub.idPadre === c.id));
    setFormProducto({
      ...PRODUCTO_INICIAL,
      idCategoria: primerHoja ? primerHoja.id : '',
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
      const data = datosDeError(err);
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
    setFormCategoria(CATEGORIA_INICIAL);
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
    return categorias.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(txt) ||
        c.padreNombre?.toLowerCase().includes(txt)
    );
  }, [categorias, busquedaCategoria]);

  // ==========================================
  // ACCIONES: ATRIBUTOS
  // ==========================================
  const metaAtributo = META_ATRIBUTO[tipoAtributo] || META_ATRIBUTO.generos;

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

  async function recargarAtributoActual(tipo) {
    const servicio = SERVICIOS_ATRIBUTO[tipo];
    if (!servicio) return;
    const actualizados = await servicio.obtenerTodos();
    if (tipo === 'generos') setGeneros(actualizados);
    else if (tipo === 'temporadas') setTemporadas(actualizados);
    else if (tipo === 'fits') setFits(actualizados);
    else if (tipo === 'materiales') setMateriales(actualizados);
  }

  function abrirNuevoAtributo() {
    setEditandoAtributoId(null);
    setFormAtributo(ATRIBUTO_INICIAL);
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

    const servicio = SERVICIOS_ATRIBUTO[tipoAtributo];
    if (!servicio) return;

    try {
      setGuardandoAtributo(true);
      setError('');

      if (editandoAtributoId) {
        await servicio.modificar(editandoAtributoId, formAtributo.nombre);
      } else {
        await servicio.alta(formAtributo.nombre);
      }

      await recargarAtributoActual(tipoAtributo);
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
    const servicio = SERVICIOS_ATRIBUTO[tipoAtributo];
    if (!servicio) return;

    try {
      setError('');
      await servicio.eliminar(id);
      await recargarAtributoActual(tipoAtributo);
      setMensaje(`Atributo "${nombre}" eliminado correctamente.`);
      await cargarProductos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el atributo.'));
    }
  }

  const hayFiltrosActivos = Boolean(
    filtroCategoria || filtroGenero || filtroTemporada || filtroFit || filtroMaterial
  );

  function limpiarFiltrosProductos() {
    setBusqueda('');
    setFiltroCategoria('');
    setFiltroGenero('');
    setFiltroTemporada('');
    setFiltroFit('');
    setFiltroMaterial('');
    setPagina(1);
  }

  return (
    <main className="view productos-view">
      <header className="page-head">
        <article>
          <h1>Productos</h1>
          <p>
            Módulo de gestión de productos, categorías y atributos
          </p>
        </article>

        <div className="page-head-actions">
          {pestanaActiva === 'productos' && (
            <>
              <button type="button" className="btn btn-primary" onClick={abrirNuevoProducto}>
                <Plus size={16} />
                Nuevo producto
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => cargarProductos(pagina)}
              >
                <RefreshCcw size={16} />
                Actualizar listado
              </button>
            </>
          )}

          {pestanaActiva === 'categorias' && (
            <>
              <button type="button" className="btn btn-primary" onClick={abrirNuevaCategoria}>
                <Plus size={16} />
                Nueva categoría
              </button>
              <button
                className="btn"
                type="button"
                onClick={cargarCatalogosMaestros}
              >
                <RefreshCcw size={16} />
                Actualizar listado
              </button>
            </>
          )}

          {pestanaActiva === 'atributos' && (
            <>
              <button type="button" className="btn btn-primary" onClick={abrirNuevoAtributo}>
                <Plus size={16} />
                {metaAtributo.nuevoLabel}
              </button>
              <button
                className="btn"
                type="button"
                onClick={cargarCatalogosMaestros}
              >
                <RefreshCcw size={16} />
                Actualizar listado
              </button>
            </>
          )}
        </div>
      </header>

      <AlertBanner
        tipo="success"
        mensaje={mensaje}
        onClose={() => setMensaje('')}
      />
      {!modalProductoAbierto && !modalCategoriaAbierto && !modalAtributoAbierto && (
        <AlertBanner
          tipo="danger"
          mensaje={error}
          onClose={() => setError('')}
        />
      )}

      {/* Selector de Pestañas Superiores */}
      <nav className="compras-tabs">
        <button
          type="button"
          className={`btn${pestanaActiva === 'productos' ? ' btn-primary' : ''}`}
          onClick={() => { setPestanaActiva('productos'); setError(''); }}
        >
          <Shirt size={16} />
          Productos ({totalItems})
        </button>
        <button
          type="button"
          className={`btn${pestanaActiva === 'categorias' ? ' btn-primary' : ''}`}
          onClick={() => { setPestanaActiva('categorias'); setError(''); }}
        >
          <FolderTree size={16} />
          Categorías ({categorias.length})
        </button>
        <button
          type="button"
          className={`btn${pestanaActiva === 'atributos' ? ' btn-primary' : ''}`}
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
          <section className="catalog-filters">
            <div className="filter-controls">
              <select
                className="select-filter"
                value={filtroCategoria}
                onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1); }}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <select
                className="select-filter"
                value={filtroGenero}
                onChange={(e) => { setFiltroGenero(e.target.value); setPagina(1); }}
              >
                <option value="">Todos los géneros</option>
                {generos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>

              <select
                className="select-filter"
                value={filtroTemporada}
                onChange={(e) => { setFiltroTemporada(e.target.value); setPagina(1); }}
              >
                <option value="">Todas las temporadas</option>
                {temporadas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>

              <select
                className="select-filter"
                value={filtroFit}
                onChange={(e) => { setFiltroFit(e.target.value); setPagina(1); }}
              >
                <option value="">Todos los fits</option>
                {fits.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>

              <select
                className="select-filter"
                value={filtroMaterial}
                onChange={(e) => { setFiltroMaterial(e.target.value); setPagina(1); }}
              >
                <option value="">Todos los materiales</option>
                {materiales.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>

              {hayFiltrosActivos && (
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={limpiarFiltrosProductos}
                  title="Limpiar filtros"
                >
                  <X size={14} /> Limpiar filtros
                </button>
              )}
            </div>
          </section>

          <section className="card">
            <header className="card-head">
              <div>
                <h2>
                  <Shirt size={18} />
                  Productos registrados ({totalItems})
                </h2>
              </div>
              <div className="filter-search-box">
                <Search size={14} className="filter-icon" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o descripción..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setPagina(1);
                  }}
                />
              </div>
            </header>

            {loadingProductos ? (
              <p className="loading-state">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <Shirt size={48} className="empty-icon" />
                <h3>No se encontraron productos</h3>
                <p>Comenzá registrando el primer producto o modificá los filtros de búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">PRODUCTO / DESCRIPCIÓN</th>
                        <th scope="col">CATEGORÍA</th>
                        <th scope="col">ATRIBUTOS</th>
                        <th scope="col" className="actions-header">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((prod) => (
                        <tr key={prod.id} className="table-row-hover">
                          <th scope="row" className="row-title">
                            <div className="row-stack">
                              <strong className="row-primary-text">{prod.nombre}</strong>
                              <span className="row-secondary-text">
                                {prod.descripcion}
                              </span>
                            </div>
                          </th>
                          <td>
                            <span className="category-pill category-pill-icon">
                              <FolderTree size={12} />
                              {prod.categoriaNombre}
                            </span>
                          </td>
                          <td>
                            <div className="pill-list">
                              {prod.generoNombre && (
                                <span className="category-pill" title="Género">
                                  {prod.generoNombre}
                                </span>
                              )}
                              {prod.temporadaNombre && (
                                <span className="category-pill" title="Temporada">
                                  {prod.temporadaNombre}
                                </span>
                              )}
                              {prod.fitNombre && (
                                <span className="category-pill" title="Fit">
                                  {prod.fitNombre}
                                </span>
                              )}
                              {prod.materialNombre && (
                                <span className="category-pill" title="Material">
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

                <PaginationBar
                  pagina={pagina}
                  totalPaginas={totalPaginas}
                  totalItems={totalItems}
                  etiquetaItem="productos"
                  onPageChange={setPagina}
                />
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
          <header className="card-head">
            <div>
              <h2>
                <FolderTree size={18} />
                Categorías registradas ({categorias.length})
              </h2>
            </div>

            <div className="filter-search-box">
              <Search size={14} className="filter-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
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
                    <th scope="col">CATEGORÍA</th>
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
                          <span className="category-pill category-pill-icon">
                            <FolderTree size={12} /> {cat.padreNombre}
                          </span>
                        ) : (
                          <span className="category-pill category-pill-strong">
                            Categoría principal
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
          <header className="card-head">
            <div>
              <h2>
                <Tags size={18} />
                {metaAtributo.plural} ({listaAtributosActual.length})
              </h2>
            </div>

            <div className="filter-search-box">
              <Search size={14} className="filter-icon" />
              <input
                type="text"
                placeholder={`Buscar en ${tipoAtributo}...`}
                value={busquedaAtributo}
                onChange={(e) => setBusquedaAtributo(e.target.value)}
              />
            </div>
          </header>

          <div className="sub-tabs-bar">
            <button
              type="button"
              className={`btn btn-small${tipoAtributo === 'generos' ? ' btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('generos'); setBusquedaAtributo(''); }}
            >
              Géneros ({generos.length})
            </button>
            <button
              type="button"
              className={`btn btn-small${tipoAtributo === 'temporadas' ? ' btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('temporadas'); setBusquedaAtributo(''); }}
            >
              Temporadas ({temporadas.length})
            </button>
            <button
              type="button"
              className={`btn btn-small${tipoAtributo === 'fits' ? ' btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('fits'); setBusquedaAtributo(''); }}
            >
              Fits ({fits.length})
            </button>
            <button
              type="button"
              className={`btn btn-small${tipoAtributo === 'materiales' ? ' btn-primary' : ''}`}
              onClick={() => { setTipoAtributo('materiales'); setBusquedaAtributo(''); }}
            >
              Materiales ({materiales.length})
            </button>
          </div>

          {atributosFiltrados.length === 0 ? (
            <div className="empty-state">
              <Tags size={48} className="empty-icon" />
              <h3>No se encontraron registros de {tipoAtributo}</h3>
              <p>Hacé clic en &quot;{metaAtributo.nuevoLabel}&quot; para agregar el primer registro a este catálogo.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col" className="col-wide">
                      NOMBRE DE {metaAtributo.singular.toUpperCase()}
                    </th>
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
                          title={`Editar ${metaAtributo.singular}`}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminarAtributo(item.id, item.nombre)}
                          title={`Eliminar ${metaAtributo.singular}`}
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
              <h2>{editandoProductoId ? 'Modificar producto' : 'Nuevo producto'}</h2>
              <button type="button" className="btn-close" onClick={() => setModalProductoAbierto(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarProducto} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error}>
                {productoRestaurable && (
                  <div className="alert-restore-actions">
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => handleRestaurarProducto(productoRestaurable.id, productoRestaurable.nombre)}
                    >
                      <RotateCcw size={14} /> Restaurar producto existente
                    </button>
                  </div>
                )}
              </AlertBanner>

              <div className="form-row-2">
                <label>
                  Nombre del Producto *
                  <input
                    type="text"
                    value={formProducto.nombre}
                    onChange={(e) => setFormProducto({ ...formProducto, nombre: e.target.value })}
                    placeholder="Ej. Remera Básica"
                    required
                  />
                </label>

                <label>
                  Categoría *
                  <select
                    value={formProducto.idCategoria}
                    onChange={(e) => setFormProducto({ ...formProducto, idCategoria: e.target.value })}
                    required
                  >
                    <option value="" disabled>Seleccione una categoría...</option>
                    {categorias.map((c) => {
                      const tieneSubcategorias = categorias.some((sub) => sub.idPadre === c.id);
                      return (
                        <option key={c.id} value={c.id} disabled={tieneSubcategorias}>
                          {c.padreNombre ? `${c.padreNombre} > ${c.nombre}` : c.nombre}
                          {tieneSubcategorias ? ' (Categoría padre)' : ''}
                        </option>
                      );
                    })}
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
                  Fit (opcional)
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
              <button type="button" className="btn-close" onClick={() => setModalCategoriaAbierto(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarCategoria} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error} />

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
                Categoría padre
                <select
                  value={formCategoria.idPadre}
                  onChange={(e) => setFormCategoria({ ...formCategoria, idPadre: e.target.value })}
                >
                  <option value="">Ninguna (Categoría principal)</option>
                  {categorias
                    .filter((c) => !editandoCategoriaId || c.id !== editandoCategoriaId)
                    .map((c) => (
                      <option key={c.id} value={c.id} disabled={c.tieneProductos}>
                        {c.padreNombre ? `${c.padreNombre} > ${c.nombre}` : c.nombre}
                        {c.tieneProductos ? ' (Tiene productos asignados)' : ''}
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
                {editandoAtributoId ? `Modificar ${metaAtributo.singular}` : metaAtributo.nuevoLabel}
              </h2>
              <button type="button" className="btn-close" onClick={() => setModalAtributoAbierto(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleGuardarAtributo} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error} />

              <label>
                {metaAtributo.campoLabel} *
                <input
                  type="text"
                  value={formAtributo.nombre}
                  onChange={(e) => setFormAtributo({ ...formAtributo, nombre: e.target.value })}
                  placeholder={metaAtributo.placeholder}
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
