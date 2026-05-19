import './noticias.css'
import PageFooter from '../../components/pageFooter/pageFooter'

const noticias = [
  {
    titulo: 'Título de la noticia 1',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
  {
    titulo: 'Título de la noticia 2',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
  {
    titulo: 'Título de la noticia 3',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
  {
    titulo: 'Título de la noticia 4',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
  {
    titulo: 'Título de la noticia 5',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
  {
    titulo: 'Título de la noticia 6',
    resumen: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore...',
    url: '#'
  },
]

export default function Noticias() {
  return (
    <>
      <main className="noticias">
        <h1 className="noticias__titulo">NOTICIAS</h1>
        <div className="noticias__grid">
          {noticias.map((n, i) => (
            <div key={i} className="noticias__card">
              <h2 className="noticias__card-titulo">{n.titulo}</h2>
              <p className="noticias__card-resumen">{n.resumen}</p>
              <a href={n.url} className="noticias__card-link">MÁS ›</a>
            </div>
          ))}
        </div>
      </main>
      <PageFooter />
    </>
  )
}