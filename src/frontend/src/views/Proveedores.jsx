import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Truck,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  RefreshCcw,
} from 'lucide-react';
import {
  obtenerProveedores,
  altaProveedor,
  modificarProveedor,
  eliminarProveedor,
  restaurarProveedor,
} from '../services/proveedorService';
import { formatoMoneda } from '../utils/numeroALetras';
import {
  limpiarCuit,
  formatearCuit,
  validarCuit,
  validarTelefono,
} from '../utils/validaciones';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import AlertBanner from '../components/AlertBanner';
import PaginationBar from '../components/PaginationBar';

const PROVEEDOR_INICIAL = {
  nombre: '',
  razonSocial: '',
  cuit: '',
  telefono: '',
  email: '',
  direccion: '',
  diasPago: 30,
  saldoInicial: 0,
};

const TAMANO_PAGINA = 15;

export default function Proveedores() {
  const [searchParams] = useSearchParams();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [proveedorRestaurable, setProveedorRestaurable] = useState(null);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busqueda, setBusqueda] = useState(() => searchParams.get('buscar') || '');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(PROVEEDOR_INICIAL);

  const cargarProveedores = useCallback(async (pag = 1) => {
    try {
      setLoading(true);
      setError('');
      setProveedorRestaurable(null);

      const data = await obtenerProveedores({
        page: pag,
        pageSize: TAMANO_PAGINA,
        search: busqueda,
      });

      setProveedores(data.items);
      setTotalPaginas(data.totalPages);
      setTotalItems(data.totalCount);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron cargar los proveedores.'));
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  useEffect(() => {
    let activo = true;

    async function inicializar() {
      try {
        setLoading(true);
        setError('');
        setProveedorRestaurable(null);

        const data = await obtenerProveedores({
          page: pagina,
          pageSize: TAMANO_PAGINA,
          search: busqueda,
        });

        if (!activo) return;
        setProveedores(data.items);
        setTotalPaginas(data.totalPages);
        setTotalItems(data.totalCount);
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudieron cargar los proveedores.'));
      } finally {
        if (activo) setLoading(false);
      }
    }

    inicializar();
    return () => {
      activo = false;
    };
  }, [pagina, busqueda]);

  function abrirNuevo() {
    setEditandoId(null);
    setForm(PROVEEDOR_INICIAL);
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
      cuit: limpiarCuit(prov.cuit),
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

    const cuitLimpio = limpiarCuit(form.cuit);
    if (!cuitLimpio) {
      setError('El CUIT es obligatorio.');
      return;
    }
    if (cuitLimpio.length !== 11) {
      setError('El CUIT debe tener exactamente 11 dígitos numéricos, sin guiones ni puntos.');
      return;
    }
    if (!validarCuit(cuitLimpio)) {
      setError('El CUIT ingresado no es válido.');
      return;
    }

    if (form.telefono?.trim() && !validarTelefono(form.telefono)) {
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
      await cargarProveedores(pagina);
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = datosDeError(err);
      if (cod === 'Proveedor.SoftDeletedCuit') {
        setProveedorRestaurable({
          id: data?.id,
          nombre: data?.nombre,
          cuit: form.cuit,
        });
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
      await cargarProveedores(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restaurar el proveedor.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id, nombre) {
    if (!window.confirm(`¿Seguro que desea dar de baja al proveedor "${nombre || 'seleccionado'}"?`)) {
      return;
    }
    try {
      setError('');
      await eliminarProveedor(id);
      setMensaje('Proveedor dado de baja correctamente.');
      await cargarProveedores(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el proveedor.'));
    }
  }

  return (
    <main className="view proveedores-view">
      <header className="page-head">
        <article>
          <h1>Proveedores</h1>
          <p>
            Módulo de gestión de proveedores
          </p>
        </article>
        <div className="page-head-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={abrirNuevo}
          >
            <Plus size={16} />
            Nuevo proveedor
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => cargarProveedores(pagina)}
          >
            <RefreshCcw size={16} />
            Actualizar listado
          </button>
        </div>
      </header>

      <AlertBanner
        tipo="success"
        mensaje={mensaje}
        onClose={() => setMensaje('')}
      />
      {!modalAbierto && (
        <AlertBanner
          tipo="danger"
          mensaje={error}
          onClose={() => setError('')}
        />
      )}

      {/* Tabla de Proveedores */}
      <section className="card">
        <header className="card-head">
          <div>
            <h2>
              <Truck size={18} />
              Proveedores Registrados ({totalItems})
            </h2>
          </div>
          <div className="filter-search-box">
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
        </header>

        {loading ? (
          <p className="loading-state">Cargando proveedores...</p>
        ) : proveedores.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} className="empty-icon" />
            <h3>No se encontraron proveedores</h3>
            <p>
              {busqueda
                ? `No hay proveedores que coincidan con la búsqueda "${busqueda}".`
                : 'Comenzá registrando el primer proveedor para gestionar compras y precios.'}
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
                {proveedores.map((prov) => {
                  const saldo = prov.saldoInicial || 0;
                  const tieneSaldo = saldo > 0;

                  return (
                    <tr key={prov.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <div className="row-stack">
                          <strong className="row-primary-text">{prov.nombre}</strong>
                          {prov.razonSocial && (
                            <span className="row-secondary-text">
                              {prov.razonSocial}
                            </span>
                          )}
                        </div>
                      </th>
                      <td className="nowrap">
                        <code>{formatearCuit(prov.cuit)}</code>
                      </td>
                      <td>
                        <div className="contact-cell">
                          {prov.telefono && (
                            <span className="contact-item">
                              <Phone size={12} /> {prov.telefono}
                            </span>
                          )}
                          {prov.email && (
                            <span className="contact-item">
                              <Mail size={12} /> {prov.email}
                            </span>
                          )}
                          {prov.direccion && (
                            <span className="contact-item">
                              <MapPin size={12} /> {prov.direccion}
                            </span>
                          )}
                          {!prov.telefono && !prov.email && !prov.direccion && (
                            <span className="text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="term-badge">
                          <Calendar size={12} />
                          {prov.diasPago ? `${prov.diasPago} días` : 'Contado'}
                        </span>
                      </td>
                      <td className={`num font-mono${tieneSaldo ? ' danger-number font-bold' : ''}`}>
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

            <PaginationBar
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalItems={totalItems}
              etiquetaItem="proveedores"
              onPageChange={setPagina}
            />
          </>
        )}
      </section>

      {/* Modal: Alta / Edición de Proveedor */}
      {modalAbierto && (
        <div className="modal-backdrop" onClick={cerrarModal}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoId ? 'Modificar proveedor' : 'Nuevo proveedor'}</h2>
              <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardarProveedor} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error}>
                {proveedorRestaurable && (
                  <div className="alert-restore-actions">
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => handleRestaurar(proveedorRestaurable.id, proveedorRestaurable.nombre)}
                    >
                      <RotateCcw size={14} /> Restaurar proveedor existente
                    </button>
                  </div>
                )}
              </AlertBanner>

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
                  Razón social *
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
                    onChange={(e) => setForm({ ...form, cuit: limpiarCuit(e.target.value) })}
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
                  Email de contacto
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="ventas@proveedor.com"
                  />
                </label>
              </div>

              <label>
                Dirección
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Calle, número, localidad..."
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
