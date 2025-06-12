# Sistema de Gestión de Cobros de Agua - Santa Rosa

## Descripción General

Este sistema web está diseñado para la gestión integral de cobros de agua potable para la Junta de Agua de Santa Rosa. La aplicación permite administrar clientes, facturas, mediciones de consumo, sucursales y usuarios del sistema, ofreciendo una solución completa para la administración del servicio de agua potable. Proyecto 

## Características Principales

### Gestión de Facturas
- Creación y visualización de facturas
- Búsqueda por cédula/RUC del cliente
- Filtrado por fechas de emisión
- Impresión de tickets de factura
- Paginación para manejo eficiente de grandes volúmenes de datos

### Gestión de Clientes
- Registro de clientes con validación de cédula/RUC ecuatoriano
- Búsqueda rápida por número de identificación
- Almacenamiento de datos completos (razón social, nombre comercial, dirección, teléfono, email)

### Gestión de Mediciones
- Registro de lecturas de medidores
- Cálculo automático de consumo
- Historial de mediciones por cliente

### Administración de Sucursales
- Registro y gestión de múltiples sucursales
- Asignación de facturas a sucursales específicas

### Gestión de Usuarios
- Control de acceso basado en roles
- Perfiles de usuario personalizables
- Autenticación segura

## Tecnologías Utilizadas

- **Frontend**: React 19 con TypeScript
- **Estilizado**: Tailwind CSS y DaisyUI
- **Construcción**: Vite
- **Enrutamiento**: React Router v7
- **Peticiones HTTP**: Axios
- **Iconos**: Heroicons y React Icons

## Estructura del Proyecto

```
src/
├── assets/           # Recursos estáticos (imágenes, iconos)
├── auth/             # Autenticación y autorización
├── Clientes/         # Módulo de gestión de clientes
├── core/             # Componentes y utilidades principales
├── facturacion/      # Módulo de facturación
├── medicion/         # Módulo de mediciones
├── profile/          # Gestión de perfil de usuario
├── shared/           # Componentes y utilidades compartidas
└── sucursales/       # Gestión de sucursales
```

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar la versión de producción
npm run preview
```

## Convenciones del API

- La API devuelve datos con nombres de campos en MAYÚSCULAS (ID, IDENTIFICACION, etc.)
- La API espera recibir datos con nombres de campos en minúsculas (identificacion, razonSocial, etc.)
- Ruta base de la API: "/apiV2"
- Búsqueda de clientes por cédula: "/apiV2/clientes/buscarCedula?cedula=valor"

## Requisitos del Sistema

- Node.js 18 o superior
- Conexión a internet para acceso a la API
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Contribución

Este proyecto fue desarrollado como parte de un proyecto de vinculación con la comunidad de Santa Rosa para mejorar la gestión administrativa de su Junta de Agua Potable.

