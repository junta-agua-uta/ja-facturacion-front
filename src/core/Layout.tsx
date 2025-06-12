import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FacturasIcon, /*AutorizacionesIcon,*/ UsuariosIcon, SucursalesIcon, MedicionesIcon, PerfilIcon } from './utils/icons';
import NavItem from './components/NavItem';
import { authService } from '../auth/Services/auth.service';
import { useEffect, useState } from 'react';
import api from '../shared/api';


const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Usuario');
  const [userRole, setUserRole] = useState('');
  const [menuOpen, setMenuOpen] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        try {
          const response = await api.get('/auth/me');
          if (response.data) {
            const nombreCompleto = `${response.data.NOMBRE} ${response.data.APELLIDO}`.trim();
            setUserName(nombreCompleto || 'Usuario');
            setUserRole(response.data.ROL || 'Usuario');
          }
        } catch (error) {

        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${menuOpen ? 'w-64' : 'w-0'} flex flex-col bg-gray-200 border-r border-gray-300 shadow-xl pb-5 transition-all duration-300 overflow-hidden`}>
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
          <p className="text-base font-medium text-gray-900">{userName}</p>
          <p className="text-sm text-gray-500">{userRole}</p>
        </div>

        <button
          onClick={handleLogout}
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

      <main className="flex-1 h-screen overflow-auto md:max-w-5xl lg:max-w-7xl mx-auto  p-6 space-y-6 max-h-full relative">
        <button
          onClick={toggleMenu}
          className="absolute -top-1 left-0 m-4 p-2 bg-gray-200 text-gray-800 rounded-full shadow-lg hover:bg-gray-300 transition-colors duration-200 z-10"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <div className='mt-10'>
        <Outlet />

        </div>
      </main>
    </div>
  )
}

export default Layout