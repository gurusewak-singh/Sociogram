import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary-600 mb-8">
          Sociogram
        </h1>
        <div className="bg-white p-8 rounded-xl shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;