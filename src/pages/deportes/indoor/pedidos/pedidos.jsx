import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'   // ← MODO PRUEBA
import './pedidos.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
import emailjs from '@emailjs/browser'
// import { useAuth } from '../../context/AuthContext'   // ← desactivado: antes se usaba para login con Google
// import { loginConGoogle } from '../../firebase'       // ← desactivado: antes se usaba para login con Google

const JUGADORAS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=1550165418&single=true&output=csv'
const PEDIDOS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwJTCQcNDqKRyeKdwLZdk1UXjYimsL9y9ASH9sxowzkQs0A2ARu9kRDkDL82MGx9_Im5ewuGW_MjRO/pub?gid=327502795&single=true&output=csv'
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

const categorias = ['Infantiles', 'U13', 'U14', 'U15', 'U16', 'U18', 'U21', 'Senior', 'Inter Masc', 'Plus 35', 'Entrenadores']

const vitrina = [
  { id: 'pasta',      nombre: 'Pasta',             imagen: '/pedidos/pasta.jpg',            descripcion: 'Tallarines, ñoquis, ravioles y más' },
  { id: 'empanadas',  nombre: 'Empanadas',          imagen: '/pedidos/empanadas.jpg',        descripcion: 'Distintos rellenos' },
  { id: 'pizzas',     nombre: 'Pizzas',             imagen: '/pedidos/pizza.jpg',            descripcion: 'Caja de 2 unidades' },
  { id: 'alfajores',  nombre: 'Alfajores Neg.',     imagen: '/pedidos/alfa-choco-negro.jpg', descripcion: 'Caja x10 chocolate negro' },
  { id: 'alfajores2', nombre: 'Alfajores Blan.',    imagen: '/pedidos/alfa-choco-blanco.jpg',descripcion: 'Caja x10 chocolate blanco' },
  { id: 'vinos',      nombre: 'Vinos',              imagen: '/pedidos/vino.jpg',             descripcion: 'Pack x2 unidades' },
  { id: 'pollo',      nombre: 'Pollo al Spiedo',    imagen: '/pedidos/pollo-spiedo.jpg',     descripcion: 'Pollo al Spiedo' },
  { id: 'milanesa',   nombre: 'Milanesa de Pollo',  imagen: '/pedidos/mila-pollo.jpg',       descripcion: 'Milanesa de Pollo' },
  { id: 'barritas',     nombre: 'Barritas',       imagen: '/pedidos/barritas.jpg',      descripcion: 'Caja surtida o mismo gusto x12 unidades' },
  { id: 'boxcafeteria', nombre: 'Box Cafetería',   imagen: '/pedidos/box-cafeteria.jpg', descripcion: 'Medialunas, Rolls de Canela y Cookies' },
]

const productos = [
  {
    id: 'pasta', nombre: 'Pasta', emoji: '🍝',
    items: [
      { id: 'queso_rallF', nombre: 'Queso Rallado Artesano Fino',     precio: 190, unidad: '150gr' },
      { id: 'queso_rallG', nombre: 'Queso Rallado Artesano Grueso',     precio: 190, unidad: '150gr' },
      { id: 'tal_esp',    nombre: 'Tallarines Espinaca ', precio: 295, unidad: '1 kg' },
      { id: 'tal_yema',   nombre: 'Tallarines Yema ',       precio: 295, unidad: '1 kg' },
      { id: 'noquis',     nombre: 'Ñoquis',                      precio: 295, unidad: '1 kg' },
      { id: 'rav_verd',   nombre: 'Ravioles Verdura (150 unid.)',   precio: 350, unidad: 'pack' },
      { id: 'rav_jq',     nombre: 'Ravioles J&Q (150 unid.)',      precio: 350, unidad: 'pack' },
      { id: 'rav_ric',    nombre: 'Ravioles Ricotta (150 unid.)',   precio: 350, unidad: 'pack' },
    ]
  },
  {
    id: 'empanadas', nombre: 'Empanadas', emoji: '🥟',
    items: [
      { id: 'emp_carne_ac',  nombre: 'Emp. Carne con Aceitunas (Cod. 101)',    precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_carne_sin', nombre: 'Emp. Carne sin Aceitunas (Cod. 104)',    precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_chil',      nombre: 'Emp. Chilena (Cod. 106)',                precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_pollo',     nombre: 'Emp. Pollo (Cod. 110)',                  precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_polloch',   nombre: 'Emp. Pollo con Champi (Cod. 111)',       precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_jyq',       nombre: 'Emp. Jamón y Queso (Cod. 113)',          precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_qya',       nombre: 'Emp. Queso y Aceitunas (Cod. 116)',      precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_int',       nombre: 'Emp. Integral (Cod. 117)',               precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_qyc',       nombre: 'Emp. Queso y Cebolla (Cod. 118)',        precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_pyc',       nombre: 'Emp. Panceta, Puerro y Queso (Cod. 120)',precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_4q',        nombre: 'Emp. Cuatro Quesos (Cod. 122)',          precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_cap',       nombre: 'Emp. Capresse (Cod. 123)',               precio: 450, unidad: 'x5 unid.' },
      { id: 'emp_esp',       nombre: 'Emp. Espinaca (Cod. 127)',               precio: 450, unidad: 'x5 unid.' },
    ]
  },
  {
    id: 'pizzas', nombre: 'Pizzas', emoji: '🍕',
    items: [
      { id: 'pizza', nombre: 'Pizza con Muzzarella (x2 unid.)', precio: 550, unidad: '' },
    ]
  },
  {
    id: 'alfajores', nombre: 'Alfajores', emoji: '🍫',
    items: [
      { id: 'alf_neg',   nombre: 'Chocolate Negro (x10)',  precio: 550, unidad: 'caja' },
      { id: 'alf_blanc', nombre: 'Chocolate Blanco (x10)', precio: 550, unidad: 'caja' },
      { id: 'alf_mixto', nombre: 'Caja Mixta (x10)', precio: 550, unidad: 'caja' },
    ]
  },
  {
    id: 'vinos', nombre: 'Vinos', emoji: '🍷',
    items: [
      { id: 'pack_vinovino', nombre: 'Pack Vino & Vino',       precio: 390, unidad: 'pack' },
      { id: 'pack_vinograpa', nombre: 'Pack Vino & Grapamiel', precio: 390, unidad: 'pack' },
    ]
  },
  {
    id: 'pollo', nombre: 'Pollo al Spiedo', emoji: '🍗',
    items: [
      { id: 'pollo_sp', nombre: 'Pollo al Spiedo', precio: 690, unidad: 'unid.' },
    ]
  },
  {
    id: 'milanesa', nombre: 'Milanesa de Pollo', emoji: '🍖',
    items: [
      { id: 'mila_pollo', nombre: 'Milanesa de Pollo', precio: 550, unidad: '1 kg.' },
    ]
  },
  {
    id: 'barritas', nombre: 'Barritas', emoji: '🍫',
    items: [
      { id: 'barr_mixta',    nombre: 'Barritas Mixtas (4 Choco y Naranja, 2 Frutos Rojos, 2 Brownie, 2 Arándanos, 2 Coco)',             precio: 550, unidad: 'caja' },
      { id: 'barr_narchoco', nombre: 'Barritas Naranja y Chocolate x12 unid.', precio: 550, unidad: 'caja' },
      { id: 'barr_frutos',   nombre: 'Barritas Frutos Rojos x12 unid.',       precio: 550, unidad: 'caja' },
      { id: 'barr_brownie',  nombre: 'Barritas Brownie x12 unid.',            precio: 550, unidad: 'caja' },
      { id: 'barr_arandano', nombre: 'Barritas Arándanos x12 unid.',          precio: 550, unidad: 'caja' },
      { id: 'barr_coco',     nombre: 'Barritas Coco x12 unid.',               precio: 550, unidad: 'caja' },
      { id: 'barr_menta',    nombre: 'Barritas Menta x12 unid.',              precio: 550, unidad: 'caja' },
    ]
  },
  {
    id: 'boxcafeteria', nombre: 'Box Cafetería', emoji: '🍪',
    items: [
      { id: 'box_cafe', nombre: 'Box Cafetería (2 medialunas, 2 rolls de canela, 4 cookies)', precio: 550, unidad: 'box' },
    ]
  },
]


const MAPA_COLUMNAS = {
  tal_esp:       'Tallarines Espinaca',
  tal_yema:      'Tallarines Yema',
  noquis:        'Ñoquis',
  rav_verd:      'Ravioles Verdura',
  rav_jq:        'Ravioles J&Q',
  rav_ric:       'Ravioles Ricotta',
  emp_carne_ac:  'Emp Carne con Aceitunas (cod 101)',
  emp_carne_sin: 'Emp Carne sin Aceituna (cod 104)',
  emp_pollo:     'Emp Pollo (cod 110)',
  emp_qyc:       'Emp Queso y Cebolla (cod 118)',
  emp_4q:        'Emp Cuatro Quesos (cod 122)',
  emp_cap:       'Emp Capresse (cod 123)',
  emp_esp:       'Emp Espinaca (cod 127)',
  emp_qya:       'Emp Queso y Aceituna (cod 116)',
  emp_jyq:       'Emp Jamon y Queso (cod 113)',
  emp_pyc:       'Emp Panceta Puerro y Queso (cod 120)',
  emp_polloch:   'Emp Pollo con Champi (cod 111)',
  emp_int:       'Emp Integral (cod 117)',
  emp_chil:      'Emp Chilena',
  pizza:         'Pizzas',
  alf_neg:       'Alf Chocolate Negro',
  alf_blanc:     'Alf Chocolate Blanco',
  alf_mixto:     'Alf Mixtos',
  pack_vinovino: 'Pack Vino & Vino',
  pack_vinograpa:'Pack Vino & Grapamiel',
  pollo_sp:      'Pollo al Spiedo',
  mila_pollo:    'Milanesa de Pollo',
  barr_mixta:    'Barritas Mixtas',
  barr_narchoco: 'Barritas Naranja y Chocolate',
  barr_frutos:   'Barritas Frutos Rojos',
  barr_brownie:  'Barritas Brownie',
  barr_arandano: 'Barritas Arándanos',
  barr_coco:     'Barritas Coco',
  barr_menta:    'Barritas Menta',
  box_cafe:      'Box Cafeteria',
  queso_rallG:   'Queso Rayado Artesano Grueso',
  queso_rallF:   'Queso Rayado Artesano Fino',
}

// Lista plana: { columna, nombre, precio }
const TODOS_LOS_ITEMS = productos.flatMap(p => p.items)
const CATALOGO = Object.entries(MAPA_COLUMNAS).map(([id, columna]) => {
  const item = TODOS_LOS_ITEMS.find(i => i.id === id)
  return { id, columna, nombre: item?.nombre?.trim() || columna, precio: item?.precio || 0 }
})

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
  if (filas.length === 0) return []

  const headers = filas[0].map(h => h.trim())
  return filas.slice(1).map(f => {
    const obj = {}
    headers.forEach((h, i) => obj[h] = (f[i] || '').trim())
    return obj
  })
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
  const [jugadoras, setJugadoras] = useState([])
  // const [jugadorasDelUsuario, setJugadorasDelUsuario] = useState([])   // ← desactivado
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
  // const [mailLogueado, setMailLogueado] = useState(null)   // ← desactivado
  const [nombreSolicitante, setNombreSolicitante] = useState('')
  const [nombreError, setNombreError] = useState(false)

  /* ── HISTORIAL DE PEDIDOS (solo lectura, panel lateral) ── */
  const [historial, setHistorial] = useState([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [historialError, setHistorialError] = useState('')
  const [panelAbierto, setPanelAbierto] = useState(false)      // toggle en mobile
  const [previoAbierto, setPrevioAbierto] = useState(null)     // índice del pedido anterior expandido

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
        // ← MODO PRUEBA: si viene la clave en la URL, se ignora el rango de fechas
        setPedidosActivos(modoPrueba || (hoy >= dateInicio && hoy <= dateFin))
      })
  }, [modoPrueba])

  // ← desactivado: este useEffect buscaba las jugadoras asociadas al mail del usuario logueado

  const cancelar = () => {
    setMostrarConfirmCancel(false)
    setPaso(0)
    setCategoriaSeleccionada(null)
    setJugadoraSeleccionada(null)
    // setJugadorasDelUsuario([])   // ← desactivado
    setCantidades({})
    setProductoAbierto(null)
    setCedulaIngresada('')
    setCedulaError(false)
    setNombreSolicitante('')
    setNombreError(false)
    setHistorial([])
    setHistorialError('')
    setPanelAbierto(false)
    setPrevioAbierto(null)
  }

  // ← desactivado: jugadorasFiltradas se usaba en el paso 2

  const sumar = (id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const restar = (id) => setCantidades(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }))

  const itemsConCantidad = productos.flatMap(p => p.items).filter(i => cantidades[i.id] > 0)
  const total = itemsConCantidad.reduce((acc, i) => acc + i.precio * cantidades[i.id], 0)

  /* ── Carga el historial de una jugadora desde la hoja "pedidos" ── */
  const cargarHistorial = async (jugadora) => {
    if (!jugadora) return
    setCargandoHistorial(true)
    setHistorialError('')
    setHistorial([])
    try {
      const res = await fetch(PEDIDOS_URL)
      const texto = await res.text()
      const filas = parsearCSVSeguro(texto)

      const nombreCompleto = normalizar(`${jugadora.nombre} ${jugadora.apellido}`)
      const propios = filas.filter(f => normalizar(f.jugadora) === nombreCompleto)

      const armados = propios.map(f => {
        const items = CATALOGO
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

  const confirmarPedido = async () => {
    setGuardando(true)
    const fecha = new Date().toLocaleDateString('es-UY')
    const fila = {
      fecha,
      categoria: categoriaSeleccionada,
      jugadora: `${jugadoraSeleccionada.nombre} ${jugadoraSeleccionada.apellido}`,
      'Tallarines Espinaca': cantidades['tal_esp'] || 0,
      'Tallarines Yema': cantidades['tal_yema'] || 0,
      'Ñoquis': cantidades['noquis'] || 0,
      'Ravioles Verdura': cantidades['rav_verd'] || 0,
      'Ravioles J&Q': cantidades['rav_jq'] || 0,
      'Ravioles Ricotta': cantidades['rav_ric'] || 0,
      'Emp Carne con Aceitunas (cod 101)': cantidades['emp_carne_ac'] || 0,
      'Emp Carne sin Aceituna (cod 104)': cantidades['emp_carne_sin'] || 0,
      'Emp Pollo (cod 110)': cantidades['emp_pollo'] || 0,
      'Emp Queso y Cebolla (cod 118)': cantidades['emp_qyc'] || 0,
      'Emp Cuatro Quesos (cod 122)': cantidades['emp_4q'] || 0,
      'Emp Capresse (cod 123)': cantidades['emp_cap'] || 0,
      'Emp Espinaca (cod 127)': cantidades['emp_esp'] || 0,
      'Emp Queso y Aceituna (cod 116)': cantidades['emp_qya'] || 0,
      'Emp Jamon y Queso (cod 113)': cantidades['emp_jyq'] || 0,
      'Emp Panceta Puerro y Queso (cod 120)': cantidades['emp_pyc'] || 0,
      'Emp Pollo con Champi (cod 111)': cantidades['emp_polloch'] || 0,
      'Emp Integral (cod 117)': cantidades['emp_int'] || 0,
      'Emp Chilena': cantidades['emp_chil'] || 0,
      'Pizzas': cantidades['pizza'] || 0,
      'Alf Chocolate Negro': cantidades['alf_neg'] || 0,
      'Alf Chocolate Blanco': cantidades['alf_blanc'] || 0,
      'Alf Mixtos': cantidades['alf_mixto'] || 0,
      'Pack Vino & Vino': cantidades['pack_vinovino'] || 0,
      'Pack Vino & Grapamiel': cantidades['pack_vinograpa'] || 0,
      'Pollo al Spiedo': cantidades['pollo_sp'] || 0,
      'Milanesa de Pollo': cantidades['mila_pollo'] || 0,
      'Barritas Mixtas': cantidades['barr_mixta'] || 0,
      'Barritas Naranja y Chocolate': cantidades['barr_narchoco'] || 0,
      'Barritas Frutos Rojos': cantidades['barr_frutos'] || 0,
      'Barritas Brownie': cantidades['barr_brownie'] || 0,
      'Barritas Arándanos': cantidades['barr_arandano'] || 0,
      'Barritas Coco': cantidades['barr_coco'] || 0,
      'Barritas Menta': cantidades['barr_menta'] || 0,
      'Box Cafeteria': cantidades['box_cafe'] || 0,
      'Queso Rayado Artesano Grueso': cantidades['queso_rallG'] || 0,
      'Queso Rayado Artesano Fino': cantidades['queso_rallF'] || 0,
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
                  <span className="pedidos__panel-cant">{cantidades[item.id]}×</span>
                  <span className="pedidos__panel-nombre">{item.nombre}</span>
                  <span className="pedidos__panel-precio">
                    ${(cantidades[item.id] * item.precio).toLocaleString()}
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
                <div key={item.id} className="pedidos__vitrina-card" style={{ cursor: pedidosActivos ? 'pointer' : 'default' }} onClick={() => { if (pedidosActivos) handlePedir() }}>
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
                onChange={(e) => { setCedulaIngresada(e.target.value); setCedulaError(false) }}
              />
              {cedulaError && <p className="pedidos__cedula-error">❌ No encontramos una jugadora con esa cédula.</p>}
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
                disabled={!cedulaIngresada || !nombreSolicitante}
                onClick={() => {
                  const cedulaLimpia = cedulaIngresada.replace(/[.\-\s]/g, '').trim()
                  const jugadora = jugadoras.find(j =>
                    j.cedula?.replace(/[.\-\s]/g, '').trim() === cedulaLimpia &&
                    j.posicion?.toUpperCase().trim() !== 'ENTRENADOR'
                  )
                  if (!jugadora) {
                    setCedulaError(true)
                    return
                  }
                  if (!nombreSolicitante.trim()) {
                    setNombreError(true)
                    return
                  }
                  setJugadoraSeleccionada(jugadora)
                  setCategoriaSeleccionada(jugadora.categoria?.trim())
                  cargarHistorial(jugadora)   // ← trae los pedidos anteriores para el panel lateral
                  setPaso(3)
                }}
              >
                CONTINUAR →
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
                  {productos.map(p => (
                    <div key={p.id} className="pedidos__producto">
                      <button
                        className={`pedidos__producto-header ${productoAbierto === p.id ? 'pedidos__producto-header--activo' : ''}`}
                        onClick={() => setProductoAbierto(productoAbierto === p.id ? null : p.id)}>
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
                      <span>{cantidades[item.id]} x ${item.precio}</span>
                      <span>${(cantidades[item.id] * item.precio).toLocaleString()}</span>
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