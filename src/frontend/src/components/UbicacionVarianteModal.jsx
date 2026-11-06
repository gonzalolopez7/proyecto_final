import { useEffect, useState } from 'react';
import { MapPin, X, Plus, Warehouse } from 'lucide-react';
import {
  obtenerDepositos,
  obtenerEstanterias,
  asignarUbicacion,
  obtenerUbicacionesPorVariante,
} from '../services/logisticaService';
import { mensajeDeError } from '../services/errores';
import AlertBanner from './AlertBanner';

const FORM_INICIAL = { idDeposito: '', idEstanteria: '', cantidad: 0 };

export default function UbicacionVarianteModal({ variante, onClose }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [depositos, setDepositos] = useState([]);
  const [estanterias, setEstanterias] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  async function cargarUbicaciones() {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerUbicacionesPorVariante(variante.id);
      setUbicaciones(data);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar las ubicaciones.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarUbicaciones();
    obtenerDepositos().then((lista) => setDepositos(lista.filter((d) => d.activo)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variante.id]);

useEffect(() => {
  let activo = true;

  async function cargarEstanterias() {
    if (!form.idDeposito) {
      setEstanterias([]);
      return;
    }

    try {
      setEstanterias([]);
      const lista = await obtenerEstanterias(form.idDeposito);

      if (activo) {
        setEstanterias(lista);
      }
    } catch (err) {
      if (activo) {
        setError(mensajeDeError(err, 'No se pudieron cargar las estanterías.'));
      }
    }
  }

  cargarEstanterias();

  return () => {
    activo = false;
  };
}, [form.idDeposito]);

  async function handleAsignar(e) {
    e.preventDefault();
    if (!form.idEstanteria) { setError('Seleccioná una estantería.'); return; }
    if (form.cantidad < 0) { setError('La cantidad no puede ser negativa.'); return; }

    try {
      setGuardando(true);
      setError('');
      await asignarUbicacion(variante.id, form.idEstanteria, Number(form.cantidad));
      setMensaje('Ubicación asignada correctamente.');
      setForm(FORM_INICIAL);
      await cargarUbicaciones();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo asignar la ubicación.'));
    } finally {
      setGuardando(false);
    }
  }

  const totalUnidades = ubicaciones.reduce((acc, u) => acc + u.cantidad, 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2><MapPin size={18} /> Ubicaciones de {variante.sku}</h2>
            <p className="modal-subtitle">
              Stock físico total: <strong>{totalUnidades}</strong> unidades repartidas en {ubicaciones.length} ubicación(es)
            </p>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <div className="modal-body-padded">
          <AlertBanner tipo="success" mensaje={mensaje} onClose={() => setMensaje('')} />
          <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')} />

          {/* Formulario de asignación */}
          <form onSubmit={handleAsignar} className="modal-form variante-inline-form">
            <fieldset className="form-section">
              <legend>Asignar / actualizar ubicación</legend>

              {depositos.length === 0 ? (
                <p className="muted text-sm">No hay depósitos activos. Creá uno primero en Logística.</p>
              ) : (
                <>
                  <div className="variante-form-grid" style={{ gridTemplateColumns: '1fr 1fr 110px' }}>
                    <label>
                      Depósito *
                      <select
                        value={form.idDeposito}
                        onChange={(e) => setForm({ ...form, idDeposito: e.target.value, idEstanteria: '' })}
                        required
                      >
                        <option value="" disabled>Seleccione...</option>
                        {depositos.map((d) => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Estantería *
                      <select
                        value={form.idEstanteria}
                        onChange={(e) => setForm({ ...form, idEstanteria: e.target.value })}
                        disabled={!form.idDeposito}
                        required
                      >
                        <option value="" disabled>
                          {form.idDeposito ? 'Seleccione...' : 'Elegí un depósito primero'}
                        </option>
                        {estanterias.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Cantidad *
                      <input
                        type="number"
                        min="0"
                        value={form.cantidad}
                        onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                        required
                      />
                    </label>
                  </div>

                  <div className="variante-form-actions">
                    <button type="submit" className="btn btn-primary btn-small" disabled={guardando}>
                      <Plus size={14} /> {guardando ? 'Guardando...' : 'Asignar'}
                    </button>
                  </div>
                </>
              )}
            </fieldset>
          </form>

          {/* Listado de ubicaciones actuales */}
          <div className="variantes-list-section">
            <header className="variantes-list-head">
              <h3><Warehouse size={16} /> Ubicaciones registradas</h3>
            </header>

            {loading ? (
              <p className="loading-state">Cargando...</p>
            ) : ubicaciones.length === 0 ? (
              <div className="empty-state empty-state-compact">
                <p className="muted text-sm">Esta variante todavía no tiene ubicación física asignada.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>DEPÓSITO</th>
                    <th>ESTANTERÍA</th>
                    <th className="num">CANTIDAD</th>
                  </tr>
                </thead>
                <tbody>
                  {ubicaciones.map((u) => (
                    <tr key={u.id} className="table-row-hover">
                      <td>{u.nombreDeposito}</td>
                      <td><span className="talle-pill">{u.nombreEstanteria}</span></td>
                      <td className="num font-mono">{u.cantidad} u.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}