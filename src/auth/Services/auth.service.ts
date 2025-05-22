import axios, { AxiosError } from 'axios';
import { AuthResponse, AuthError, Credentials, User } from '../Interfaces/Types';

const API_URL = import.meta.env.VITE_API_URL as string;

export const authService = {
  login: async (credentials: Credentials): Promise<AuthResponse> => {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        {
          cedula: credentials.cedula,
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );


      if (response.data.access_token) {
        // Guardar token (usando access_token en lugar de token)
        localStorage.setItem('userToken', response.data.access_token);
        
        // Extraer datos del usuario del token (si no vienen en la respuesta)
        const tokenPayload = JSON.parse(atob(response.data.access_token.split('.')[1]));
        const userData: User = {
          id: tokenPayload.id || '', // Usar 'sub' u otro campo del payload
          cedula: tokenPayload.cedula
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));

      }

      return response.data;
    } catch (error) {
      console.error('Error en la autenticación:', error);
      const axiosError = error as AxiosError<AuthError>;
      throw axiosError.response?.data ?? { message: 'Error desconocido' };
    }
  },

  logout: (): void => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  },

  getToken: (): string | null => {
    return localStorage.getItem('userToken');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('userData');
    return user ? JSON.parse(user) as User : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('userToken');
  },

  // Método adicional para decodificar el token
  decodeToken: (token: string): any => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decodificando token:', e);
      return null;
    }
  }
};