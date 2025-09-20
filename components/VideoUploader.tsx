import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface MediaUploaderProps {
  onMediaSelect: (file: File) => void;
  onProcessStart: () => void;
  mediaFile: File | null;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ onMediaSelect, onProcessStart, mediaFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onMediaSelect(e.target.files[0]);
    }
  };
  
  const handleDragEvent = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvent(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const fileType = file.type.split('/')[0];
        if (fileType === activeTab) {
            onMediaSelect(file);
        } else {
            alert(`Please drop a ${activeTab} file. You dropped a ${fileType} file.`);
        }
    }
  }, [onMediaSelect, activeTab]);

  const dragOverClass = isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600';
  const fileTypes = {
    video: { accept: 'video/mp4,video/avi', description: 'MP4 or AVI files' },
    image: { accept: 'image/jpeg,image/png,image/webp', description: 'JPEG, PNG, or WEBP files' },
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-2 text-gray-100">Upload Media for Analysis</h2>
      <p className="text-gray-400 mb-6">Select the file type and then upload your media.</p>

      <div className="flex justify-center mb-6">
        <button 
          onClick={() => { setActiveTab('video'); onMediaSelect(null as any); }}
          className={`px-6 py-2 rounded-l-lg transition-colors text-white font-semibold focus:outline-none ${activeTab === 'video' ? 'bg-cyan-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Video
        </button>
        <button 
          onClick={() => { setActiveTab('image'); onMediaSelect(null as any); }}
          className={`px-6 py-2 rounded-r-lg transition-colors text-white font-semibold focus:outline-none ${activeTab === 'image' ? 'bg-cyan-600 shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Image
        </button>
      </div>

      <label
        onDragEnter={(e) => handleDragEvent(e, true)}
        onDragOver={(e) => handleDragEvent(e, true)}
        onDragLeave={(e) => handleDragEvent(e, false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed ${dragOverClass} rounded-lg cursor-pointer transition-colors duration-300`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon />
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop a {activeTab}
          </p>
          <p className="text-xs text-gray-500">{fileTypes[activeTab].description}</p>
          {mediaFile && <p className="mt-4 text-md text-green-400">{mediaFile.name}</p>}
        </div>
        <input id="dropzone-file" type="file" className="hidden" accept={fileTypes[activeTab].accept} onChange={handleFileChange} />
      </label>

      <button
        onClick={onProcessStart}
        disabled={!mediaFile}
        className="mt-8 px-8 py-4 bg-cyan-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:transform-none"
      >
        Start Analysis
      </button>
    </div>
  );
};