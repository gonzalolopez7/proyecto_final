import { useCallback } from 'react';
import { ROLES_DISPONIBLES, obtenerInfoRol } from '../config/permisos';

export default function useRoles() {
  const recargar = useCallback(() => {}, []);

  return {
    roles: ROLES_DISPONIBLES,
    obtenerInfoRol,
    cargando: false,
    error: '',
    recargar,
  };
}
