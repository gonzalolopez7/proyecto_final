import { useEffect, useState } from 'react';
import { MapPin, X, Plus, Warehouse, Edit3, Trash2 } from 'lucide-react';
import {
  obtenerDepositos,
  obtenerEstanterias,
  crearUbicacion,
  modificarUbicacion,
  eliminarUbicacion,
  obtenerUbicacionesPorVariante,
} from '../services/logisticaService';
import { mensajeDeError } from '../services/errores';
import AlertBanner from './AlertBanner';

const FORM_INICIAL = { idDeposito: '', idEstanteria: '', cantidad: 1 };

export default function UbicacionVarianteModal({ variante, onClose }) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [depositos, setDepositos] = useState([]);
  const [estanterias, setEstanterias] = useState([]);
  const [form, setForm] = useState(FORM_INICIAL);
  const [editandoUbicacionId, setEditandoUbicacionId] = useState(null);
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
    obtenerDepositos()
      .then(setDepositos)
      .catch((err) => setError(mensajeDeError(err, 'No se pudieron cargar los depósitos.')));
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

  function limpiarForm() {
    setEditandoUbicacionId(null);
    setForm(FORM_INICIAL);
    setError('');
  }

  function abrirEditarUbicacion(u) {
    setEditandoUbicacionId(u.id);
    setForm({
      idDeposito: u.idDeposito,
      idEstanteria: u.idEstanteria,
      cantidad: u.cantidad,
    });
    setError('');
    setMensaje('');
  }

  async function handleGuardar(e) {
    e.preventDefault();
    const cantidadNum = Number(form.cantidad);

    if (!editandoUbicacionId && !form.idEstanteria) {
      setError('Seleccioná una estantería.');
      return;
    }
    if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }

    try {
      setGuardando(true);
      setError('');

      if (editandoUbicacionId) {
        await modificarUbicacion(editandoUbicacionId, { cantidad: cantidadNum });
        setMensaje('Cantidad actualizada correctamente.');
      } else {
        await crearUbicacion({
          idVariante: variante.id,
          idEstanteria: form.idEstanteria,
          cantidad: cantidadNum,
        });
        setMensaje('Ubicación asignada correctamente.');
      }

      limpiarForm();
      await cargarUbicaciones();
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          editandoUbicacionId
            ? 'No se pudo actualizar la ubicación.'
            : 'No se pudo asignar la ubicación.'
        )
      );
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminarUbicacion(u) {
    if (
      !window.confirm(
        `¿Quitar la variante "${variante.sku}" de la estantería "${u.nombreEstanteria}" (${u.nombreDeposito})?`
      )
    ) {
      return;
    }

    try {
      setError('');
      await eliminarUbicacion(u.id);
      if (editandoUbicacionId === u.id) {
        limpiarForm();
      }
      setMensaje('Ubicación eliminada correctamente.');
      await cargarUbicaciones();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar la ubicación.'));
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

          {/* Formulario de asignación / edición */}
          <form onSubmit={handleGuardar} className="modal-form variante-inline-form">
            <fieldset className="form-section">
              <legend>
                {editandoUbicacionId
                  ? 'Modificar cantidad en ubicación'
                  : 'Asignar nueva ubicación'}
              </legend>

              {depositos.length === 0 ? (
                <p className="muted text-sm">No hay depósitos registrados. Creá uno primero en el módulo Depósitos.</p>
              ) : (
                <>
                  <div className="variante-form-grid" style={{ gridTemplateColumns: '1fr 1fr 110px' }}>
                    <label>
                      Depósito *
                      <select
                        value={form.idDeposito}
                        onChange={(e) => setForm({ ...form, idDeposito: e.target.value, idEstanteria: '' })}
                        disabled={Boolean(editandoUbicacionId)}
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
                        disabled={!form.idDeposito || Boolean(editandoUbicacionId)}
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
                        min="1"
                        step="1"
                        value={form.cantidad}
                        onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                        required
                      />
                    </label>
                  </div>

                  <div className="variante-form-actions">
                    {editandoUbicacionId && (
                      <button type="button" className="btn btn-small" onClick={limpiarForm}>
                        Cancelar edición
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary btn-small" disabled={guardando}>
                      <Plus size={14} />{' '}
                      {guardando
                        ? 'Guardando...'
                        : editandoUbicacionId
                          ? 'Actualizar cantidad'
                          : 'Asignar ubicación'}
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
                    <th className="actions-header">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {ubicaciones.map((u) => (
                    <tr
                      key={u.id}
                      className={`table-row-hover${editandoUbicacionId === u.id ? ' row-editing' : ''}`}
                    >
                      <td>{u.nombreDeposito}</td>
                      <td><span className="talle-pill">{u.nombreEstanteria}</span></td>
                      <td className="num font-mono">{u.cantidad} u.</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          onClick={() => abrirEditarUbicacion(u)}
                          title="Modificar cantidad"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          onClick={() => handleEliminarUbicacion(u)}
                          title="Quitar de esta estantería"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
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
