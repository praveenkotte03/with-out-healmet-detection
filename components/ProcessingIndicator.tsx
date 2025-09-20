
import React from 'react';

interface ProcessingIndicatorProps {
  message: string;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
      <p className="text-lg text-gray-300">{message}</p>
      <p className="text-sm text-gray-500">This may take a few moments depending on video length.</p>
    </div>
  );
};
