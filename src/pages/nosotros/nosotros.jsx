import './nosotros.css'
import PageFooter from '../../components/pageFooter/pageFooter'
import BackButton from '../../components/backButton/backButton'

export default function Nosotros() {
  return (
    <>
      <main className="nosotros">
        <BackButton />
        <h1 className="nosotros__titulo">¿Quiénes Somos?</h1>
        <p className="nosotros__texto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure 
          dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </main>
      <PageFooter />
    </>
  )
}