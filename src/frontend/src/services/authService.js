import { jwtDecode } from 'jwt-decode';
import api, { STORAGE_TOKEN_KEY, STORAGE_USER_KEY, limpiarTexto } from './api';

/**
 * Autentica contra la API SGCS
 * POST /api/Auth/login
 */
export async function login(username, password) {
  const { data } = await api.post('/api/Auth/login', {
    userName: limpiarTexto(username),
    password,
  });
  return data;
}

export async function cerrarSesionEnApi() {
  // En SGCS la invalidación de JWT es client-side mediante el borrado del token
  return Promise.resolve();
}

export function guardarSesion(data) {
  const token = data?.accessToken;
  if (!token) return;

  sessionStorage.setItem(STORAGE_TOKEN_KEY, token);
  sessionStorage.setItem(
    STORAGE_USER_KEY,
    JSON.stringify({
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    })
  );
}

export function cerrarSesion() {
  sessionStorage.removeItem(STORAGE_TOKEN_KEY);
  sessionStorage.removeItem(STORAGE_USER_KEY);
}

export function obtenerSesion() {
  const token = sessionStorage.getItem(STORAGE_TOKEN_KEY);
  const storedUser = sessionStorage.getItem(STORAGE_USER_KEY);
  if (!token || !storedUser) return null;

  try {
    const payload = jwtDecode(token);
    if (payload.exp * 1000 < Date.now()) {
      cerrarSesion();
      return null;
    }

    const userObj = JSON.parse(storedUser);

    return {
      token,
      user: {
        userName: userObj.userName,
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        role: userObj.role,
      },
    };
  } catch {
    cerrarSesion();
    return null;
  }
}
