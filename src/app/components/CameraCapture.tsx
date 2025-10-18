'use client';

import { useRef, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Photo } from '../types';

interface CameraCaptureProps {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
  onClose: () => void;
}

export default function CameraCapture({ photos, setPhotos, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Camera access denied');
      onClose();
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        setPhotos([...photos, { 
          id: Date.now(), 
          src: imageData, 
          rotation: 0,
          order: photos.length 
        }]);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex-1 relative">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50">
          <button onClick={onClose} className="text-white flex items-center gap-2">
            <ChevronLeft size={24} />
            Cancel
          </button>
        </div>
      </div>
      <div className="bg-black p-6 flex justify-around items-center">
        <div className="w-16"></div>
        <button
          onClick={capturePhoto}
          className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-white"></div>
        </button>
        <div className="w-16"></div>
      </div>
    </div>
  );
}