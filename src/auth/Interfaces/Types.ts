export interface Credentials {
  cedula: string;
  password: string;
}

export interface AuthResponse {
  access_token: string; 
  user?: User;       
}

export interface User {
  id: string;
  cedula: string;

}

export interface AuthError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}