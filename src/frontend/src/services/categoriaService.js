import api, { limpiarTexto } from './api';

const ENDPOINT = '/api/Categoria';

function armarPayloadCategoria(dto = {}) {
  return {
    nombre: limpiarTexto(dto.nombre),
    idPadre: dto.idPadre || null,
  };
}

/**
 * Obtiene el listado de categorías desde la API SGCS
 * GET /api/Categoria
 */
export async function obtenerCategorias(params = {}) {
  const query = {};
  if (params.idPadre) query.idPadre = params.idPadre;
  if (params.soloPrincipales) query.soloPrincipales = true;

  const { data } = await api.get(ENDPOINT, { params: query });
  return Array.isArray(data) ? data : [];
}

export async function obtenerCategoriasTree() {
  const { data } = await api.get(`${ENDPOINT}/tree`);
  return Array.isArray(data) ? data : [];
}

export async function obtenerCategoriaPorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

export async function altaCategoria(dto) {
  const { data } = await api.post(ENDPOINT, armarPayloadCategoria(dto));
  return data;
}

export async function modificarCategoria(id, dto) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadCategoria(dto));
  return data;
}

export async function eliminarCategoria(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}
