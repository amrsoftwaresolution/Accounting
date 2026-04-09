// Components/layouts/FormLayout.jsx
import React from 'react';

const FormLayout = ({ children, title, className = "" }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={`max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        {title && (
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
