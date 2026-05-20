import './landing.css'

export default function Landing() {
  return (
    <div className="landing">
      <img src="/logo.png" alt="CEVVEN Handball" className="landing__logo" />
      <div className="landing__btns">
        <a href="/construccion" className="landing__btn landing__btn--beach">
          <img src="/landing/beach.png" alt="Beach" className="landing__btn-img" />
          <span className="landing__btn-label">BEACH</span>
        </a>
        <a href="/home" className="landing__btn landing__btn--indoor">
          <img src="/landing/indoor.png" alt="Indoor" className="landing__btn-img" />
          <span className="landing__btn-label">INDOOR</span>
        </a>
        <a href="/construccion" className="landing__btn landing__btn--fitness">
          <img src="/landing/fitness.png" alt="Fitness" className="landing__btn-img" />
          <span className="landing__btn-label">FITNESS<br/>Y ALTO RENDIMIENTO</span>
        </a>
      </div>
    </div>
  )
}