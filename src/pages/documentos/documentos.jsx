import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './documentos.css'
import PageFooter from '../../components/pageFooter/pageFooter'

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'

function parsearCSV(texto) {
  const filas = texto.trim().split('\n')
  const headers = filas[0].split(',').map(h => h.trim())
  return filas.slice(1).map(fila => {
    const valores = fila.split(',').map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => obj[h] = valores[i] || '')
    return obj
  })
}

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

export default function Documentos() {
  const { cat, nombre } = useParams()
  const navigate = useNavigate()
  const [paso, setPaso] = useState('cedula')
  const [cedulaInput, setCedulaInput] = useState('')
  const [cedulaError, setCedulaError] = useState(false)
  const [jugadora, setJugadora] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch(JUGADORAS_URL)
      .then(res => res.text())
      .then(texto => {
        const todas = parsearCSV(texto)
        const nombreDecoded = decodeURIComponent(nombre)
        const encontrada = todas.find(j =>
          `${j.nombre} ${j.apellido}`.trim().toLowerCase() === nombreDecoded.trim().toLowerCase()
        )
        setJugadora(encontrada || null)
        setCargando(false)
      })
  }, [nombre])

  const verificarCedula = () => {
    const limpia = cedulaInput.replace(/[.\-\s]/g, '').trim()
    const cedulaJugadora = jugadora?.cedula?.replace(/[.\-\s]/g, '').trim()
    if (limpia === cedulaJugadora) {
      setPaso('docs')
    } else {
      setCedulaError(true)
    }
  }

  if (cargando) return <main className="documentos"><p className="documentos__cargando">Cargando...</p></main>
  if (!jugadora) return <main className="documentos"><p className="documentos__error">Jugadora no encontrada.</p></main>

  const nombreCompleto = `${jugadora.nombre} ${jugadora.apellido}`

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
                onChange={(e) => { setCedulaInput(e.target.value); setCedulaError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && verificarCedula()}
              />
              {cedulaError && (
                <p className="documentos__cedula-error">❌ Cédula incorrecta. Intentá de nuevo.</p>
              )}
              <button
                className="documentos__cedula-btn"
                onClick={verificarCedula}
                disabled={!cedulaInput}
              >
                VER DOCUMENTOS →
              </button>
            </div>
          </div>
        )}

        {paso === 'docs' && (
          <>
            <h1 className="documentos__titulo">{nombreCompleto}</h1>
            <p className="documentos__cat">{cat}</p>

            <div className="documentos__grid">

              {/* CÉDULA */}
              <div className="documentos__card">
                <h2 className="documentos__card-titulo">Cédula de Identidad</h2>
                <div className="documentos__img-wrap">
                  {driveUrl(jugadora['foto CI']) ? (
                    <img
                      src={driveUrl(jugadora['foto CI'])}
                      alt="Cédula"
                      className="documentos__img"
                    />
                  ) : (
                    <div className="documentos__sin-img">📄 Sin imagen cargada</div>
                  )}
                </div>
                <div className={`documentos__vencimiento documentos__vencimiento--${vencimientoColor(jugadora['vencimiento CI'])}`}>
                  <span className="documentos__vencimiento-label">Vencimiento</span>
                  <span className="documentos__vencimiento-fecha">
                    {jugadora['vencimiento CI'] || 'No registrado'}
                  </span>
                  {vencimientoColor(jugadora['vencimiento CI']) === 'vencido' && <span>⚠️ VENCIDA</span>}
                  {vencimientoColor(jugadora['vencimiento CI']) === 'urgente' && <span>⚠️ Vence en menos de 7 días</span>}
                  {vencimientoColor(jugadora['vencimiento CI']) === 'proximo' && <span>⚡ Vence pronto</span>}
                  {vencimientoColor(jugadora['vencimiento CI']) === 'ok' && <span>✅ Al día</span>}
                </div>
              </div>

              {/* CARNET DE SALUD */}
              <div className="documentos__card">
                <h2 className="documentos__card-titulo">Carnet de Salud</h2>
                <div className="documentos__img-wrap">
                  {driveUrl(jugadora['foto carnet']) ? (
                    <img
                      src={driveUrl(jugadora['foto carnet'])}
                      alt="Carnet de salud"
                      className="documentos__img"
                    />
                  ) : (
                    <div className="documentos__sin-img">📄 Sin imagen cargada</div>
                  )}
                </div>
                <div className={`documentos__vencimiento documentos__vencimiento--${vencimientoColor(jugadora['vencimiento carnet'])}`}>
                  <span className="documentos__vencimiento-label">Vencimiento</span>
                  <span className="documentos__vencimiento-fecha">
                    {jugadora['vencimiento carnet'] || 'No registrado'}
                  </span>
                  {vencimientoColor(jugadora['vencimiento carnet']) === 'vencido' && <span>⚠️ VENCIDO</span>}
                  {vencimientoColor(jugadora['vencimiento carnet']) === 'urgente' && <span>⚠️ Vence en menos de 7 días</span>}
                  {vencimientoColor(jugadora['vencimiento carnet']) === 'proximo' && <span>⚡ Vence pronto</span>}
                  {vencimientoColor(jugadora['vencimiento carnet']) === 'ok' && <span>✅ Al día</span>}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
      <PageFooter />
    </>
  )
}