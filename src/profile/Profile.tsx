import { useEffect, useState } from 'react';
import api from '../shared/api';
import { UserIcon } from '@heroicons/react/24/solid'; // Ícono de usuario

interface UserData {
  NOMBRE: string;
  APELLIDO: string;
  CEDULA: string;
  CORREO: string;
  ROL: string;
  FECHA_CREACION: string;
}

const Profile = () => {
  // Removed unused navigate variable
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserData(response.data);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-xl">Cargando...</div>;
  }

  if (!userData) {
    return <div className="p-6 text-center text-red-500 text-xl">Error al cargar el perfil.</div>;
  }

  return (
    <div className="overflow-hidden h-full mt-[-40px]"> {/* Aquí se sube todo el contenido */}
      <div className="px-4 text-left overflow-hidden">
        {/* Sección de foto de perfil con ícono de usuario */}
        <div className="flex justify-center">
          <div className="">
            <UserIcon className="h-22 w-16 text-black-600" />
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Sección de Nombre */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Nombre</h2>
          <button className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full">Editar</button>
        </div>
        <p className="text-gray-700 text-xl mb-8">{`${userData.NOMBRE} ${userData.APELLIDO || ''}`}</p>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Sección de Cédula */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Cédula</h2>
          <button className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full">Editar</button>
        </div>
        <p className="text-gray-700 text-xl mb-8">{userData.CEDULA}</p>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Sección de Correo Electrónico */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Correo Electrónico</h2>
          <button className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full">Editar</button>
        </div>
        <p className="text-gray-700 text-xl mb-8">{userData.CORREO}</p>
      </div>
    </div>
  );
};

export default Profile;
