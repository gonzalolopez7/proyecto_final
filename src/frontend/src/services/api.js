import axios from 'axios';

export const STORAGE_TOKEN_KEY = 'token';
export const STORAGE_USER_KEY = 'user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega automáticamente el JWT si existe.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(STORAGE_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const esLogin = error.config?.url?.includes('/login');
    if (error.response?.status === 401 && !esLogin) {
      sessionStorage.removeItem(STORAGE_TOKEN_KEY);
      sessionStorage.removeItem(STORAGE_USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Normaliza un texto obligatorio quitando espacios en los extremos.
 */
export function limpiarTexto(valor) {
  return String(valor ?? '').trim();
}

/**
 * Normaliza un texto opcional: devuelve el string sin espacios extremos o null si queda vacío.
 */
export function limpiarTextoOpcional(valor) {
  const limpio = limpiarTexto(valor);
  return limpio.length > 0 ? limpio : null;
}

/**
 * Construye el objeto de query params estándar para endpoints paginados de la API SGCS.
 */
export function armarParametrosPaginados(params = {}, pageSizePorDefecto = 15, filtrosExtra = {}) {
  const query = {
    Page: params.page ?? 1,
    PageSize: params.pageSize ?? pageSizePorDefecto,
  };

  const search = limpiarTextoOpcional(params.search);
  if (search) {
    query.Search = search;
  }

  Object.entries(filtrosExtra).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query[clave] = valor;
    }
  });

  return query;
}

/**
 * Normaliza la respuesta paginada devuelta por la API en una estructura uniforme:
 * { items, totalCount, totalPages, pageNumber }
 */
export function normalizarRespuestaPaginada(data, pagePorDefecto = 1, mapearItem = (x) => x) {
  const rawItems = Array.isArray(data) ? data : (data?.items || []);
  const items = rawItems.map(mapearItem);

  return {
    items,
    totalCount: data?.totalCount ?? items.length,
    totalPages: data?.totalPages ?? 1,
    pageNumber: data?.pageNumber ?? pagePorDefecto,
  };
}

export default api;
