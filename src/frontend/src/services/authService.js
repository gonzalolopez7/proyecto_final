import { jwtDecode } from 'jwt-decode';
import api from './api';

/**
 * Autentica contra la API SGCS v2 (.NET 8)
 * POST /api/Auth/login
 * Payload: { userName, password }
 * Retorna: { accessToken, userName, firstName, lastName, role }
 */
export async function login(username, password) {
  const { data } = await api.post('/api/Auth/login', {
    userName: username,
    password: password,
  });
  return data;
}

export async function cerrarSesionEnApi() {
  // En SGCS v2 la invalidación de JWT es client-side via borrado de token
  return Promise.resolve();
}

export function guardarSesion(data) {
  const token = data?.accessToken;
  if (token) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify({
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    }));
  }
}

export function cerrarSesion() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

export function obtenerSesion() {
  const token = sessionStorage.getItem('token');
  const storedUser = sessionStorage.getItem('user');
  if (!token || !storedUser) return null;

  try {
    const p = jwtDecode(token);
    if (p.exp * 1000 < Date.now()) {
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