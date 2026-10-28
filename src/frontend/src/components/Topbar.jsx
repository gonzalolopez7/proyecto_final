import { useState } from 'react';
import { Menu, LogOut, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion, cerrarSesionEnApi } from '../services/authService';

const NOMBRES_ROLES = {
  admin: 'Administrador',
  administrador: 'Administrador',
  encargado: 'Encargado',
  comprador: 'Comprador',
  operadorinventario: 'Operador de inventario',
  operadorlogistica: 'Operador de logística',
};

export default function Topbar({ setMenuAbierto }) {
  const navigate = useNavigate();
  const user = obtenerSesion()?.user;
  const [busqueda, setBusqueda] = useState('');

  const nombreCompleto = user ? `${user.firstName} ${user.lastName}`.trim() || user.userName : 'Usuario';
  const rolEtiqueta = user?.role
    ? NOMBRES_ROLES[user.role.toLowerCase().replace(/[\s_-]/g, '')] || user.role
    : 'Usuario';

  function handleBuscar(e) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    navigate(`/proveedores?buscar=${encodeURIComponent(busqueda.trim())}`);
  }

  async function salir() {
    try {
      await cerrarSesionEnApi();
    } catch (err) {
      console.warn('No se pudo invalidar la sesión en la API:', err);
    } finally {
      cerrarSesion();
      navigate('/login');
    }
  }

  return (
    <header className="topbar">
      <button 
        type="button" 
        className="menu-button" 
        onClick={() => setMenuAbierto(true)} 
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Buscador centralizado para proveedores */}
      <form className="topbar-search" onSubmit={handleBuscar}>
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar proveedores, CUIT o contacto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      {/* Derecha: Usuario + Cerrar sesión */}
      <div className="topbar-actions">
        <div className="topbar-user">
          <div className="user-avatar" title={nombreCompleto}>
            <User size={16} />
          </div>
          <div className="user-details">
            <span className="user-name">{nombreCompleto}</span>
            <span className="user-role">{rolEtiqueta}</span>
          </div>
          <button type="button" className="btn btn-small btn-logout" onClick={salir} title="Cerrar sesión">
            <LogOut size={14} />
            <span className="logout-text">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
