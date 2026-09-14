import { useState } from 'react'
import { Menu, X, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../navbar/navbar.css'

const links = [
  { nombre: 'Nosotros',    url: '/fitness/nosotros' },
  { nombre: 'Noticias',    url: '/fitness/noticias' },
  { nombre: 'Actividades', url: '/fitness/actividades' },
  { nombre: 'Tienda',      url: '/fitness/tienda' },
  { nombre: 'Unite',       url: '/fitness/unite' },
  { nombre: 'Contacto',    url: '/fitness/contacto' },
]

export default function NavbarFitness() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/"><img src="/cevven-fitydep.png" alt="CEVVEN Fitness" /></Link>
      </div>

      <button className="navbar__burger" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.url} onClick={() => setOpen(false)}>{l.nombre}</Link>
          </li>
        ))}
      </ul>

      <div className="navbar__right">
        <div className="navbar__social">
          {/* Instagram → perfil de Cevven Fitness */}
          <a href="https://www.instagram.com/cevven_fitness/" target="_blank" rel="noopener noreferrer" className="navbar__social-link" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3c1.2-.1 1.6-.1 4.8-.1zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>
          </a>
          {/* WhatsApp → abre la página de contacto */}
          <Link to="/fitness/contacto" className="navbar__social-link" aria-label="Contacto">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
          </Link>
        </div>

        {/* Usuario → placeholder, todavía no hace nada */}
        <div className="navbar__user">
          <button className="navbar__user-btn" type="button" aria-label="Usuario">
            <User size={22} />
          </button>
        </div>
      </div>
    </nav>
  )
}