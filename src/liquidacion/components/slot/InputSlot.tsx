import React from 'react';

type FormFieldProps = {
  label: string;
  children: React.ReactNode;
};

const FormField = ({ label, children }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="label text-gray-600">
        <span className="label-text font-semibold">{label}</span>
      </label>
      {children}
    </div>
  );
};

export default FormField;
