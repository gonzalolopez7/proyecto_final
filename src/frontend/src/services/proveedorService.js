import api from './api';

/**
 * Obtiene proveedores con paginación desde el nuevo backend SGCS v2
 * GET /api/Proveedor?Page=1&PageSize=50
 * Retorna arreglo compatible con Array.isArray(res) y con res.items/totalCount/totalPages
 */
export async function obtenerProveedores(params = { page: 1, pageSize: 50 }) {
  const query = {
    Page: params.page ?? params.Page ?? 1,
    PageSize: params.pageSize ?? params.PageSize ?? 50,
  };
  const response = await api.get('/api/Proveedor', { params: query });
  const data = response.data;
  const rawItems = Array.isArray(data) ? data : (data?.items || []);

  const items = rawItems.map((p) => ({
    ...p,
    idProveedor: p.idProveedor || p.id,
    razonSocial: p.razonSocial || p.nombre,
    nombre: p.nombre || p.razonSocial,
    diasPago: p.diasPago ?? p.diasCondicionPago ?? 30,
    diasCondicionPago: p.diasPago ?? p.diasCondicionPago ?? 30,
  }));

  items.totalCount = data?.totalCount ?? items.length;
  items.totalPages = data?.totalPages ?? 1;
  items.pageNumber = data?.pageNumber ?? query.Page;
  items.items = items;

  return items;
}

export async function obtenerProveedorPorId(id) {
  const response = await api.get(`/api/Proveedor/${id}`);
  return response.data;
}

export async function obtenerProveedorPorCuit(cuit) {
  const response = await api.get(`/api/Proveedor/by-cuit/${encodeURIComponent(cuit)}`);
  return response.data;
}

export async function altaProveedor(dto) {
  const payload = {
    nombre: (dto.nombre || dto.razonSocial || '').trim(),
    razonSocial: (dto.razonSocial || dto.nombre || '').trim(),
    cuit: (dto.cuit || '').trim(),
    telefono: dto.telefono ? String(dto.telefono).trim() : null,
    direccion: dto.direccion ? String(dto.direccion).trim() : null,
    email: dto.email ? String(dto.email).trim() : null,
    diasPago: Number(dto.diasPago ?? dto.diasCondicionPago ?? 0),
    saldoInicial: Number(dto.saldoInicial ?? 0),
  };

  const response = await api.post('/api/Proveedor', payload);
  return response.data;
}

export async function modificarProveedor(id, dto) {
  const payload = {
    nombre: (dto.nombre || dto.razonSocial || '').trim(),
    razonSocial: (dto.razonSocial || dto.nombre || '').trim(),
    cuit: (dto.cuit || '').trim(),
    telefono: dto.telefono ? String(dto.telefono).trim() : null,
    direccion: dto.direccion ? String(dto.direccion).trim() : null,
    email: dto.email ? String(dto.email).trim() : null,
    diasPago: Number(dto.diasPago ?? dto.diasCondicionPago ?? 0),
    saldoInicial: Number(dto.saldoInicial ?? 0),
  };

  const response = await api.put(`/api/Proveedor/${id}`, payload);
  return response.data;
}

export async function eliminarProveedor(id) {
  const response = await api.delete(`/api/Proveedor/${id}`);
  return response.data;
}

export async function restaurarProveedor(id) {
  const response = await api.post(`/api/Proveedor/${id}/restore`);
  return response.data;
}
