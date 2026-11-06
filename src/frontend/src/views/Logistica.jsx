import { Fragment, useEffect, useState, useCallback } from 'react';
import { Warehouse, Plus, Edit3, Trash2, X, RotateCcw, FolderTree, RefreshCcw } from 'lucide-react';
import {
  obtenerDepositos, altaDeposito, modificarDeposito,
  eliminarDeposito, restaurarDeposito,
  obtenerEstanterias, altaEstanteria, modificarEstanteria,
  eliminarEstanteria, restaurarEstanteria,
  obtenerUbicacionesPorEstanteria,
} from '../services/logisticaService';
import { mensajeDeError, codigoDeError, datosDeError } from '../services/errores';
import AlertBanner from '../components/AlertBanner';

const DEPOSITO_INICIAL = { nombre: '', descripcion: '' };
const ESTANTERIA_INICIAL = { idDeposito: '', nombre: '', descripcion: '' };

export default function Logistica() {
  const [pestana, setPestana] = useState('depositos');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [depositos, setDepositos] = useState([]);
  const [loadingDepositos, setLoadingDepositos] = useState(true);
  const [depositoRestaurable, setDepositoRestaurable] = useState(null);

  const [modalDepositoAbierto, setModalDepositoAbierto] = useState(false);
  const [editandoDepositoId, setEditandoDepositoId] = useState(null);
  const [formDeposito, setFormDeposito] = useState(DEPOSITO_INICIAL);
  const [guardandoDeposito, setGuardandoDeposito] = useState(false);

  const [depositoSeleccionado, setDepositoSeleccionado] = useState('');
  const [estanterias, setEstanterias] = useState([]);
  const [estanteriaRestaurable, setEstanteriaRestaurable] = useState(null);
  const [modalEstanteriaAbierto, setModalEstanteriaAbierto] = useState(false);
  const [editandoEstanteriaId, setEditandoEstanteriaId] = useState(null);
  const [formEstanteria, setFormEstanteria] = useState(ESTANTERIA_INICIAL);
  const [guardandoEstanteria, setGuardandoEstanteria] = useState(false);

  const [estanteriaExpandida, setEstanteriaExpandida] = useState(null);
  const [contenidoEstanteria, setContenidoEstanteria] = useState([]);
  const [loadingContenido, setLoadingContenido] = useState(false);

  const cargarDepositos = useCallback(async () => {
    try {
      setLoadingDepositos(true);
      setDepositos(await obtenerDepositos());
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar los depósitos.'));
    } finally {
      setLoadingDepositos(false);
    }
  }, []);

  useEffect(() => { cargarDepositos(); }, [cargarDepositos]);

  useEffect(() => {
    setEstanteriaExpandida(null);
    setContenidoEstanteria([]);
    if (!depositoSeleccionado) { setEstanterias([]); return; }
    obtenerEstanterias(depositoSeleccionado).then(setEstanterias).catch((err) => {
      setError(mensajeDeError(err, 'No se pudieron cargar las estanterías.'));
    });
  }, [depositoSeleccionado]);

  function abrirNuevoDeposito() {
    setEditandoDepositoId(null);
    setFormDeposito(DEPOSITO_INICIAL);
    setDepositoRestaurable(null);
    setError('');
    setModalDepositoAbierto(true);
  }

  function abrirEditarDeposito(d) {
    setEditandoDepositoId(d.id);
    setFormDeposito({ nombre: d.nombre, descripcion: d.descripcion || '' });
    setDepositoRestaurable(null);
    setError('');
    setModalDepositoAbierto(true);
  }

  async function handleGuardarDeposito(e) {
    e.preventDefault();
    if (!formDeposito.nombre.trim()) {
      setError('El nombre del depósito es obligatorio.');
      return;
    }
    try {
      setGuardandoDeposito(true);
      setError('');
      setDepositoRestaurable(null);

      const payload = {
        nombre: formDeposito.nombre.trim(),
        descripcion: formDeposito.descripcion.trim() || null,
      };

      if (editandoDepositoId) {
        await modificarDeposito(editandoDepositoId, payload);
        setMensaje('Depósito modificado con éxito.');
      } else {
        await altaDeposito(payload);
        setMensaje('Depósito creado con éxito.');
      }
      setModalDepositoAbierto(false);
      await cargarDepositos();
    } catch (err) {
      const cod = codigoDeError(err);
      const data = datosDeError(err);
      if (cod === 'Deposito.SoftDeletedNombre') {
        setDepositoRestaurable({ id: data?.existingDepositoId || data?.id, nombre: data?.nombre });
      }
      setError(mensajeDeError(err, 'Error al guardar el depósito.'));
    } finally {
      setGuardandoDeposito(false);
    }
  }

  async function handleRestaurarDeposito(id, nombre) {
    try {
      await restaurarDeposito(id);
      setMensaje(`Depósito "${nombre}" restaurado exitosamente.`);
      setDepositoRestaurable(null);
      setModalDepositoAbierto(false);
      await cargarDepositos();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo restaurar el depósito.'));
    }
  }

  async function handleEliminarDeposito(id, nombre) {
    if (!window.confirm(`¿Dar de baja el depósito "${nombre}"?`)) return;
    try {
      await eliminarDeposito(id);
      setMensaje('Depósito dado de baja correctamente.');
      if (depositoSeleccionado === id) {
        setDepositoSeleccionado('');
        setEstanterias([]);
      }
      await cargarDepositos();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el depósito. Verificá que no tenga estanterías activas.'));
    }
  }

  function abrirNuevaEstanteria() {
    setEditandoEstanteriaId(null);
    setFormEstanteria({ ...ESTANTERIA_INICIAL, idDeposito: depositoSeleccionado });
    setEstanteriaRestaurable(null);
    setError('');
    setModalEstanteriaAbierto(true);
  }

  function abrirEditarEstanteria(est) {
    setEditandoEstanteriaId(est.id);
    setFormEstanteria({
      idDeposito: est.idDeposito,
      nombre: est.nombre,
      descripcion: est.descripcion || '',
    });
    setEstanteriaRestaurable(null);
    setError('');
    setModalEstanteriaAbierto(true);
  }

  async function handleGuardarEstanteria(e) {
    e.preventDefault();
    if (!formEstanteria.idDeposito) { setError('Seleccioná un depósito.'); return; }
    if (!formEstanteria.nombre.trim()) { setError('El nombre de la estantería es obligatorio.'); return; }

    try {
      setGuardandoEstanteria(true);
      setError('');
      setEstanteriaRestaurable(null);

      if (editandoEstanteriaId) {
        await modificarEstanteria(editandoEstanteriaId, {
          nombre: formEstanteria.nombre.trim(),
          descripcion: formEstanteria.descripcion.trim() || null,
        });
        setMensaje('Estantería modificada con éxito.');
      } else {
        await altaEstanteria({
          idDeposito: formEstanteria.idDeposito,
          nombre: formEstanteria.nombre.trim(),
          descripcion: formEstanteria.descripcion.trim() || null,
        });
        setMensaje('Estantería creada con éxito.');
      }
      setModalEstanteriaAbierto(false);
      setEstanterias(await obtenerEstanterias(depositoSeleccionado));
      await cargarDepositos();
    } catch (err) {
      const cod = codigoDeError(err);
      const data = datosDeError(err);
      if (cod === 'Estanteria.SoftDeletedNombre') {
        setEstanteriaRestaurable({ id: data?.existingEstanteriaId || data?.id, nombre: data?.nombre });
      }
      setError(mensajeDeError(err, 'Error al guardar la estantería.'));
    } finally {
      setGuardandoEstanteria(false);
    }
  }

  async function handleRestaurarEstanteria(id, nombre) {
    try {
      await restaurarEstanteria(id);
      setMensaje(`Estantería "${nombre}" restaurada exitosamente.`);
      setEstanteriaRestaurable(null);
      setModalEstanteriaAbierto(false);
      setEstanterias(await obtenerEstanterias(depositoSeleccionado));
      await cargarDepositos();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo restaurar la estantería.'));
    }
  }

  async function handleEliminarEstanteria(id, nombre) {
    if (!window.confirm(`¿Eliminar la estantería "${nombre}"?`)) return;
    try {
      await eliminarEstanteria(id);
      setMensaje('Estantería eliminada correctamente.');
      if (estanteriaExpandida === id) {
        setEstanteriaExpandida(null);
        setContenidoEstanteria([]);
      }
      setEstanterias(await obtenerEstanterias(depositoSeleccionado));
      await cargarDepositos();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar: la estantería contiene stock.'));
    }
  }

  async function toggleEstanteria(est) {
    if (estanteriaExpandida === est.id) {
      setEstanteriaExpandida(null);
      setContenidoEstanteria([]);
      return;
    }

    try {
      setLoadingContenido(true);
      setError('');
      setEstanteriaExpandida(est.id);

      const data = await obtenerUbicacionesPorEstanteria(est.id);
      setContenidoEstanteria(data);
    } catch (err) {
      setError(
        mensajeDeError(err, 'No se pudo cargar el contenido de la estantería.')
      );
    } finally {
      setLoadingContenido(false);
    }
  }

  return (
    <main className="view logistica-view">
      <header className="page-head">
        <article>
          <h1>Depósitos y estanterías</h1>
          <p>Módulo de gestión de depositos, estanterías y ubicaciones físicas de stock.</p>
        </article>
        <div className="page-head-actions">
          {pestana === 'depositos' && (
            <button type="button" className="btn btn-primary" onClick={abrirNuevoDeposito}>
              <Plus size={16} /> Nuevo depósito
            </button>
          )}
          {pestana === 'estanterias' && depositoSeleccionado && (
            <button type="button" className="btn btn-primary" onClick={abrirNuevaEstanteria}>
              <Plus size={16} /> Nueva estantería
            </button>
          )}
          <button className="btn" type="button" onClick={cargarDepositos}>
            <RefreshCcw size={16} /> Actualizar
          </button>
        </div>
      </header>

      <AlertBanner tipo="success" mensaje={mensaje} onClose={() => setMensaje('')} />
      {!modalDepositoAbierto && !modalEstanteriaAbierto && (
        <AlertBanner tipo="danger" mensaje={error} onClose={() => setError('')} />
      )}

      <nav className="compras-tabs">
        <button type="button" className={`btn${pestana === 'depositos' ? ' btn-primary' : ''}`}
          onClick={() => setPestana('depositos')}>
          <Warehouse size={16} /> Depósitos ({depositos.length})
        </button>
        <button type="button" className={`btn${pestana === 'estanterias' ? ' btn-primary' : ''}`}
          onClick={() => setPestana('estanterias')}>
          <FolderTree size={16} /> Estanterías
        </button>
      </nav>

      {pestana === 'depositos' && (
        <section className="card">
          <header className="card-head"><h2><Warehouse size={18} /> Depósitos registrados</h2></header>
          {loadingDepositos ? (
            <p className="loading-state">Cargando...</p>
          ) : depositos.length === 0 ? (
            <div className="empty-state">
              <Warehouse size={48} className="empty-icon" />
              <h3>No hay depósitos registrados</h3>
              <p className="muted">Creá el primer depósito para empezar a organizar estanterías y stock.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>NOMBRE</th>
                  <th>DESCRIPCIÓN</th>
                  <th className="num">ESTANTERÍAS</th>
                  <th className="num">UNIDADES</th>
                  <th className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {depositos.map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className="row-title">
                      <strong>{d.nombre}</strong>
                    </th>
                    <td className="muted">{d.descripcion || '—'}</td>
                    <td className="num">{d.cantidadEstanterias}</td>
                    <td className="num">{d.cantidadUnidades}</td>

                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-icon"
                        title="Modificar depósito"
                        onClick={() => abrirEditarDeposito(d)}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        className="btn btn-icon danger"
                        title="Dar de baja"
                        onClick={() => handleEliminarDeposito(d.id, d.nombre)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {pestana === 'estanterias' && (
        <section className="card">
          <header className="card-head">
            <h2><FolderTree size={18} /> Estanterías</h2>
            <select className="select-filter" value={depositoSeleccionado}
              onChange={(e) => setDepositoSeleccionado(e.target.value)}>
              <option value="">Seleccioná un depósito...</option>
              {depositos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </header>
          {!depositoSeleccionado ? (
            <div className="empty-state">
              <FolderTree size={48} className="empty-icon" />
              <h3>Elegí un depósito para ver sus estanterías</h3>
            </div>
          ) : estanterias.length === 0 ? (
            <div className="empty-state">
              <p>Este depósito todavía no tiene estanterías.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>NOMBRE</th>
                  <th>DESCRIPCIÓN</th>
                  <th className="num">UBICACIONES</th>
                  <th className="num">UNIDADES</th>
                  <th className="actions-header">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {estanterias.map((est) => (
                  <Fragment key={est.id}>
                    <tr
                      className="table-row-hover fila-compra"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleEstanteria(est)}
                      title="Hacé clic para ver las variantes ubicadas en esta estantería"
                    >
                      <th scope="row" className="row-title"><strong>{est.nombre}</strong></th>
                      <td className="muted">{est.descripcion || '—'}</td>
                      <td className="num">{est.cantidadUbicaciones}</td>
                      <td className="num">{est.cantidadUnidades}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="btn btn-icon"
                          title="Modificar estantería"
                          onClick={(e) => { e.stopPropagation(); abrirEditarEstanteria(est); }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-icon danger"
                          title="Dar de baja"
                          onClick={(e) => { e.stopPropagation(); handleEliminarEstanteria(est.id, est.nombre); }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    {estanteriaExpandida === est.id && (
                      <tr className="fila-detalle">
                        <td colSpan={5}>
                          <div className="detalle-compra">
                            {loadingContenido ? (
                              <p className="muted text-sm">Cargando contenido de la estantería...</p>
                            ) : contenidoEstanteria.length === 0 ? (
                              <p className="muted text-sm">Estantería vacía.</p>
                            ) : (
                              <table>
                                <thead>
                                  <tr>
                                    <th>SKU</th>
                                    <th>PRODUCTO</th>
                                    <th>TALLE</th>
                                    <th>COLOR</th>
                                    <th className="num">CANTIDAD</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {contenidoEstanteria.map((u) => (
                                    <tr key={u.id}>
                                      <td><code>{u.sku}</code></td>
                                      <td>{u.productoNombre || '—'}</td>
                                      <td><span className="talle-pill">{u.talleNombre || '—'}</span></td>
                                      <td>{u.colorNombre || '—'}</td>
                                      <td className="num font-mono">{u.cantidad} u.</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {modalDepositoAbierto && (
        <div className="modal-backdrop" onClick={() => setModalDepositoAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoDepositoId ? 'Modificar depósito' : 'Nuevo depósito'}</h2>
              <button className="btn-close" onClick={() => setModalDepositoAbierto(false)}><X size={18} /></button>
            </header>
            <form onSubmit={handleGuardarDeposito} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error}>
                {depositoRestaurable && (
                  <div className="alert-restore-actions">
                    <button type="button" className="btn btn-small"
                      onClick={() => handleRestaurarDeposito(depositoRestaurable.id, depositoRestaurable.nombre)}>
                      <RotateCcw size={14} /> Restaurar depósito existente
                    </button>
                  </div>
                )}
              </AlertBanner>
              <label>
                Nombre *
                <input type="text" maxLength={100} value={formDeposito.nombre}
                  onChange={(e) => setFormDeposito({ ...formDeposito, nombre: e.target.value })}
                  placeholder="Ej. Depósito Central" required />
              </label>
              <label>
                Descripción
                <input type="text" maxLength={500} value={formDeposito.descripcion}
                  onChange={(e) => setFormDeposito({ ...formDeposito, descripcion: e.target.value })} />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalDepositoAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardandoDeposito}>
                  {guardandoDeposito ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEstanteriaAbierto && (
        <div className="modal-backdrop" onClick={() => setModalEstanteriaAbierto(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h2>{editandoEstanteriaId ? 'Modificar estantería' : 'Nueva estantería'}</h2>
              <button className="btn-close" onClick={() => setModalEstanteriaAbierto(false)}><X size={18} /></button>
            </header>
            <form onSubmit={handleGuardarEstanteria} className="modal-form">
              <AlertBanner tipo="danger" mensaje={error}>
                {estanteriaRestaurable && (
                  <div className="alert-restore-actions">
                    <button type="button" className="btn btn-small"
                      onClick={() => handleRestaurarEstanteria(estanteriaRestaurable.id, estanteriaRestaurable.nombre)}>
                      <RotateCcw size={14} /> Restaurar estantería existente
                    </button>
                  </div>
                )}
              </AlertBanner>
              <label>
                Nombre *
                <input type="text" maxLength={100} value={formEstanteria.nombre}
                  onChange={(e) => setFormEstanteria({ ...formEstanteria, nombre: e.target.value })}
                  placeholder="Ej. A1" required />
              </label>
              <label>
                Descripción
                <input type="text" maxLength={500} value={formEstanteria.descripcion}
                  onChange={(e) => setFormEstanteria({ ...formEstanteria, descripcion: e.target.value })}
                  placeholder="Ej. Pasillo norte - Nivel 1" />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setModalEstanteriaAbierto(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardandoEstanteria}>
                  {guardandoEstanteria ? 'Guardando...' : editandoEstanteriaId ? 'Guardar cambios' : 'Crear estantería'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
