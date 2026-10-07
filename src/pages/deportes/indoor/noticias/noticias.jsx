import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2, Plus, Check, X, Star } from 'lucide-react'
import './noticias.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
import { useAuth } from '../../../../context/AuthContext'
import {
  obtenerNoticias,
  soyAdmin,
  agregarNoticia,
  editarNoticia,
  borrarNoticia,
  destacarNoticia,
  esDestacada,
  urlImagen,
} from './noticiasApi'

const MENSAJES_ERROR = {
  sin_sesion: 'Tu sesión se cerró. Volvé a ingresar con Google.',
  no_autorizado: 'Tu usuario no tiene permiso para editar noticias.',
  faltan_datos: 'Completá el título y el resumen.',
  no_existe: 'Esa noticia ya no existe (puede que otra persona la haya borrado).',
}
const avisarError = (err) => alert(MENSAJES_ERROR[err.message] || 'Algo salió mal. Probá de nuevo en un ratito.')

export default function Noticias() {
  const navigate = useNavigate()
  const { usuario } = useAuth()

  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(false)

  const [esAdmin, setEsAdmin] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // edición individual
  const [editandoId, setEditandoId] = useState(null)
  const [borradorTitulo, setBorradorTitulo] = useState('')
  const [borradorMini, setBorradorMini] = useState('')

  // borrar
  const [aBorrar, setABorrar] = useState(null)

  // agregar
  const [agregando, setAgregando] = useState(false)
  const [nuevoTitulo, setNuevoTitulo] = useState('')
  const [nuevoMini, setNuevoMini] = useState('')

  // ── Cargar noticias ──
  useEffect(() => {
    obtenerNoticias()
      .then(setNoticias)
      .catch(() => setErrorCarga(true))
      .finally(() => setCargando(false))
  }, [])

  // ── ¿La logueada es superadmin? ──
  useEffect(() => {
    if (!usuario) {
      setEsAdmin(false)
      setModoEdicion(false)
      return
    }
    soyAdmin()
      .then(admin => {
        console.log('[noticias] ¿superadmin?', admin, '—', usuario.email)
        setEsAdmin(admin)
      })
      .catch(err => {
        console.error('[noticias] No se pudo verificar superadmin:', err)
        setEsAdmin(false)
      })
  }, [usuario])

  // ── Editar ──
  const empezarEdicion = (n) => {
    setEditandoId(n.id)
    setBorradorTitulo(n.titulo)
    setBorradorMini(n.mini)
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setBorradorTitulo('')
    setBorradorMini('')
  }

  const guardarEdicion = async () => {
    const titulo = borradorTitulo.trim()
    const mini = borradorMini.trim()
    if (!titulo || !mini) return alert(MENSAJES_ERROR.faltan_datos)

    setGuardando(true)
    try {
      await editarNoticia(editandoId, titulo, mini)
      setNoticias(prev => prev.map(n => (n.id === editandoId ? { ...n, titulo, mini } : n)))
      cancelarEdicion()
    } catch (err) {
      avisarError(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Destacar (solo una a la vez; tocar la destacada la desmarca) ──
  const toggleDestacada = async (n) => {
    const valor = !esDestacada(n)
    setGuardando(true)
    try {
      await destacarNoticia(n.id, valor)
      setNoticias(prev => prev.map(x => ({ ...x, destacada: valor && x.id === n.id ? 'TRUE' : '' })))
    } catch (err) {
      avisarError(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Borrar ──
  const confirmarBorrar = async () => {
    setGuardando(true)
    try {
      await borrarNoticia(aBorrar.id)
      setNoticias(prev => prev.filter(n => n.id !== aBorrar.id))
      setABorrar(null)
    } catch (err) {
      avisarError(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Agregar ──
  const cancelarAgregar = () => {
    setAgregando(false)
    setNuevoTitulo('')
    setNuevoMini('')
  }

  const guardarNueva = async () => {
    const titulo = nuevoTitulo.trim()
    const mini = nuevoMini.trim()
    if (!titulo || !mini) return alert(MENSAJES_ERROR.faltan_datos)

    setGuardando(true)
    try {
      const { noticia } = await agregarNoticia(titulo, mini)
      setNoticias(prev => [...prev, noticia])
      cancelarAgregar()
    } catch (err) {
      avisarError(err)
    } finally {
      setGuardando(false)
    }
  }

  const salirDeEdicion = () => {
    setModoEdicion(false)
    cancelarEdicion()
    cancelarAgregar()
  }

  return (
    <>
      <main className="noticias">
        <BackButton />
        <h1 className="noticias__titulo">NOTICIAS</h1>

        {esAdmin && (
          <div className="noticias__barra-admin">
            <button
              className={`noticias__btn-editar ${modoEdicion ? 'noticias__btn-editar--activo' : ''}`}
              onClick={() => (modoEdicion ? salirDeEdicion() : setModoEdicion(true))}
            >
              {modoEdicion ? <><Check size={18} /> Terminar edición</> : <><Pencil size={18} /> Editar</>}
            </button>
          </div>
        )}

        {cargando && <p className="noticias__estado">Cargando noticias...</p>}
        {errorCarga && <p className="noticias__estado">No se pudieron cargar las noticias. Probá recargar la página.</p>}

        {!cargando && !errorCarga && noticias.length === 0 && !modoEdicion && (
          <p className="noticias__estado">Todavía no hay noticias.</p>
        )}

        {!cargando && !errorCarga && (
          <div className="noticias__grid">
            {noticias.map((n) => {
              const editandoEsta = editandoId === n.id
              const destacada = esDestacada(n)

              return (
                <div
                  key={n.id}
                  className={`noticias__card ${modoEdicion ? 'noticias__card--edicion' : ''} ${modoEdicion && destacada ? 'noticias__card--destacada' : ''}`}
                  onClick={() => !modoEdicion && navigate(`/noticias/${n.id}`)}
                >
                  {modoEdicion && !editandoEsta && (
                    <div className="noticias__card-acciones">
                      <button
                        className={`noticias__icono noticias__icono--destacar ${destacada ? 'noticias__icono--destacar-on' : ''}`}
                        title={destacada ? 'Quitar de destacada' : 'Destacar en el home'}
                        onClick={() => toggleDestacada(n)}
                        disabled={guardando}
                      >
                        <Star size={16} fill={destacada ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="noticias__icono"
                        title="Editar noticia"
                        onClick={() => empezarEdicion(n)}
                        disabled={guardando}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="noticias__icono noticias__icono--borrar"
                        title="Borrar noticia"
                        onClick={() => setABorrar(n)}
                        disabled={guardando}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {modoEdicion && destacada && (
                    <span className="noticias__badge-destacada">
                      <Star size={13} fill="currentColor" /> Destacada en el home
                    </span>
                  )}

                  {n.foto && (
                    <img
                      src={urlImagen(n.foto)}
                      alt={n.titulo}
                      className="noticias__card-foto"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}

                  {editandoEsta ? (
                    <div className="noticias__form">
                      <label className="noticias__label">Título</label>
                      <input
                        className="noticias__input"
                        value={borradorTitulo}
                        onChange={(e) => setBorradorTitulo(e.target.value)}
                        maxLength={150}
                      />
                      <label className="noticias__label">Resumen</label>
                      <textarea
                        className="noticias__textarea"
                        value={borradorMini}
                        onChange={(e) => setBorradorMini(e.target.value)}
                        rows={4}
                        maxLength={400}
                      />
                      <div className="noticias__form-botones">
                        <button className="noticias__btn noticias__btn--secundario" onClick={cancelarEdicion} disabled={guardando}>
                          <X size={16} /> Cancelar
                        </button>
                        <button className="noticias__btn noticias__btn--primario" onClick={guardarEdicion} disabled={guardando}>
                          <Check size={16} /> {guardando ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="noticias__card-titulo">{n.titulo}</h2>
                      <p className="noticias__card-resumen">{n.mini}</p>
                      {!modoEdicion && <span className="noticias__card-link">MÁS ›</span>}
                    </>
                  )}
                </div>
              )
            })}

            {/* ── Agregar nueva ── */}
            {modoEdicion && (
              agregando ? (
                <div className="noticias__card noticias__card--nueva-form">
                  <div className="noticias__form">
                    <label className="noticias__label">Título</label>
                    <input
                      className="noticias__input"
                      value={nuevoTitulo}
                      onChange={(e) => setNuevoTitulo(e.target.value)}
                      maxLength={150}
                      autoFocus
                    />
                    <label className="noticias__label">Resumen</label>
                    <textarea
                      className="noticias__textarea"
                      value={nuevoMini}
                      onChange={(e) => setNuevoMini(e.target.value)}
                      rows={4}
                      maxLength={400}
                    />
                    <div className="noticias__form-botones">
                      <button className="noticias__btn noticias__btn--secundario" onClick={cancelarAgregar} disabled={guardando}>
                        <X size={16} /> Cancelar
                      </button>
                      <button className="noticias__btn noticias__btn--primario" onClick={guardarNueva} disabled={guardando}>
                        <Check size={16} /> {guardando ? 'Guardando...' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button className="noticias__card noticias__card--nueva" onClick={() => setAgregando(true)}>
                  <Plus size={32} />
                  <span>Agregar nueva noticia</span>
                </button>
              )
            )}
          </div>
        )}
      </main>

      {/* ── Confirmación de borrado ── */}
      {aBorrar && (
        <div className="noticias__modal-fondo" onClick={() => !guardando && setABorrar(null)}>
          <div className="noticias__modal" onClick={(e) => e.stopPropagation()}>
            <Trash2 size={32} className="noticias__modal-icono" />
            <p className="noticias__modal-texto">¿Seguro que querés borrar esta noticia?</p>
            <p className="noticias__modal-titulo">«{aBorrar.titulo}»</p>
            <div className="noticias__form-botones noticias__form-botones--centro">
              <button className="noticias__btn noticias__btn--secundario" onClick={() => setABorrar(null)} disabled={guardando}>
                No
              </button>
              <button className="noticias__btn noticias__btn--peligro" onClick={confirmarBorrar} disabled={guardando}>
                {guardando ? 'Borrando...' : 'Sí, borrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </>
  )
}