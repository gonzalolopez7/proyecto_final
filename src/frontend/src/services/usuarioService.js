import api from './api';

export const ROLES_DISPONIBLES = [
  { id: 'Admin', nombre: 'Admin', etiqueta: 'Administrador', detalle: 'Acceso completo al sistema y gestión de usuarios' },
  { id: 'Encargado', nombre: 'Encargado', etiqueta: 'Encargado', detalle: 'Gestión operativa y proveedores' },
  { id: 'Comprador', nombre: 'Comprador', etiqueta: 'Comprador', detalle: 'Gestión de compras y proveedores' },
  { id: 'OperadorInventario', nombre: 'OperadorInventario', etiqueta: 'Operador de inventario', detalle: 'Control de inventario y stock' },
  { id: 'OperadorLogistica', nombre: 'OperadorLogistica', etiqueta: 'Operador de logística', detalle: 'Movimientos de stock y logística' },
];

/**
 * Obtiene usuarios con paginación desde el nuevo backend SGCS v2
 * GET /api/User?Page=1&PageSize=20
 * Retorna arreglo compatible con Array.isArray(res) y con res.items/totalCount/totalPages
 */
export async function obtenerUsuarios(params = { page: 1, pageSize: 20 }) {
  const query = {
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? 20,
  };

  const response = await api.get('/api/User', { params: query });
  const data = response.data;
  const rawItems = Array.isArray(data) ? data : (data?.items || []);

  const items = rawItems.map((u) => ({
    ...u,
    idUsuario: u.idUsuario || u.id,
    nombreUsuario: u.nombreUsuario || u.userName,
    nombre: u.nombre || u.firstName,
    apellido: u.apellido || u.lastName,
    rol: u.rol || u.role,
  }));

  items.totalCount = data?.totalCount ?? items.length;
  items.totalPages = data?.totalPages ?? 1;
  items.pageNumber = data?.pageNumber ?? query.Page;
  items.items = items;

  return items;
}

export async function obtenerUsuarioPorId(id) {
  const response = await api.get(`/api/User/${id}`);
  return response.data;
}

export async function altaUsuario(usuario) {
  // CreateUserCommand espera: { userName, password, firstName, lastName, email, phoneNumber, role }
  const payload = {
    userName: (usuario.userName || usuario.nombreUsuario || '').trim(),
    password: usuario.password,
    firstName: (usuario.firstName || usuario.nombre || '').trim(),
    lastName: (usuario.lastName || usuario.apellido || '').trim(),
    email: usuario.email ? usuario.email.trim() : null,
    phoneNumber: usuario.phoneNumber || usuario.telefono ? (usuario.phoneNumber || usuario.telefono).trim() : null,
    role: usuario.role || usuario.rol || usuario.idRol || 'Encargado',
  };

  const response = await api.post('/api/User', payload);
  return response.data;
}

export async function modificarUsuario(id, usuario) {
  // UpdateUserRequest espera: { userName, firstName, lastName, email, phoneNumber, role }
  const payload = {
    userName: (usuario.userName || usuario.nombreUsuario || '').trim(),
    firstName: (usuario.firstName || usuario.nombre || '').trim(),
    lastName: (usuario.lastName || usuario.apellido || '').trim(),
    email: usuario.email ? usuario.email.trim() : null,
    phoneNumber: usuario.phoneNumber || usuario.telefono ? (usuario.phoneNumber || usuario.telefono).trim() : null,
    role: usuario.role || usuario.rol || usuario.idRol || 'Encargado',
  };

  const response = await api.put(`/api/User/${id}`, payload);
  return response.data;
}

export async function eliminarUsuario(id) {
  const response = await api.delete(`/api/User/${id}`);
  return response.data;
}

export async function restaurarUsuario(id) {
  const response = await api.post(`/api/User/${id}/restore`);
  return response.data;
}

export async function resetPasswordUsuario(id, newPassword) {
  const response = await api.post(`/api/User/${id}/reset-password`, {
    newPassword,
  });
  return response.data;
}

export async function obtenerRoles() {
  return ROLES_DISPONIBLES;
}
