
import React from 'react';
import { HelmetIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <HelmetIcon />
        <h1 className="ml-3 text-2xl md:text-3xl font-bold tracking-wider text-cyan-400">
          Helmet Violation Detection AI
        </h1>
      </div>
    </header>
  );
};
