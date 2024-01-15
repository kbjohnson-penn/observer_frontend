import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-64 w-64"></div>
      <div className="text-2xl font-bold text-blue-700 ml-4">
      </div>
    </div>
  );
};

export default LoadingPage;