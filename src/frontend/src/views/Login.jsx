import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { login, guardarSesion } from '../services/authService';
import { mensajeDeError } from '../services/errores';

// Prendas del perchero decorativo: silueta, color y posición sobre la barra
const PRENDAS = [
  { tipo: 'remera', color: '#E9ECEF', izq: '4%' },
  { tipo: 'jean', color: '#3E6A9E', izq: '17%' },
  { tipo: 'buzo', color: '#F2B705', izq: '31%' },
  { tipo: 'remera', color: '#16202B', izq: '46%' },
  { tipo: 'jean', color: '#1B3A5C', izq: '60%' },
];

const SILUETAS = {
  remera: 'M30 6 L8 22 L19 40 L30 33 L30 88 L70 88 L70 33 L81 40 L92 22 L70 6 Q50 24 30 6 Z',
  jean: 'M27 6 H73 L78 92 H55 L50 38 L45 92 H22 Z',
  buzo: 'M34 8 Q50 -2 66 8 L94 64 L79 71 L70 46 L70 90 L30 90 L30 46 L21 71 L6 64 Z',
};

function Perchero() {
  return (
    <div className="lg-perchero" aria-hidden="true">
      <div className="lg-barra" />
      {PRENDAS.map(({ tipo, color, izq }, i) => (
        <div key={i} className="lg-prenda" style={{ left: izq, '--i': i }}>
          <svg viewBox="0 0 100 24" className="lg-percha">
            <path d="M50 22 L50 12 Q50 6 56 6 Q62 6 62 11" fill="none" stroke="#B4BFCE" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 22 L14 24 M50 22 L86 24" fill="none" stroke="#B4BFCE" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg viewBox="0 0 100 96" className={`lg-silueta lg-${tipo}`}>
            <path d={SILUETAS[tipo]} fill={color} />
            {tipo === 'jean' && <path d="M27 14 H73 M50 14 V38" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />}
            {tipo === 'buzo' && <path d="M40 10 Q50 26 60 10" stroke="rgba(0,0,0,0.25)" strokeWidth="2" fill="none" />}
          </svg>
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identificador: '',
    password: '',
  });

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function cambiarCampo(event) {
    const { name, value } = event.target;
    setForm((actual) => ({
      ...actual,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.identificador.trim() || !form.password) {
      setError('Por favor completá tu usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);

      const data = await login(form.identificador, form.password);
      guardarSesion(data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);
      setError(mensajeDeError(err, 'Credenciales inválidas. Comprobá usuario y contraseña.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-viewport lg-escena">
      <Perchero />

      <div className="lg-contenido">
        {/* Texto de presentación */}
        <section className="lg-intro">
          <div className="lg-marca">
            <div className="brand-badge-large">CS</div>
            <div>
              <strong className="lg-marca-nombre">Compra&amp;Stock</strong>
              <span className="lg-marca-sub">Gestión textil mayorista</span>
            </div>
          </div>

          <h1 className="lg-titular">Cada talle y cada color, en su lugar.</h1>
          <p className="lg-bajada">
            Comprá a tus proveedores, controlá el stock de cada variante y mantené las cuentas al día.
          </p>

          <div className="lg-variantes" aria-hidden="true">
            <div className="lg-talles">
              {['S', 'M', 'L', 'XL', 'XXL'].map((t) => (
                <span key={t} className={t === 'L' ? 'activo' : ''}>{t}</span>
              ))}
            </div>
            <div className="lg-colores">
              {['#E9ECEF', '#16202B', '#1B3A5C', '#3E6A9E', '#F2B705', '#B3382C'].map((c) => (
                <span key={c} style={{ background: c }} />
              ))}
            </div>
          </div>

          <small className="lg-pie">Proyecto final de carrera, UNT FACET 2026</small>
        </section>

        {/* Formulario: una etiqueta de prenda que cuelga de la barra */}
        <main className="lg-etiqueta-zona">
          <div className="lg-hilo" aria-hidden="true" />
          <div className="lg-etiqueta">
            <span className="lg-agujero" aria-hidden="true" />

            <header className="login-header">
              <span className="eyebrow">Acceso del personal</span>
              <h2>Iniciar sesión</h2>
              <p>Ingresá para ver el stock, cargar compras y revisar las cuentas.</p>
            </header>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-field">
                <label htmlFor="identificador">Usuario o correo electrónico</label>
                <div className="input-icon-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    id="identificador"
                    name="identificador"
                    type="text"
                    value={form.identificador}
                    onChange={cambiarCampo}
                    placeholder="ej. admin o usuario@empresa.com"
                    autoComplete="username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="password">Contraseña</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="password"
                    name="password"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={cambiarCampo}
                    placeholder="Ingresá tu clave"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn-toggle-password"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    tabIndex={-1}
                    aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert-banner alert-danger login-alert" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-submit-login"
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}