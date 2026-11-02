import api, {
  limpiarTexto,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';

const ENDPOINT = '/api/Producto';

function armarPayloadProducto(dto = {}) {
  return {
    nombre: limpiarTexto(dto.nombre),
    descripcion: limpiarTexto(dto.descripcion),
    idCategoria: dto.idCategoria,
    idGenero: dto.idGenero || null,
    idTemporada: dto.idTemporada || null,
    idFit: dto.idFit || null,
    idMaterial: dto.idMaterial || null,
  };
}

/**
 * Obtiene productos con paginación y filtros desde la API SGCS
 * GET /api/Producto?Page=1&PageSize=15&Search=...
 */
export async function obtenerProductos(params = {}) {
  const query = armarParametrosPaginados(params, 15, {
    IdCategoria: params.idCategoria,
    IdGenero: params.idGenero,
    IdTemporada: params.idTemporada,
    IdFit: params.idFit,
    IdMaterial: params.idMaterial,
  });

  const { data } = await api.get(ENDPOINT, { params: query });

  return normalizarRespuestaPaginada(data, query.Page, (p) => ({
    ...p,
    categoriaNombre: p.categoriaNombre || 'Sin categoría',
  }));
}

export async function obtenerProductoPorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

export async function obtenerProductoPorNombre(nombre) {
  const { data } = await api.get(`${ENDPOINT}/by-name/${encodeURIComponent(nombre)}`);
  return data;
}

export async function altaProducto(dto) {
  const { data } = await api.post(ENDPOINT, armarPayloadProducto(dto));
  return data;
}

export async function modificarProducto(id, dto) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadProducto(dto));
  return data;
}

export async function eliminarProducto(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}

export async function restaurarProducto(id) {
  const { data } = await api.post(`${ENDPOINT}/${id}/restore`);
  return data;
}
