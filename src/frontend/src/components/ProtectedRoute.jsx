import { Navigate, Outlet } from 'react-router-dom';
import { obtenerSesion } from '../services/authService';

// Sin sesión -> /login. Con sesión pero sin el rol -> /dashboard.
// Solo es UX: la seguridad real la imponen los [Authorize] del backend.
export default function ProtectedRoute({ roles }) {
  const sesion = obtenerSesion();
  if (!sesion) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(sesion.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}