import { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Truck,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Plus,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import { obtenerSesion } from '../services/authService';
import { obtenerProveedores } from '../services/proveedorService';
import { obtenerUsuarios } from '../services/usuarioService';
import { formatoMoneda } from '../utils/numeroALetras';

export default function Dashboard() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const user = sesion?.user;

  const [loading, setLoading] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [totalProveedores, setTotalProveedores] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    async function cargarResumen() {
      try {
        setLoading(true);
        const [resProvs, resUsers] = await Promise.allSettled([
          obtenerProveedores({ page: 1, pageSize: 5 }),
          obtenerUsuarios({ page: 1, pageSize: 5 }),
        ]);

        if (resProvs.status === 'fulfilled') {
          const data = resProvs.value;
          const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
          setProveedores(items);
          setTotalProveedores(data.totalCount || items.length);
        }

        if (resUsers.status === 'fulfilled') {
          const data = resUsers.value;
          const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
          setUsuarios(items);
          setTotalUsuarios(data.totalCount || items.length);
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    cargarResumen();
  }, []);

  const totalSaldoInicial = proveedores.reduce((acc, p) => acc + (Number(p.saldoInicial) || 0), 0);
  const proveedoresConSaldo = proveedores.filter((p) => (Number(p.saldoInicial) || 0) > 0).length;

  return (
    <main className="view dashboard-view">
      <header className="page-head">
        <article>
          <h1>Buen día, {user?.firstName || user?.userName}</h1>
          <p>
            Panel de control general. Gestión centralizada de proveedores comerciales y usuarios del sistema SGCS.
          </p>
        </article>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate('/proveedores')}
          >
            <Plus size={16} />
            Nuevo proveedor
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => navigate('/usuarios')}
          >
            <UserPlus size={16} />
            Nuevo usuario
          </button>
        </div>
      </header>

      {/* Indicadores Principales */}
      <section className="kpis" aria-label="Indicadores principales">
        <KpiCard
          label="Proveedores registrados"
          value={`${totalProveedores}`}
          detail="Directorio comercial mayorista activo"
        />

        <KpiCard
          label="Saldo inicial proveedores"
          value={formatoMoneda(totalSaldoInicial)}
          detail={proveedoresConSaldo > 0 ? `${proveedoresConSaldo} proveedores con saldo inicial` : 'Sin saldos iniciales pendientes'}
        />

        <KpiCard
          label="Usuarios del sistema"
          value={`${totalUsuarios}`}
          detail="Cuentas activas con control de roles"
        />

        <KpiCard
          label="Estado de la API"
          value="SGCS v2"
          detail="Backend .NET 8 conectado"
        />
      </section>

      {/* Grilla con Proveedores y Usuarios recientes */}
      <div className="dashboard-grid">
        {/* Panel izquierdo: Proveedores recientes */}
        <section className="card">
          <header className="card-head">
            <h2>
              <Building2 size={18} />
              Proveedores registrados
            </h2>
            <button
              type="button"
              className="btn btn-small"
              onClick={() => navigate('/proveedores')}
            >
              Ver todos <ArrowRight size={14} />
            </button>
          </header>
          <div className="card-body">
            {loading ? (
              <p className="loading-state">Cargando proveedores...</p>
            ) : proveedores.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Truck size={36} className="empty-icon" />
                <p className="muted text-sm">No hay proveedores registrados aún.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">PROVEEDOR</th>
                    <th scope="col">CUIT</th>
                    <th scope="col">CONDICIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <strong>{p.nombre}</strong>
                      </th>
                      <td>
                        <code>{p.cuit || 'Sin CUIT'}</code>
                      </td>
                      <td>
                        <span className="term-badge">
                          <Calendar size={12} />
                          {p.diasPago ? `${p.diasPago} días` : 'Contado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Panel derecho: Usuarios del sistema */}
        <section className="card">
          <header className="card-head">
            <h2>
              <Users size={18} />
              Usuarios y roles
            </h2>
            <button
              type="button"
              className="btn btn-small"
              onClick={() => navigate('/usuarios')}
            >
              Administrar <ArrowRight size={14} />
            </button>
          </header>
          <div className="card-body">
            {loading ? (
              <p className="loading-state">Cargando usuarios...</p>
            ) : usuarios.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <Users size={36} className="empty-icon" />
                <p className="muted text-sm">No hay usuarios disponibles.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">USUARIO</th>
                    <th scope="col">NOMBRE</th>
                    <th scope="col">ROL</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <th scope="row" className="row-title">
                        <code>{u.userName}</code>
                      </th>
                      <td>
                        {u.firstName} {u.lastName}
                      </td>
                      <td>
                        <span className="tag tag-success">
                          <ShieldCheck size={12} style={{ marginRight: 4 }} />
                          {u.role || 'Usuario'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
