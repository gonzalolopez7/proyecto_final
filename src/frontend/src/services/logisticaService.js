import api from './api';

// ===== DEPÓSITOS =====
export async function obtenerDepositos() {
  const { data } = await api.get('/api/Deposito');
  return Array.isArray(data) ? data : [];
}
export async function altaDeposito(dto) {
  const { data } = await api.post('/api/Deposito', dto);
  return data;
}
export async function modificarDeposito(id, dto) {
  const { data } = await api.put(`/api/Deposito/${id}`, dto);
  return data;
}
export async function eliminarDeposito(id) {
  const { data } = await api.delete(`/api/Deposito/${id}`);
  return data;
}
export async function restaurarDeposito(id) {
  const { data } = await api.post(`/api/Deposito/${id}/restore`);
  return data;
}

// ===== ESTANTERÍAS =====
export async function obtenerEstanterias(idDeposito) {
  const { data } = await api.get('/api/Estanteria', {
    params: idDeposito ? { idDeposito } : {},
  });
  return Array.isArray(data) ? data : [];
}
export async function altaEstanteria(dto) {
  const { data } = await api.post('/api/Estanteria', dto);
  return data;
}
export async function modificarEstanteria(id, dto) {
  const { data } = await api.put(`/api/Estanteria/${id}`, dto);
  return data;
}
export async function eliminarEstanteria(id) {
  const { data } = await api.delete(`/api/Estanteria/${id}`);
  return data;
}
export async function restaurarEstanteria(id) {
  const { data } = await api.post(`/api/Estanteria/${id}/restore`);
  return data;
}

// ===== UBICACIONES =====
export async function crearUbicacion(dto) {
  const { data } = await api.post('/api/Ubicacion', dto);
  return data;
}
export async function modificarUbicacion(id, dto) {
  const { data } = await api.put(`/api/Ubicacion/${id}`, dto);
  return data;
}
export async function eliminarUbicacion(id) {
  const { data } = await api.delete(`/api/Ubicacion/${id}`);
  return data;
}
export async function obtenerUbicacionesPorVariante(idVariante) {
  const { data } = await api.get(`/api/Ubicacion/by-variante/${idVariante}`);
  return Array.isArray(data) ? data : [];
}
export async function obtenerUbicacionesPorEstanteria(idEstanteria) {
  const { data } = await api.get(`/api/Ubicacion/by-estanteria/${idEstanteria}`);
  return Array.isArray(data) ? data : [];
}
