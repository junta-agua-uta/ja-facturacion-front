import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from './Services/auth.service';

const Login = () => {
    const [cedula, setCedula] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cedula.trim() || !password.trim()) {
            setError('Por favor complete todos los campos');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Llamar al servicio de autenticación
            await authService.login({
                cedula,
                password
            });
            
            // Verificación adicional del almacenamiento
            const storedToken = authService.getToken();
            if (!storedToken) {
                throw new Error('No se pudo almacenar el token');
            }

            navigate('/junta');
        } catch (error) {
            console.error('Error en el login:', error);
            setError(error instanceof Error ? error.message : 'Credenciales Incorrectas');
        } finally {
            setIsLoading(false);
        }
        
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
                <div className="flex flex-col items-center mb-2">
                    {/* Logo */}
                    <img
                        src="/logo_agua.svg"
                        alt="Logo Agua Pública"
                        className="w-50 h-50"
                    />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="cedula" className="block mb-1 text-sm font-medium text-blue-900">
                            Número de cédula
                        </label>
                        <input
                            type="text"
                            id="cedula"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Escribe tu número de cédula"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="contrasena" className="block mb-1 text-sm font-medium text-blue-900">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="contrasena"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Escribe tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="mt-1 text-right">
                            <a
                                href="#"
                                className="text-sm text-blue-500 hover:text-blue-700"
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md text-center ">
                            {error}
                        </div>
                    )}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-2/3 px-4 py-2 text-white bg-blue-900 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default Login;