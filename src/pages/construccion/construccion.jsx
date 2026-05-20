import { useNavigate } from 'react-router-dom'
import './construccion.css'

export default function Construccion() {
  const navigate = useNavigate()
  return (
    <div className="construccion">
      <div className="construccion__card">
        <span className="construccion__icon">🚧</span>
        <h1 className="construccion__titulo">EN CONSTRUCCIÓN</h1>
        <p className="construccion__sub">Próximamente disponible</p>
        <button className="construccion__btn" onClick={() => navigate('/')}>
          ← Volver
        </button>
      </div>
    </div>
  )
}