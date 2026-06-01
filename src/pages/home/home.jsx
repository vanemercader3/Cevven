import { useState, useEffect } from 'react'
import './home.css'

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=0&single=true&output=csv'

const imagenes = [
  { src: '/home/hero.png',  position: 'center 60%' },
  { src: '/home/hero3.png', position: 'center 65%' },
  { src: '/home/hero4.png', position: 'center center' },
  { src: '/home/hero5.png', position: 'center 30%' },
  { src: '/home/hero6.png', position: 'center center' },
  { src: '/home/hero7.png', position: 'center center' },
]

const noticias = [
  { tag: 'NOTICIAS', titulo: '¡Arrancó la Escuelita de Handball!', img: '/noticias/noticia1.jpg', destacada: true },
  { tag: 'NOTICIAS', titulo: 'Convocadas al Mundial Sub 18', img: '/noticias/noticia2.jpg' },
  { tag: 'NOTICIAS', titulo: 'CEVVEN campeón del Súper 4', img: '/noticias/noticia3.jpg' },
  { tag: 'NOTICIAS', titulo: 'Nueva indumentaria temporada 2026', img: '/noticias/noticia4.jpg' },
  { tag: 'NOTICIAS', titulo: 'Termino la temporada de Beach Handball', img: '/noticias/noticia5.jpg' },
]

const fotos = [
  { img: '/pedidos/empanadas.jpg',        nombre: 'Empanadas',        contain: true },
  { img: '/pedidos/pollo-spiedo.jpg',     nombre: 'Pollo al Spiedo',  contain: true },
  { img: '/pedidos/pasta.jpg',            nombre: 'Pasta',            contain: true },
  { img: '/pedidos/pizza.jpg',            nombre: 'Pizza',            contain: true },
  { img: '/pedidos/alfa-choco-blanco.jpg',nombre: 'Alfajores Blanco', contain: true },
  { img: '/pedidos/vino.jpg',             nombre: 'Vinos',            contain: true },
  { img: '/pedidos/mila-pollo.jpg',       nombre: 'Milanesa de Pollo',contain: true },
  { img: '/pedidos/alfa-choco-negro.jpg', nombre: 'Alfajores Negro',  contain: true },
  { img: '/pedidos/barritas.jpg',         nombre: 'Barritas',         contain: true },  // ← nueva
  { img: '/pedidos/box-cafeteria.jpg',    nombre: 'Box Cafetería',    contain: true },  // ← nueva
]

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

function nombreALogo(nombre) {
  return '/logosRivales/' + nombre
    .toLowerCase()
    .replace(/ñ/g, 'n')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    + '.jpg'
}

export default function Home() {
  const [actual, setActual] = useState(0)
  const [fixtures, setFixtures] = useState([])
  const [fotosOffset, setFotosOffset] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActual(prev => (prev + 1) % imagenes.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setFotosOffset(prev => (prev + 1) % fotos.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(texto => {
        const partidos = parsearCSV(texto)
        const fixture = partidos.filter(p =>
          p.mostrarEnHome === 'TRUE'
        ).slice(0, 2)
        setFixtures(fixture)
      })
      .catch(err => console.error('Error cargando fixture:', err))
  }, [])

  const noticiaDestacada = noticias.find(n => n.destacada)
  const noticiasSecundarias = noticias.filter(n => !n.destacada)
  const isMobile = window.innerWidth <= 768
  const fotosVisibles = [...fotos.slice(fotosOffset), ...fotos.slice(0, fotosOffset)].slice(0, isMobile ? 4 : 5)
  return (
    <>
      <main>
        {/* HERO */}
        <section className="hero">
          {imagenes.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={`Slide ${i + 1}`}
              className={`hero__img ${i === actual ? 'hero__img--active' : ''}`}
              style={{ 
                objectPosition: img.position,
                objectFit: img.contain ? 'contain' : 'cover'
              }}
            />
          ))}
          <div className="hero__dots">
            {imagenes.map((_, i) => (
              <button
                key={i}
                className={`hero__dot ${i === actual ? 'hero__dot--active' : ''}`}
                onClick={() => setActual(i)}
              />
            ))}
          </div>
        </section>

        {/* FIXTURE */}
        <section className="fixture">
          <div className="fixture__title">
            <h2>FIXTURE<br />FIN DE SEMANA</h2>
            <a href="/partidos">MÁS PARTIDOS ❯</a>
          </div>
          <div className="fixture__matches">
            {fixtures.length === 0 ? (
              <p style={{ color: 'white', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>
                Cargando partidos...
              </p>
            ) : (
              fixtures.map((f, i) => (
                <div key={i} className="fixture__match">
                  <div className="fixture__match-row">
                    <div className="fixture__logo-wrap">
                      <img src="/logo.png" alt="CEVVEN" />
                      <span className="fixture__logo-nombre">CEVVEN</span>
                    </div>
                    <span className="fixture__vs">VS</span>
                    <div className="fixture__logo-wrap">
                      <img
                        src={nombreALogo(f.rival)}
                        alt={f.rival}
                        onError={(e) => { e.target.src = '/logo.png' }}
                      />
                      <span className="fixture__logo-nombre">{f.rival}</span>
                    </div>
                  </div>
                  <p className="fixture__cat">{f.nombreHome || f.categoria}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* NOTICIAS */}
        <section className="home-noticias">
          <h2 className="home-noticias__titulo">NOTICIAS</h2>
          <div className="home-noticias__grid">
            <a href="/noticias" className="home-noticias__destacada">
              <img src={noticiaDestacada.img} alt={noticiaDestacada.titulo} className="home-noticias__img" />
              <div className="home-noticias__destacada-info">
                <span className="home-noticias__tag">{noticiaDestacada.tag}</span>
                <h3>{noticiaDestacada.titulo}</h3>
                <span className="home-noticias__link">→ MÁS</span>
              </div>
            </a>
            <div className="home-noticias__lista">
              {noticiasSecundarias.map((n, i) => (
                <a key={i} href="/noticias" className="home-noticias__item">
                  <img src={n.img} alt={n.titulo} className="home-noticias__item-img" />
                  <div>
                    <span className="home-noticias__tag">{n.tag}</span>
                    <h4>{n.titulo}</h4>
                    <span className="home-noticias__link">→ MÁS</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* BANNER INDUMENTARIA */}
        <section className="home-indumentaria">
          <div className="home-indumentaria__content">
            <h2 className="home-indumentaria__titulo">INDUMENTARIA</h2>
            <p className="home-indumentaria__sub">Entrená, competí, representá.</p>
            <a href="/indumentaria" className="home-indumentaria__link">→ VER INDUMENTARIA</a>
          </div>
          <img src="/indumentaria/remera.png" alt="Indumentaria CEVVEN" className="home-indumentaria__img" />
          <div className="home-indumentaria__deco1" />
          <div className="home-indumentaria__deco2" />
          <div className="home-indumentaria__deco3" />
          <div className="home-indumentaria__deco4" />
          <div className="home-indumentaria__deco5" />
          <div className="home-indumentaria__deco6" />
          <div className="home-indumentaria__deco7" />
        </section>

        {/* PEDIDOS */}
        <section className="home-pedidos">
          <div className="home-pedidos__content">
            <h2 className="home-pedidos__titulo">PEDIDOS</h2>
            <p className="home-pedidos__sub">Apoyá a las chicas comprando nuestros productos</p>
            <a href="/pedidos" className="home-pedidos__btn">HACER UN PEDIDO →</a>
          </div>
          <div className="home-pedidos__fotos">
            {fotosVisibles.map((p, i) => (
              <a key={`${fotosOffset}-${i}`} href="/pedidos" className="home-pedidos__foto-wrap">
                <img 
                  src={p.img} 
                  alt={p.nombre} 
                  className={`home-pedidos__foto ${p.contain ? 'home-pedidos__foto--contain' : ''}`}
                />
                <span className="home-pedidos__foto-nombre">{p.nombre}</span>
              </a>
            ))}
          </div>
        </section>

        {/* SPONSORS */}
        <section className="home-sponsors">
          <p className="home-sponsors__label">NUESTROS SPONSORS</p>
          <div className="home-sponsors__logos">
            <img src="/sponsors/neu-millan.png" alt="Neu Millán" className="home-sponsors__logo" />
            <img src="/sponsors/bocatti.png" alt="Bocatti" className="home-sponsors__logo" />
            <img src="/sponsors/la-soniada.png" alt="La Soñada" className="home-sponsors__logo" />
            <img src="/sponsors/pichones.png" alt="Pichones" className="home-sponsors__logo" />
          </div>
        </section>

      </main>
    </>
  )
}