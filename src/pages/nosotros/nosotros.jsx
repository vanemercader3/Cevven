import './nosotros.css'
import PageFooter from '../../components/pageFooter/pageFooter'
import BackButton from '../../components/backButton/backButton'

export default function Nosotros() {
  return (
    <>
      <main className="nosotros">
        <BackButton />

        <div className="nosotros__hero">
          <img src="/home/hero2.png" alt="CEVVEN Handball" className="nosotros__hero-img" />
          <div className="nosotros__hero-overlay">
            <h1 className="nosotros__titulo">Bienvenidos a la familia de CEVVEN</h1>
          </div>
        </div>

        <div className="nosotros__contenido">
          <p className="nosotros__texto">
            En el Centro de Viajantes y Vendedores de Plaza (CEVVEN), entendemos que elegir el lugar donde tus hijos van a crecer, jugar y formarse es una decisión importante. Por eso, en nuestro club de handball no solo entrenamos deportistas; construimos un segundo hogar.
          </p>
          <p className="nosotros__texto">
            Aquí, el handball es la excusa perfecta para que tu hijo o hija descubra el verdadero valor del trabajo en equipo, la superación personal y la amistad. Nos apasiona ver cómo cada niño y joven que cruza nuestras puertas gana confianza en sí mismo, se mantiene activo y, sobre todo, se divierte en un entorno seguro, sano y profundamente familiar.
          </p>
          <p className="nosotros__texto">
            <strong>¿Por qué elegirnos?</strong> Porque en CEVVEN combinamos la exigencia sana del deporte con la calidez de una comunidad que acompaña cada paso, cada gol y cada aprendizaje de nuestros gurises.
          </p>
          <p className="nosotros__texto">
            No importa si nunca han tocado una pelota o si ya sueñan con la selección; en CEVVEN hay un lugar pensado exclusivamente para ellos.
          </p>
          <p className="nosotros__texto nosotros__texto--cierre">
            ¡Sumate a nuestra camiseta y vení a compartir la pasión del handball con nosotros!
          </p>

          <a href="/contacto" className="nosotros__btn">
            Agendá una clase
          </a>
        </div>

      </main>
      <PageFooter />
    </>
  )
}