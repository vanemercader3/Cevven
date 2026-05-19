import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './categoria.css'
import PageFooter from '../../components/pageFooter/pageFooter'

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'

const categoriaInfo = {
  'U13':        { nombre: 'Sub 13',               url: 'https://fuhandball.com/tablas-u13-femenino-26/' },
  'U14':        { nombre: 'Sub 14',               url: 'https://fuhandball.com/tablas-u14-femenino-26/' },
  'U15':        { nombre: 'Sub 15',               url: 'https://fuhandball.com/tablas-u15-femenino-26/' },
  'U16':        { nombre: 'Sub 16',               url: 'https://fuhandball.com/tablas-u16-femenino-26/' },
  'U18':        { nombre: 'Sub 18',               url: 'https://fuhandball.com/tablas-u18-femenino-26/' },
  'U21':        { nombre: 'Sub 21',               url: 'https://fuhandball.com/tablas-u21-femenino-26/' },
  'Senior':     { nombre: 'Senior Femenino',      url: 'https://fuhandball.com/tablas-senior-femenino-26/' },
  'Inter Masc': { nombre: 'Intermedia Masculino', url: 'https://fuhandball.com/intermedia-masculino-26/' },
  'Infantiles': { nombre: 'Infantiles',           url: '#' },
  'Plus 35':    { nombre: 'Plus 35',              url: '#' },
  'Entrenadores': { nombre: 'Entrenadores',       url: '#' },
}

function parsearCSV(texto) {
  const filas = texto.trim().split('\n')
  const separador = filas[0].includes('\t') ? '\t' : ','
  const headers = filas[0].split(separador).map(h => h.trim())
  return filas.slice(1).map(fila => {
    const valores = fila.split(separador).map(v => v.trim())
    const obj = {}
    headers.forEach((h, i) => obj[h] = valores[i] || '')
    return obj
  })
}

export default function Categoria() {
  const { cat } = useParams()
  const navigate = useNavigate()
  const [jugadoras, setJugadoras] = useState([])
  const [cargando, setCargando] = useState(true)

  const info = categoriaInfo[cat] || { nombre: cat, url: '#' }

  useEffect(() => {
    fetch(JUGADORAS_URL)
      .then(res => res.text())
      .then(texto => {
        const todas = parsearCSV(texto)
        const filtradas = todas.filter(j =>
          j.categoria?.trim().toLowerCase() === cat?.trim().toLowerCase()
        )
        setJugadoras(filtradas)
        setCargando(false)
      })
  }, [cat])

  return (
    <>
      <main className="categoria">
        <div className="categoria__header">
          <h1 className="categoria__titulo">{info.nombre}</h1>
          {info.url !== '#' && (
            <a href={info.url} target="_blank" rel="noopener noreferrer" className="categoria__tabla-btn">
              Tabla Posiciones FUH →
            </a>
          )}
        </div>

        {cargando ? (
          <p className="categoria__cargando">Cargando jugadoras...</p>
        ) : jugadoras.length === 0 ? (
          <p className="categoria__vacio">No hay jugadoras registradas en esta categoría.</p>
        ) : (
          <div className="categoria__grid">
            {jugadoras.map((j, i) => {
              const esEntrenador = j.posicion?.toUpperCase().trim() === 'ENTRENADOR'
              return (
                <div
                  key={i}
                  className={`categoria__card ${esEntrenador ? 'categoria__card--entrenador' : 'categoria__card--clickeable'}`}
                  onClick={() => {
                    if (!esEntrenador) {
                      navigate(`/documentos/${cat}/${encodeURIComponent(`${j.nombre} ${j.apellido}`)}`)
                    }
                  }}
                >
                  <div className="categoria__foto-wrap">
                    <img
                      src={j['foto jugadora'] ? `https://drive.google.com/thumbnail?id=${j['foto jugadora']}&sz=w400` : '/categorias/persona.jpg'}
                      alt={`${j.nombre} ${j.apellido}`}
                      className="categoria__foto"
                      onError={(e) => { e.target.src = '/categorias/persona.jpg' }}
                    />
                  </div>
                  <div className="categoria__info">
                    <h3 className="categoria__nombre">{j.nombre} {j.apellido}</h3>
                    {esEntrenador ? (
                      <span className="categoria__entrenador-badge">ENTRENADOR</span>
                    ) : (
                      <>
                        <p className="categoria__dato">
                          <span className="categoria__label">Posición</span>
                          <span>{j.posicion || '—'}</span>
                        </p>
                        <p className="categoria__dato">
                          <span className="categoria__label">Nacimiento</span>
                          <span>{j.cumple || '—'}</span>
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <PageFooter />
    </>
  )
}