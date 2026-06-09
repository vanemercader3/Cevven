import { useState } from 'react'
import emailjs from '@emailjs/browser'
import './contacto.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'
import { Mail, Phone, MapPin } from 'lucide-react'

const SERVICE_ID = 'service_eus8zan'
const TEMPLATE_ID = 'template_dxearl3'
const PUBLIC_KEY = '6mltD84C_kgv-YML0'

export default function Contacto() {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleEnviar = async () => {
    if (!form.nombre || !form.email || !form.asunto) {
      alert('Por favor completá nombre, email y asunto')
      return
    }

    setEnviando(true)
    setError(false)

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: form.nombre,
        from_email: form.email,
        subject: form.asunto,
        message: form.mensaje || '(sin mensaje)',
      }, PUBLIC_KEY)

      setEnviado(true)
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' })
    } catch (err) {
      console.error(err)
      setError(true)
    }

    setEnviando(false)
  }

  return (
    <>
      <main className="contacto">
        <BackButton />
        <div className="contacto__izq">
          <h1 className="contacto__titulo">CONTACTO</h1>
          <p className="contacto__sub">¿En qué te podemos ayudar?</p>

          <div className="contacto__datos">
            <div className="contacto__dato">
              <MapPin size={20} />
              <div>
                <strong>CEVVEN Handball</strong>
                <p>Daniel Fernández Crespo 1950, Mdeo. UY</p>
              </div>
            </div>
            <div className="contacto__dato">
              <Phone size={20} />
              <div>
                <strong>Teléfono</strong>
                <p>099 027 944</p>
              </div>
            </div>
            <div className="contacto__dato">
              <Mail size={20} />
              <div>
                <strong>Email</strong>
                <p>contacto@cevven.com</p>
              </div>
            </div>
          </div>

          <div className="contacto__redes">
            <a href="https://www.youtube.com/@MundoCevven" target="_blank" rel="noopener noreferrer" className="contacto__red">YouTube</a>
            <a href="https://www.instagram.com/cevvenhandballoficial/" target="_blank" rel="noopener noreferrer" className="contacto__red">Instagram</a>
            <a href="https://www.facebook.com/cevvenhandball" target="_blank" rel="noopener noreferrer" className="contacto__red">Facebook</a>
          </div>
        </div>

        <div className="contacto__der">
          {enviado ? (
            <div className="contacto__enviado">
              <span>✅</span>
              <h2>¡Mensaje enviado!</h2>
              <p>Te responderemos a la brevedad.</p>
              <button className="contacto__btn" onClick={() => setEnviado(false)}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <div className="contacto__form-card">
              <div className="contacto__campo">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="contacto__campo">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="contacto__campo">
                <label>Asunto</label>
                <input
                  type="text"
                  name="asunto"
                  placeholder="¿Sobre qué nos escribís?"
                  value={form.asunto}
                  onChange={handleChange}
                />
              </div>
              <div className="contacto__campo">
                <label>Mensaje (opcional)</label>
                <textarea
                  name="mensaje"
                  placeholder="Tu mensaje..."
                  rows={6}
                  value={form.mensaje}
                  onChange={handleChange}
                />
              </div>
              {error && (
                <p className="contacto__error">Hubo un error al enviar. Intentá de nuevo.</p>
              )}
              <button
                className="contacto__btn"
                onClick={handleEnviar}
                disabled={enviando}
              >
                {enviando ? 'ENVIANDO...' : 'ENVIAR'}
              </button>
            </div>
          )}
        </div>
      </main>
      <PageFooter />
    </>
  )
}