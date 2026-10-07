import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Check, X, ImagePlus, Trash2 } from 'lucide-react'
import {
  obtenerNoticias,
  urlImagen,
  soyAdmin,
  editarDetalle,
  subirFotoNoticia,
  quitarFotoNoticia,
  comprimirImagen,
} from './noticiasApi'
import { useAuth } from '../../../../context/AuthContext'
import './noticiaDetalle.css'
import './noticiaDetalleEdicion.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'

const MENSAJES_ERROR = {
  sin_sesion: 'Tu sesión se cerró. Volvé a ingresar con Google.',
  no_autorizado: 'Tu usuario no tiene permiso para editar noticias.',
  faltan_datos: 'El título no puede quedar vacío.',
  no_existe: 'Esa noticia ya no existe (puede que otra persona la haya borrado).',
  imagen_invalida: 'No se pudo leer la imagen. Probá con una foto JPG o PNG.',
  foto_muy_grande: 'La foto es demasiado grande. Probá con otra.',
}
const avisarError = (err) => {
  console.error('Error en noticia:', err)
  alert(MENSAJES_ERROR[err.message] || `Algo salió mal: ${err.message}`)
}

// Separa en párrafos por línea en blanco
const parrafos = (texto) => texto.split(/\n\s*\n/).filter(p => p.trim() !== '')

export default function NoticiaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const inputFotoRef = useRef(null)

  const [noticia, setNoticia] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [esAdmin, setEsAdmin] = useState(false)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  const [borradorTitulo, setBorradorTitulo] = useState('')
  const [borradorTexto, setBorradorTexto] = useState('')
  // muestra la foto recién subida al instante (Drive tarda un poco en generar la miniatura)
  const [fotoPreview, setFotoPreview] = useState('')

  // ── Cargar la noticia ──
  useEffect(() => {
    obtenerNoticias()
      .then(lista => setNoticia(lista.find(n => n.id === parseInt(id)) || null))
      .catch(() => setNoticia(null))
      .finally(() => setCargando(false))
  }, [id])

  // ── ¿La logueada es superadmin? ──
  useEffect(() => {
    if (!usuario) {
      setEsAdmin(false)
      setEditando(false)
      return
    }
    soyAdmin()
      .then(setEsAdmin)
      .catch(() => setEsAdmin(false))
  }, [usuario])

  // ── Editar texto ──
  const empezarEdicion = () => {
    setBorradorTitulo(noticia.titulo)
    setBorradorTexto(noticia.texto || '')
    setEditando(true)
  }

  const cancelarEdicion = () => {
    setEditando(false)
    setBorradorTitulo('')
    setBorradorTexto('')
  }

  const guardar = async () => {
    const titulo = borradorTitulo.trim()
    const texto = borradorTexto.trim()
    if (!titulo) return alert(MENSAJES_ERROR.faltan_datos)

    setGuardando(true)
    try {
      await editarDetalle(noticia.id, titulo, texto)
      setNoticia(prev => ({ ...prev, titulo, texto }))
      cancelarEdicion()
    } catch (err) {
      avisarError(err)
    } finally {
      setGuardando(false)
    }
  }

  // ── Foto (se guarda apenas la eligen) ──
  const elegirFoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite volver a elegir la misma foto
    if (!file) return

    setSubiendoFoto(true)
    try {
      const dataUrl = await comprimirImagen(file)
      const foto = await subirFotoNoticia(noticia.id, dataUrl)
      setFotoPreview(dataUrl)
      setNoticia(prev => ({ ...prev, foto }))
    } catch (err) {
      avisarError(err)
    } finally {
      setSubiendoFoto(false)
    }
  }

  const quitarFoto = async () => {
    if (!window.confirm('¿Seguro que querés quitar la foto de esta noticia?')) return
    setSubiendoFoto(true)
    try {
      await quitarFotoNoticia(noticia.id)
      setFotoPreview('')
      setNoticia(prev => ({ ...prev, foto: '' }))
    } catch (err) {
      avisarError(err)
    } finally {
      setSubiendoFoto(false)
    }
  }

  if (cargando) {
    return (
      <>
        <main className="noticia-detalle">
          <BackButton />
          <p>Cargando noticia...</p>
        </main>
        <PageFooter />
      </>
    )
  }

  if (!noticia) {
    return (
      <>
        <main className="noticia-detalle">
          <BackButton />
          <p>Noticia no encontrada.</p>
        </main>
        <PageFooter />
      </>
    )
  }

  const srcFoto = fotoPreview || urlImagen(noticia.foto)
  // Si todavía no tiene texto largo, mostramos el resumen
  const cuerpo = noticia.texto || noticia.mini

  return (
    <>
      <main className="noticia-detalle">
        <BackButton />

        {esAdmin && !editando && (
          <div className="noticia-detalle__barra-admin">
            <button className="noticia-detalle__btn-editar" onClick={empezarEdicion}>
              <Pencil size={18} /> Editar noticia
            </button>
          </div>
        )}

        {/* ── FOTO ── */}
        {editando ? (
          <div className="noticia-detalle__foto-editor">
            {srcFoto ? (
              <img src={srcFoto} alt={noticia.titulo} className="noticia-detalle__foto" />
            ) : (
              <button
                className="noticia-detalle__foto-vacia"
                onClick={() => inputFotoRef.current?.click()}
                disabled={subiendoFoto}
              >
                <ImagePlus size={36} />
                <span>{subiendoFoto ? 'Subiendo foto...' : 'Subir foto'}</span>
              </button>
            )}

            {srcFoto && (
              <div className="noticia-detalle__foto-botones">
                <button
                  className="noticia-detalle__btn noticia-detalle__btn--secundario"
                  onClick={() => inputFotoRef.current?.click()}
                  disabled={subiendoFoto}
                >
                  <ImagePlus size={16} /> {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
                </button>
                <button
                  className="noticia-detalle__btn noticia-detalle__btn--peligro"
                  onClick={quitarFoto}
                  disabled={subiendoFoto}
                >
                  <Trash2 size={16} /> Quitar foto
                </button>
              </div>
            )}

            <p className="noticia-detalle__ayuda">La foto se guarda apenas la elegís.</p>

            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              onChange={elegirFoto}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          srcFoto && (
            <img
              src={srcFoto}
              alt={noticia.titulo}
              className="noticia-detalle__foto"
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )
        )}

        {/* ── CONTENIDO ── */}
        <div className="noticia-detalle__contenido">
          {editando ? (
            <div className="noticia-detalle__form">
              <label className="noticia-detalle__label">Título</label>
              <input
                className="noticia-detalle__input"
                value={borradorTitulo}
                onChange={(e) => setBorradorTitulo(e.target.value)}
                maxLength={150}
              />

              <label className="noticia-detalle__label">Texto de la noticia</label>
              <textarea
                className="noticia-detalle__textarea"
                value={borradorTexto}
                onChange={(e) => setBorradorTexto(e.target.value)}
                rows={16}
                placeholder="Escribí acá la noticia completa..."
              />
              <p className="noticia-detalle__ayuda">
                Para separar párrafos, dejá una línea en blanco (Enter dos veces).
              </p>

              <div className="noticia-detalle__form-botones">
                <button
                  className="noticia-detalle__btn noticia-detalle__btn--secundario"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  className="noticia-detalle__btn noticia-detalle__btn--primario"
                  onClick={guardar}
                  disabled={guardando || subiendoFoto}
                >
                  <Check size={16} /> {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="noticia-detalle__titulo">{noticia.titulo}</h1>
              <div className="noticia-detalle__texto">
                {parrafos(cuerpo).map((parrafo, i) => (
                  <p key={i}>{parrafo}</p>
                ))}
              </div>
              <button className="noticia-detalle__volver" onClick={() => navigate('/noticias')}>
                ← Volver a noticias
              </button>
            </>
          )}
        </div>
      </main>
      <PageFooter />
    </>
  )
}