import api, {
  limpiarTexto,
  limpiarTextoOpcional,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';

const ENDPOINT = '/api/User';

export const ROLES_DISPONIBLES = [
  { id: 'Admin', nombre: 'Admin', etiqueta: 'Administrador', detalle: 'Acceso completo al sistema y gestión de usuarios' },
  { id: 'Encargado', nombre: 'Encargado', etiqueta: 'Encargado', detalle: 'Gestión operativa, compras y proveedores' },
  { id: 'Comprador', nombre: 'Comprador', etiqueta: 'Comprador', detalle: 'Gestión de órdenes de compra y proveedores' },
  { id: 'OperadorInventario', nombre: 'OperadorInventario', etiqueta: 'Operador de inventario', detalle: 'Catálogo de productos y conteos de stock' },
  { id: 'OperadorLogistica', nombre: 'OperadorLogistica', etiqueta: 'Operador de logística', detalle: 'Movimientos de stock y ubicaciones' },
];

/**
 * Obtiene la etiqueta legible y detalle descriptivo de un rol a partir de su identificador.
 */
export function obtenerInfoRol(nombre = '') {
  if (!nombre) return { etiqueta: 'Usuario', detalle: '' };
  const normalizar = (str) =>
    String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f\s_-]/g, '')
      .toLowerCase();

  const clave = normalizar(nombre);
  if (clave === 'administrador') {
    return ROLES_DISPONIBLES[0];
  }

  const encontrado = ROLES_DISPONIBLES.find((r) => normalizar(r.id) === clave);
  return encontrado || { id: nombre, nombre, etiqueta: nombre, detalle: '' };
}

function armarPayloadUsuario(usuario = {}) {
  return {
    userName: limpiarTexto(usuario.userName),
    firstName: limpiarTexto(usuario.firstName),
    lastName: limpiarTexto(usuario.lastName),
    email: limpiarTextoOpcional(usuario.email),
    phoneNumber: limpiarTextoOpcional(usuario.phoneNumber),
    role: usuario.role || 'Encargado',
  };
}

/**
 * Obtiene usuarios con paginación desde la API SGCS
 * GET /api/User?Page=1&PageSize=20
 */
export async function obtenerUsuarios(params = {}) {
  const query = armarParametrosPaginados(params, 20);
  const { data } = await api.get(ENDPOINT, { params: query });

  return normalizarRespuestaPaginada(data, query.Page);
}

export async function obtenerUsuarioPorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

export async function altaUsuario(usuario) {
  const payload = {
    ...armarPayloadUsuario(usuario),
    password: usuario.password,
  };

  const { data } = await api.post(ENDPOINT, payload);
  return data;
}

export async function modificarUsuario(id, usuario) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadUsuario(usuario));
  return data;
}

export async function eliminarUsuario(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}

export async function restaurarUsuario(id) {
  const { data } = await api.post(`${ENDPOINT}/${id}/restore`);
  return data;
}

export async function resetPasswordUsuario(id, newPassword) {
  const { data } = await api.post(`${ENDPOINT}/${id}/reset-password`, {
    newPassword,
  });
  return data;
}

export async function obtenerRoles() {
  return ROLES_DISPONIBLES;
}
