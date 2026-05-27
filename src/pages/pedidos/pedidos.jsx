import { useState, useEffect } from 'react'
import './pedidos.css'
import PageFooter from '../../components/pageFooter/pageFooter'
import BackButton from '../../components/backButton/backButton'
import emailjs from '@emailjs/browser'
import { useAuth } from '../../context/AuthContext'
import { loginConGoogle } from '../../firebase'

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzadHnefQOSp5CcFqIJq1WAUVYCBEuxghq6QVcXipvlLnb4WBTIyNNbrskPaXDW6z6X/exec'
const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1223710762&single=true&output=csv'
const EMAILJS_SERVICE = 'service_eus8zan'
const EMAILJS_TEMPLATE_PEDIDO = 'template_9mz3d68'
const EMAILJS_KEY = '6mltD84C_kgv-YML0'

const categorias = ['Infantiles', 'U13', 'U14', 'U15', 'U16', 'U18', 'U21', 'Senior', 'Inter Masc', 'Plus 35', 'Entrenadores']

const vitrina = [
  { id: 'pasta',      nombre: 'Pasta',             imagen: '/pedidos/pasta.jpg',           descripcion: 'Tallarines, ñoquis, ravioles y más' },
  { id: 'empanadas',  nombre: 'Empanadas',          imagen: '/pedidos/empanadas.jpg',       descripcion: 'Docenas con distintos rellenos' },
  { id: 'pizzas',     nombre: 'Pizzas',             imagen: '/pedidos/pizza.jpg',           descripcion: 'Cajas de 2 unidades' },
  { id: 'alfajores',  nombre: 'Alfajores Neg.',     imagen: '/pedidos/alfa-choco-negro.jpg',descripcion: 'Pack x10 chocolate negro' },
  { id: 'alfajores2', nombre: 'Alfajores Blan.',    imagen: '/pedidos/alfa-choco-blanco.jpg',descripcion: 'Pack x10 chocolate blanco' },
  { id: 'vinos',      nombre: 'Vinos',              imagen: '/pedidos/vino.jpg',            descripcion: 'Pack x2 unidades' },
  { id: 'pollo',      nombre: 'Pollo al Spiedo',    imagen: '/pedidos/pollo-spiedo.jpg',    descripcion: 'Pollo al spiedo' },
  { id: 'milanesa',   nombre: 'Milanesa de Pollo',  imagen: '/pedidos/mila-pollo.jpg',      descripcion: 'Milanesas de pollo' },
]

const productos = [
  {
    id: 'pasta', nombre: 'Pasta', emoji: '🍝',
    items: [
      { id: 'queso_ray',  nombre: 'Queso Rayado Artesano', precio: 190, unidad: '150gr' },
      { id: 'tal_esp',  nombre: 'Tallarines Espinaca Gruesos', precio: 275, unidad: 'kg' },
      { id: 'tal_yema', nombre: 'Tallarines Yema Finos',       precio: 275, unidad: 'kg' },
      { id: 'noquis',   nombre: 'Ñoquis',                      precio: 275, unidad: 'kg' },
      { id: 'rav_verd', nombre: 'Ravioles Verdura (150 ud.)',   precio: 330, unidad: 'pack' },
      { id: 'rav_jq',   nombre: 'Ravioles J&Q (150 ud.)',      precio: 330, unidad: 'pack' },
      { id: 'rav_ric',  nombre: 'Ravioles Ricotta (150 ud.)',   precio: 330, unidad: 'pack' },
    ]
  },
  {
    id: 'empanadas', nombre: 'Empanadas', emoji: '🥟',
    items: [
      { id: 'emp_carne_ac',  nombre: 'Carne con Aceitunas', precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_carne_sin', nombre: 'Carne sin Aceituna',  precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_pollo',     nombre: 'Pollo',               precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_qyc',       nombre: 'Queso y Cebolla',     precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_4q',        nombre: 'Cuatro Quesos',       precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_cap',       nombre: 'Capresse',            precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_esp',       nombre: 'Espinaca',            precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_qya',       nombre: 'Queso y Aceituna',    precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_jyq',       nombre: 'Jamón y Queso',       precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_pyc',       nombre: 'Panceta y Cebolla',   precio: 430, unidad: 'x5 ud.' },
      { id: 'emp_polloch',   nombre: 'Pollo con Champi',    precio: 360, unidad: 'x5 ud.' },
      { id: 'emp_int',       nombre: 'Integral',            precio: 360, unidad: 'x5 ud.' },
      { id: 'emp_chil',      nombre: 'Chilena',             precio: 390, unidad: 'x5 ud.' },
    ]
  },
  {
    id: 'pizzas', nombre: 'Pizzas', emoji: '🍕',
    items: [
      { id: 'pizza', nombre: 'Pizza (x2 ud.)', precio: 550, unidad: 'caja' },
    ]
  },
  {
    id: 'alfajores', nombre: 'Alfajores', emoji: '🍫',
    items: [
      { id: 'alf_neg',   nombre: 'Chocolate Negro (x10)',  precio: 550, unidad: 'pack' },
      { id: 'alf_blanc', nombre: 'Chocolate Blanco (x10)', precio: 550, unidad: 'pack' },
    ]
  },
  {
    id: 'vinos', nombre: 'Vinos', emoji: '🍷',
    items: [
      { id: 'vino', nombre: 'Pack Vinos x2', precio: 390, unidad: 'pack' },
    ]
  },
  {
    id: 'pollo', nombre: 'Pollo al Spiedo', emoji: '🍗',
    items: [
      { id: 'pollo_sp', nombre: 'Pollo al Spiedo', precio: 690, unidad: 'ud.' },
    ]
  },
  {
    id: 'milanesa', nombre: 'Milanesa de Pollo', emoji: '🍖',
    items: [
      { id: 'mila_pollo', nombre: 'Milanesa de Pollo', precio: 550, unidad: 'kg.' },
    ]
  },
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

export default function Pedidos() {
  const { usuario } = useAuth()
  const [paso, setPaso] = useState(0)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [jugadoraSeleccionada, setJugadoraSeleccionada] = useState(null)
  const [jugadoras, setJugadoras] = useState([])
  const [jugadorasDelUsuario, setJugadorasDelUsuario] = useState([])
  const [productoAbierto, setProductoAbierto] = useState(null)
  const [cantidades, setCantidades] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mostrarConfirmCancel, setMostrarConfirmCancel] = useState(false)
  const [pedidosActivos, setPedidosActivos] = useState(true)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cedulaIngresada, setCedulaIngresada] = useState('')
  const [cedulaError, setCedulaError] = useState(false)
  const [verificando, setVerificando] = useState(false)

  useEffect(() => {
    fetch(JUGADORAS_URL)
      .then(res => res.text())
      .then(texto => setJugadoras(parsearCSV(texto)))
  }, [])

  useEffect(() => {
    fetch(CONFIG_URL)
      .then(res => res.text())
      .then(texto => {
        const filas = texto.trim().split('\n')
        const valores = filas[1].split(',').map(v => v.trim())
        const inicio = valores[0]
        const fin = valores[1]
        setFechaInicio(inicio)
        setFechaFin(fin)
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const [dI, mI, aI] = inicio.split('/')
        const [dF, mF, aF] = fin.split('/')
        const dateInicio = new Date(`${aI}-${mI}-${dI}`)
        const dateFin = new Date(`${aF}-${mF}-${dF}`)
        dateFin.setHours(23, 59, 59)
        setPedidosActivos(hoy >= dateInicio && hoy <= dateFin)
      })
  }, [])

  useEffect(() => {
    if (!usuario || jugadoras.length === 0) return
    const mailUsuario = usuario.email?.toLowerCase().trim()
    const coinciden = jugadoras.filter(j =>
      (j.mail?.toLowerCase().trim() === mailUsuario ||
      j.mail2?.toLowerCase().trim() === mailUsuario) &&
      j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
    )
    setJugadorasDelUsuario(coinciden)
  }, [usuario, jugadoras])

  const cancelar = () => {
    setMostrarConfirmCancel(false)
    setPaso(0)
    setCategoriaSeleccionada(null)
    setJugadoraSeleccionada(null)
    setJugadorasDelUsuario([])
    setCantidades({})
    setProductoAbierto(null)
    setCedulaIngresada('')
    setCedulaError(false)
  }

  const jugadorasFiltradas = jugadoras.filter(j =>
    j.categoria?.trim().toLowerCase() === categoriaSeleccionada?.trim().toLowerCase() &&
    j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
  )

  const sumar = (id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const restar = (id) => setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }))

  const itemsConCantidad = productos.flatMap(p => p.items).filter(i => cantidades[i.id] > 0)
  const total = itemsConCantidad.reduce((acc, i) => acc + i.precio * cantidades[i.id], 0)

  const handlePedir = async () => {
    if (!pedidosActivos) return
    if (!usuario) {
      alert('Tenés que iniciar sesión para hacer un pedido.')
      try {
        await loginConGoogle()
      } catch (err) {
        if (err.message === 'no_autorizado') {
          alert('Tu cuenta de Google no está asociada a ninguna jugadora de CEVVEN.')
        }
        return
      }
    }

    const mailUsuario = usuario?.email?.toLowerCase().trim()
    const coinciden = jugadoras.filter(j =>
      (j.mail?.toLowerCase().trim() === mailUsuario ||
      j.mail2?.toLowerCase().trim() === mailUsuario) &&
      j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
    )

    if (coinciden.length === 1) {
      setJugadoraSeleccionada(coinciden[0])
      setCategoriaSeleccionada(coinciden[0].categoria?.trim())
      setPaso(3)
    } else if (coinciden.length > 1) {
      setJugadorasDelUsuario(coinciden)
      setPaso(2)
    } else {
      setPaso(1)
    }
  }

  const confirmarPedido = async () => {
    setGuardando(true)
    const fecha = new Date().toLocaleDateString('es-UY')
    const fila = {
      fecha,
      categoria: categoriaSeleccionada,
      jugadora: `${jugadoraSeleccionada.nombre} ${jugadoraSeleccionada.apellido}`,
      'Tallarines Espinaca Gruesos': cantidades['tal_esp'] || 0,
      'Tallarines Yema Finos': cantidades['tal_yema'] || 0,
      'Ñoquis': cantidades['noquis'] || 0,
      'Ravioles Verdura': cantidades['rav_verd'] || 0,
      'Ravioles J&Q': cantidades['rav_jq'] || 0,
      'Ravioles Ricotta': cantidades['rav_ric'] || 0,
      'Emp Carne con Aceitunas': cantidades['emp_carne_ac'] || 0,
      'Emp Carne sin Aceituna': cantidades['emp_carne_sin'] || 0,
      'Emp Pollo': cantidades['emp_pollo'] || 0,
      'Emp Queso y Cebolla': cantidades['emp_qyc'] || 0,
      'Emp Cuatro Quesos': cantidades['emp_4q'] || 0,
      'Emp Capresse': cantidades['emp_cap'] || 0,
      'Emp Espinaca': cantidades['emp_esp'] || 0,
      'Emp Queso y Aceituna': cantidades['emp_qya'] || 0,
      'Emp Jamon y Queso': cantidades['emp_jyq'] || 0,
      'Emp Panceta y Cebolla': cantidades['emp_pyc'] || 0,
      'Emp Pollo con Champi': cantidades['emp_polloch'] || 0,
      'Emp Integral': cantidades['emp_int'] || 0,
      'Emp Chilena': cantidades['emp_chil'] || 0,
      'Pizzas': cantidades['pizza'] || 0,
      'Alf Chocolate Negro': cantidades['alf_neg'] || 0,
      'Alf Chocolate Blanco': cantidades['alf_blanc'] || 0,
      'Pack Vinos': cantidades['vino'] || 0,
      'Pollo al Spiedo': cantidades['pollo_sp'] || 0,
      'Milanesa de Pollo': cantidades['mila_pollo'] || 0,
      'Queso Rayado Artesano': cantidades['queso_ray'] || 0,
      total,
    }
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fila)
      })
    } catch (err) {
      console.error('Error guardando pedido:', err)
    }

    const resumenLineas = itemsConCantidad.map(item =>
      `- ${item.nombre}: ${cantidades[item.id]} x $${item.precio} = $${(cantidades[item.id] * item.precio).toLocaleString()}`
    ).join('\n')

    const mailJugadora = usuario?.email?.trim() || jugadoraSeleccionada.mail?.trim()
    if (mailJugadora) {
      try {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_PEDIDO, {
          nombre: `${jugadoraSeleccionada.nombre} ${jugadoraSeleccionada.apellido}`,
          resumen: resumenLineas,
          total: total.toLocaleString(),
          to_email: mailJugadora,
        }, EMAILJS_KEY)
      } catch (err) {
        console.error('Error enviando mail:', err)
      }
    }
    setGuardando(false)
    setPaso(5)
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
    await confirmarPedido()
  }

  return (
    <>
      <main className="pedidos">
        {paso === 0 && <BackButton />}

        {/* PASO 0 — VITRINA */}
        {paso === 0 && (
          <div className="pedidos__paso">
            <h1 className="pedidos__titulo">PEDIDOS</h1>
            <p className="pedidos__sub">Apoyá a las chicas comprando nuestros productos</p>

            {!pedidosActivos && (
              <div className="pedidos__cerrado">
                <span className="pedidos__cerrado-icon">🔒</span>
                <p className="pedidos__cerrado-texto">Los pedidos están cerrados</p>
                <p className="pedidos__cerrado-fechas">
                  Período de pedidos: <strong>{fechaInicio}</strong> al <strong>{fechaFin}</strong>
                </p>
              </div>
            )}

            <div className="pedidos__vitrina">
              {vitrina.map(item => (
                <div key={item.id} className="pedidos__vitrina-card">
                  <div className="pedidos__vitrina-img-wrap">
                    <img src={item.imagen} alt={item.nombre} className="pedidos__vitrina-img" />
                  </div>
                  <div className="pedidos__vitrina-info">
                    <h3 className="pedidos__vitrina-nombre">{item.nombre}</h3>
                    <p className="pedidos__vitrina-desc">{item.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pedidos__vitrina-cta">
              <button
                className={`pedidos__btn-pedir pedidos__btn-pedir--grande ${!pedidosActivos ? 'pedidos__btn-pedir--disabled' : ''}`}
                disabled={!pedidosActivos}
                onClick={handlePedir}
              >
                HACER UN PEDIDO →
              </button>
            </div>
          </div>
        )}

        {/* PASO 1 — CATEGORÍAS (solo si no se encontró jugadora por mail) */}
        {paso === 1 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => setPaso(0)}>← Volver</button>
            </div>
            <h2 className="pedidos__titulo">Seleccioná la categoría</h2>
            <p className="pedidos__sub">¿De qué categoría es la jugadora?</p>
            <div className="pedidos__categorias">
              {categorias.map(cat => (
                <button
                  key={cat}
                  className="pedidos__cat-btn"
                  onClick={() => { setCategoriaSeleccionada(cat); setPaso(2) }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2 — JUGADORA */}
        {paso === 2 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => jugadorasDelUsuario.length > 1 ? setPaso(0) : setPaso(1)}>← Volver</button>
              <button className="pedidos__cancelar" onClick={() => setMostrarConfirmCancel(true)}>✕ Cancelar</button>
            </div>

            {jugadorasDelUsuario.length > 1 ? (
              <>
                <h2 className="pedidos__titulo">¿Para quién es el pedido?</h2>
                <p className="pedidos__sub">Encontramos más de una jugadora asociada a tu cuenta</p>
                <div className="pedidos__categorias">
                  {jugadorasDelUsuario.map((j, i) => (
                    <button
                      key={i}
                      className="pedidos__cat-btn"
                      onClick={() => {
                        setJugadoraSeleccionada(j)
                        setCategoriaSeleccionada(j.categoria?.trim())
                        setPaso(3)
                      }}
                    >
                      {j.nombre} {j.apellido}
                      <span style={{ fontSize: '0.85rem', opacity: 0.7, marginLeft: '6px' }}>— {j.categoria}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="pedidos__titulo">{categoriaSeleccionada}</h2>
                <p className="pedidos__sub">Seleccionar jugador/a</p>
                {jugadorasFiltradas.length === 0 ? (
                  <p className="pedidos__vacio">No hay jugadoras en esta categoría</p>
                ) : (
                  <div className="pedidos__select-wrap">
                    <select
                      className="pedidos__select"
                      defaultValue=""
                      onChange={(e) => {
                        const idx = e.target.value
                        if (idx !== '') {
                          setJugadoraSeleccionada(jugadorasFiltradas[idx])
                          setPaso(3)
                        }
                      }}
                    >
                      <option value="" disabled>Seleccioná una jugadora...</option>
                      {jugadorasFiltradas.map((j, i) => (
                        <option key={i} value={i}>{j.nombre} {j.apellido}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PASO 3 — PRODUCTOS */}
        {paso === 3 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => {
                if (jugadorasDelUsuario.length === 1) {
                  setPaso(0)
                } else if (jugadorasDelUsuario.length > 1) {
                  setPaso(2)
                } else {
                  setPaso(2)
                }
              }}>← Volver</button>
              <button className="pedidos__cancelar" onClick={() => setMostrarConfirmCancel(true)}>✕ Cancelar</button>
            </div>
            <h2 className="pedidos__titulo">Pedido para {jugadoraSeleccionada.nombre} {jugadoraSeleccionada.apellido}</h2>
            <p className="pedidos__sub">Seleccioná los productos</p>
            <div className="pedidos__productos">
              {productos.map(p => (
                <div key={p.id} className="pedidos__producto">
                  <button
                    className={`pedidos__producto-header ${productoAbierto === p.id ? 'pedidos__producto-header--activo' : ''}`}
                    onClick={() => setProductoAbierto(productoAbierto === p.id ? null : p.id)}
                  >
                    <span>{p.emoji} {p.nombre}</span>
                    <span>{productoAbierto === p.id ? '▲' : '▼'}</span>
                  </button>
                  {productoAbierto === p.id && (
                    <div className="pedidos__items">
                      {p.items.map(item => (
                        <div key={item.id} className="pedidos__item">
                          <div className="pedidos__item-info">
                            <span className="pedidos__item-nombre">{item.nombre}</span>
                            {item.precio > 0 && <span className="pedidos__item-precio">${item.precio} / {item.unidad}</span>}
                          </div>
                          <div className="pedidos__contador">
                            <button onClick={() => restar(item.id)}>−</button>
                            <span>{cantidades[item.id] || 0}</span>
                            <button onClick={() => sumar(item.id)}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="pedidos__total-bar">
              <span>Total: <strong>${total.toLocaleString()}</strong></span>
              <button
                className="pedidos__btn-pedir"
                disabled={total === 0}
                onClick={() => setPaso(4)}
              >
                VER PEDIDO
              </button>
            </div>
          </div>
        )}

        {/* PASO 4 — RESUMEN */}
        {paso === 4 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => setPaso(3)}>← Volver</button>
              <button className="pedidos__cancelar" onClick={() => setMostrarConfirmCancel(true)}>✕ Cancelar</button>
            </div>
            <h2 className="pedidos__titulo">Resumen del pedido</h2>
            <p className="pedidos__sub">Pedido para <strong>{jugadoraSeleccionada.nombre} {jugadoraSeleccionada.apellido}</strong> — {categoriaSeleccionada}</p>
            <div className="pedidos__resumen">
              {itemsConCantidad.map(item => (
                <div key={item.id} className="pedidos__resumen-fila">
                  <span>{item.nombre}</span>
                  <span>{cantidades[item.id]} x ${item.precio}</span>
                  <span>${(cantidades[item.id] * item.precio).toLocaleString()}</span>
                </div>
              ))}
              <div className="pedidos__resumen-total">
                <span>TOTAL</span>
                <span></span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pedidos__cedula-wrap">
              <label className="pedidos__cedula-label">
                Ingresá la cédula de <strong>{jugadoraSeleccionada.nombre}</strong> para confirmar
              </label>
              <p className="pedidos__cedula-hint">Sin puntos ni guiones. Ej: 1.234.567-8 → 12345678</p>
              <input
                type="text"
                className={`pedidos__cedula-input ${cedulaError ? 'pedidos__cedula-input--error' : ''}`}
                placeholder="12345678"
                value={cedulaIngresada}
                onChange={(e) => { setCedulaIngresada(e.target.value); setCedulaError(false) }}
              />
              {cedulaError && <p className="pedidos__cedula-error">❌ Cédula incorrecta. Intentá de nuevo.</p>}
            </div>

            <div className="pedidos__resumen-btns">
              <button className="pedidos__btn-secundario" onClick={() => setPaso(3)}>
                ← Seguir comprando
              </button>
              <button
                className="pedidos__btn-pedir"
                onClick={verificarYConfirmar}
                disabled={guardando || verificando || !cedulaIngresada}
              >
                {guardando ? 'GUARDANDO...' : verificando ? 'VERIFICANDO...' : 'CONFIRMAR PEDIDO ✓'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 5 — CONFIRMADO */}
        {paso === 5 && (
          <div className="pedidos__paso pedidos__confirmado">
            <div className="pedidos__confirmado-card">
              <span className="pedidos__confirmado-icon">✅</span>
              <h2>¡Pedido confirmado!</h2>
              <p>El total es <strong>${total.toLocaleString()}</strong></p>
              <p>Enviá el comprobante a:</p>
              <p className="pedidos__telefono">📱 +598 99 999 999 — Leo Parilla</p>
              <div className="pedidos__transferencia">
                <p><strong>Datos para transferir:</strong></p>
                <p>Banco: [Nombre del banco]</p>
                <p>Número de cuenta: [Número]</p>
                <p>Titular: [Nombre del titular]</p>
              </div>
              <button className="pedidos__btn-pedir" onClick={cancelar}>
                HACER OTRO PEDIDO
              </button>
            </div>
          </div>
        )}

        {/* MODAL CANCELAR */}
        {mostrarConfirmCancel && (
          <div className="pedidos__modal-overlay">
            <div className="pedidos__modal">
              <p className="pedidos__modal-texto">¿Seguro que querés cancelar el pedido?</p>
              <div className="pedidos__modal-btns">
                <button className="pedidos__btn-secundario" onClick={() => setMostrarConfirmCancel(false)}>
                  Seguir comprando
                </button>
                <button className="pedidos__cancelar" onClick={cancelar}>
                  ✕ Cancelar pedido
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <PageFooter />
    </>
  )
}