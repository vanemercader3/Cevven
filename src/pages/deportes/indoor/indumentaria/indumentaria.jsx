import { useState, useEffect } from 'react'
import './indumentaria.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
// import { useAuth } from '../../context/AuthContext'
// import { loginConGoogle } from '../../firebase'
import emailjs from '@emailjs/browser'

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0fMCKVhwObqTGS_T2Ju3HX6ACrRR-y4ObgScg-mHCKvZ4OgGYfe1nlTKhB8oqsHU7/exec'

const talles = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const categorias = ['Infantiles', 'U13', 'U14', 'U15', 'U16', 'U18', 'U21', 'Senior', 'Inter Masc', 'Plus 35', 'Entrenadores']

const EMAILJS_SERVICE = 'service_eus8zan'
const EMAILJS_TEMPLATE_PEDIDO = 'template_9mz3d68'
const EMAILJS_KEY = '6mltD84C_kgv-YML0'

const productos = [
  { id: 1, nombre: 'Pantalón Largo',            precio: 1000, imagen: '/indumentaria/pantalon.png',       talleUnico: false },
  { id: 2, nombre: 'Canguro',                   precio: 1100, imagen: '/indumentaria/canguro.png',        talleUnico: false},
  { id: 3, nombre: 'Medio Cierre Polar',        precio: 1000, imagen: '/indumentaria/polar.png',          talleUnico: false, personalizacion: true  },
  { id: 4, nombre: 'Camperón de Invierno',      precio: 1800, imagen: '/indumentaria/camperon.png',       talleUnico: false },
  { id: 5, nombre: 'Remera de Entrenamiento',   precio: 500,  imagen: '/indumentaria/remera.png',
    imagenes: ['/indumentaria/remera.png', '/indumentaria/remera-atras.png'],                             talleUnico: false },
  { id: 7, nombre: 'Campera con Cierre',        precio: 1100, imagen: '/indumentaria/campera-cierre.png', talleUnico: false, personalizacion: true },
  { id: 6, nombre: 'Cuellito Polar',            precio: 200,  imagen: '/indumentaria/cuellito.png',       talleUnico: true  },
  { id: 8, nombre: 'Medias',                    precio: 160,  imagen: '/indumentaria/medias.png',         talleUnico: true  },
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

function ProductoCard({ producto, onAgregar }) {
  const [talleSeleccionado, setTalleSeleccionado] = useState(null)
  const [agregado, setAgregado] = useState(false)
  const [numero, setNumero] = useState('')
  const [personalizar, setPersonalizar] = useState(null)
  const [imgIndex, setImgIndex] = useState(0)
  const [pidiendo, setPidiendo] = useState(false) // muestra el panel de personalización

  const imagenes = producto.imagenes || (producto.imagen ? [producto.imagen] : [])
  const tieneCarrusel = imagenes.length > 1

  if (producto.proximamente) {
    return (
      <div className="producto__card producto__card--proximamente">
        <div className="producto__imagen">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="producto__img producto__img--proximamente" />
          ) : (
            <span className="producto__placeholder">📦</span>
          )}
        </div>
        <div className="producto__info">
          <h2 className="producto__nombre">{producto.nombre}</h2>
          <p className="producto__precio producto__precio--proximamente">Precio a confirmar</p>
          <span className="producto__proximamente-badge">PRÓXIMAMENTE</span>
        </div>
      </div>
    )
  }

  const handlePedir = () => {
    if (!producto.talleUnico && !talleSeleccionado) {
      alert('Por favor seleccioná un talle')
      return
    }
    if (producto.personalizacion) {
      setPidiendo(true) // mostrar panel de personalización
      return
    }
    onAgregar(producto, talleSeleccionado, null)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const handleConfirmarPersonalizacion = () => {
    if (personalizar === null) {
      alert('Por favor indicá si querés personalizar con tu número')
      return
    }
    onAgregar(producto, talleSeleccionado, personalizar === true ? numero.trim() : null)
    setPidiendo(false)
    setPersonalizar(null)
    setNumero('')
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="producto__card">
      {producto.id === 6 && (
        <div className="producto__badge">¡Con 2 prendas o más te lo llevás de regalo!</div>
      )}

      {/* Imagen con carrusel opcional */}
      <div className="producto__imagen">
        {imagenes.length > 0 ? (
          <img src={imagenes[imgIndex]} alt={producto.nombre} className="producto__img" />
        ) : (
          <span className="producto__placeholder">📦</span>
        )}
        {tieneCarrusel && (
          <>
            <button
              className="producto__carrusel-btn producto__carrusel-btn--prev"
              onClick={() => setImgIndex(i => (i - 1 + imagenes.length) % imagenes.length)}
              aria-label="Imagen anterior"
            >‹</button>
            <button
              className="producto__carrusel-btn producto__carrusel-btn--next"
              onClick={() => setImgIndex(i => (i + 1) % imagenes.length)}
              aria-label="Imagen siguiente"
            >›</button>
            <div className="producto__carrusel-dots">
              {imagenes.map((_, i) => (
                <span
                  key={i}
                  className={`producto__carrusel-dot ${i === imgIndex ? 'producto__carrusel-dot--activo' : ''}`}
                  onClick={() => setImgIndex(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="producto__info">
        <h2 className="producto__nombre">{producto.nombre}</h2>
        <p className="producto__precio">${producto.precio.toLocaleString()}</p>
        <div className="producto__talles">
          {producto.talleUnico ? (
            <span className="producto__talle-unico">Talle único</span>
          ) : (
            talles.map(t => (
              <button key={t}
                className={`producto__talle ${talleSeleccionado === t ? 'producto__talle--activo' : ''}`}
                onClick={() => setTalleSeleccionado(t)}>
                {t}
              </button>
            ))
          )}
        </div>

        {/* Personalización de número — aparece al tocar "Agregar al pedido" */}
        {producto.personalizacion && pidiendo && (
          <div className="producto__personalizacion">
            <p className="producto__personalizacion-label">¿Querés personalizarla con tu número?</p>
            <div className="producto__personalizacion-opciones">
              <button
                className={`producto__pers-btn ${personalizar === false ? 'producto__pers-btn--activo' : ''}`}
                onClick={() => { setPersonalizar(false); setNumero('') }}>
                No
              </button>
              <button
                className={`producto__pers-btn ${personalizar === true ? 'producto__pers-btn--activo' : ''}`}
                onClick={() => setPersonalizar(true)}>
                Sí
              </button>
            </div>
            {personalizar === true && (
              <input
                type="text"
                className="producto__numero-input"
                placeholder="Ej: 7"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                maxLength={3}
                autoFocus
              />
            )}
            <div className="producto__personalizacion-btns">
              <button className="producto__pers-cancelar" onClick={() => { setPidiendo(false); setPersonalizar(null); setNumero('') }}>
                Cancelar
              </button>
              <button className="producto__btn producto__btn--pers-confirmar" onClick={handleConfirmarPersonalizacion}>
                ✓ AGREGAR
              </button>
            </div>
          </div>
        )}

        {!pidiendo && (
          <button className={`producto__btn ${agregado ? 'producto__btn--agregado' : ''}`} onClick={handlePedir}>
            {agregado ? '✓ AGREGADO' : 'AGREGAR AL PEDIDO'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Indumentaria() {
  const [carrito, setCarrito] = useState([])
  const [paso, setPaso] = useState('tienda')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [jugadoraSeleccionada, setJugadoraSeleccionada] = useState(null)
  const [jugadoras, setJugadoras] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [mostrarResumen, setMostrarResumen] = useState(false)
  const [cedulaIngresada, setCedulaIngresada] = useState('')
  const [cedulaError, setCedulaError] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [nombreSolicitante, setNombreSolicitante] = useState('')
  const [nombreError, setNombreError] = useState(false)

  useEffect(() => {
    fetch(JUGADORAS_URL)
      .then(res => res.text())
      .then(texto => setJugadoras(parsearCSV(texto)))
  }, [])

  const jugadorasFiltradas = jugadoras.filter(j =>
    j.categoria?.trim().toLowerCase() === categoriaSeleccionada?.trim().toLowerCase() &&
    j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
  )

  const agregarAlCarrito = (producto, talle, numeroPersonalizacion) => {
    setCarrito(prev => {
      const key = `${producto.id}-${talle}-${numeroPersonalizacion ?? ''}`
      const existe = prev.find(i => i.key === key)
      if (existe) return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, {
        key,
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        talle: talle || 'Único',
        cantidad: 1,
        numero: numeroPersonalizacion ?? null,
      }]
    })
  }

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const totalPrendas = carrito.reduce((a, i) => a + i.cantidad, 0)

  const handleConfirmarResumen = () => {
    setMostrarResumen(false)
    setPaso('identificacion')
  }

  const confirmarPedidoConJugadora = async (jugadora) => {
    setGuardando(true)
    const fecha = new Date().toLocaleDateString('es-UY')

    const productosNombres = productos
      .filter(p => !p.proximamente)
      .map(p => p.nombre)

    const agrupado = {}
    productosNombres.forEach(nombre => { agrupado[nombre] = [] })

    carrito.forEach(item => {
      if (agrupado[item.nombre] !== undefined) {
        agrupado[item.nombre].push(item)
      }
    })

    if (totalPrendas >= 2) {
      const cuellitosEnCarrito = agrupado['Cuellito Polar'] || []
      if (cuellitosEnCarrito.length === 0) {
        agrupado['Cuellito Polar'] = [{ cantidad: 1, talle: 'Único', numero: null, regalo: true }]
      } else {
        agrupado['Cuellito Polar'][0] = {
          ...agrupado['Cuellito Polar'][0],
          cantidad: agrupado['Cuellito Polar'][0].cantidad + 1,
        }
      }
    }

    const formatearGrupo = (items) => {
      if (!items || items.length === 0) return ''
      return items.map(item => {
        const base = item.talle === 'Único'
          ? `${item.cantidad}`
          : `${item.cantidad}-${item.talle}`
        const extra = item.numero ? `(#${item.numero})` : ''
        return base + extra
      }).join(' | ')
    }

    const fila = {
      fecha,
      categoria: categoriaSeleccionada,
      jugadora: `${jugadora.nombre} ${jugadora.apellido}`,
      solicitante: nombreSolicitante,
    }

    productosNombres.forEach(nombre => {
      fila[nombre] = formatearGrupo(agrupado[nombre])
    })

    fila['total'] = total

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fila, _hoja: 'indumentaria' })
      })
    } catch (err) {
      console.error('Error guardando pedido:', err)
    }

    const resumenLineas = carrito.map(item => {
      const personaliz = item.numero ? ` — Número: #${item.numero}` : ''
      return `- ${item.nombre}${item.talle !== 'Único' ? ` (${item.talle})` : ''}${personaliz}: ${item.cantidad} x $${item.precio} = $${(item.cantidad * item.precio).toLocaleString()}`
    }).join('\n')

    const mails = [
      jugadora.mail?.trim(),
      jugadora.mail2?.trim()
    ].filter(Boolean)

    for (const mail of mails) {
      try {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_PEDIDO, {
          nombre: `${jugadora.nombre} ${jugadora.apellido}`,
          solicitante: nombreSolicitante,
          resumen: resumenLineas,
          total: total.toLocaleString(),
          to_email: mail,
          banco: 'B.R.O.U.',
          cuenta: '000420453-00001',
          titular: 'Leonardo Parrilla',
          telefono: '+598 99 027 944',
        }, EMAILJS_KEY)
      } catch (err) {
        console.error('Error enviando mail a', mail, err)
      }
    }

    setGuardando(false)
    setPaso('confirmado')
  }

  const resetear = () => {
    setPaso('tienda')
    setCarrito([])
    setCategoriaSeleccionada(null)
    setJugadoraSeleccionada(null)
    setCedulaIngresada('')
    setCedulaError(false)
    setNombreSolicitante('')
    setNombreError(false)
  }

  return (
    <>
      <main className="indumentaria">
        {paso === 'tienda' && <BackButton />}

        {/* TIENDA */}
        {paso === 'tienda' && (
          <>
            <h1 className="indumentaria__titulo">INDUMENTARIA</h1>
            <p className="indumentaria__subtitulo">Entrená, competí, representá. Somos CEVVEN Handball</p>
            <div className="indumentaria__grid">
              {productos.map(p => (
                <ProductoCard key={p.id} producto={p} onAgregar={agregarAlCarrito} />
              ))}
            </div>
            {carrito.length > 0 && (
              <div className="indumentaria__carrito-bar">
                <div className="indumentaria__carrito-info">
                  <span>{totalPrendas} prenda{totalPrendas !== 1 ? 's' : ''}</span>
                  <strong>${total.toLocaleString()}</strong>
                </div>
                <button className="indumentaria__carrito-btn" onClick={() => setMostrarResumen(true)}>
                  VER PEDIDO →
                </button>
              </div>
            )}
          </>
        )}

        {/* MODAL RESUMEN */}
        {mostrarResumen && (
          <div className="indumentaria__modal-overlay">
            <div className="indumentaria__modal">
              <h2 className="indumentaria__modal-titulo">Tu pedido</h2>
              <div className="indumentaria__resumen">
                {carrito.map(item => (
                  <div key={item.key} className="indumentaria__resumen-fila">
                    <span>
                      {item.nombre}
                      {item.talle !== 'Único' ? ` — ${item.talle}` : ''}
                      {item.numero ? ` — #${item.numero}` : ''}
                    </span>
                    <span>{item.cantidad} x ${item.precio}</span>
                    <span>${(item.cantidad * item.precio).toLocaleString()}</span>
                    <button className="indumentaria__resumen-borrar"
                      onClick={() => setCarrito(prev => prev.filter(i => i.key !== item.key))}>✕</button>
                  </div>
                ))}
                {totalPrendas >= 2 && (
                  <div className="indumentaria__resumen-fila indumentaria__resumen-regalo">
                    <span>🎁 Cuellito Polar — REGALO</span>
                    <span>1 x $0</span><span>$0</span><span></span>
                  </div>
                )}
                <div className="indumentaria__resumen-total">
                  <span>TOTAL</span><span></span>
                  <span>${total.toLocaleString()}</span><span></span>
                </div>
              </div>
              <div className="indumentaria__modal-btns">
                <button className="indumentaria__btn-sec" onClick={() => setMostrarResumen(false)}>← Seguir eligiendo</button>
                <button className="indumentaria__btn-pedir" disabled={carrito.length === 0} onClick={handleConfirmarResumen}>
                  CONFIRMAR PEDIDO →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO IDENTIFICACIÓN */}
        {paso === 'identificacion' && (
          <div className="indumentaria__paso">
            <button className="indumentaria__volver" onClick={() => { setPaso('tienda'); setMostrarResumen(true) }}>← Volver</button>
            <h2 className="indumentaria__titulo">¿Para quién es el pedido?</h2>
            <p className="indumentaria__subtitulo">Ingresá los datos para continuar</p>

            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Cédula de la jugadora
              </label>
              <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
                Sin puntos ni guiones. Ej: 1.234.567-8 → 12345678
              </p>
              <input
                type="text"
                className={`indumentaria__cedula-input ${cedulaError ? 'indumentaria__cedula-input--error' : ''}`}
                placeholder="12345678"
                value={cedulaIngresada}
                onChange={(e) => { setCedulaIngresada(e.target.value); setCedulaError(false) }}
              />
              {cedulaError && <p className="indumentaria__cedula-error">❌ No encontramos una jugadora con esa cédula.</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                Tu nombre (quien hace el pedido)
              </label>
              <input
                type="text"
                className={`indumentaria__cedula-input ${nombreError ? 'indumentaria__cedula-input--error' : ''}`}
                placeholder="Ej: María González"
                value={nombreSolicitante}
                onChange={(e) => { setNombreSolicitante(e.target.value); setNombreError(false) }}
              />
              {nombreError && <p className="indumentaria__cedula-error">❌ Ingresá tu nombre para continuar.</p>}
            </div>

            <button
              className="indumentaria__btn-pedir"
              disabled={!cedulaIngresada || !nombreSolicitante || guardando}
              onClick={async () => {
                const cedulaLimpia = cedulaIngresada.replace(/[.\-\s]/g, '').trim()
                const jugadora = jugadoras.find(j =>
                  j.cedula?.replace(/[.\-\s]/g, '').trim() === cedulaLimpia &&
                  j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
                )
                if (!jugadora) { setCedulaError(true); return }
                if (!nombreSolicitante.trim()) { setNombreError(true); return }
                setJugadoraSeleccionada(jugadora)
                setCategoriaSeleccionada(jugadora.categoria?.trim())
                await confirmarPedidoConJugadora(jugadora)
              }}
            >
              {guardando ? 'GUARDANDO...' : 'CONFIRMAR PEDIDO ✓'}
            </button>
          </div>
        )}

        {/* PASO CATEGORIA — se mantiene para uso futuro */}
        {paso === 'categoria' && (
          <div className="indumentaria__paso">
            <button className="indumentaria__volver" onClick={() => setPaso('tienda')}>← Volver</button>
            <h2 className="indumentaria__titulo">Seleccioná la categoría</h2>
            <div className="indumentaria__categorias">
              {categorias.map(cat => (
                <button key={cat} className="indumentaria__cat-btn"
                  onClick={() => { setCategoriaSeleccionada(cat); setPaso('jugadora') }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO JUGADORA — se mantiene para uso futuro */}
        {paso === 'jugadora' && (
          <div className="indumentaria__paso">
            <button className="indumentaria__volver" onClick={() => setPaso('categoria')}>← Volver</button>
            <h2 className="indumentaria__titulo">{categoriaSeleccionada}</h2>
            <p className="indumentaria__subtitulo">Seleccionar jugador/a</p>
            {jugadorasFiltradas.length === 0 ? (
              <p>No hay jugadoras en esta categoría</p>
            ) : (
              <div className="indumentaria__select-wrap">
                <select className="indumentaria__select" defaultValue=""
                  onChange={(e) => {
                    const idx = e.target.value
                    if (idx !== '') { setJugadoraSeleccionada(jugadorasFiltradas[idx]); setPaso('cedula') }
                  }}>
                  <option value="" disabled>Seleccionar jugador/a...</option>
                  {jugadorasFiltradas.map((j, i) => (
                    <option key={i} value={i}>{j.nombre} {j.apellido}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* CONFIRMADO */}
        {paso === 'confirmado' && (
          <div className="indumentaria__paso indumentaria__confirmado">
            <div className="indumentaria__confirmado-card">
              <span className="indumentaria__confirmado-icon">✅</span>
              <h2>¡Pedido confirmado!</h2>
              <p>El total es <strong>${total.toLocaleString()}</strong></p>
              <p>Enviá el comprobante a:</p>
              <p className="pedidos__telefono">📱 +598 99 027 944 — Leo Parrilla</p>
              <div className="pedidos__transferencia">
                <p><strong>Datos para transferir:</strong></p>
                <p>Banco: B.R.O.U.</p>
                <p>Número de cuenta: 000420453-00001</p>
                <p>Titular: Leonardo Parrilla</p>
              </div>
              <button className="indumentaria__btn-pedir" onClick={resetear}>HACER OTRO PEDIDO</button>
            </div>
          </div>
        )}

      </main>
      <PageFooter />
    </>
  )
}