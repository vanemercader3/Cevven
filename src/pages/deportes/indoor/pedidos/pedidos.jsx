import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'   // ← MODO PRUEBA
import './pedidos.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
import emailjs from '@emailjs/browser'
// import { useAuth } from '../../context/AuthContext'   // ← desactivado: antes se usaba para login con Google
// import { loginConGoogle } from '../../firebase'       // ← desactivado: antes se usaba para login con Google

// La cédula ya NO se valida contra un CSV público. Se valida contra el Apps Script,
// que lee la hoja Jugadoras (privada) y devuelve solo los datos de esa jugadora.
const PEDIDOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=327502795&single=true&output=csv'
const PRECIOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=337517673&single=true&output=csv'
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0fMCKVhwObqTGS_T2Ju3HX6ACrRR-y4ObgScg-mHCKvZ4OgGYfe1nlTKhB8oqsHU7/exec'
const CONFIG_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1223710762&single=true&output=csv'
const EMAILJS_SERVICE = 'service_eus8zan'
const EMAILJS_TEMPLATE_PEDIDO = 'template_9mz3d68'
const EMAILJS_KEY = '6mltD84C_kgv-YML0'

/* ─────────────────────────────────────────────────────────────
   MODO PRUEBA — clave secreta para saltear la fecha límite.
   Entrando a  /pedidos?modo=stage  los pedidos quedan
   siempre abiertos.
   ───────────────────────────────────────────────────────────── */
const CLAVE_MODO_PRUEBA = 'stage'


const GRUPOS_META = {
  Pasta:     { emoji: '🍝' },
  Empanadas: { emoji: '🥟' },
  Pizzas:    { emoji: '🍕' },
  Alfajores: { emoji: '🍫', img: '/pedidos/alfa-emoji.jpg' },
  Vinos:     { emoji: '🍷' },
  Pollo:     { emoji: '🍗' },
  Milanesa:  { emoji: '🍖' },
  Barritas:  { emoji: '🍫' },
  Box:       { emoji: '🍪', titulo: 'Box Cafetería' },
}
const EMOJI_GENERICO = '🛒'


const VITRINA = [
  { grupo: 'Pasta',     nombre: 'Pasta',            imagen: '/pedidos/pasta.jpg',            descripcion: 'Tallarines, ñoquis, ravioles y más' },
  { grupo: 'Empanadas', nombre: 'Empanadas',        imagen: '/pedidos/empanadas.jpg',        descripcion: 'Distintos rellenos' },
  { grupo: 'Pizzas',    nombre: 'Pizzas',           imagen: '/pedidos/pizza.jpg',            descripcion: 'Caja de 2 unidades' },
  { grupo: 'Alfajores', nombre: 'Alfajores Neg.',   imagen: '/pedidos/alfa-choco-negro.jpg',  descripcion: 'Caja x10 chocolate negro' },
  { grupo: 'Alfajores', nombre: 'Alfajores Blan.',  imagen: '/pedidos/alfa-choco-blanco.jpg', descripcion: 'Caja x10 chocolate blanco' },
  { grupo: 'Vinos',     nombre: 'Vinos',            imagen: '/pedidos/vino.jpg',             descripcion: 'Pack x2 unidades' },
  { grupo: 'Pollo',     nombre: 'Pollo al Spiedo',  imagen: '/pedidos/pollo-spiedo.jpg',     descripcion: 'Pollo al Spiedo' },
  { grupo: 'Pollo',     nombre: 'Arrollado de Pollo', imagen: '/pedidos/arrollado-pollo.jpg', descripcion: 'Arrollado de Pollo' },
  { grupo: 'Milanesa',  nombre: 'Milanesa de Pollo',imagen: '/pedidos/mila-pollo.jpg',       descripcion: 'Milanesa de Pollo' },
  { grupo: 'Barritas',  nombre: 'Barritas',         imagen: '/pedidos/barritas.jpg',         descripcion: 'Caja surtida o mismo gusto x12 unidades' },
  { grupo: 'Box',       nombre: 'Box Cafetería',    imagen: '/pedidos/box-cafeteria.jpg',    descripcion: 'Medialunas, Rolls de Canela y Cookies' },
]

const categorias = ['Infantiles', 'U13', 'U14', 'U15', 'U16', 'U18', 'U21', 'Senior', 'Inter Masc', 'Plus 35', 'Entrenadores']

// Parser robusto: respeta comillas, comas dentro de comillas y detecta
// separador (tab o coma). Devuelve array de objetos usando la fila 0 como headers.
function parsearCSVSeguro(texto) {
  const primeraLinea = texto.split('\n')[0] || ''
  const sep = primeraLinea.includes('\t') ? '\t' : ','
  const filas = []
  let campo = ''
  let fila = []
  let enComillas = false

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++ }
        else enComillas = false
      } else campo += c
    } else {
      if (c === '"') enComillas = true
      else if (c === sep) { fila.push(campo); campo = '' }
      else if (c === '\n') { fila.push(campo); filas.push(fila); fila = []; campo = '' }
      else if (c === '\r') { /* ignorar */ }
      else campo += c
    }
  }
  if (campo !== '' || fila.length > 0) { fila.push(campo); filas.push(fila) }
  if (filas.length === 0) return { headers: [], filas: [] }

  const headers = filas[0].map(h => h.trim())
  const objetos = filas.slice(1).map(f => {
    const obj = {}
    headers.forEach((h, i) => obj[h] = (f[i] || '').trim())
    return obj
  })
  return { headers, filas: objetos }
}

// Normaliza texto para comparar nombres (sin tildes, sin dobles espacios, minúsculas)
function normalizar(txt) {
  return (txt || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

// Convierte "12/3/2026" a Date para poder ordenar
function fechaADate(str) {
  const [d, m, a] = (str || '').split('/')
  if (!d || !m || !a) return new Date(0)
  return new Date(`${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`)
}

export default function Pedidos() {
  // const { usuario } = useAuth()   // ← desactivado: antes se usaba para verificar si había usuario logueado

  /* ── MODO PRUEBA: lee ?modo=... de la URL ── */
  const [searchParams] = useSearchParams()
  const modoPrueba = searchParams.get('modo') === CLAVE_MODO_PRUEBA

  const [paso, setPaso] = useState(0)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [jugadoraSeleccionada, setJugadoraSeleccionada] = useState(null)
  const [productoAbierto, setProductoAbierto] = useState(null)
  const [cantidades, setCantidades] = useState({})   // clave = columna técnica
  const [guardando, setGuardando] = useState(false)
  const [mostrarConfirmCancel, setMostrarConfirmCancel] = useState(false)
  const [pedidosActivos, setPedidosActivos] = useState(true)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cedulaIngresada, setCedulaIngresada] = useState('')
  const [cedulaError, setCedulaError] = useState('')       // guarda el mensaje exacto
  const [verificando, setVerificando] = useState(false)    // spinner al validar cédula
  const [nombreSolicitante, setNombreSolicitante] = useState('')
  const [nombreError, setNombreError] = useState(false)

  /* ── CATÁLOGO DINÁMICO (desde Precios + validación contra pedidos) ── */
  const [catalogo, setCatalogo] = useState([])          // items válidos e inválidos, con flag error
  const [gruposOrden, setGruposOrden] = useState([])    // orden de grupos según el Sheet
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true)
  const [catalogoError, setCatalogoError] = useState('')

  /* ── HISTORIAL DE PEDIDOS (solo lectura, panel lateral) ── */
  const [historial, setHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [historialError, setHistorialError] = useState('')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [previoAbierto, setPrevioAbierto] = useState(null)

  /* ── Carga el catálogo desde Precios y lo valida contra los headers
        reales de la hoja pedidos. Un producto queda marcado con "error"
        si su columna no existe en pedidos o si le falta el precio. ── */
  useEffect(() => {
    const cargarCatalogo = async () => {
      setCargandoCatalogo(true)
      setCatalogoError('')
      try {
        // 1. Headers reales de la hoja pedidos (fila 0)
        const resPed = await fetch(PEDIDOS_URL)
        const textoPed = await resPed.text()
        const { headers: headersPedidos } = parsearCSVSeguro(textoPed)
        const setHeaders = new Set(headersPedidos.map(h => h.trim()))

        // 2. Filas de Precios
        const resPre = await fetch(PRECIOS_URL)
        const textoPre = await resPre.text()
        const { filas: filasPrecios } = parsearCSVSeguro(textoPre)

        const items = []
        const ordenGrupos = []

        filasPrecios.forEach(f => {
          const nombre  = (f.producto || '').trim()
          if (!nombre) return   // fila vacía → se ignora

          const activo  = (f.activo || '').trim().toUpperCase()
          if (activo === 'FALSE') return   // producto apagado → no se muestra

          const columna   = (f.columna || '').trim()
          const grupo     = (f.grupo || '').trim() || 'Otros'
          const unidad    = (f.unidad || '').trim()
          const precioRaw = (f.precios || '').trim().replace(/[^\d]/g, '')
          const precio    = precioRaw === '' ? null : parseInt(precioRaw, 10)

          // ── VALIDACIÓN → sistema de ERROR ──
          let error = null
          if (!columna || !setHeaders.has(columna)) {
            error = 'columna'   // la columna no coincide con ningún header de pedidos
          } else if (precio === null || isNaN(precio)) {
            error = 'precio'    // falta el precio o no es un número
          }

          if (!ordenGrupos.includes(grupo)) ordenGrupos.push(grupo)

          items.push({
            id: columna || `sin-col-${nombre}`,   // clave interna
            columna,
            nombre,
            unidad,
            precio,
            grupo,
            error,
          })
        })

        setCatalogo(items)
        setGruposOrden(ordenGrupos)
      } catch (err) {
        console.error('Error cargando catálogo:', err)
        setCatalogoError('No pudimos cargar el catálogo. Reintentá en un ratito.')
      }
      setCargandoCatalogo(false)
    }
    cargarCatalogo()
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
        setPedidosActivos(modoPrueba || (hoy >= dateInicio && hoy <= dateFin))
      })
  }, [modoPrueba])

  /* ── Derivados del catálogo ── */
  // Items válidos (sin error) agrupados por grupo, respetando el orden del Sheet
  const gruposCatalogo = gruposOrden.map(g => ({
    grupo: g,
    meta: GRUPOS_META[g] || { emoji: EMOJI_GENERICO },
    items: catalogo.filter(i => i.grupo === g),
  })).filter(g => g.items.length > 0)

  // ¿Hay errores en el catálogo? (para el cartel de aviso)
  const itemsConError = catalogo.filter(i => i.error)

  // Solo los grupos que existen en el catálogo aparecen en la vitrina
  const gruposPresentes = new Set(gruposOrden)
  const vitrinaVisible = VITRINA.filter(v => gruposPresentes.has(v.grupo))

  const cancelar = () => {
    setMostrarConfirmCancel(false)
    setPaso(0)
    setCategoriaSeleccionada(null)
    setJugadoraSeleccionada(null)
    setCantidades({})
    setProductoAbierto(null)
    setCedulaIngresada('')
    setCedulaError('')
    setNombreSolicitante('')
    setNombreError(false)
    setHistorial([])
    setHistorialError('')
    setPanelAbierto(false)
    setPrevioAbierto(null)
  }

  const sumar = (col) => setCantidades(prev => ({ ...prev, [col]: (prev[col] || 0) + 1 }))
  const restar = (col) => setCantidades(prev => ({ ...prev, [col]: Math.max(0, (prev[col] || 0) - 1) }))

  // Items del pedido actual (con cantidad > 0). Se lee del catálogo por columna.
  const itemsConCantidad = catalogo.filter(i => !i.error && cantidades[i.columna] > 0)
  const total = itemsConCantidad.reduce((acc, i) => acc + i.precio * cantidades[i.columna], 0)

  /* ── Carga el historial de una jugadora desde la hoja "pedidos" ── */
  const cargarHistorial = async (jugadora) => {
    if (!jugadora) return
    setCargandoHistorial(true)
    setHistorialError('')
    setHistorial([])
    try {
      const res = await fetch(PEDIDOS_URL)
      const texto = await res.text()
      const { filas } = parsearCSVSeguro(texto)

      const nombreCompleto = normalizar(`${jugadora.nombre} ${jugadora.apellido}`)
      const propios = filas.filter(f => normalizar(f.jugadora) === nombreCompleto)

      const armados = propios.map(f => {
        // Recorro el catálogo y busco la cantidad en la columna correspondiente
        const items = catalogo
          .filter(c => !c.error && c.columna)
          .map(c => ({ ...c, cantidad: parseInt(f[c.columna], 10) || 0 }))
          .filter(c => c.cantidad > 0)
        const subtotal = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
        return { fecha: f.fecha || '', categoria: f.categoria || '', items, subtotal }
      })
      .filter(p => p.items.length > 0)
      .sort((a, b) => fechaADate(b.fecha) - fechaADate(a.fecha))

      setHistorial(armados)
    } catch (err) {
      console.error('Error cargando historial:', err)
      setHistorialError('No pudimos cargar tus pedidos anteriores.')
    }
    setCargandoHistorial(false)
  }

  const totalHistorial = historial.reduce((acc, p) => acc + p.subtotal, 0)
  const totalGeneral = totalHistorial + total

  const handlePedir = () => {
    if (!pedidosActivos) return
    setPaso(1)
  }

  /* ── Valida la cédula contra el Apps Script (hoja Jugadoras privada).
        Si es correcta, devuelve nombre, apellido, categoría y mails.
        Los entrenadores no pueden hacer pedidos. ── */
  const validarCedulaYContinuar = async () => {
    const cedulaLimpia = cedulaIngresada.replace(/[.\-\s]/g, '').trim()
    if (!cedulaLimpia) { setCedulaError('❌ Ingresá la cédula.'); return }
    if (!nombreSolicitante.trim()) { setNombreError(true); return }

    setVerificando(true)
    setCedulaError('')
    try {
      const url = `${APPS_SCRIPT_URL}?_accion=validarCedula&cedula=${encodeURIComponent(cedulaLimpia)}`
      const res = await fetch(url)
      const data = await res.json()

      if (!data.ok) {
        setCedulaError('❌ No encontramos una jugadora con esa cédula.')
        setVerificando(false)
        return
      }
      if ((data.posicion || '').toUpperCase().trim() === 'ENTRENADOR') {
        setCedulaError('❌ No encontramos una jugadora con esa cédula.')
        setVerificando(false)
        return
      }

      // Guardo la jugadora con la misma forma que usaba el resto del código
      const jugadora = {
        nombre: data.nombre,
        apellido: data.apellido,
        categoria: data.categoria,
        mail: data.mail,
        mail2: data.mail2,
      }
      setJugadoraSeleccionada(jugadora)
      setCategoriaSeleccionada((data.categoria || '').trim())
      cargarHistorial(jugadora)   // ← trae los pedidos anteriores para el panel lateral
      setPaso(3)
    } catch (err) {
      console.error('Error validando cédula:', err)
      setCedulaError('❌ No pudimos verificar la cédula. Reintentá en un ratito.')
    }
    setVerificando(false)
  }

  const confirmarPedido = async () => {
    setGuardando(true)
    const fecha = new Date().toLocaleDateString('es-UY')

    // Armo la fila SOLO con columnas técnicas válidas del catálogo.
    // 'total' NO se escribe (lo calcula la fórmula del Sheet).
    const fila = {
      fecha,
      categoria: categoriaSeleccionada,
      jugadora: `${jugadoraSeleccionada.nombre} ${jugadoraSeleccionada.apellido}`,
    }
    catalogo.forEach(i => {
      if (i.error || !i.columna) return
      fila[i.columna] = cantidades[i.columna] || 0
    })

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
      `- ${item.nombre}: ${cantidades[item.columna]} x $${item.precio} = $${(cantidades[item.columna] * item.precio).toLocaleString()}`
    ).join('\n')

    const mails = [
      jugadoraSeleccionada.mail?.trim(),
      jugadoraSeleccionada.mail2?.trim()
    ].filter(Boolean)

    for (const mail of mails) {
      try {
        await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE_PEDIDO, {
          nombre: `${jugadoraSeleccionada.nombre} ${jugadoraSeleccionada.apellido}`,
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
    setPaso(5)
  }

  /* ── Panel lateral: carrito actual + pedidos anteriores ── */
  const panelPedidos = (
    <aside className={`pedidos__panel ${panelAbierto ? 'pedidos__panel--abierto' : ''}`}>
      <button className="pedidos__panel-toggle" onClick={() => setPanelAbierto(v => !v)}>
        <span>🧾 Mi pedido — ${totalGeneral.toLocaleString()}</span>
        <span>{panelAbierto ? '▲' : '▼'}</span>
      </button>

      <div className="pedidos__panel-body">
        {/* Carrito actual */}
        <div className="pedidos__panel-bloque">
          <h4 className="pedidos__panel-titulo">Estás agregando</h4>
          {itemsConCantidad.length === 0 ? (
            <p className="pedidos__panel-vacio">Todavía no agregaste nada</p>
          ) : (
            <>
              {itemsConCantidad.map(item => (
                <div key={item.id} className="pedidos__panel-fila">
                  <span className="pedidos__panel-cant">{cantidades[item.columna]}×</span>
                  <span className="pedidos__panel-nombre">{item.nombre}</span>
                  <span className="pedidos__panel-precio">
                    ${(cantidades[item.columna] * item.precio).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pedidos__panel-subtotal">
                <span>Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        {/* Pedidos anteriores */}
        <div className="pedidos__panel-bloque">
          <h4 className="pedidos__panel-titulo">Lo que llevás pedido</h4>

          {cargandoHistorial && <p className="pedidos__panel-vacio">Cargando...</p>}
          {historialError && <p className="pedidos__panel-error">{historialError}</p>}

          {!cargandoHistorial && !historialError && historial.length === 0 && (
            <p className="pedidos__panel-vacio">Este es tu primer pedido 🎉</p>
          )}

          {historial.map((p, idx) => (
            <div key={idx} className="pedidos__panel-previo">
              <button
                className="pedidos__panel-previo-head"
                onClick={() => setPrevioAbierto(previoAbierto === idx ? null : idx)}
              >
                <span>📅 {p.fecha}</span>
                <span>${p.subtotal.toLocaleString()} {previoAbierto === idx ? '▲' : '▼'}</span>
              </button>
              {previoAbierto === idx && (
                <div className="pedidos__panel-previo-items">
                  {p.items.map(i => (
                    <div key={i.id} className="pedidos__panel-fila">
                      <span className="pedidos__panel-cant">{i.cantidad}×</span>
                      <span className="pedidos__panel-nombre">{i.nombre}</span>
                      <span className="pedidos__panel-precio">
                        ${(i.cantidad * i.precio).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Total general */}
        <div className="pedidos__panel-total">
          <span>TOTAL GENERAL</span>
          <span>${totalGeneral.toLocaleString()}</span>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      <main className="pedidos">
        {paso === 0 && <BackButton />}

        {/* ← MODO PRUEBA: cartel visible solo para vos, para no confundirte */}
        {modoPrueba && (
          <div style={{
            background: 'var(--orange)',
            color: '#fff',
            padding: '0.5rem 1rem',
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.05em',
            borderRadius: '6px',
            margin: '0 0 1rem'
          }}>
            ⚠️ MODO PRUEBA ACTIVO ⚠️
          </div>
        )}

        {/* ← AVISO DE ERRORES DE CATÁLOGO: solo visible en modo prueba,
             para que no confunda a las jugadoras pero vos lo veas al testear */}
        {modoPrueba && itemsConError.length > 0 && (
          <div style={{
            background: '#fff3f3',
            border: '2px solid #d33',
            color: '#a00',
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            margin: '0 0 1rem',
            fontSize: '0.9rem'
          }}>
            <strong>⚠️ {itemsConError.length} producto(s) con ERROR en el Sheet:</strong>
            <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
              {itemsConError.map(i => (
                <li key={i.id}>
                  <strong>{i.nombre}</strong> — {i.error === 'columna'
                    ? `la columna "${i.columna || '(vacía)'}" no existe en la hoja pedidos`
                    : 'le falta el precio'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* PASO 0 — VITRINA */}
        {paso === 0 && (
          <div className="pedidos__paso">
            <h1 className="pedidos__titulo">PEDIDOS</h1>
            <p className="pedidos__sub">Apoyá a las chicas comprando nuestros productos</p>

            {cargandoCatalogo && (
              <p className="pedidos__sub" style={{ textAlign: 'center' }}>Cargando productos...</p>
            )}
            {catalogoError && (
              <div className="pedidos__cerrado">
                <p className="pedidos__cerrado-texto">{catalogoError}</p>
              </div>
            )}

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
              {vitrinaVisible.map(item => (
                <div key={item.nombre} className="pedidos__vitrina-card" style={{ cursor: pedidosActivos ? 'pointer' : 'default' }} onClick={() => { if (pedidosActivos) handlePedir() }}>
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

        {/* PASO 1 — IDENTIFICACIÓN */}
        {paso === 1 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => setPaso(0)}>← Volver</button>
            </div>
            <h2 className="pedidos__titulo">¿Para quién es el pedido?</h2>
            <p className="pedidos__sub">Ingresá los datos para continuar</p>

            <div className="pedidos__cedula-wrap">
              <label className="pedidos__cedula-label">Cédula de la jugadora</label>
              <p className="pedidos__cedula-hint">Sin puntos ni guiones. Ej: 1.234.567-8 → 12345678</p>
              <input
                type="text"
                className={`pedidos__cedula-input ${cedulaError ? 'pedidos__cedula-input--error' : ''}`}
                placeholder="12345678"
                value={cedulaIngresada}
                onChange={(e) => { setCedulaIngresada(e.target.value); setCedulaError('') }}
                onKeyDown={(e) => e.key === 'Enter' && !verificando && validarCedulaYContinuar()}
              />
              {cedulaError && <p className="pedidos__cedula-error">{cedulaError}</p>}
            </div>

            <div className="pedidos__cedula-wrap" style={{ marginTop: '1.2rem' }}>
              <label className="pedidos__cedula-label">Tu nombre (quien hace el pedido)</label>
              <input
                type="text"
                className={`pedidos__cedula-input ${nombreError ? 'pedidos__cedula-input--error' : ''}`}
                placeholder="Ej: María González"
                value={nombreSolicitante}
                onChange={(e) => { setNombreSolicitante(e.target.value); setNombreError(false) }}
              />
              {nombreError && <p className="pedidos__cedula-error">❌ Ingresá tu nombre para continuar.</p>}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="pedidos__btn-pedir"
                disabled={!cedulaIngresada || !nombreSolicitante || verificando}
                onClick={validarCedulaYContinuar}
              >
                {verificando ? 'VERIFICANDO...' : 'CONTINUAR →'}
              </button>
            </div>
          </div>
        )}

        {/* PASO 3 — PRODUCTOS + PANEL LATERAL */}
        {paso === 3 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => setPaso(1)}>← Volver</button>
              <button className="pedidos__cancelar" onClick={() => setMostrarConfirmCancel(true)}>✕ Cancelar</button>
            </div>
            <h2 className="pedidos__titulo">Pedido para {jugadoraSeleccionada.nombre} {jugadoraSeleccionada.apellido}</h2>
            <p className="pedidos__sub">Seleccioná los productos</p>

            <div className="pedidos__layout">
              <div className="pedidos__layout-main">
                <div className="pedidos__productos">
                  {gruposCatalogo.map(g => (
                    <div key={g.grupo} className="pedidos__producto">
                      <button
                        className={`pedidos__producto-header ${productoAbierto === g.grupo ? 'pedidos__producto-header--activo' : ''}`}
                        onClick={() => setProductoAbierto(productoAbierto === g.grupo ? null : g.grupo)}>
                        <span>
                          {g.meta.img
                            ? <img src={g.meta.img} alt="" style={{ height: '1.2em', verticalAlign: '-0.2em', marginRight: '0.3em' }} />
                            : `${g.meta.emoji} `}
                          {g.meta.titulo || g.grupo}
                        </span>
                        <span>{productoAbierto === g.grupo ? '▲' : '▼'}</span>
                      </button>
                      {productoAbierto === g.grupo && (
                        <div className="pedidos__items">
                          {g.items.map(item => (
                            <div key={item.id} className="pedidos__item">
                              <div className="pedidos__item-info">
                                <span className="pedidos__item-nombre">{item.nombre}</span>
                                {item.precio > 0 && (
                                  <span className="pedidos__item-precio">
                                    ${item.precio}{item.unidad ? ` / ${item.unidad}` : ''}
                                  </span>
                                )}
                              </div>
                              <div className="pedidos__contador">
                                <button onClick={() => restar(item.columna)}>−</button>
                                <span>{cantidades[item.columna] || 0}</span>
                                <button onClick={() => sumar(item.columna)}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {panelPedidos}
            </div>

            <div className="pedidos__total-bar">
              <span>Total: <strong>${total.toLocaleString()}</strong></span>
              <button className="pedidos__btn-pedir" disabled={total === 0} onClick={() => setPaso(4)}>
                VER PEDIDO
              </button>
            </div>
          </div>
        )}

        {/* PASO 4 — RESUMEN + PANEL LATERAL */}
        {paso === 4 && (
          <div className="pedidos__paso">
            <div className="pedidos__nav">
              <button className="pedidos__volver" onClick={() => setPaso(3)}>← Volver</button>
              <button className="pedidos__cancelar" onClick={() => setMostrarConfirmCancel(true)}>✕ Cancelar</button>
            </div>
            <h2 className="pedidos__titulo">Resumen del pedido</h2>
            <p className="pedidos__sub">Pedido para <strong>{jugadoraSeleccionada.nombre} {jugadoraSeleccionada.apellido}</strong> — {categoriaSeleccionada}</p>

            <div className="pedidos__layout">
              <div className="pedidos__layout-main">
                <div className="pedidos__resumen">
                  {itemsConCantidad.map(item => (
                    <div key={item.id} className="pedidos__resumen-fila">
                      <span>{item.nombre}</span>
                      <span>{cantidades[item.columna]} x ${item.precio}</span>
                      <span>${(cantidades[item.columna] * item.precio).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pedidos__resumen-total">
                    <span>TOTAL</span><span></span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pedidos__resumen-btns">
                  <button className="pedidos__btn-secundario" onClick={() => setPaso(3)}>← Seguir comprando</button>
                  <button className="pedidos__btn-pedir" onClick={confirmarPedido} disabled={guardando}>
                    {guardando ? 'GUARDANDO...' : 'CONFIRMAR PEDIDO ✓'}
                  </button>
                </div>
              </div>

              {panelPedidos}
            </div>
          </div>
        )}

        {/* PASO 5 — CONFIRMADO */}
        {paso === 5 && (
          <div className="pedidos__paso pedidos__confirmado">
            <div className="pedidos__confirmado-card">
              <span className="pedidos__confirmado-icon">✅</span>
              <h2>¡Pedido confirmado!</h2>
              <p>Gracias por tu compra</p>
              <p>No olvides mandar el comprobante a:</p>
              <p className="pedidos__telefono">📱 +598 99 027 944 — Leo Parrilla</p>
              <button className="pedidos__btn-pedir" onClick={cancelar}>HACER OTRO PEDIDO</button>
            </div>
          </div>
        )}

        {/* MODAL CANCELAR */}
        {mostrarConfirmCancel && (
          <div className="pedidos__modal-overlay">
            <div className="pedidos__modal">
              <p className="pedidos__modal-texto">¿Seguro que querés cancelar el pedido?</p>
              <div className="pedidos__modal-btns">
                <button className="pedidos__btn-secundario" onClick={() => setMostrarConfirmCancel(false)}>Seguir comprando</button>
                <button className="pedidos__cancelar" onClick={cancelar}>✕ Cancelar pedido</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <PageFooter />
    </>
  )
}