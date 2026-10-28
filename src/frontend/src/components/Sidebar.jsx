import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  X 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { obtenerSesion } from '../services/authService';
import { PERMISOS } from '../config/permisos';

const GRUPOS_NAVEGACION = [
  {
    titulo: 'Panel',
    enlaces: [
      { to: '/dashboard', texto: 'Resumen general', Icono: LayoutDashboard, roles: PERMISOS.dashboard },
    ],
  },
  {
    titulo: 'Módulos',
    enlaces: [
      { to: '/proveedores', texto: 'Proveedores', Icono: Truck, roles: PERMISOS.proveedores },
      { to: '/usuarios', texto: 'Usuarios y roles', Icono: Users, roles: PERMISOS.usuarios },
    ],
  },
];

function coincideRol(rolUsuario, rolesPermitidos) {
  if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
  if (!rolUsuario) return false;

  const normalizar = (r) => String(r).trim().toLowerCase().replace(/[\s_-]/g, '');
  const rolNorm = normalizar(rolUsuario);

  return rolesPermitidos.some((r) => {
    const pNorm = normalizar(r);
    return (
      rolNorm === pNorm ||
      (rolNorm === 'admin' && pNorm === 'administrador') ||
      (rolNorm === 'administrador' && pNorm === 'admin')
    );
  });
}

const NOMBRES_ROLES = {
  admin: 'Administrador',
  administrador: 'Administrador',
  encargado: 'Encargado',
  comprador: 'Comprador',
  operadorinventario: 'Operador de inventario',
  operadorlogistica: 'Operador de logística',
};

export default function Sidebar({ menuAbierto, setMenuAbierto }) {
  const rol = obtenerSesion()?.user?.role;
  const cerrarMenu = () => setMenuAbierto(false);

  const rolEtiqueta = rol
    ? NOMBRES_ROLES[rol.toLowerCase().replace(/[\s_-]/g, '')] || rol
    : 'Usuario';

  return (
    <aside className={`sidebar ${menuAbierto ? 'open' : ''}`}>
      <header className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-badge">CS</div>
          <div>
            <strong className="brand-title">Compra&Stock</strong>
            <span className="brand-subtitle">Gestión textil</span>
          </div>
        </div>
        <button type="button" className="sidebar-close" onClick={cerrarMenu} aria-label="Cerrar menú">
          <X size={20} />
        </button>
      </header>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {GRUPOS_NAVEGACION.map((grupo) => {
          const enlacesVisibles = grupo.enlaces.filter(
            ({ roles }) => coincideRol(rol, roles)
          );

          if (enlacesVisibles.length === 0) return null;

          return (
            <div key={grupo.titulo} className="nav-group">
              <span className="nav-group-title">{grupo.titulo}</span>
              {enlacesVisibles.map(({ to, texto, Icono }) => (
                <NavLink key={to} to={to} onClick={cerrarMenu} className={({ isActive }) => (isActive ? 'active' : '')}>
                  <Icono size={18} />
                  <span>{texto}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <footer className="sidebar-footer">
        <div className="user-info-sidebar">
          <span className="user-role-tag">{rolEtiqueta}</span>
          <small>Sistema SGCS v2.0</small>
        </div>
      </footer>
    </aside>
  );
}
