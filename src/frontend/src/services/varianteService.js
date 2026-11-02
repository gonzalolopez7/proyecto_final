import api, {
  limpiarTexto,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';

const ENDPOINT = '/api/Variante';

function armarPayloadVarianteBase(dto = {}) {
  return {
    sku: limpiarTexto(dto.sku).toUpperCase(),
    idTalle: dto.idTalle,
    idColor: dto.idColor,
    stockMinimo: Math.max(0, Number(dto.stockMinimo ?? 0)),
  };
}

/**
 * Obtiene variantes con paginación y filtros desde la API SGCS
 * GET /api/Variante?Page=1&PageSize=15&Search=...
 */
export async function obtenerVariantes(params = {}) {
  const query = armarParametrosPaginados(params, 15, {
    IdProducto: params.idProducto,
    IdColor: params.idColor,
    IdTalle: params.idTalle,
  });

  const { data } = await api.get(ENDPOINT, { params: query });
  return normalizarRespuestaPaginada(data, query.Page);
}

/**
 * Obtiene todas las variantes activas de un producto específico,
 * ordenadas por orden de talle y nombre de color.
 * GET /api/Variante/by-producto/{idProducto}
 */
export async function obtenerVariantesPorProducto(idProducto) {
  if (!idProducto) return [];
  const { data } = await api.get(`${ENDPOINT}/by-producto/${idProducto}`);
  return Array.isArray(data) ? data : [];
}

export async function obtenerVariantePorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

export async function altaVariante(dto = {}) {
  const payload = {
    idProducto: dto.idProducto,
    ...armarPayloadVarianteBase(dto),
  };

  const { data } = await api.post(ENDPOINT, payload);
  return data;
}

export async function modificarVariante(id, dto = {}) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadVarianteBase(dto));
  return data;
}

export async function eliminarVariante(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}

export async function restaurarVariante(id) {
  const { data } = await api.post(`${ENDPOINT}/${id}/restore`);
  return data;
}

