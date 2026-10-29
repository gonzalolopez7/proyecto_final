import api from './api';

// ==================== GÉNEROS ====================

export async function obtenerGeneros() {
  const response = await api.get('/api/Genero');
  return Array.isArray(response.data) ? response.data : [];
}

export async function altaGenero(nombre) {
  const response = await api.post('/api/Genero', { nombre: (nombre || '').trim() });
  return response.data;
}

export async function modificarGenero(id, nombre) {
  const response = await api.put(`/api/Genero/${id}`, { nombre: (nombre || '').trim() });
  return response.data;
}

export async function eliminarGenero(id) {
  const response = await api.delete(`/api/Genero/${id}`);
  return response.data;
}

// ==================== TEMPORADAS ====================

export async function obtenerTemporadas() {
  const response = await api.get('/api/Temporada');
  return Array.isArray(response.data) ? response.data : [];
}

export async function altaTemporada(nombre) {
  const response = await api.post('/api/Temporada', { nombre: (nombre || '').trim() });
  return response.data;
}

export async function modificarTemporada(id, nombre) {
  const response = await api.put(`/api/Temporada/${id}`, { nombre: (nombre || '').trim() });
  return response.data;
}

export async function eliminarTemporada(id) {
  const response = await api.delete(`/api/Temporada/${id}`);
  return response.data;
}

// ==================== FITS ====================

export async function obtenerFits() {
  const response = await api.get('/api/Fit');
  return Array.isArray(response.data) ? response.data : [];
}

export async function altaFit(nombre) {
  const response = await api.post('/api/Fit', { nombre: (nombre || '').trim() });
  return response.data;
}

export async function modificarFit(id, nombre) {
  const response = await api.put(`/api/Fit/${id}`, { nombre: (nombre || '').trim() });
  return response.data;
}

export async function eliminarFit(id) {
  const response = await api.delete(`/api/Fit/${id}`);
  return response.data;
}

// ==================== MATERIALES ====================

export async function obtenerMateriales() {
  const response = await api.get('/api/Material');
  return Array.isArray(response.data) ? response.data : [];
}

export async function altaMaterial(nombre) {
  const response = await api.post('/api/Material', { nombre: (nombre || '').trim() });
  return response.data;
}

export async function modificarMaterial(id, nombre) {
  const response = await api.put(`/api/Material/${id}`, { nombre: (nombre || '').trim() });
  return response.data;
}

export async function eliminarMaterial(id) {
  const response = await api.delete(`/api/Material/${id}`);
  return response.data;
}

