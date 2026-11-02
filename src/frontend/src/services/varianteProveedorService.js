import api, {
  limpiarTexto,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';

const ENDPOINT = '/api/VarianteProveedor';

function armarPayloadEdicion(dto = {}) {
  return {
    codigoProveedor: limpiarTexto(dto.codigoProveedor).toUpperCase(),
    costo: Math.max(0, Number(dto.costo ?? 0)),
  };
}

/**
 * Obtiene relaciones VarianteProveedor con paginación y filtros desde la API SGCS
 * GET /api/VarianteProveedor?Page=1&PageSize=15&Search=...
 */
export async function obtenerVariantesProveedores(params = {}) {
  const query = armarParametrosPaginados(params, 15, {
    IdProveedor: params.idProveedor,
    IdVariante: params.idVariante,
    IdProducto: params.idProducto,
  });

  const { data } = await api.get(ENDPOINT, { params: query });
  return normalizarRespuestaPaginada(data, query.Page);
}

/**
 * Obtiene una relación VarianteProveedor por su ID
 * GET /api/VarianteProveedor/{id}
 */
export async function obtenerVarianteProveedorPorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

/**
 * Obtiene todos los proveedores que comercializan una variante específica,
 * ordenados por costo de menor a mayor.
 * GET /api/VarianteProveedor/by-variante/{idVariante}
 */
export async function obtenerProveedoresPorVariante(idVariante) {
  if (!idVariante) return [];
  const { data } = await api.get(`${ENDPOINT}/by-variante/${idVariante}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Obtiene todas las variantes asociadas a un proveedor específico.
 * GET /api/VarianteProveedor/by-proveedor/{idProveedor}
 */
export async function obtenerVariantesPorProveedor(idProveedor) {
  if (!idProveedor) return [];
  const { data } = await api.get(`${ENDPOINT}/by-proveedor/${idProveedor}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Vincula una variante con un proveedor registrando su código y costo
 * POST /api/VarianteProveedor
 */
export async function altaVarianteProveedor(dto = {}) {
  const payload = {
    idVariante: dto.idVariante,
    idProveedor: dto.idProveedor,
    ...armarPayloadEdicion(dto),
  };

  const { data } = await api.post(ENDPOINT, payload);
  return data;
}

/**
 * Actualiza el código de proveedor y/o el costo de una relación existente
 * PUT /api/VarianteProveedor/{id}
 */
export async function modificarVarianteProveedor(id, dto = {}) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadEdicion(dto));
  return data;
}

/**
 * Elimina el vínculo entre una variante y un proveedor
 * DELETE /api/VarianteProveedor/{id}
 */
export async function eliminarVarianteProveedor(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}

