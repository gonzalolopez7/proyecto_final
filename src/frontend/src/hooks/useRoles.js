import { useState, useCallback } from 'react';
import { ROLES_DISPONIBLES } from '../services/usuarioService';

export default function useRoles() {
  const [roles, setRoles] = useState(ROLES_DISPONIBLES);
  const [cargando, setCargando] = useState(false);
  const [error] = useState('');

  const recargar = useCallback(() => {
    setCargando(true);
    setRoles(ROLES_DISPONIBLES);
    setCargando(false);
  }, []);

  return { roles, cargando, error, recargar };
}
