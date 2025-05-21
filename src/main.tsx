import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from './core/Layout.tsx'
import Login from './auth/Login.tsx'
import { createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom'
import Facturacion from './facturacion/pages/Facturacion.tsx'
import AgregarFacturas from './facturacion/pages/AgregarFacturas.tsx'
import BranchesPage from './sucursales/pages/BranchesPage.tsx'
import MedicionesPage from './medicion/pages/MedicionPage.tsx'
import ClientesPage from './Clientes/pages/ClientesPage.tsx'
import ProtectedRoute from './core/ProtectedRoute.tsx'
import Profile from './profile/Profile.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    // Ruta protegida que verifica autenticación
    path: '/junta',
    element: <ProtectedRoute />,
    children: [
      {
        // Layout se renderiza solo si el usuario está autenticado
        element: <Layout />,
        children: [
          {
            path: '',
            element: <Navigate to="facturas" replace />
          },
          {
            path: 'facturas',
            children: [
              {
                path: '',
                element: <Facturacion />
              },
              {
                path: 'crear',
                element: <AgregarFacturas />
              }
            ]
          },
          {
            path: 'autorizaciones',
            element: <div>Autorizaciones Page</div>
          },
          {
            path: 'usuarios',
             element: <ClientesPage />
          },
          {
            path: 'sucursales',
            element: <BranchesPage />
          },
          {
            path: 'mediciones',
            element: <MedicionesPage />
          },
          {
            path: 'perfil',
            element:<Profile/>
          }
        ]
      }
    ]
  },
  {
    // Ruta de fallback para cualquier otra URL no definida
    path: '*',
    element: <Navigate to="/login" replace />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
