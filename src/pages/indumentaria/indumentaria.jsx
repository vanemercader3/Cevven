import { useState, useEffect } from 'react'
import './indumentaria.css'
import PageFooter from '../../components/pageFooter/pageFooter'

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzadHnefQOSp5CcFqIJq1WAUVYCBEuxghq6QVcXipvlLnb4WBTIyNNbrskPaXDW6z6X/exec'

const talles = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const categorias = ['Infantiles', 'U13', 'U14', 'U15', 'U16', 'U18', 'U21', 'Senior', 'Inter Masc', 'Plus 35', 'Entrenadores']

const productos = [
  { id: 1, nombre: 'Pantalón Largo', precio: 1000, imagen: '/indumentaria/pantalon.png', talleUnico: false },
  { id: 2, nombre: 'Canguro', precio: 1100, imagen: '/indumentaria/canguro.png', talleUnico: false },
  { id: 3, nombre: 'Medio Cierre Polar', precio: 1000, imagen: '/indumentaria/polar.png', talleUnico: false },
  { id: 4, nombre: 'Camperón de Invierno', precio: 1800, imagen: '/indumentaria/camperon.png', talleUnico: false },
  { id: 5, nombre: 'Remera de Entrenamiento', precio: 500, imagen: '/indumentaria/remera.png', talleUnico: false },
  { id: 6, nombre: 'Cuellito Polar', precio: 200, imagen: '/indumentaria/cuellito.png', talleUnico: true },
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

  const handlePedir = () => {
    if (!producto.talleUnico && !talleSeleccionado) {
      alert('Por favor seleccioná un talle')
      return
    }
    onAgregar(producto, talleSeleccionado)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="producto__card">
      {producto.id === 6 && (
        <div className="producto__badge">
          ¡Con 2 prendas o más te lo llevás de regalo!
        </div>
      )}
      <div className="producto__imagen">
        {producto.imagen ? (
          <img src={producto.imagen} alt={producto.nombre} className="producto__img" />
        ) : (
          <span className="producto__placeholder">📦</span>
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
              <button
                key={t}
                className={`producto__talle ${talleSeleccionado === t ? 'producto__talle--activo' : ''}`}
                onClick={() => setTalleSeleccionado(t)}
              >
                {t}
              </button>
            ))
          )}
        </div>
        <button
          className={`producto__btn ${agregado ? 'producto__btn--agregado' : ''}`}
          onClick={handlePedir}
        >
          {agregado ? '✓ AGREGADO' : 'AGREGAR AL PEDIDO'}
        </button>
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

  useEffect(() => {
    fetch(JUGADORAS_URL)
      .then(res => res.text())
      .then(texto => setJugadoras(parsearCSV(texto)))
  }, [])

  const jugadorasFiltradas = jugadoras.filter(j =>
    j.categoria?.trim().toLowerCase() === categoriaSeleccionada?.trim().toLowerCase()
  )

  const agregarAlCarrito = (producto, talle) => {
    setCarrito(prev => {
      const key = `${producto.id}-${talle}`
      const existe = prev.find(i => i.key === key)
      if (existe) {
        return prev.map(i => i.key === key ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, {
        key,
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        talle: talle || 'Único',
        cantidad: 1
      }]
    })
  }

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const totalPrendas = carrito.reduce((a, i) => a + i.cantidad, 0)

  const confirmarPedidoConJugadora = async (jugadora) => {
    setGuardando(true)
    const fecha = new Date().toLocaleDateString('es-UY')

    const fila = {
      fecha,
      categoria: categoriaSeleccionada,
      jugadora: `${jugadora.nombre} ${jugadora.apellido}`,
      'Pantalón Largo XS': 0, 'Pantalón Largo S': 0, 'Pantalón Largo M': 0,
      'Pantalón Largo L': 0, 'Pantalón Largo XL': 0, 'Pantalón Largo XXL': 0,
      'Canguro XS': 0, 'Canguro S': 0, 'Canguro M': 0,
      'Canguro L': 0, 'Canguro XL': 0, 'Canguro XXL': 0,
      'Medio Cierre Polar XS': 0, 'Medio Cierre Polar S': 0, 'Medio Cierre Polar M': 0,
      'Medio Cierre Polar L': 0, 'Medio Cierre Polar XL': 0, 'Medio Cierre Polar XXL': 0,
      'Camperón de Invierno XS': 0, 'Camperón de Invierno S': 0, 'Camperón de Invierno M': 0,
      'Camperón de Invierno L': 0, 'Camperón de Invierno XL': 0, 'Camperón de Invierno XXL': 0,
      'Remera de Entrenamiento XS': 0, 'Remera de Entrenamiento S': 0, 'Remera de Entrenamiento M': 0,
      'Remera de Entrenamiento L': 0, 'Remera de Entrenamiento XL': 0, 'Remera de Entrenamiento XXL': 0,
      'Cuellito Polar': 0,
      total,
    }

    carrito.forEach(item => {
      const col = item.talle === 'Único' ? item.nombre : `${item.nombre} ${item.talle}`
      if (fila[col] !== undefined) fila[col] = item.cantidad
    })

    if (totalPrendas >= 2) {
      fila['Cuellito Polar'] = (fila['Cuellito Polar'] || 0) + 1
    }

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

    setGuardando(false)
    setPaso('confirmado')
  }

  const verificarYConfirmar = async () => {
    setVerificando(true)
    setCedulaError(false)
    const cedulaLimpia = cedulaIngresada.replace(/[.\-\s]/g, '').trim()
    const cedulaJugadora = jugadoraSeleccionada.cedula?.replace(/[.\-\s]/g, '').trim()
    if (cedulaLimpia !== cedulaJugadora) {
      setCedulaError(true)
      setVerificando(false)
      return
    }
    setVerificando(false)
    await confirmarPedidoConJugadora(jugadoraSeleccionada)
  }

  return (
    <>
      <main className="indumentaria">

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
                    <span>{item.nombre} {item.talle !== 'Único' ? `— ${item.talle}` : ''}</span>
                    <span>{item.cantidad} x ${item.precio}</span>
                    <span>${(item.cantidad * item.precio).toLocaleString()}</span>
                    <button
                      className="indumentaria__resumen-borrar"
                      onClick={() => setCarrito(prev => prev.filter(i => i.key !== item.key))}
                    >✕</button>
                  </div>
                ))}
                {totalPrendas >= 2 && (
                  <div className="indumentaria__resumen-fila indumentaria__resumen-regalo">
                    <span>🎁 Cuellito Polar — REGALO</span>
                    <span>1 x $0</span>
                    <span>$0</span>
                    <span></span>
                  </div>
                )}
                <div className="indumentaria__resumen-total">
                  <span>TOTAL</span>
                  <span></span>
                  <span>${total.toLocaleString()}</span>
                  <span></span>
                </div>
              </div>
              <div className="indumentaria__modal-btns">
                <button className="indumentaria__btn-sec" onClick={() => setMostrarResumen(false)}>
                  ← Seguir eligiendo
                </button>
                <button
                  className="indumentaria__btn-pedir"
                  disabled={carrito.length === 0}
                  onClick={() => { setMostrarResumen(false); setPaso('categoria') }}
                >
                  CONFIRMAR PEDIDO →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO CATEGORIA */}
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

        {/* PASO JUGADORA */}
        {paso === 'jugadora' && (
          <div className="indumentaria__paso">
            <button className="indumentaria__volver" onClick={() => setPaso('categoria')}>← Volver</button>
            <h2 className="indumentaria__titulo">{categoriaSeleccionada}</h2>
            <p className="indumentaria__subtitulo">Seleccionar jugador/a</p>
            {jugadorasFiltradas.length === 0 ? (
              <p>No hay jugadoras en esta categoría</p>
            ) : (
              <div className="indumentaria__select-wrap">
                <select
                  className="indumentaria__select"
                  defaultValue=""
                  onChange={(e) => {
                    const idx = e.target.value
                    if (idx !== '') {
                      setJugadoraSeleccionada(jugadorasFiltradas[idx])
                      setPaso('cedula')
                    }
                  }}
                >
                  <option value="" disabled>Seleccionar jugador/a...</option>
                  {jugadorasFiltradas.map((j, i) => (
                    <option key={i} value={i}>{j.nombre} {j.apellido}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* PASO CEDULA */}
        {paso === 'cedula' && jugadoraSeleccionada && (
          <div className="indumentaria__paso">
            <button className="indumentaria__volver" onClick={() => setPaso('jugadora')}>← Volver</button>
            <h2 className="indumentaria__titulo">Verificación</h2>
            <p className="indumentaria__subtitulo">
              Ingresá la cédula de <strong>{jugadoraSeleccionada.nombre} {jugadoraSeleccionada.apellido}</strong> para confirmar
            </p>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
              Sin puntos ni guiones. Ej: 1.234.567-8 → 12345678
            </p>
            <input
              type="text"
              className={`indumentaria__cedula-input ${cedulaError ? 'indumentaria__cedula-input--error' : ''}`}
              placeholder="12345678"
              value={cedulaIngresada}
              onChange={(e) => { setCedulaIngresada(e.target.value); setCedulaError(false) }}
            />
            {cedulaError && (
              <p className="indumentaria__cedula-error">❌ Cédula incorrecta. Intentá de nuevo.</p>
            )}
            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="indumentaria__btn-pedir"
                onClick={verificarYConfirmar}
                disabled={guardando || verificando || !cedulaIngresada}
              >
                {guardando ? 'GUARDANDO...' : verificando ? 'VERIFICANDO...' : 'CONFIRMAR PEDIDO ✓'}
              </button>
            </div>
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
              <p className="indumentaria__telefono">📱 +598 99 999 999 — Leo Parilla</p>
              <div className="indumentaria__transferencia">
                <p><strong>Datos para transferir:</strong></p>
                <p>Banco: [Nombre del banco]</p>
                <p>Número de cuenta: [Número]</p>
                <p>Titular: [Nombre del titular]</p>
              </div>
              <button className="indumentaria__btn-pedir" onClick={() => {
                setPaso('tienda')
                setCarrito([])
                setCategoriaSeleccionada(null)
                setJugadoraSeleccionada(null)
                setCedulaIngresada('')
                setCedulaError(false)
              }}>
                HACER OTRO PEDIDO
              </button>
            </div>
          </div>
        )}

      </main>
      <PageFooter />
    </>
  )
}