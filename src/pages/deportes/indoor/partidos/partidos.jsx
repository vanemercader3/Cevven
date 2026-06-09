import { useState, useEffect } from 'react'
import './partidos.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
/*import { ArrowLeft } from 'lucide-react'*/

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=0&single=true&output=csv'

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

function agruparPorDia(partidos) {
  const grupos = {}
  partidos.forEach(p => {
    if (p.rival?.toLowerCase() === 'fecha libre') return
    if (!grupos[p.dia]) grupos[p.dia] = []
    grupos[p.dia].push(p)
  })
  return grupos
}

function TablaPartidos({ partidos }) {
  return (
    <div className="partidos__tabla">
      <div className="partidos__header">
        <span>Categoría</span>
        <span>Lugar</span>
        <span>Hora</span>
        <span>Local</span>
        <span></span>
        <span>Rival</span>
      </div>
      {partidos.map((p, i) => (
        <div key={i} className="partidos__fila">
          <span className="partidos__cat">{p.categoria}</span>
          <span>{p.lugar}</span>
          <span className="partidos__hora">{p.hora}</span>
          <span className={`partidos__equipo ${p.colorLocal ? `partidos__equipo--${p.colorLocal}` : ''}`}>
            {p.local}
          </span>
          <span className="partidos__vs">VS</span>
          <span className="partidos__rival">{p.rival}</span>
        </div>
      ))}
    </div>
  )
}

export default function Partidos() {
  const [grupos, setGrupos] = useState({})
  const [fechasLibres, setFechasLibres] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(texto => {
        const partidos = parsearCSV(texto)
        const libres = partidos.filter(p => p.rival?.toLowerCase() === 'fecha libre')
        setFechasLibres(libres)
        setGrupos(agruparPorDia(partidos))
        setCargando(false)
      })
      .catch(() => {
        setError('No se pudieron cargar los partidos.')
        setCargando(false)
      })
  }, [])

  return (
    <>
      <main className="partidos">
        <BackButton />

        {/* <a href="/" className="partidos__volver">
          <ArrowLeft size={20} />
          Volver al inicio
        </a> */}
        <h1 className="partidos__titulo">FIXTURE</h1>
        <p className="partidos__sub">Partidos del fin de semana</p>

        {cargando && <p className="partidos__cargando">Cargando partidos...</p>}
        {error && <p className="partidos__error">{error}</p>}

        {Object.entries(grupos).map(([dia, partidos]) => (
          <div key={dia} className="partidos__dia">
            <h2 className="partidos__dia-titulo">
              <span className="partidos__dia-linea" />
              {dia}
              <span className="partidos__dia-linea" />
            </h2>
            <TablaPartidos partidos={partidos} />
          </div>
        ))}

        {fechasLibres.length > 0 && (
          <div className="partidos__dia">
            <h2 className="partidos__dia-titulo">
              <span className="partidos__dia-linea" />
              Sin partido esta fecha
              <span className="partidos__dia-linea" />
            </h2>
            <div className="partidos__tabla">
              <div className="partidos__header">
                <span>Categoría</span>
              </div>
              {fechasLibres.map((p, i) => (
                <div key={i} className="partidos__fila partidos__fila--libre">
                  <span className="partidos__cat">{p.categoria}</span>
                  <span className={`partidos__equipo ${p.colorLocal ? `partidos__equipo--${p.colorLocal}` : ''}`}>
                    {p.local || 'CEVVEN'}
                  </span>
                  <span className="partidos__libre-texto">FECHA LIBRE</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      <PageFooter />
    </>
  )
}