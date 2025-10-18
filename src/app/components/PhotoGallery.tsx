'use client';

import { useState } from 'react';
import { RotateCw, X, GripVertical } from 'lucide-react';
import { Photo, BOX_BORDER } from '../types';

interface PhotoGalleryProps {
  photos: Photo[];
  setPhotos: (photos: Photo[]) => void;
}

export default function PhotoGallery({ photos, setPhotos }: PhotoGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const rotatePhoto = (id: number) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePhoto = (id: number) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((photo, index) => (
        <div
          key={photo.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className="relative border rounded overflow-hidden cursor-move"
          style={{ 
            borderColor: BOX_BORDER,
            opacity: draggedIndex === index ? 0.5 : 1 
          }}
        >
          <img
            src={photo.src}
            alt={`Photo ${index + 1}`}
            style={{ transform: `rotate(${photo.rotation}deg)` }}
            className="w-full h-32 object-cover"
          />
          <div className="absolute top-2 left-2 bg-white/90 rounded p-1">
            <GripVertical size={16} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2 flex justify-between">
            <button
              onClick={() => rotatePhoto(photo.id)}
              className="w-7 h-7 bg-white/95 rounded flex items-center justify-center"
            >
              <RotateCw size={14} />
            </button>
            <button
              onClick={() => deletePhoto(photo.id)}
              className="w-7 h-7 bg-white/95 rounded flex items-center justify-center text-red-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
}