import { useRef, useState, useEffect } from 'react';
import { CameraIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { sounds } from '@/utils/sounds';

interface CameraCaptureProps {
  onCapture: (photoData: string) => void;
  onClose: () => void;
  habitName: string;
}

export default function CameraCapture({ onCapture, onClose, habitName }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setError('Camera is not available in this environment.');
      setIsLoading(false);
      return;
    }

    // Check if navigator and mediaDevices exist
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Please use Chrome, Firefox, or Safari.');
      setIsLoading(false);
      return;
    }

    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
              setError('Unable to start camera. Please try again.');
              setIsLoading(false);
            });
          }
        };
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      let errorMessage = 'Unable to access camera. ';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      setError(errorMessage);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError('Camera is not ready yet. Please wait a moment.');
        return;
      }
      
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0);
        // Convert to image
        const photoData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(photoData);
        sounds.complete();
        // Stop the camera stream
        stopCamera();
      } else {
        setError('Unable to capture photo. Please try again.');
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setError(null);
    startCamera();
  };

  // Start camera when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-black/80 backdrop-blur-sm flex-shrink-0">
        <h2 className="text-xl font-semibold text-white">Capture {habitName}</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 lg transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {isLoading && !error && !capturedPhoto ? (
          <div className="text-center p-8 bg-white/10 backdrop-blur-sm 2xl mx-4">
            <div className="inline-block animate-spin full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-white">Starting camera...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white/10 backdrop-blur-sm 2xl mx-4 max-w-md">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-red-400 mb-4 font-medium">{error}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-blue-500 text-white xl hover:bg-blue-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        ) : capturedPhoto ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
              <img
                src={capturedPhoto}
                alt="Captured"
                className="w-full 2xl shadow-2xl mb-6"
              />
              <div className="flex gap-4">
                <button
                  onClick={retakePhoto}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white xl hover:bg-gray-600 transition-colors font-medium"
                >
                  Retake
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg"
                >
                  <CheckIcon className="w-5 h-5" />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
            />
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {stream && !capturedPhoto && !isLoading && !error && (
        <div className="p-4 border-t border-gray-800 bg-black/80 backdrop-blur-sm flex-shrink-0 mt-auto">
          <button
            onClick={capturePhoto}
            className="w-full py-4 bg-blue-500 text-white xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-semibold shadow-lg"
          >
            <CameraIcon className="w-6 h-6" />
            Capture Photo
          </button>
        </div>
      )}
    </div>
  );
}

