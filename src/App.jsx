import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar/navbar'
import Home from './pages/home/home'
import Nosotros from './pages/nosotros/nosotros'
import Noticias from './pages/noticias/noticias'
import Indumentaria from './pages/indumentaria/indumentaria'
import Contacto from './pages/contacto/contacto'
import Partidos from './pages/partidos/partidos'
import Pedidos from './pages/pedidos/pedidos'
import Categoria from './pages/categoria/categoria'
import Landing from './pages/landing/landing'
import Documentos from './pages/documentos/documentos'


function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/nosotros" element={<Layout><Nosotros /></Layout>} />
        <Route path="/noticias" element={<Layout><Noticias /></Layout>} />
        <Route path="/indumentaria" element={<Layout><Indumentaria /></Layout>} />
        <Route path="/contacto" element={<Layout><Contacto /></Layout>} />
        <Route path="/partidos" element={<Layout><Partidos /></Layout>} />
        <Route path="/pedidos" element={<Layout><Pedidos /></Layout>} />
        <Route path="/categoria/:cat" element={<Layout><Categoria /></Layout>} />
        <Route path="/documentos/:cat/:nombre" element={<Layout><Documentos /></Layout>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App