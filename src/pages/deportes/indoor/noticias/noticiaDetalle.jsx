import { useParams, useNavigate } from 'react-router-dom'
import { noticias } from './noticias'
import './noticiaDetalle.css'
import PageFooter from '../../../../components/pageFooter/pageFooter'
import BackButton from '../../../../components/backButton/backButton'

export default function NoticiaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const noticia = noticias.find(n => n.id === parseInt(id))

  if (!noticia) {
    return (
      <>
        <main className="noticia-detalle">
          <BackButton />
          <p>Noticia no encontrada.</p>
        </main>
        <PageFooter />
      </>
    )
  }

  return (
    <>
      <main className="noticia-detalle">
        <BackButton />
        {noticia.foto && (
          <img
            src={noticia.foto}
            alt={noticia.titulo}
            className="noticia-detalle__foto"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="noticia-detalle__contenido">
          <h1 className="noticia-detalle__titulo">{noticia.titulo}</h1>
          <div className="noticia-detalle__texto">
            {noticia.texto.split('\n\n').map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
          </div>
          <button className="noticia-detalle__volver" onClick={() => navigate('/noticias')}>
            ← Volver a noticias
          </button>
        </div>
      </main>
      <PageFooter />
    </>
  )
}