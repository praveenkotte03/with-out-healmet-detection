import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { MediaUploader } from './components/VideoUploader';
import { ProcessingIndicator } from './components/ProcessingIndicator';
import { ViolationCard } from './components/ViolationCard';
import { analyzeFrameForViolation } from './services/geminiService';
import type { Violation } from './types';
import { NoViolationsFound } from './components/Icons';

const App: React.FC = () => {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingMessage, setProcessingMessage] = useState<string>('');
  const [violations, setViolations] = useState<Violation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);
  
  const resetState = () => {
    setMediaFile(null);
    setViolations([]);
    setError(null);
    setIsProcessing(false);
    setProcessingMessage('');
    setAnalysisComplete(false);
  };

  const processImage = useCallback(async () => {
    if (!mediaFile) return;

    setIsProcessing(true);
    setAnalysisComplete(false);
    setViolations([]);
    setError(null);
    setProcessingMessage('Analyzing image...');

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            if (!event.target?.result) {
                throw new Error("Could not read the image file.");
            }
            const base64Image = (event.target.result as string).split(',')[1];
            const result = await analyzeFrameForViolation(base64Image);

            if (result && result.is_violation && result.license_plate) {
                const newViolation: Violation = {
                    id: `HV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
                    timestamp: new Date(),
                    licensePlate: result.license_plate,
                    imageDataUrl: event.target.result as string,
                };
                setViolations([newViolation]);
            }
            setProcessingMessage('Analysis complete.');
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
            setError(`Failed to analyze image. ${errorMessage}`);
        } finally {
            setIsProcessing(false);
            setAnalysisComplete(true);
        }
    };
    reader.onerror = () => {
        setError("Failed to read the image file.");
        setIsProcessing(false);
    };

    reader.readAsDataURL(mediaFile);

  }, [mediaFile]);

  const processVideo = useCallback(async () => {
    if (!mediaFile) return;

    setIsProcessing(true);
    setAnalysisComplete(false);
    setViolations([]);
    setError(null);

    const video = document.createElement('video');
    video.src = URL.createObjectURL(mediaFile);

    video.onloadedmetadata = async () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        setError('Could not create canvas context.');
        setIsProcessing(false);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const duration = video.duration;
      const interval = 1; // Process one frame per second
      let violationCount = 0;

      for (let time = 0; time < duration; time += interval) {
        setProcessingMessage(`Analyzing video... ${Math.round((time / duration) * 100)}% complete`);
        video.currentTime = time;
        await new Promise(resolve => video.onseeked = resolve);

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

        try {
          const result = await analyzeFrameForViolation(base64Image);
          if (result && result.is_violation && result.license_plate) {
            violationCount++;
            const newViolation: Violation = {
              id: `HV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(violationCount).padStart(4, '0')}`,
              timestamp: new Date(new Date().getTime() + time * 1000),
              licensePlate: result.license_plate,
              imageDataUrl: canvas.toDataURL('image/jpeg'),
            };
            setViolations(prev => [...prev, newViolation]);
          }
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
            setError(`Failed to analyze frame at ${time.toFixed(2)}s. ${errorMessage}`);
            // Continue processing other frames
        }
      }
      setProcessingMessage('Analysis complete.');
      setIsProcessing(false);
      setAnalysisComplete(true);
      URL.revokeObjectURL(video.src);
    };
     video.onerror = () => {
      setError("Failed to load video. Please check the file format.");
      setIsProcessing(false);
    };
  }, [mediaFile]);

  const handleStartAnalysis = useCallback(() => {
    if (!mediaFile) return;

    if (mediaFile.type.startsWith('video/')) {
        processVideo();
    } else if (mediaFile.type.startsWith('image/')) {
        processImage();
    } else {
        setError("Unsupported file type. Please upload a valid video or image file.");
    }
  }, [mediaFile, processVideo, processImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-2xl shadow-lg backdrop-blur-sm p-8 border border-gray-700">
          {!isProcessing && violations.length === 0 && !analysisComplete && (
            <MediaUploader
              onMediaSelect={setMediaFile}
              onProcessStart={handleStartAnalysis}
              mediaFile={mediaFile}
            />
          )}

          {isProcessing && (
            <ProcessingIndicator message={processingMessage} />
          )}
          
          {error && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
              <p><strong>Error:</strong> {error}</p>
              <button onClick={resetState} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Try Again</button>
            </div>
          )}

          {analysisComplete && !isProcessing && (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6">Analysis Results</h2>
                {violations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {violations.map((v) => (
                        <ViolationCard key={v.id} violation={v} />
                    ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg">
                        <NoViolationsFound />
                        <p className="mt-4 text-xl text-gray-300">No helmet violations were detected.</p>
                    </div>
                )}
                 <button onClick={resetState} className="mt-8 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105">
                    Analyze Another File
                </button>
            </div>
          )}
        </div>
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by Gemini AI. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};

export default App;