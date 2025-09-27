# Sistema de Facturación Electrónica – Frontend (React)

Este proyecto es el *frontend* del sistema de *facturación electrónica, desarrollado con **React*.  
Se comunica con el backend desarrollado en NestJS para gestionar usuarios, clientes, facturas y demás funcionalidades.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- [Git](https://git-scm.com/)

---

## Instalación

1. Clona el repositorio e instala las dependencias:

bash
npm i


2. Configura un archivo .env en la raíz del proyecto.  
   Es importante definir la URL del backend para la integración:

env
VITE_API_URL=http://localhost:4000/apiV2


> Ajusta la URL según la ubicación del backend.

3. Ejecuta la aplicación en modo desarrollo:

bash
npm run dev


---