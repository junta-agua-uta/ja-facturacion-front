import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Layout from './core/Layout.tsx'
import Login from './auth/Login.tsx'
import { createBrowserRouter, RouterProvider, Navigate} from 'react-router-dom'
import BranchesPage from './sucursales/pages/BranchesPage.tsx'

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
        element: <BranchesPage />
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
