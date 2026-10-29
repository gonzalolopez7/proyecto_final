import api from './api';

/**
 * Obtiene el listado de categorías desde la API SGCS
 * GET /api/Categoria
 */
export async function obtenerCategorias(params = {}) {
  const query = {};
  if (params.idPadre) query.idPadre = params.idPadre;
  if (params.soloPrincipales) query.soloPrincipales = true;

  const response = await api.get('/api/Categoria', { params: query });
  return Array.isArray(response.data) ? response.data : [];
}

export async function obtenerCategoriasTree() {
  const response = await api.get('/api/Categoria/tree');
  return Array.isArray(response.data) ? response.data : [];
}

export async function obtenerCategoriaPorId(id) {
  const response = await api.get(`/api/Categoria/${id}`);
  return response.data;
}

export async function altaCategoria(dto) {
  const payload = {
    nombre: (dto.nombre || '').trim(),
    idPadre: dto.idPadre || null,
  };

  const response = await api.post('/api/Categoria', payload);
  return response.data;
}

export async function modificarCategoria(id, dto) {
  const payload = {
    nombre: (dto.nombre || '').trim(),
    idPadre: dto.idPadre || null,
  };

  const response = await api.put(`/api/Categoria/${id}`, payload);
  return response.data;
}

export async function eliminarCategoria(id) {
  const response = await api.delete(`/api/Categoria/${id}`);
  return response.data;
}

