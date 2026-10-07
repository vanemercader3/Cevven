import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { obtenerNoticias, esDestacada, urlImagen } from '../noticias/noticiasApi'
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

// Foto de una noticia; si no tiene (o falla), muestra el degradé del club
function FotoNoticia({ noticia, className }) {
  const [fallo, setFallo] = useState(false)
  const src = urlImagen(noticia.foto)

  if (!src || fallo) {
    return (
      <div
        className={className}
        style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))' }}
      />
    )
  }
  return (
    <img
      src={src}
      alt={noticia.titulo}
      className={className}
      onError={() => setFallo(true)}
    />
  )
}

const fotos = [
  { img: '/pedidos/empanadas.jpg',        nombre: 'Empanadas',        contain: true },
  { img: '/pedidos/pollo-spiedo.jpg',     nombre: 'Pollo al Spiedo',  contain: true },
  { img: '/pedidos/arrollado-pollo.jpg',  nombre: 'Arrollado de Pollo', contain: true },
  { img: '/pedidos/pasta.jpg',            nombre: 'Pasta',            contain: true },
  { img: '/pedidos/pizza.jpg',            nombre: 'Pizza',            contain: true },
  { img: '/pedidos/alfa-choco-blanco.jpg',nombre: 'Alfajores Blanco', contain: true },
  { img: '/pedidos/vino.jpg',             nombre: 'Vinos',            contain: true },
  { img: '/pedidos/mila-pollo.jpg',       nombre: 'Milanesa de Pollo',contain: true },
  { img: '/pedidos/alfa-choco-negro.jpg', nombre: 'Alfajores Negro',  contain: true },
  { img: '/pedidos/barritas.jpg',         nombre: 'Barritas',         contain: true },
  { img: '/pedidos/box-cafeteria.jpg',    nombre: 'Box Cafetería',    contain: true },
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

function useAnimarAlVerlo() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function Home() {
  const [actual, setActual] = useState(0)
  const [fixtures, setFixtures] = useState([])
  const [fotosOffset, setFotosOffset] = useState(0)
  const [noticias, setNoticias] = useState([])
  const [cargandoNoticias, setCargandoNoticias] = useState(true)

  const refFixture = useAnimarAlVerlo()
  const refNoticias = useAnimarAlVerlo()
  const refIndumentaria = useAnimarAlVerlo()
  const refPedidos = useAnimarAlVerlo()
  const refSponsors = useAnimarAlVerlo()

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
        const fixture = partidos.filter(p => p.mostrarEnHome === 'TRUE').slice(0, 2)
        setFixtures(fixture)
      })
      .catch(err => console.error('Error cargando fixture:', err))
  }, [])

  // Noticias desde la hoja (las mismas que se editan en /noticias)
  useEffect(() => {
    obtenerNoticias()
      .then(setNoticias)
      .catch(err => console.error('Error cargando noticias:', err))
      .finally(() => setCargandoNoticias(false))
  }, [])

  // La marcada con ⭐ va grande; si no hay ninguna, la primera.
  // Al lado, las 4 siguientes en el orden de la página de noticias.
  const noticiaDestacada = noticias.find(esDestacada) || noticias[0]
  const noticiasSecundarias = noticiaDestacada
    ? noticias.filter(n => n.id !== noticiaDestacada.id).slice(0, 4)
    : []
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
              style={{ objectPosition: img.position, objectFit: img.contain ? 'contain' : 'cover' }}
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
        <section className="fixture animar" ref={refFixture}>
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
                      <img src={nombreALogo(f.rival)} alt={f.rival} onError={(e) => { e.target.src = '/logo.png' }} />
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
        <section className="home-noticias animar" ref={refNoticias}>
          <h2 className="home-noticias__titulo">NOTICIAS</h2>

          {cargandoNoticias ? (
            <p style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontWeight: 700, color: '#888' }}>
              Cargando noticias...
            </p>
          ) : !noticiaDestacada ? (
            <p style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontWeight: 700, color: '#888' }}>
              Próximamente vas a ver acá las novedades del club.
            </p>
          ) : (
            <div className="home-noticias__grid">
              <Link to={`/noticias/${noticiaDestacada.id}`} className="home-noticias__destacada">
                <FotoNoticia noticia={noticiaDestacada} className="home-noticias__img" />
                <div className="home-noticias__destacada-info">
                  <span className="home-noticias__tag">NOTICIAS</span>
                  <h3>{noticiaDestacada.titulo}</h3>
                  <span className="home-noticias__link">→ MÁS</span>
                </div>
              </Link>
              <div className="home-noticias__lista">
                {noticiasSecundarias.map(n => (
                  <Link key={n.id} to={`/noticias/${n.id}`} className="home-noticias__item">
                    <FotoNoticia noticia={n} className="home-noticias__item-img" />
                    <div>
                      <span className="home-noticias__tag">NOTICIAS</span>
                      <h4>{n.titulo}</h4>
                      <span className="home-noticias__link">→ MÁS</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* BANNER INDUMENTARIA */}
        <section className="home-indumentaria animar" ref={refIndumentaria}>
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
        <section className="home-pedidos animar" ref={refPedidos}>
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
        <section className="home-sponsors animar" ref={refSponsors}>
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