import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Shield,
  KeyRound,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail
} from 'lucide-react';
import {
  obtenerUsuarios,
  altaUsuario,
  modificarUsuario,
  eliminarUsuario,
  restaurarUsuario,
  resetPasswordUsuario,
} from '../services/usuarioService';
import useRoles from '../hooks/useRoles';
import { mensajeDeError, codigoDeError } from '../services/errores';

const usuarioInicial = {
  userName: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmarPassword: '',
  email: '',
  phoneNumber: '',
  role: 'Encargado',
};

const ROL_INFO = {
  admin: { etiqueta: 'Administrador', detalle: 'Acceso completo al sistema y gestión de usuarios' },
  administrador: { etiqueta: 'Administrador', detalle: 'Acceso completo al sistema y gestión de usuarios' },
  encargado: { etiqueta: 'Encargado', detalle: 'Gestión operativa, compras y proveedores' },
  comprador: { etiqueta: 'Comprador', detalle: 'Gestión de órdenes de compra y proveedores' },
  operadorinventario: { etiqueta: 'Operador de inventario', detalle: 'Catálogo de productos y conteos de stock' },
  operadorlogistica: { etiqueta: 'Operador de logística', detalle: 'Movimientos de stock y ubicaciones' },
};

function infoRol(nombre = '') {
  const clave = nombre.normalize('NFD').replace(/[\u0300-\u036f\s_-]/g, '').toLowerCase();
  return ROL_INFO[clave] || { etiqueta: nombre, detalle: '' };
}

export default function Usuarios() {
  const { roles, cargando: cargandoRoles, error: errorRoles, recargar: recargarRoles } = useRoles();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(usuarioInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [passwordResetData, setPasswordResetData] = useState({ id: null, userName: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarioRestaurable, setUsuarioRestaurable] = useState(null);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [tamanoPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const cargarUsuarios = useCallback(async (pag = 1) => {
    try {
      setLoading(true);
      setError('');
      setUsuarioRestaurable(null);
      const data = await obtenerUsuarios({ page: pag, pageSize: tamanoPagina });
      if (data && Array.isArray(data.items)) {
        setUsuarios(data.items);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalCount || data.items.length);
      } else if (Array.isArray(data)) {
        setUsuarios(data);
        setTotalPaginas(data.totalPages || 1);
        setTotalItems(data.totalCount || data.length);
      } else {
        setUsuarios([]);
      }
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron obtener los usuarios.'));
    } finally {
      setLoading(false);
    }
  }, [tamanoPagina]);

  useEffect(() => {
    let ignorar = false;
    obtenerUsuarios({ page: pagina, pageSize: tamanoPagina })
      .then((data) => {
        if (ignorar) return;
        if (data && Array.isArray(data.items)) {
          setUsuarios(data.items);
          setTotalPaginas(data.totalPages || 1);
          setTotalItems(data.totalCount || data.items.length);
        } else if (Array.isArray(data)) {
          setUsuarios(data);
          setTotalPaginas(data.totalPages || 1);
          setTotalItems(data.totalCount || data.length);
        }
      })
      .catch((err) => {
        if (ignorar) return;
        setError(mensajeDeError(err, 'No se pudieron cargar los usuarios.'));
      })
      .finally(() => {
        if (!ignorar) setLoading(false);
      });
    return () => { ignorar = true; };
  }, [pagina, tamanoPagina]);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setForm(usuarioInicial);
    setEditandoId(null);
    setUsuarioRestaurable(null);
  }

  function abrirNuevo() {
    limpiarFormulario();
    setError('');
    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);
    setError('');
    limpiarFormulario();
  }

  function cerrarModalPassword() {
    setModalPasswordAbierto(false);
    setError('');
  }

  function editar(usuario) {
    setModalAbierto(true);
    setEditandoId(usuario.id);
    setUsuarioRestaurable(null);
    setError('');
    setForm({
      userName: usuario.userName ?? '',
      firstName: usuario.firstName ?? '',
      lastName: usuario.lastName ?? '',
      email: usuario.email ?? '',
      phoneNumber: usuario.phoneNumber ?? '',
      role: usuario.role ?? 'Encargado',
      password: '',
      confirmarPassword: '',
    });
  }

  function abrirResetPassword(usuario) {
    setPasswordResetData({
      id: usuario.id,
      userName: usuario.userName,
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setModalPasswordAbierto(true);
  }

  async function guardarResetPassword(e) {
    e.preventDefault();
    if (!passwordResetData.newPassword || passwordResetData.newPassword.length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setGuardando(true);
      setError('');
      await resetPasswordUsuario(passwordResetData.id, passwordResetData.newPassword);
      setMensaje(`Contraseña restablecida exitosamente para ${passwordResetData.userName}.`);
      setModalPasswordAbierto(false);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restablecer la contraseña.'));
    } finally {
      setGuardando(false);
    }
  }

  async function guardar(event) {
    event.preventDefault();
    setError('');
    setMensaje('');

    if (!form.userName?.trim() || !form.firstName?.trim() || !form.lastName?.trim()) {
      setError('Completá los campos obligatorios (Usuario, Nombre y Apellido).');
      return;
    }

    if (form.userName.trim().length < 4) {
      setError('El nombre de usuario debe tener al menos 4 caracteres.');
      return;
    }

    if (!form.role) {
      setError('Elegí un rol para el usuario.');
      return;
    }

    if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber.trim())) {
      setError('El teléfono debe tener exactamente 10 dígitos numéricos (ej. 3811234567).');
      return;
    }

    if (!editandoId) {
      if (!form.password) {
        setError('La contraseña es obligatoria.');
        return;
      }
      if (form.password.length < 4) {
        setError('La contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (form.password !== form.confirmarPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    try {
      setGuardando(true);
      setError('');
      setUsuarioRestaurable(null);

      if (editandoId) {
        await modificarUsuario(editandoId, {
          userName: form.userName.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email?.trim() || null,
          phoneNumber: form.phoneNumber?.trim() || null,
          role: form.role,
        });
        setMensaje('Usuario modificado correctamente.');
      } else {
        await altaUsuario({
          userName: form.userName.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email?.trim() || null,
          phoneNumber: form.phoneNumber?.trim() || null,
          role: form.role,
        });
        setMensaje('Usuario creado correctamente.');
      }
      cerrarModal();
      await cargarUsuarios(pagina);
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = err.response?.data;
      if (cod === 'User.SoftDeletedUser') {
        setUsuarioRestaurable({
          id: data?.id,
          userName: data?.userName,
        });
      }
      setError(mensajeDeError(err, 'No se pudo guardar el usuario.'));
    } finally {
      setGuardando(false);
    }
  }

  async function handleRestaurar(id, userName) {
    try {
      setLoading(true);
      setError('');
      await restaurarUsuario(id);
      setMensaje(`Usuario "${userName}" restaurado exitosamente.`);
      setUsuarioRestaurable(null);
      cerrarModal();
      await cargarUsuarios(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo restaurar el usuario.'));
    } finally {
      setLoading(false);
    }
  }

  async function eliminar(id, nombre) {
    const confirmar = window.confirm(`¿Seguro que querés dar de baja al usuario "${nombre || 'seleccionado'}"?`);
    if (!confirmar) return;

    try {
      setError('');
      await eliminarUsuario(id);
      setMensaje('Usuario dado de baja correctamente.');
      await cargarUsuarios(pagina);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudo eliminar el usuario.'));
    }
  }

  return (
    <main className="view usuarios-view">
      <header className="page-head">
        <article>
          <h1>Usuarios y roles</h1>
          <p>
            Control de acceso basado en roles (Admin, Encargado, Comprador, Operadores) y administración de credenciales de seguridad.
          </p>
        </article>

        <button type="button" className="btn btn-primary" onClick={abrirNuevo}>
          <UserPlus size={16} />
          Nuevo usuario
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
      {error && !modalAbierto && !modalPasswordAbierto && (
        <div className="alert-banner alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} className="btn-close-alert"><X size={14} /></button>
        </div>
      )}

      {/* Modal: Alta / Modificación de usuario */}
      {modalAbierto && (
        <div className="modal-backdrop" onClick={cerrarModal}>
          <div
            className="modal-content modal-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuario-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <h2 id="usuario-modal-titulo">
                  {editandoId ? 'Modificar usuario' : 'Nuevo usuario'}
                </h2>
                <p className="modal-subtitle">
                  {editandoId
                    ? 'Actualizá los datos de perfil y rol del usuario.'
                    : 'Creá la cuenta y asignale los permisos correspondientes.'}
                </p>
              </div>
              <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardar} className="modal-form usuario-form">
              {error && (
                <div className="alert-banner alert-danger" role="alert">
                  <AlertTriangle size={18} />
                  <div style={{ flex: 1 }}>
                    <span>{error}</span>
                    {usuarioRestaurable && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-small"
                          onClick={() => handleRestaurar(usuarioRestaurable.id, usuarioRestaurable.userName)}
                        >
                          <RotateCcw size={14} /> Restaurar usuario existente
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <fieldset className="form-section">
                <legend>Datos personales</legend>
                <div className="form-row-2">
                  <label>
                    Nombre *
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={cambiarCampo}
                      placeholder="Marta"
                      autoComplete="given-name"
                      required
                    />
                  </label>
                  <label>
                    Apellido *
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={cambiarCampo}
                      placeholder="Gómez"
                      autoComplete="family-name"
                      required
                    />
                  </label>
                </div>
                <div className="form-row-2">
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={cambiarCampo}
                      placeholder="marta.gomez@negocio.com"
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    Teléfono (10 dígitos)
                    <input
                      name="phoneNumber"
                      type="text"
                      value={form.phoneNumber}
                      onChange={cambiarCampo}
                      placeholder="Ej. 3811234567"
                      maxLength={10}
                      autoComplete="off"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Credenciales de acceso</legend>
                <label>
                  Nombre de usuario * (mínimo 4 caracteres)
                  <input
                    name="userName"
                    value={form.userName}
                    onChange={cambiarCampo}
                    placeholder="marta.gomez"
                    autoComplete="off"
                    required
                  />
                </label>

                {!editandoId && (
                  <div className="form-row-2">
                    <label>
                      Contraseña * (mínimo 4 caracteres)
                      <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={cambiarCampo}
                        placeholder="Ingresá la clave"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                    <label>
                      Repetir contraseña *
                      <input
                        name="confirmarPassword"
                        type="password"
                        value={form.confirmarPassword}
                        onChange={cambiarCampo}
                        placeholder="Escribila de nuevo"
                        autoComplete="new-password"
                        required
                      />
                    </label>
                  </div>
                )}
              </fieldset>

              <fieldset className="form-section">
                <legend>Rol asignado</legend>
                {cargandoRoles ? (
                  <p className="muted text-sm" role="status">Cargando roles...</p>
                ) : errorRoles ? (
                  <div className="alert-banner alert-danger" role="alert">
                    <AlertTriangle size={18} />
                    <span>{errorRoles}</span>
                    <button type="button" className="btn btn-small" style={{ marginLeft: 'auto' }} onClick={recargarRoles}>
                      Reintentar
                    </button>
                  </div>
                ) : roles.length === 0 ? (
                  <p className="muted text-sm">No hay roles disponibles.</p>
                ) : (
                  <div className="role-options">
                    {roles.map((r) => {
                      const idRol = r.id || r.nombre;
                      const info = infoRol(idRol);
                      return (
                        <label
                          key={idRol}
                          className={`role-option ${form.role === idRol ? 'selected' : ''}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={idRol}
                            checked={form.role === idRol}
                            onChange={cambiarCampo}
                          />
                          <span className="role-option-name">{info.etiqueta}</span>
                          <span className="role-option-desc">{info.detalle}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              <div className="modal-actions">
                <button className="btn" type="button" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button className="btn btn-primary" type="submit" disabled={guardando}>
                  {guardando
                    ? 'Guardando...'
                    : editandoId
                      ? 'Guardar cambios'
                      : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restablecer Contraseña */}
      {modalPasswordAbierto && (
        <div className="modal-backdrop" onClick={cerrarModalPassword}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <div>
                <h2>Restablecer contraseña</h2>
                <p className="modal-subtitle">Usuario: <strong>{passwordResetData.userName}</strong></p>
              </div>
              <button type="button" className="btn-close" onClick={cerrarModalPassword}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardarResetPassword} className="modal-form">
              {error && (
                <div className="alert-banner alert-danger">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}
              <label>
                Nueva contraseña *
                <input
                  type="password"
                  value={passwordResetData.newPassword}
                  onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </label>
              <label>
                Repetir contraseña *
                <input
                  type="password"
                  value={passwordResetData.confirmPassword}
                  onChange={(e) => setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })}
                  placeholder="Escribila de nuevo"
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={cerrarModalPassword}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Cambiar clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grilla de Usuarios */}
      <section className="card">
        <header className="card-head">
          <h2>
            <Users size={18} />
            Usuarios del sistema ({totalItems})
          </h2>
          <button
            className="btn btn-small"
            type="button"
            onClick={() => cargarUsuarios(pagina)}
          >
            Actualizar listado
          </button>
        </header>

        {loading ? (
          <p className="loading-state">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No hay usuarios registrados</h3>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">USUARIO</th>
                  <th scope="col">NOMBRE COMPLETO</th>
                  <th scope="col">CONTACTO</th>
                  <th scope="col">ROL ASIGNADO</th>
                  <th scope="col" className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const rolNombre = u.role || 'Sin rol';
                  const rolEtiqueta = infoRol(rolNombre).etiqueta;

                  return (
                    <tr key={u.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <code>{u.userName}</code>
                      </th>
                      <td>
                        <strong>{u.firstName} {u.lastName}</strong>
                      </td>
                      <td>
                        <div className="contact-cell">
                          {u.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={12} /> {u.email}
                            </span>
                          )}
                          {u.phoneNumber && (
                            <small className="muted flex items-center gap-1">
                              <Phone size={12} /> {u.phoneNumber}
                            </small>
                          )}
                          {!u.email && !u.phoneNumber && <span className="muted text-sm">—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="tag tag-success">
                          <Shield size={12} style={{ marginRight: 4 }} />
                          {rolEtiqueta}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-icon"
                          type="button"
                          onClick={() => abrirResetPassword(u)}
                          title="Restablecer contraseña"
                        >
                          <KeyRound size={16} />
                        </button>
                        <button
                          className="btn btn-icon"
                          type="button"
                          onClick={() => editar(u)}
                          title="Modificar usuario"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="btn btn-icon danger"
                          type="button"
                          onClick={() => eliminar(u.id, u.userName)}
                          title="Eliminar usuario"
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
                  Página {pagina} de {totalPaginas} ({totalItems} usuarios en total)
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
    </main>
  );
}
