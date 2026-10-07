import { useEffect, useState } from 'react'
import { Play, ArrowLeft, ChevronDown, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import NavbarFitness from '../../../components/navbarFitness/navbarFitness'
import './actividades.css'

const BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1tEq2qpgh_C4jddy8sz3cJbtzP5HijZsIHcIT9Xz2cP5mxy3JvQaOLQAs39WqJrlq6-gZF8XAC-XJ/pub?output=csv'
const URL_CLASES   = `${BASE}&gid=0`
const URL_HORARIOS = `${BASE}&gid=1373249144`

const ACENTOS = ['var(--blue)', 'var(--purple)', 'var(--orange)', 'var(--green)', 'var(--pink)']

// Actividades del catálogo que agrupan varias clases de la hoja horarios
const ALIAS = {
  'funcional + ciclismo': ['ciclismo indoor', 'funcional bike'],
  'gap': ['gap', 'gap/hiit'],
  'hiit': ['hiit', 'gap/hiit'],
}

const ORDEN_DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

// Primera oración de la descripción (hasta el primer punto)
function resumen(desc) {
  if (!desc) return ''
  const m = desc.match(/^(.*?\.)(\s|$)/)
  return m ? m[1] : desc
}

// Parser CSV que respeta comas dentro de comillas y saltos de línea escapados
function parseSheet(text) {
  const filas = []
  let fila = []
  let campo = ''
  let enComillas = false
  text = text.replace(/\r/g, '')

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (enComillas) {
      if (c === '"' && text[i + 1] === '"') { campo += '"'; i++ }
      else if (c === '"') { enComillas = false }
      else { campo += c }
    } else {
      if (c === '"') { enComillas = true }
      else if (c === ',') { fila.push(campo); campo = '' }
      else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = '' }
      else { campo += c }
    }
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila) }

  const headers = filas.shift().map(h => norm(h))
  return filas
    .filter(cols => cols.some(c => c && c.trim() !== ''))
    .map(cols => Object.fromEntries(headers.map((h, idx) => [h, (cols[idx] || '').trim()])))
}
async function traer(url) {
  try {
    const r = await fetch(url)
    return parseSheet(await r.text())
  } catch (e) {
    console.error('Error leyendo hoja:', e)
    return []
  }
}

// Saca el ID de un link de YouTube (watch, youtu.be o shorts)
function youtubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  return m ? m[1] : null
}

// Convierte cualquier link de Google Drive en uno que se pueda mostrar como imagen
function urlImagen(url) {
  if (!url) return ''
  const m = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/)
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`
  return url
}

function TarjetaClase({ clase, i, sesiones }) {
  const [play, setPlay] = useState(false)
  const [abierta, setAbierta] = useState(false)
  const ac = ACENTOS[i % ACENTOS.length]
  const vid = youtubeId(clase.video)
  const portada = urlImagen(clase.img) || (vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : '')

  const resumenTxt = resumen(clase.descripcion)
  const hayMasTexto = (clase.descripcion || '').trim() !== resumenTxt.trim()
  const hayMas = hayMasTexto || sesiones.length > 0

  const abrirVideo = (e) => {
    e.stopPropagation()
    setPlay(true)
  }

  return (
    <article
      className={`acti-card ${abierta ? 'acti-card--open' : ''}`}
      style={{ '--ac': ac, cursor: hayMas ? 'pointer' : 'default' }}
      onClick={() => hayMas && setAbierta(o => !o)}
    >
      <div className="acti-card__bar" />

      <div className="acti-media">
        {play && vid ? (
          <iframe
            src={`https://www.youtube.com/embed/${vid}?autoplay=1`}
            title={clase.nombre}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div
            className="acti-portada"
            style={portada ? { backgroundImage: `url(${portada})` } : undefined}
          >
            {!portada && <span className="acti-portada__emoji">{clase.emoji || '🏋️'}</span>}
            {vid && (
              <button className="acti-play" onClick={abrirVideo} aria-label="Reproducir video">
                <Play size={24} fill="currentColor" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="acti-body">
        <h3>
          {clase.emoji && <span className="acti-body__emoji">{clase.emoji}</span>}
          {clase.nombre}
        </h3>

        <p className="acti-desc">
          {abierta ? clase.descripcion : resumenTxt}
        </p>

        {abierta && sesiones.length > 0 && (
          <div className="acti-horarios">
            <span className="acti-horarios__lbl"><Clock size={15} /> Horarios</span>
            <div className="acti-horarios__chips">
              {sesiones.map((s, j) => (
                <span key={j} className="acti-chip">{norm(s.dia).slice(0, 3)} {s.hora}</span>
              ))}
            </div>
          </div>
        )}

        {hayMas && (
          <span className="acti-vermas">
            {abierta ? 'Ver menos' : 'Ver más'} <ChevronDown size={15} />
          </span>
        )}
      </div>
    </article>
  )
}

export default function Actividades() {
  const [clases, setClases] = useState([])
  const [horarios, setHorarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    traer(URL_CLASES)
      .then(setClases)
      .finally(() => setCargando(false))
    traer(URL_HORARIOS).then(setHorarios)
  }, [])

  // Solo se ocultan las clases con "no" en la columna activo
  // (vacío o "si" = se muestra). La hoja de horarios NO se filtra.
  const clasesActivas = clases.filter(c => norm(c.activo) !== 'no')

  // Cruza cada actividad con sus sesiones en la hoja horarios (por nombre o alias)
  const sesionesDe = (nombre) => {
    const n = norm(nombre)
    const nombresBuscados = ALIAS[n] || [n]  // si tiene alias, busca esos; si no, su propio nombre
    return horarios
      .filter(h => nombresBuscados.includes(norm(h.actividad)))
      .sort((a, b) => {
        const da = ORDEN_DIAS.indexOf(norm(a.dia))
        const db = ORDEN_DIAS.indexOf(norm(b.dia))
        if (da !== db) return da - db
        return (a.hora || '').localeCompare(b.hora || '')
      })
  }

  return (
    <div className="fit">
      <NavbarFitness />

      {/* HEADER */}
      <div className="acti-header">
        <Link to="/fitness" className="acti-volver"><ArrowLeft size={18} /> Inicio</Link>
        <h1 className="acti-titulo">ACTIVIDADES</h1>
      </div>

      {/* CATÁLOGO */}
      <section className="fit-sec">
        {cargando ? (
          <p className="fit-vacio">Cargando actividades...</p>
        ) : clasesActivas.length === 0 ? (
          <p className="fit-vacio">No hay actividades para mostrar.</p>
        ) : (
          <div className="acti-grid">
            {clasesActivas.map((c, i) => (
              <TarjetaClase key={i} clase={c} i={i} sesiones={sesionesDe(c.nombre)} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="fit-cta">
        <span className="fit-cta__blob c1" />
        <span className="fit-cta__blob c2" />
        <div className="fit-cta__inner">
          <h2>¿LISTO PARA ARRANCAR?</h2>
          <p>Escribinos y coordinamos tu primera clase.</p>
          <a href="/fitness/contacto" className="fit-cta__btn">CONTACTANOS →</a>
        </div>
      </section>
    </div>
  )
}