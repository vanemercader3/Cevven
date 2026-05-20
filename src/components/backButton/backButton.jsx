import { useNavigate } from 'react-router-dom'
import './backButton.css'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button className="back-btn" onClick={() => navigate('/home')}>
      ← Inicio
    </button>
  )
}