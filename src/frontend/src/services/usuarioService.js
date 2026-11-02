import api, {
  limpiarTexto,
  limpiarTextoOpcional,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';
import { ROLES_DISPONIBLES, obtenerInfoRol } from '../config/permisos';

export { ROLES_DISPONIBLES, obtenerInfoRol };

const ENDPOINT = '/api/User';

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
