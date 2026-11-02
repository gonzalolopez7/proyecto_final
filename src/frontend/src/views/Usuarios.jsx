import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  X,
  Shield,
  KeyRound,
  RotateCcw,
  Phone,
  Mail,
  RefreshCcw,
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
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import { validarTelefono } from '../utils/validaciones';
import AlertBanner from '../components/AlertBanner';
import PaginationBar from '../components/PaginationBar';

const USUARIO_INICIAL = {
  userName: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmarPassword: '',
  email: '',
  phoneNumber: '',
  role: 'Encargado',
};

const PASSWORD_RESET_INICIAL = {
  id: null,
  userName: '',
  newPassword: '',
  confirmPassword: '',
};

const TAMANO_PAGINA = 10;

export default function Usuarios() {
  const { roles, obtenerInfoRol } = useRoles();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(USUARIO_INICIAL);
  const [editandoId, setEditandoId] = useState(null);
  const [passwordResetData, setPasswordResetData] = useState(PASSWORD_RESET_INICIAL);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuarioRestaurable, setUsuarioRestaurable] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const cargarUsuarios = useCallback(async (pag = 1) => {
    try {
      setLoading(true);
      setError('');
      setUsuarioRestaurable(null);

      const data = await obtenerUsuarios({
        page: pag,
        pageSize: TAMANO_PAGINA,
        search: busqueda,
      });

      setUsuarios(data.items);
      setTotalPaginas(data.totalPages);
      setTotalItems(data.totalCount);
    } catch (err) {
      console.error(err);
      setError(mensajeDeError(err, 'No se pudieron obtener los usuarios.'));
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
        setUsuarioRestaurable(null);

        const data = await obtenerUsuarios({
          page: pagina,
          pageSize: TAMANO_PAGINA,
          search: busqueda,
        });

        if (!activo) return;
        setUsuarios(data.items);
        setTotalPaginas(data.totalPages);
        setTotalItems(data.totalCount);
      } catch (err) {
        if (!activo) return;
        console.error(err);
        setError(mensajeDeError(err, 'No se pudieron obtener los usuarios.'));
      } finally {
        if (activo) setLoading(false);
      }
    }

    inicializar();
    return () => {
      activo = false;
    };
  }, [pagina, busqueda]);

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setForm(USUARIO_INICIAL);
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

    if (form.phoneNumber?.trim() && !validarTelefono(form.phoneNumber)) {
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
        await modificarUsuario(editandoId, form);
        setMensaje('Usuario modificado correctamente.');
      } else {
        await altaUsuario(form);
        setMensaje('Usuario creado correctamente.');
      }
      cerrarModal();
      await cargarUsuarios(pagina);
    } catch (err) {
      console.error(err);
      const cod = codigoDeError(err);
      const data = datosDeError(err);
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
    const confirmar = window.confirm(
      `¿Seguro que querés dar de baja al usuario "${nombre || 'seleccionado'}"?`
    );
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
            Módulo de gestión de usuarios, roles, permisos y credenciales
          </p>
        </article>
        <div className="page-head-actions">
          <button type="button" className="btn btn-primary" onClick={abrirNuevo}>
            <UserPlus size={16} />
            Nuevo usuario
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => cargarUsuarios(pagina)}
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
      {!modalAbierto && !modalPasswordAbierto && (
        <AlertBanner
          tipo="danger"
          mensaje={error}
          onClose={() => setError('')}
        />
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
              </div>
              <button type="button" className="btn-close" onClick={cerrarModal} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardar} className="modal-form usuario-form">
              <AlertBanner tipo="danger" mensaje={error}>
                {usuarioRestaurable && (
                  <div className="alert-restore-actions">
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => handleRestaurar(usuarioRestaurable.id, usuarioRestaurable.userName)}
                    >
                      <RotateCcw size={14} /> Restaurar usuario existente
                    </button>
                  </div>
                )}
              </AlertBanner>

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
                <div className="role-options">
                  {roles.map((r) => {
                    const idRol = r.id || r.nombre;
                    const info = obtenerInfoRol(idRol);
                    return (
                      <label
                        key={idRol}
                        className={`role-option${form.role === idRol ? ' selected' : ''}`}
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
                <p className="modal-subtitle">
                  Usuario: <strong>{passwordResetData.userName}</strong>
                </p>
              </div>
              <button type="button" className="btn-close" onClick={cerrarModalPassword} aria-label="Cerrar">
                <X size={18} />
              </button>
            </header>

            <form onSubmit={guardarResetPassword} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error} />

              <label>
                Nueva contraseña *
                <input
                  type="password"
                  value={passwordResetData.newPassword}
                  onChange={(e) =>
                    setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })
                  }
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </label>
              <label>
                Repetir contraseña *
                <input
                  type="password"
                  value={passwordResetData.confirmPassword}
                  onChange={(e) =>
                    setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })
                  }
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

      {/* Tabla de Usuarios */}
      <section className="card">
        <header className="card-head">
          <div>
            <h2>
              <Users size={18} />
              Usuarios del sistema ({totalItems})
            </h2>
          </div>
          <div className="filter-search-box">
            <Search size={14} className="filter-icon" />
            <input
              type="text"
              placeholder="Buscar por Usuario, Nombre, Email, Rol, Teléfono..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </header>

        {loading ? (
          <p className="loading-state">Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <Users size={48} className="empty-icon" />
            <h3>No se encontraron usuarios</h3>
            <p>
              {busqueda
                ? `No hay usuarios que coincidan con la búsqueda "${busqueda}".`
                : 'No hay usuarios registrados en el sistema.'}
            </p>
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
                  const rolEtiqueta = obtenerInfoRol(u.role).etiqueta;

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
                            <span className="contact-item">
                              <Mail size={12} /> {u.email}
                            </span>
                          )}
                          {u.phoneNumber && (
                            <small className="contact-item">
                              <Phone size={12} /> {u.phoneNumber}
                            </small>
                          )}
                          {!u.email && !u.phoneNumber && <span className="muted text-sm">—</span>}
                        </div>
                      </td>
                      <td>
                        <span className="tag tag-success">
                          <Shield size={12} />
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

            <PaginationBar
              pagina={pagina}
              totalPaginas={totalPaginas}
              totalItems={totalItems}
              etiquetaItem="usuarios"
              onPageChange={setPagina}
            />
          </>
        )}
      </section>
    </main>
  );
}
