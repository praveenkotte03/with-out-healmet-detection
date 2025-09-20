
import React from 'react';
import type { Violation } from '../types';
import { DownloadIcon } from './Icons';

interface ViolationCardProps {
  violation: Violation;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({ violation }) => {
  const fineAmount = 1000;

  const generateChallanText = () => {
    return `
Challan ID      : ${violation.id}
Date/Time       : ${violation.timestamp.toLocaleString()}
Vehicle Plate   : ${violation.licensePlate}
Offence         : Riding without helmet
Fine Amount     : INR ${fineAmount}
Evidence        : evidence/${violation.id}_${violation.licensePlate}.jpg

Note: Please pay the fine within 30 days to avoid further action.
    `.trim();
  };

  const handleDownload = () => {
    const challanText = generateChallanText();
    const blob = new Blob([challanText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `challan_${violation.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700 transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-700">
      <img src={violation.imageDataUrl} alt="Violation evidence" className="w-full h-auto object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-red-400 mb-2">Violation Detected</h3>
        <div className="bg-gray-900 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
          <p><span className="text-gray-400">Plate:</span> {violation.licensePlate}</p>
          <p><span className="text-gray-400">Time:</span> {violation.timestamp.toLocaleTimeString()}</p>
        </div>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-300 mb-2">Challan Details:</h4>
            <pre className="bg-gray-900 p-3 rounded-md text-xs font-mono whitespace-pre-wrap overflow-x-auto text-gray-300">
                {generateChallanText()}
            </pre>
        </div>
        <button
          onClick={handleDownload}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-300"
        >
          <DownloadIcon />
          <span className="ml-2">Download Challan (.txt)</span>
        </button>
      </div>
    </div>
  );
};
