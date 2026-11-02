import { Navigate, Outlet } from 'react-router-dom';
import { obtenerSesion } from '../services/authService';
import { tienePermiso } from '../config/permisos';

// Sin sesión -> /login. Con sesión pero sin el rol -> /dashboard.
// Solo es UX: la seguridad real la imponen los [Authorize] del backend.
export default function ProtectedRoute({ roles }) {
  const sesion = obtenerSesion();
  if (!sesion) return <Navigate to="/login" replace />;

  if (!tienePermiso(sesion.user?.role, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
