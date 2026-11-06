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
export async function cambiarEstadoDeposito(id, activo) {
  const { data } = await api.patch(`/api/Deposito/${id}/estado`, { activo });
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
export async function eliminarEstanteria(id) {
  const { data } = await api.delete(`/api/Estanteria/${id}`);
  return data;
}

// ===== UBICACIONES =====
export async function asignarUbicacion(idVariante, idEstanteria, cantidad) {
  const { data } = await api.post('/api/Ubicacion', { idVariante, idEstanteria, cantidad });
  return data;
}
export async function obtenerUbicacionesPorVariante(idVariante) {
  const { data } = await api.get(`/api/Ubicacion/variante/${idVariante}`);
  return Array.isArray(data) ? data : [];
}
export async function obtenerUbicacionesPorEstanteria(idEstanteria) {
  const { data } = await api.get(`/api/Ubicacion/estanteria/${idEstanteria}`);
  return Array.isArray(data) ? data : [];
}