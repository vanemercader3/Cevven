import './landing.css'

export default function Landing() {
  return (
    <div className="landing">
      <img src="/logo.png" alt="CEVVEN Handball" className="landing__logo" />
      <div className="landing__btns">
        <button className="landing__btn landing__btn--beach">BEACH</button>
        <a href="/home" className="landing__btn landing__btn--indoor">INDOOR</a>
        <button className="landing__btn landing__btn--fitness">FITNESS</button>
      </div>
    </div>
  )
}