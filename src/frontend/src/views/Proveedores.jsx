import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  obtenerProveedores,
  altaProveedor,
  modificarProveedor,
  eliminarProveedor,
  restaurarProveedor
} from '../services/proveedorService';
import { formatoMoneda } from '../utils/numeroALetras';
import { validarCuit } from '../utils/validaciones';
import { mensajeDeError, codigoDeError } from '../services/errores';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proveedorRestaurable, setProveedorRestaurable] = useState(null);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina] = useState(15);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Búsqueda en memoria
  const [busqueda, setBusqueda] = useState('');

  // Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Formulario Proveedor (SGCS v2)
  const [form, setForm] = useState({
    nombre: '',
    razonSocial: '',
    cuit: '',
    telefono: '',
    email: '',
    direccion: '',
    diasPago: 30,
    saldoInicial: 0,
  });

  const cargarDatos = useCallback(async (pag = 1) => {
    try {
      setLoading(true);
      setError('');
      setProveedorRestaurable(null);

      const data = await obtenerProveedores({ page: pag, pageSize: tamanoPagina, search: busqueda });
      if (data && Array.isArray(data.items)) {
        setProveedores(data.items);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalCount || data.items.length);
      } else if (Array.isArray(data)) {
        setProveedores(data);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalCount || data.length);
      } else {
        setProveedores([]);
      }
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los proveedores.'));
    } finally {
      setLoading(false);
    }
  }, [tamanoPagina, busqueda]);

  useEffect(() => {
    cargarDatos(pagina);
  }, [pagina, cargarDatos]);

  // Proveedores obtenidos y filtrados desde el servidor
  const proveedoresFiltrados = proveedores;

  function abrirNuevo() {
    setEditandoId(null);
    setForm({
      nombre: '',
      razonSocial: '',
      cuit: '',
      telefono: '',
      email: '',
      direccion: '',
      diasPago: 30,
      saldoInicial: 0,
    });
    setProveedorRestaurable(null);
    setError('');
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setEditandoId(null);
    setProveedorRestaurable(null);
    setError('');
  }

  function abrirEditar(prov) {
    setEditandoId(prov.id);
    setForm({
      nombre: prov.nombre || prov.razonSocial || '',
      razonSocial: prov.razonSocial || prov.nombre || '',
      cuit: (prov.cuit || '').replace(/[-.\s]/g, ''),
      telefono: prov.telefono || '',
      email: prov.email || '',
      direccion: prov.direccion || '',
      diasPago: prov.diasPago ?? 30,
      saldoInicial: prov.saldoInicial || 0,
    });
    setProveedorRestaurable(null);
    setError('');
    setModalAbierto(true);
  }

  async function guardarProveedor(e) {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setError('El nombre o fantasía comercial es obligatorio.');
      return;
    }
    if (!form.razonSocial.trim()) {
      setError('La razón social fiscal es obligatoria.');
      return;
    }

    const cuitLimpio = form.cuit.trim().replace(/[-.\s]/g, '');
    if (!cuitLimpio) {
      setError('El CUIT es obligatorio.');
      return;
    }
    if (cuitLimpio.length !== 11 || !/^\d{11}$/.test(cuitLimpio)) {
      setError('El CUIT debe tener exactamente 11 dígitos numéricos, sin guiones ni puntos.');
      return;
    }
    if (!validarCuit(cuitLimpio)) {
      setError('El CUIT ingresado no es válido.');
      return;
    }

    if (form.telefono && !/^\d{10}$/.test(form.telefono.trim())) {
      setError('El teléfono debe tener exactamente 10 dígitos numéricos (ej. 3811234567).');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      setProveedorRestaurable(null);

      const payload = {
        ...form,
        cuit: cuitLimpio,
      };

      if (editandoId) {
        await modificarProveedor(editandoId, payload);
        setMensaje('Proveedor modificado exitosamente.');
      } else {
        await altaProveedor(payload);
        setMensaje('Proveedor registrado con éxito.');
      }

      setModalAbierto(false);
      await cargarDatos(pagina);
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = err.response?.data;
      if (cod === 'Proveedor.SoftDeletedCuit') {
        const idBaja = data?.id;
        const nombreBaja = data?.nombre;
        setProveedorRestaurable({ id: idBaja, nombre: nombreBaja, cuit: form.cuit });
      }
      setError(mensajeDeError(err, 'Error al guardar el proveedor.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleRestaurar(id, nombre) {
    try {
      setLoading(true);
      setError('');
      await restaurarProveedor(id);
      setMensaje(`Proveedor "${nombre}" restaurado exitosamente.`);
      setProveedorRestaurable(null);
      setModalAbierto(false);
      await cargarDatos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restaurar el proveedor.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id, nombre) {
    if (!window.confirm(`¿Seguro que desea dar de baja al proveedor "${nombre || 'seleccionado'}"?`)) return;
    try {
      setError('');
      await eliminarProveedor(id);
      setMensaje('Proveedor dado de baja correctamente.');
      await cargarDatos(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el proveedor.'));
    }
  }
const formatearCuit = (cuit) => {
  if (!cuit) return 'Sin CUIT';
  const soloNumeros = cuit.toString().replace(/\D/g, '');
  if (soloNumeros.length === 11) {
    return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 10)}-${soloNumeros.slice(10)}`;
  }
  return cuit;
};
  return (
    <main className="view proveedores-view">
      <header className="page-head">
        <article>
          <h1>Proveedores</h1>
          <p>
            Directorio comercial textil, condiciones de pago y seguimiento de saldos con la nueva API SGCS.
          </p>
        </article>

        <button
          type="button"
          className="btn btn-primary"
          onClick={abrirNuevo}
        >
          <Plus size={16} />
          Nuevo proveedor
        </button>
      </header>

      {/* Alertas */}
      {mensaje && (
        <div className="alert-banner alert-success">
          <Check size={18} />
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje('')} className="btn-close-alert"><X size={14} /></button>
        </div>
      )}
      {error && !modalAbierto && (
        <div className="alert-banner alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="btn-close-alert"><X size={14} /></button>
        </div>
      )}

      {/* Filtros */}
      <section className="catalog-filters">
        <div className="filter-controls">
          <div className="filter-search-box full-width-sm">
            <Search size={14} className="filter-icon" />
            <input
              type="text"
              placeholder="Buscar por Nombre, Razón Social, CUIT, contacto..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
          {busqueda && (
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => {
                setBusqueda('');
                setPagina(1);
              }}
            >
              <X size={14} /> Limpiar búsqueda
            </button>
          )}
        </div>
      </section>

      {/* Listado de Proveedores */}
      <section className="card">
        <header className="card-head">
          <h2>
            <Building2 size={18} />
            Proveedores Registrados ({totalItems})
          </h2>
          <span className="muted text-sm">Condiciones comerciales de compra mayorista</span>
        </header>

        {loading ? (
          <p className="loading-state">Cargando proveedores...</p>
        ) : proveedoresFiltrados.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} className="empty-icon" />
            <h3>No se encontraron proveedores</h3>
            <p>
              {busqueda
                ? `No hay proveedores que coincidan con la búsqueda "${busqueda}".`
                : 'Comenzá registrando el primer proveedor para gestionar compras y precios textiles.'}
            </p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">PROVEEDOR / RAZÓN SOCIAL</th>
                  <th scope="col">CUIT</th>
                  <th scope="col">CONTACTO / DIRECCIÓN</th>
                  <th scope="col">PLAZO DE PAGO</th>
                  <th scope="col" className="num">SALDO INICIAL</th>
                  <th scope="col" className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((prov) => {
                  const saldo = prov.saldoInicial || 0;
                  const tieneSaldo = saldo > 0;

                  return (
                    <tr key={prov.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <div className="supplier-name-cell">
                          <strong>{prov.nombre} </strong>
                          {prov.razonSocial && prov.razonSocial !== prov.nombre && (
                            <small className="muted">{prov.razonSocial}</small>
                          )}
                        </div>
                      </th>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <code>{formatearCuit(prov.cuit) || 'Sin CUIT'}</code>
                      </td>
                      <td>
                        <div className="contact-cell">
                          {prov.telefono && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Phone size={12} /> {prov.telefono}
                            </span>
                          )}
                          {prov.email && (
                            <small className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Mail size={12} /> {prov.email}
                            </small>
                          )}
                          {prov.direccion && (
                            <small className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MapPin size={12} /> {prov.direccion}
                            </small>
                          )}
                          {!prov.telefono && !prov.email && !prov.direccion && (
                            <span className="muted text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="term-badge">
                          <Calendar size={12} />
                          {prov.diasPago ? `${prov.diasPago} días` : 'Contado'}
                        </span>
                      </td>
                      <td className={`num font-mono ${tieneSaldo ? 'danger-number font-bold' : ''}`}>
                        {formatoMoneda(saldo)}
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => abrirEditar(prov)}
                          title="Editar proveedor"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminar(prov.id, prov.nombre)}
                          title="Eliminar proveedor"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <footer className="pagination-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
                <span className="muted text-sm">
                  Página {pagina} de {totalPaginas} ({totalItems} proveedores en total)
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

      {/* Modal: Alta / Edición de Proveedor */}
      {modalAbierto && (
        <div className="modal-backdrop" onClick={cerrarModal}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoId ? 'Modificar proveedor' : 'Nuevo proveedor'}</h2>
              <button type="button" className="btn-close" onClick={cerrarModal}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardarProveedor} className="modal-form">
              {error && (
                <div className="alert-banner alert-danger">
                  <AlertTriangle size={16} />
                  <div style={{ flex: 1 }}>
                    <span>{error}</span>
                    {proveedorRestaurable && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => handleRestaurar(proveedorRestaurable.id, proveedorRestaurable.nombre)}
                        >
                          <RotateCcw size={14} /> Restaurar proveedor existente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row-2">
                <label>
                  Nombre de fantasía / comercial *
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Textil Central"
                    required
                  />
                </label>

                <label>
                  Razón social fiscal *
                  <input
                    type="text"
                    value={form.razonSocial}
                    onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                    placeholder="Ej. Textil Central S.A."
                    required
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  CUIT (11 dígitos, sin guiones ni puntos) *
                  <input
                    type="text"
                    maxLength={11}
                    value={form.cuit}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, '');
                      setForm({ ...form, cuit: soloNumeros });
                    }}
                    placeholder="Ej. 30712345678"
                    required
                  />
                </label>

                <label>
                  Condición de pago (Días) *
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={form.diasPago}
                    onChange={(e) => setForm({ ...form, diasPago: Number(e.target.value) })}
                    placeholder="30"
                    required
                  />
                </label>
              </div>

              <div className="form-row-2">
                <label>
                  Teléfono (10 dígitos numéricos)
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej. 3811234567"
                    maxLength={10}
                  />
                </label>

                <label>
                  Email de contacto comercial
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ventas@proveedor.com"
                  />
                </label>
              </div>

              <label>
                Dirección comercial
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Calle número, localidad"
                />
              </label>

              <label>
                Saldo inicial de deuda (opcional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.saldoInicial}
                  onChange={(e) => setForm({ ...form, saldoInicial: Number(e.target.value) })}
                  placeholder="0"
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
