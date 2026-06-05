import { useEffect, useState } from 'react';
import api from '../shared/api';
import { UserIcon } from '@heroicons/react/24/solid';
import { PencilIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface UserData {
  NOMBRE: string;
  APELLIDO: string;
  CEDULA: string;
  CORREO: string;
  ROL: string;
  FECHA_CREACION: string;
}

interface UpdateUserData {
  cedula?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  password?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  password: string;
}

interface NameEditData {
  nombre: string;
  apellido: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [nameEditData, setNameEditData] = useState<NameEditData>({ nombre: '', apellido: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserData(response.data);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (field: string, currentValue: string) => {
    if (field === 'nombre') {
      setNameEditData({
        nombre: userData?.NOMBRE || '',
        apellido: userData?.APELLIDO || ''
      });
    }
    setEditingField(field);
    setEditValue(currentValue);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
    setNameEditData({ nombre: '', apellido: '' });
    setError(null);
  };

  const handleSaveEdit = async (field: string) => {
    const updateData: UpdateUserData = {};

    if (field === 'nombre') {
      if (!nameEditData.nombre.trim() || !nameEditData.apellido.trim()) {
        setError('El nombre y apellido no pueden estar vacíos');
        return;
      }
      updateData.nombre = nameEditData.nombre;
      updateData.apellido = nameEditData.apellido;
    } else {
      if (!editValue.trim()) {
        setError(`El campo ${field} no puede estar vacío`);
        return;
      }

      switch (field) {
        case 'cedula':
          updateData.cedula = editValue;
          break;
        case 'correo':
          updateData.correo = editValue;
          break;
      }
    }

    try {
      await api.put('/auth/profile', updateData);

      if (field === 'nombre') {
        setUserData(prev => ({
          ...prev!,
          NOMBRE: nameEditData.nombre,
          APELLIDO: nameEditData.apellido
        }));
        setSuccess('Nombre y apellido actualizados correctamente');
      } else if (field === 'cedula') {
        setUserData(prev => ({
          ...prev!,
          CEDULA: editValue
        }));
        setSuccess('Cédula actualizada correctamente');
      } else if (field === 'correo') {
        setUserData(prev => ({
          ...prev!,
          CORREO: editValue
        }));
        setSuccess('Correo actualizado correctamente');
      }

      setEditingField(null);
      setEditValue('');
      setNameEditData({ nombre: '', apellido: '' });

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error al actualizar:", error);
      setError(error.response?.data?.message || `Error al actualizar ${field}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.password) {
      setError('Todos los campos de contraseña son requeridos');
      return;
    }

    if (passwordData.password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await api.patch('/auth/change-password', passwordData);
      setSuccess('Contraseña actualizada correctamente');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', password: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      setError(error.response?.data?.message || 'Error al cambiar la contraseña');
      setTimeout(() => setError(null), 3000);
    }
  };

  const renderEditableField = (field: string, label: string, value: string) => {
    if (editingField === field) {
      if (field === 'nombre') {
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Nombre
              </label>
              <input
                type="text"
                value={nameEditData.nombre}
                onChange={(e) => setNameEditData({ ...nameEditData, nombre: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-xl"
                placeholder="Ingrese su nombre"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Apellido
              </label>
              <input
                type="text"
                value={nameEditData.apellido}
                onChange={(e) => setNameEditData({ ...nameEditData, apellido: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-xl"
                placeholder="Ingrese su apellido"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveEdit(field)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckIcon className="h-5 w-5" />
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
              >
                <XMarkIcon className="h-5 w-5" />
                Cancelar
              </button>
            </div>
          </div>
        );
      }

      // Para cédula y correo
      return (
        <div className="space-y-3">
          <input
            type={field === 'correo' ? 'email' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-xl"
            autoFocus
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleSaveEdit(field)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              Guardar
            </button>
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
            >
              <XMarkIcon className="h-5 w-5" />
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    if (field === 'nombre') {
      return (
        <>
          <p className="text-gray-700 text-xl mb-8">
            {value || 'No especificado'}
          </p>
        </>
      );
    }

    return (
      <>
        <p className="text-gray-700 text-xl mb-8">{value || 'No especificado'}</p>
      </>
    );
  };

  if (loading) {
    return <div className="p-6 text-center text-xl">Cargando...</div>;
  }

  if (!userData) {
    return <div className="p-6 text-center text-red-500 text-xl">Error al cargar el perfil.</div>;
  }

  return (
    <div className="overflow-hidden h-full mt-[-40px]">
      {/* Mensajes de éxito/error */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {error}
        </div>
      )}

      <div className="px-4 text-left overflow-hidden">
        {/* Sección de foto de perfil con ícono de usuario */}
        <div className="flex justify-center">
          <div className="relative">
            <UserIcon className="h-22 w-16 text-blue-600" />
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Sección de Nombre y Apellido */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Nombre Completo</h2>
          {editingField !== 'nombre' && (
            <button
              onClick={() => handleEditClick('nombre', `${userData.NOMBRE} ${userData.APELLIDO || ''}`)}
              className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full hover:bg-blue-800 transition flex items-center gap-2"
            >
              <PencilIcon className="h-5 w-5" />
              Editar
            </button>
          )}
        </div>
        {renderEditableField('nombre', 'Nombre', `${userData.NOMBRE} ${userData.APELLIDO || ''}`)}

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Sección de Cédula */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Cédula</h2>
          {editingField !== 'cedula' && (
            <button
              onClick={() => handleEditClick('cedula', userData.CEDULA)}
              className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full hover:bg-blue-800 transition flex items-center gap-2"
            >
              <PencilIcon className="h-5 w-5" />
              Editar
            </button>
          )}
        </div>
        {renderEditableField('cedula', 'Cédula', userData.CEDULA)}

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Sección de Correo Electrónico */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Correo Electrónico</h2>
          {editingField !== 'correo' && (
            <button
              onClick={() => handleEditClick('correo', userData.CORREO)}
              className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full hover:bg-blue-800 transition flex items-center gap-2"
            >
              <PencilIcon className="h-5 w-5" />
              Editar
            </button>
          )}
        </div>
        {renderEditableField('correo', 'Correo', userData.CORREO)}

        {/* Línea divisoria */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Sección de Contraseña */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-900">Contraseña</h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-blue-900 text-white px-6 py-3 text-lg rounded-full hover:bg-blue-800 transition flex items-center gap-2"
          >
            <PencilIcon className="h-5 w-5" />
            Cambiar
          </button>
        </div>
        <p className="text-gray-500 text-xl mb-8">********</p>
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Cambiar Contraseña</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Ingrese su contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
              >
                Actualizar Contraseña
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', password: '' });
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setError(null);
                }}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>

            {error && (
              <div className="mt-4 text-red-500 text-center">
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;