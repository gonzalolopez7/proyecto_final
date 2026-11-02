import api, { limpiarTexto } from './api';

/**
 * Crea las operaciones CRUD estándar para un catálogo de atributo simple ({ id, nombre }).
 */
function crearServicioAtributo(recurso) {
  const endpoint = `/api/${recurso}`;

  return {
    obtenerTodos: async () => {
      const { data } = await api.get(endpoint);
      return Array.isArray(data) ? data : [];
    },
    alta: async (nombre) => {
      const { data } = await api.post(endpoint, { nombre: limpiarTexto(nombre) });
      return data;
    },
    modificar: async (id, nombre) => {
      const { data } = await api.put(`${endpoint}/${id}`, { nombre: limpiarTexto(nombre) });
      return data;
    },
    eliminar: async (id) => {
      const { data } = await api.delete(`${endpoint}/${id}`);
      return data;
    },
  };
}

const generoService = crearServicioAtributo('Genero');
const temporadaService = crearServicioAtributo('Temporada');
const fitService = crearServicioAtributo('Fit');
const materialService = crearServicioAtributo('Material');

export const SERVICIOS_ATRIBUTO = {
  generos: generoService,
  temporadas: temporadaService,
  fits: fitService,
  materiales: materialService,
};

// ==================== GÉNEROS ====================
export const obtenerGeneros = generoService.obtenerTodos;
export const altaGenero = generoService.alta;
export const modificarGenero = generoService.modificar;
export const eliminarGenero = generoService.eliminar;

// ==================== TEMPORADAS ====================
export const obtenerTemporadas = temporadaService.obtenerTodos;
export const altaTemporada = temporadaService.alta;
export const modificarTemporada = temporadaService.modificar;
export const eliminarTemporada = temporadaService.eliminar;

// ==================== FITS ====================
export const obtenerFits = fitService.obtenerTodos;
export const altaFit = fitService.alta;
export const modificarFit = fitService.modificar;
export const eliminarFit = fitService.eliminar;

// ==================== MATERIALES ====================
export const obtenerMateriales = materialService.obtenerTodos;
export const altaMaterial = materialService.alta;
export const modificarMaterial = materialService.modificar;
export const eliminarMaterial = materialService.eliminar;

// ==================== COLORES ====================
const COLOR_ENDPOINT = '/api/Color';

function armarPayloadColor(dto = {}) {
  const hex = limpiarTexto(dto.codigoHex).toUpperCase();
  return {
    nombre: limpiarTexto(dto.nombre),
    codigo: limpiarTexto(dto.codigo).toUpperCase(),
    codigoHex: hex.startsWith('#') ? hex : `#${hex}`,
  };
}

export async function obtenerColores() {
  const { data } = await api.get(COLOR_ENDPOINT);
  return Array.isArray(data) ? data : [];
}

export async function obtenerColorPorId(id) {
  const { data } = await api.get(`${COLOR_ENDPOINT}/${id}`);
  return data;
}

export async function altaColor(dto) {
  const { data } = await api.post(COLOR_ENDPOINT, armarPayloadColor(dto));
  return data;
}

export async function modificarColor(id, dto) {
  const { data } = await api.put(`${COLOR_ENDPOINT}/${id}`, armarPayloadColor(dto));
  return data;
}

export async function eliminarColor(id) {
  const { data } = await api.delete(`${COLOR_ENDPOINT}/${id}`);
  return data;
}

// ==================== ESCALAS DE TALLE Y TALLES ====================
const ESCALA_ENDPOINT = '/api/escala-talle';

export async function obtenerEscalasTalle() {
  const { data } = await api.get(ESCALA_ENDPOINT);
  return Array.isArray(data) ? data : [];
}

export async function obtenerEscalaTallePorId(id) {
  const { data } = await api.get(`${ESCALA_ENDPOINT}/${id}`);
  return data;
}

export async function obtenerTallesPorEscala(idEscalaTalle) {
  if (!idEscalaTalle) return [];
  const { data } = await api.get(`${ESCALA_ENDPOINT}/${idEscalaTalle}/talles`);
  return Array.isArray(data) ? data : [];
}

export async function obtenerTallePorId(id) {
  const { data } = await api.get(`/api/Talle/${id}`);
  return data;
}
