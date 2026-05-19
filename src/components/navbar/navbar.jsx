import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import './navbar.css'

const categorias = [
  { nombre: 'Sub 13',              url: '/categoria/U13' },
  { nombre: 'Sub 14',              url: '/categoria/U14' },
  { nombre: 'Sub 15',              url: '/categoria/U15' },
  { nombre: 'Sub 16',              url: '/categoria/U16' },
  { nombre: 'Sub 18',              url: '/categoria/U18' },
  { nombre: 'Sub 21',              url: '/categoria/U21' },
  { nombre: 'Senior Femenino',     url: '/categoria/Senior' },
  { nombre: 'Intermedia Masculino',url: '/categoria/Inter Masc' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar__deco-orange" />
      <div className="navbar__deco-teal" />
      <div className="navbar__deco-center1" />
      <div className="navbar__deco-center2" />
      <div className="navbar__deco-center3" />
      <div className="navbar__deco-center4" />

      <div className="navbar__logo">
        <a href="/"><img src="/logo.png" alt="CEVVEN Handball" /></a>
      </div>

      <button className="navbar__burger" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
        <li><a href="/nosotros">Nosotros</a></li>
        <li><a href="/noticias">Noticias</a></li>
        <li
          className="navbar__dropdown"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <a href="#">Categorías <ChevronDown size={14} /></a>
          {dropdownOpen && (
            <ul className="navbar__submenu">
              {categorias.map((cat, i) => (
                <li key={i}>
                  <a href={cat.url}>{cat.nombre}</a>
                </li>
              ))}
            </ul>
          )}
        </li>
        <li><a href="/indumentaria">Indumentaria</a></li>
        <li><a href="/pedidos">Pedidos</a></li>
        <li><a href="/contacto">Contacto</a></li>
      </ul>


      <div className="navbar__social">
  <a href="https://www.youtube.com/@MundoCevven" target="_blank" rel="noopener noreferrer" className="navbar__social-link">
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
    </svg>
  </a>
  <a href="https://www.instagram.com/cevvenhandballoficial/" target="_blank" rel="noopener noreferrer" className="navbar__social-link">
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/>
    </svg>
  </a>
  <a href="https://www.facebook.com/cevvenhandball" target="_blank" rel="noopener noreferrer" className="navbar__social-link">
    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
      <path d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.3h3.4l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.1z"/>
    </svg>
  </a>
</div>

<a href="https://www.youtube.com/@MundoCevven" target="_blank" rel="noopener noreferrer" className="navbar__live">EN VIVO</a>        </nav>
  )
}