import api from './api';

/**
 * Obtiene productos con paginación y filtros desde la API SGCS
 * GET /api/Producto?Page=1&PageSize=15&Search=...
 */
export async function obtenerProductos(params = { page: 1, pageSize: 15 }) {
  const query = {
    Page: params.page ?? params.Page ?? 1,
    PageSize: params.pageSize ?? params.PageSize ?? 15,
  };

  if (params.search?.trim()) query.Search = params.search.trim();
  if (params.idCategoria) query.IdCategoria = params.idCategoria;
  if (params.idGenero) query.IdGenero = params.idGenero;
  if (params.idTemporada) query.IdTemporada = params.idTemporada;
  if (params.idFit) query.IdFit = params.idFit;
  if (params.idMaterial) query.IdMaterial = params.idMaterial;

  const response = await api.get('/api/Producto', { params: query });
  const data = response.data;
  const rawItems = Array.isArray(data) ? data : (data?.items || []);

  const items = rawItems.map((p) => ({
    ...p,
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    idCategoria: p.idCategoria,
    categoriaNombre: p.categoriaNombre || 'Sin categoría',
    idGenero: p.idGenero,
    generoNombre: p.generoNombre,
    idTemporada: p.idTemporada,
    temporadaNombre: p.temporadaNombre,
    idFit: p.idFit,
    fitNombre: p.fitNombre,
    idMaterial: p.idMaterial,
    materialNombre: p.materialNombre,
  }));

  items.totalCount = data?.totalCount ?? items.length;
  items.totalPages = data?.totalPages ?? 1;
  items.pageNumber = data?.pageNumber ?? query.Page;
  items.items = items;

  return items;
}

export async function obtenerProductoPorId(id) {
  const response = await api.get(`/api/Producto/${id}`);
  return response.data;
}

export async function obtenerProductoPorNombre(nombre) {
  const response = await api.get(`/api/Producto/by-name/${encodeURIComponent(nombre)}`);
  return response.data;
}

export async function altaProducto(dto) {
  const payload = {
    nombre: (dto.nombre || '').trim(),
    descripcion: (dto.descripcion || '').trim(),
    idCategoria: dto.idCategoria,
    idGenero: dto.idGenero || null,
    idTemporada: dto.idTemporada || null,
    idFit: dto.idFit || null,
    idMaterial: dto.idMaterial || null,
  };

  const response = await api.post('/api/Producto', payload);
  return response.data;
}

export async function modificarProducto(id, dto) {
  const payload = {
    nombre: (dto.nombre || '').trim(),
    descripcion: (dto.descripcion || '').trim(),
    idCategoria: dto.idCategoria,
    idGenero: dto.idGenero || null,
    idTemporada: dto.idTemporada || null,
    idFit: dto.idFit || null,
    idMaterial: dto.idMaterial || null,
  };

  const response = await api.put(`/api/Producto/${id}`, payload);
  return response.data;
}

export async function eliminarProducto(id) {
  const response = await api.delete(`/api/Producto/${id}`);
  return response.data;
}

export async function restaurarProducto(id) {
  const response = await api.post(`/api/Producto/${id}/restore`);
  return response.data;
}

