import React, { useState } from 'react';

const AgregarClientes = () => {
  const [formData, setFormData] = useState({
    identificacion: '',
    razonSocial: '',
    direccion: '',
    telefonoNro1: '',
    telefonoNro2: '',
    correo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the data to an API or perform other actions
    console.log('Form submitted:', formData);
    // You could add functionality to navigate back to the Clientes list after submission
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-blue-800 mb-8">CLIENTES</h1>
      
      <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="identificacion" className="block text-blue-800 font-medium mb-2">
              Identificación
            </label>
            <input
              type="text"
              id="identificacion"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              placeholder="1805328015"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="razonSocial" className="block text-blue-800 font-medium mb-2">
              Razón Social
            </label>
            <input
              type="text"
              id="razonSocial"
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleChange}
              placeholder="Razón"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="direccion" className="block text-blue-800 font-medium mb-2">
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ambato"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="telefonoNro1" className="block text-blue-800 font-medium mb-2">
              Teléfono Nro 1
            </label>
            <input
              type="text"
              id="telefonoNro1"
              name="telefonoNro1"
              value={formData.telefonoNro1}
              onChange={handleChange}
              placeholder="0987654321"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="telefonoNro2" className="block text-blue-800 font-medium mb-2">
              Teléfono Nro 2
            </label>
            <input
              type="text"
              id="telefonoNro2"
              name="telefonoNro2"
              value={formData.telefonoNro2}
              onChange={handleChange}
              placeholder="0987654321"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="mb-8">
            <label htmlFor="correo" className="block text-blue-800 font-medium mb-2">
              Correo
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="jhondoe@gmail.com"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-800 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition duration-300"
            >
              Agregar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarClientes;