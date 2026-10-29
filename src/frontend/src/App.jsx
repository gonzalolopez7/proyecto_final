import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import { PERMISOS } from './config/permisos';

import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Proveedores from './views/Proveedores';
import Usuarios from './views/Usuarios';
import Productos from './views/Productos';

function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="app">
      <Sidebar menuAbierto={menuAbierto} setMenuAbierto={setMenuAbierto} />
      <main className="main-area">
        <Topbar setMenuAbierto={setMenuAbierto} />
        <section className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route element={<ProtectedRoute roles={PERMISOS.proveedores} />}>
              <Route path="/proveedores" element={<Proveedores />} />
            </Route>

            <Route element={<ProtectedRoute roles={PERMISOS.productos} />}>
              <Route path="/productos" element={<Productos />} />
            </Route>

            <Route element={<ProtectedRoute roles={PERMISOS.usuarios} />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Todo lo demás exige sesión */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
