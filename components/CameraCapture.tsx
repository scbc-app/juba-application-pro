import React, { useRef, useState } from 'react';

interface CameraCaptureProps {
  label: string;
  onCapture: (base64: string) => void;
  existingImage: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ label, onCapture, existingImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingImage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onCapture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      
      <div className="relative w-full aspect-video bg-gray-200 rounded-md overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
        {preview ? (
          <img src={preview} alt="Capture" className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            <span className="text-xs mt-1">No Image</span>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        {preview ? 'Retake Photo' : 'Take Photo'}
      </button>
    </div>
  );
};

export default CameraCapture;
