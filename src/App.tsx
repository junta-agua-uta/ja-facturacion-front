import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <>
    <h1>Hola Mundo</h1>
    <img src="/iconos_layout/autorizaciones.svg" alt="icono de autorizaciones" />
    <Link to="/junta/facturas">Ingresar</Link>
    </>
  )
}

export default App
