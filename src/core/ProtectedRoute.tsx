import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../auth/Services/auth.service';

interface ProtectedRouteProps {
  redirectPath?: string;
}

/**
 * Componente que protege rutas verificando si el usuario está autenticado.
 * Si no está autenticado, redirige al usuario a la ruta especificada (por defecto /login).
 */
const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const isAuthenticated = authService.isAuthenticated();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Si está autenticado, renderizar los componentes hijos
  return <Outlet />;
};

export default ProtectedRoute;
