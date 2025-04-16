import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Layout from './components/Layout'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/junta',
    element: <Layout />,
    children: [
      {
        path: 'facturas',
        element: <div>Facturas Page</div>
      },
      {
        path: 'autorizaciones',
        element: <div>Autorizaciones Page</div>
      },
      {
        path: 'usuarios',
        element: <div>Usuarios Page</div>
      },
      {
        path: 'sucursales',
        element: <div>Sucursales Page</div>
      },
      {
        path: 'mediciones',
        element: <div>Mediciones Page</div>
      },
      {
        path: 'perfil',
        element: <div>Perfil Page</div>
      },
      {
        
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
