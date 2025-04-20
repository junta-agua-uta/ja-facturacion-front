import { Outlet,  useLocation } from 'react-router-dom'
import { FacturasIcon, AutorizacionesIcon, UsuariosIcon, SucursalesIcon, MedicionesIcon, PerfilIcon } from './utils/icons';
import NavItem from './components/NavItem';

const Layout = () => {

  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 flex flex-col bg-gray-200">
        <div className="p-4 flex justify-center">
          <img src="/logo_agua.svg" alt="Logo Agua Pública" className="h-36" />
        </div>

        <nav className="flex-1">
          
          <NavItem
            to="/junta/facturas"
            isActive={isActive('facturas')}
            icon={<FacturasIcon isActive={isActive('facturas')} />}
            label="Facturas"
            children={[
              {
                label: "Ver todas las facturas",
                to: "/junta/facturas"
              },
              {
                label: "Crear factura",
                to: "/junta/facturas/crear"
              }
            ]}
          />

          <NavItem
            to="/junta/autorizaciones"
            isActive={isActive('autorizaciones')}
            icon={<AutorizacionesIcon isActive={isActive('autorizaciones')} />}
            label="Autorizaciones"
          />

          <NavItem
            to="/junta/usuarios"
            isActive={isActive('usuarios')}
            icon={<UsuariosIcon isActive={isActive('usuarios')} />}
            label="Usuarios"
          />

          <NavItem
            to="/junta/sucursales"
            isActive={isActive('sucursales')}
            icon={<SucursalesIcon isActive={isActive('sucursales')} />}
            label="Sucursales"
          />

          <NavItem
            to="/junta/mediciones"
            isActive={isActive('mediciones')}
            icon={<MedicionesIcon isActive={isActive('mediciones')} />}
            label="Mediciones"
          />

          <NavItem
            to="/junta/perfil"
            isActive={isActive('perfil')}
            icon={<PerfilIcon isActive={isActive('perfil')} />}
            label="Perfil"
          />
        </nav>

        <div className="p-4 flex flex-col items-center">
          <PerfilIcon isActive={false} />
          <p className="text-base font-medium text-gray-900">Jhon Doe</p>
          <p className="text-sm text-gray-500">Administrador</p>
        </div>

        <button 
        className="mx-4 mb-4 px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors duration-200 flex items-center justify-center hover:cursor-pointer">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 overflow-hidden max-w-7xl mx-auto mt-10 p-6 space-y-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout 