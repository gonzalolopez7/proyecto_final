import api, {
  limpiarTexto,
  limpiarTextoOpcional,
  armarParametrosPaginados,
  normalizarRespuestaPaginada,
} from './api';

const ENDPOINT = '/api/Proveedor';

function armarPayloadProveedor(dto = {}) {
  return {
    nombre: limpiarTexto(dto.nombre || dto.razonSocial),
    razonSocial: limpiarTexto(dto.razonSocial || dto.nombre),
    cuit: limpiarTexto(dto.cuit),
    telefono: limpiarTextoOpcional(dto.telefono),
    direccion: limpiarTextoOpcional(dto.direccion),
    email: limpiarTextoOpcional(dto.email),
    diasPago: Number(dto.diasPago ?? 0),
    saldoInicial: Number(dto.saldoInicial ?? 0),
  };
}

/**
 * Obtiene proveedores con paginación desde la API SGCS
 * GET /api/Proveedor?Page=1&PageSize=50
 */
export async function obtenerProveedores(params = {}) {
  const query = armarParametrosPaginados(params, 50);
  const { data } = await api.get(ENDPOINT, { params: query });

  return normalizarRespuestaPaginada(data, query.Page, (p) => ({
    ...p,
    razonSocial: p.razonSocial || p.nombre,
    nombre: p.nombre || p.razonSocial,
    diasPago: p.diasPago ?? 30,
  }));
}

export async function obtenerProveedorPorId(id) {
  const { data } = await api.get(`${ENDPOINT}/${id}`);
  return data;
}

export async function obtenerProveedorPorCuit(cuit) {
  const { data } = await api.get(`${ENDPOINT}/by-cuit/${encodeURIComponent(cuit)}`);
  return data;
}

export async function altaProveedor(dto) {
  const { data } = await api.post(ENDPOINT, armarPayloadProveedor(dto));
  return data;
}

export async function modificarProveedor(id, dto) {
  const { data } = await api.put(`${ENDPOINT}/${id}`, armarPayloadProveedor(dto));
  return data;
}

export async function eliminarProveedor(id) {
  const { data } = await api.delete(`${ENDPOINT}/${id}`);
  return data;
}

export async function restaurarProveedor(id) {
  const { data } = await api.post(`${ENDPOINT}/${id}/restore`);
  return data;
}
