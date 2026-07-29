import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './documentos.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'

// Apps Script — valida cédula, devuelve datos, guarda fechas y sube fotos.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0fMCKVhwObqTGS_T2Ju3HX6ACrRR-y4ObgScg-mHCKvZ4OgGYfe1nlTKhB8oqsHU7/exec'

function driveUrl(id) {
  if (!id) return null
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
}

function vencimientoColor(fecha) {
  if (!fecha) return 'gris'
  const [d, m, a] = fecha.split('/')
  const vence = new Date(`${a}-${m}-${d}`)
  const hoy = new Date()
  const diff = (vence - hoy) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'vencido'
  if (diff <= 7) return 'urgente'
  if (diff <= 30) return 'proximo'
  return 'ok'
}

function normalizar(txt) {
  return (txt || '').toString().replace(/\s+/g, ' ').trim().toLowerCase()
}

// Comprime una imagen a máx 1200px de ancho y calidad 0.7, y devuelve
// { base64, mime } listo para mandar al Apps Script. Achica fotos de celular
// de varios MB a unos cientos de KB.
function comprimirImagen(file, maxAncho = 1200, calidad = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxAncho) {
          height = Math.round(height * (maxAncho / width))
          width = maxAncho
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', calidad)
        const base64 = dataUrl.split(',')[1]   // saco el encabezado "data:image/jpeg;base64,"
        resolve({ base64, mime: 'image/jpeg' })
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Documentos() {
  const { cat, nombre } = useParams()
  const navigate = useNavigate()
  const [paso, setPaso] = useState('cedula')
  const [cedulaInput, setCedulaInput] = useState('')
  const [cedulaError, setCedulaError] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [datos, setDatos] = useState(null)              // datos devueltos por el Apps Script
  const [cedulaValida, setCedulaValida] = useState('')  // la cédula ya validada, para las subidas

  // ── Estado del formulario de edición (modal) ──
  const [modalAbierto, setModalAbierto] = useState(false)
  const [fechaCI, setFechaCI] = useState('')            // aaaa-mm-dd
  const [fechaCarnet, setFechaCarnet] = useState('')    // aaaa-mm-dd
  const [fotoPerfil, setFotoPerfil] = useState(null)    // File
  const [fotoCI, setFotoCI] = useState(null)
  const [fotoCarnet, setFotoCarnet] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [progreso, setProgreso] = useState('')
  const [modalConfirmado, setModalConfirmado] = useState(false)

  const nombreDecoded = decodeURIComponent(nombre)

  const verificarCedula = async () => {
    const limpia = cedulaInput.replace(/[.\-\s]/g, '').trim()
    if (!limpia) return
    setVerificando(true)
    setCedulaError('')
    try {
      const url = `${APPS_SCRIPT_URL}?_accion=validarCedula&cedula=${encodeURIComponent(limpia)}`
      const res = await fetch(url)
      const data = await res.json()

      if (!data.ok) {
        setCedulaError('❌ Cédula incorrecta. Intentá de nuevo.')
        setVerificando(false)
        return
      }
      const nombreResp = normalizar(`${data.nombre} ${data.apellido}`)
      if (nombreResp !== normalizar(nombreDecoded)) {
        setCedulaError('❌ Esa cédula no corresponde a esta jugadora.')
        setVerificando(false)
        return
      }

      setDatos(data)
      setCedulaValida(limpia)
      setPaso('docs')
    } catch (err) {
      console.error('Error validando cédula:', err)
      setCedulaError('❌ No pudimos verificar la cédula. Reintentá en un ratito.')
    }
    setVerificando(false)
  }

  // Abre el modal con las fechas actuales prellenadas
  const abrirModal = () => {
    setFechaCI(datos?.vencimientoCIInput || '')
    setFechaCarnet(datos?.vencimientoCarnetInput || '')
    setFotoPerfil(null)
    setFotoCI(null)
    setFotoCarnet(null)
    setModalConfirmado(false)
    setModalAbierto(true)
  }

  const cerrarModal = () => {
    if (guardando) return
    setModalAbierto(false)
  }

  // Guarda todo lo que la jugadora tocó (fechas + fotos). Nada es obligatorio.
  const confirmarCambios = async () => {
    setGuardando(true)
    try {
      // 1) Fechas (por GET) — solo si cambió respecto a lo que había
      if (fechaCI && fechaCI !== (datos?.vencimientoCIInput || '')) {
        setProgreso('Guardando vencimiento de cédula...')
        await fetch(`${APPS_SCRIPT_URL}?_accion=guardarFecha&cedula=${encodeURIComponent(cedulaValida)}&tipo=ci&valor=${encodeURIComponent(fechaCI)}`)
      }
      if (fechaCarnet && fechaCarnet !== (datos?.vencimientoCarnetInput || '')) {
        setProgreso('Guardando vencimiento de carnet...')
        await fetch(`${APPS_SCRIPT_URL}?_accion=guardarFecha&cedula=${encodeURIComponent(cedulaValida)}&tipo=carnet&valor=${encodeURIComponent(fechaCarnet)}`)
      }

      // 2) Fotos (por POST no-cors) — solo las que eligió
      const subirUna = async (file, tipo, etiqueta) => {
        if (!file) return
        setProgreso(`Subiendo ${etiqueta}...`)
        const { base64, mime } = await comprimirImagen(file)
        await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _accion: 'subirFoto', cedula: cedulaValida, tipo, archivo: base64, mime }),
        })
      }
      await subirUna(fotoPerfil, 'perfil', 'foto de perfil')
      await subirUna(fotoCI, 'ci', 'foto de cédula')
      await subirUna(fotoCarnet, 'carnet', 'foto de carnet')

      setProgreso('')
      setModalConfirmado(true)   // muestra el cartel de "puede tardar unos minutos"
    } catch (err) {
      console.error('Error guardando cambios:', err)
      setProgreso('')
      alert('Hubo un problema al guardar. Reintentá en un ratito.')
    }
    setGuardando(false)
  }

  const nombreCompleto = nombreDecoded

  return (
    <>
      <main className="documentos">
        <button className="documentos__volver" onClick={() => navigate(`/categoria/${cat}`)}>
          ← Volver a {cat}
        </button>

        {paso === 'cedula' && (
          <div className="documentos__cedula-paso">
            <div className="documentos__cedula-card">
              <span className="documentos__cedula-icon">🔒</span>
              <h2 className="documentos__cedula-titulo">Documentos de {nombreCompleto}</h2>
              <p className="documentos__cedula-sub">
                Para ver los documentos ingresá la cédula de identidad
              </p>
              <p className="documentos__cedula-hint">Sin puntos ni guiones. Ej: 1.234.567-8 → 12345678</p>
              <input
                type="text"
                className={`documentos__cedula-input ${cedulaError ? 'documentos__cedula-input--error' : ''}`}
                placeholder="12345678"
                value={cedulaInput}
                onChange={(e) => { setCedulaInput(e.target.value); setCedulaError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !verificando && verificarCedula()}
              />
              {cedulaError && (
                <p className="documentos__cedula-error">{cedulaError}</p>
              )}
              <button
                className="documentos__cedula-btn"
                onClick={verificarCedula}
                disabled={!cedulaInput || verificando}
              >
                {verificando ? 'VERIFICANDO...' : 'VER DOCUMENTOS →'}
              </button>
            </div>
          </div>
        )}

        {paso === 'docs' && datos && (
          <>
            <div className="documentos__titulo-fila">
              <div>
                <h1 className="documentos__titulo">{nombreCompleto}</h1>
                <p className="documentos__cat">{cat}</p>
              </div>
              {/* Lápiz de editar → abre el formulario */}
              <button className="documentos__editar-btn" onClick={abrirModal} title="Editar mis datos">
                ✏️ Editar
              </button>
            </div>

            <div className="documentos__grid">

              {/* CÉDULA */}
              <div className="documentos__card">
                <h2 className="documentos__card-titulo">Cédula de Identidad</h2>
                <div className="documentos__img-wrap">
                  {driveUrl(datos.fotoCI) ? (
                    <img src={driveUrl(datos.fotoCI)} alt="Cédula" className="documentos__img" />
                  ) : (
                    <div className="documentos__sin-img">📄 Sin imagen cargada</div>
                  )}
                </div>
                <div className={`documentos__vencimiento documentos__vencimiento--${vencimientoColor(datos.vencimientoCI)}`}>
                  <span className="documentos__vencimiento-label">Vencimiento</span>
                  <span className="documentos__vencimiento-fecha">
                    {datos.vencimientoCI || 'No registrado'}
                  </span>
                  {vencimientoColor(datos.vencimientoCI) === 'vencido' && <span>⚠️ VENCIDA</span>}
                  {vencimientoColor(datos.vencimientoCI) === 'urgente' && <span>⚠️ Vence en menos de 7 días</span>}
                  {vencimientoColor(datos.vencimientoCI) === 'proximo' && <span>⚡ Vence pronto</span>}
                  {vencimientoColor(datos.vencimientoCI) === 'ok' && <span>✅ Al día</span>}
                </div>
              </div>

              {/* CARNET DE SALUD */}
              <div className="documentos__card">
                <h2 className="documentos__card-titulo">Carnet de Salud</h2>
                <div className="documentos__img-wrap">
                  {driveUrl(datos.fotoCarnet) ? (
                    <img src={driveUrl(datos.fotoCarnet)} alt="Carnet de salud" className="documentos__img" />
                  ) : (
                    <div className="documentos__sin-img">📄 Sin imagen cargada</div>
                  )}
                </div>
                <div className={`documentos__vencimiento documentos__vencimiento--${vencimientoColor(datos.vencimientoCarnet)}`}>
                  <span className="documentos__vencimiento-label">Vencimiento</span>
                  <span className="documentos__vencimiento-fecha">
                    {datos.vencimientoCarnet || 'No registrado'}
                  </span>
                  {vencimientoColor(datos.vencimientoCarnet) === 'vencido' && <span>⚠️ VENCIDO</span>}
                  {vencimientoColor(datos.vencimientoCarnet) === 'urgente' && <span>⚠️ Vence en menos de 7 días</span>}
                  {vencimientoColor(datos.vencimientoCarnet) === 'proximo' && <span>⚡ Vence pronto</span>}
                  {vencimientoColor(datos.vencimientoCarnet) === 'ok' && <span>✅ Al día</span>}
                </div>
              </div>

            </div>
          </>
        )}

        {/* MODAL FORMULARIO DE EDICIÓN */}
        {modalAbierto && (
          <div className="documentos__modal-overlay" onClick={cerrarModal}>
            <div className="documentos__modal" onClick={(e) => e.stopPropagation()}>

              {!modalConfirmado ? (
                <>
                  <h2 className="documentos__modal-titulo">Editar mis datos</h2>
                  <p className="documentos__modal-sub">Completá solo lo que quieras actualizar. Lo que dejes vacío queda como está.</p>

                  {/* Datos fijos (solo lectura) */}
                  <div className="documentos__form-fijos">
                    <div><span className="documentos__form-label">Nombre</span><span>{datos?.nombre} {datos?.apellido}</span></div>
                    <div><span className="documentos__form-label">Cédula</span><span>{cedulaValida}</span></div>
                  </div>

                  {/* Fechas */}
                  <div className="documentos__form-campo">
                    <label className="documentos__form-label">Vencimiento cédula</label>
                    <input type="date" className="documentos__form-input"
                      value={fechaCI} onChange={(e) => setFechaCI(e.target.value)} />
                  </div>
                  <div className="documentos__form-campo">
                    <label className="documentos__form-label">Vencimiento carnet de salud</label>
                    <input type="date" className="documentos__form-input"
                      value={fechaCarnet} onChange={(e) => setFechaCarnet(e.target.value)} />
                  </div>

                  {/* Fotos */}
                  <div className="documentos__form-campo">
                    <label className="documentos__form-label">Foto de perfil</label>
                    <input type="file" accept="image/*" className="documentos__form-file"
                      onChange={(e) => setFotoPerfil(e.target.files[0] || null)} />
                  </div>
                  <div className="documentos__form-campo">
                    <label className="documentos__form-label">Foto de la cédula</label>
                    <input type="file" accept="image/*" className="documentos__form-file"
                      onChange={(e) => setFotoCI(e.target.files[0] || null)} />
                  </div>
                  <div className="documentos__form-campo">
                    <label className="documentos__form-label">Foto del carnet de salud</label>
                    <input type="file" accept="image/*" className="documentos__form-file"
                      onChange={(e) => setFotoCarnet(e.target.files[0] || null)} />
                  </div>

                  {guardando && <p className="documentos__form-progreso">{progreso || 'Guardando...'}</p>}

                  <div className="documentos__modal-btns">
                    <button className="documentos__btn-sec" onClick={cerrarModal} disabled={guardando}>Cancelar</button>
                    <button className="documentos__cedula-btn" onClick={confirmarCambios} disabled={guardando}>
                      {guardando ? 'GUARDANDO...' : 'CONFIRMAR ✓'}
                    </button>
                  </div>
                </>
              ) : (
                // Cartel de confirmación
                <div className="documentos__confirmado">
                  <span className="documentos__confirmado-icon">✅</span>
                  <h2>¡Confirmado!</h2>
                  <p>Tus datos se están actualizando.</p>
                  <p style={{ color: '#888', fontSize: '0.9rem' }}>Puede llevar unos minutos en verse reflejado.</p>
                  <button className="documentos__cedula-btn" onClick={() => navigate(`/categoria/${cat}`)}>
                    OK
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
      <PageFooter />
    </>
  )
}