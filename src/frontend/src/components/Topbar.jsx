import { useState } from 'react';
import { Menu, LogOut, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion, cerrarSesionEnApi } from '../services/authService';
import { obtenerInfoRol } from '../config/permisos';

export default function Topbar({ setMenuAbierto }) {
  const navigate = useNavigate();
  const user = obtenerSesion()?.user;
  const [busqueda, setBusqueda] = useState('');

  const nombreCompleto = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName
    : 'Usuario';
  const rolEtiqueta = obtenerInfoRol(user?.role).etiqueta;

  function handleBuscar(e) {
    e.preventDefault();
    const termino = busqueda.trim();
    if (!termino) return;
    navigate(`/proveedores?buscar=${encodeURIComponent(termino)}`);
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

      <form className="topbar-search" onSubmit={handleBuscar}>
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar proveedores, CUIT o contacto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <div className="topbar-user">
          <div className="user-avatar" title={nombreCompleto}>
            <User size={16} />
          </div>
          <div className="user-details">
            <span className="user-name">{nombreCompleto}</span>
            <span className="user-role">{rolEtiqueta}</span>
          </div>
          <button
            type="button"
            className="btn btn-small btn-logout"
            onClick={salir}
            title="Cerrar sesión"
          >
            <LogOut size={14} />
            <span className="logout-text">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
