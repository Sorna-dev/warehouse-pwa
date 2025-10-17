'use client';

import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import FormScreen from './components/FormScreen';
import CameraScreen from './components/CameraScreen';
import SuccessScreen from './components/SuccessScreen';
import { ContainerData, Photo, PieceCountItem } from './types';

export default function WarehousePWA() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [containerNumber, setContainerNumber] = useState('');
  const [operationType, setOperationType] = useState('');
  const [doorNumber, setDoorNumber] = useState('');
  const [pieceCount, setPieceCount] = useState<PieceCountItem[]>([{ type: 'Pallets', quantity: 0 }]);
  const [materials, setMaterials] = useState<Record<string, number>>({ 
    'Pallets': 0, 
    'Shrink Wrap': 0, 
    'Air Bags': 0, 
    'Dunnage': 0 
  });
  const [discrepancies, setDiscrepancies] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="font-sans antialiased">
      {currentScreen === 'home' && <HomeScreen onNewContainer={() => setCurrentScreen('form')} />}
      {currentScreen === 'form' && (
        <FormScreen
          containerNumber={containerNumber}
          setContainerNumber={setContainerNumber}
          operationType={operationType}
          setOperationType={setOperationType}
          doorNumber={doorNumber}
          setDoorNumber={setDoorNumber}
          pieceCount={pieceCount}
          setPieceCount={setPieceCount}
          materials={materials}
          setMaterials={setMaterials}
          discrepancies={discrepancies}
          setDiscrepancies={setDiscrepancies}
          photos={photos}
          setPhotos={setPhotos}
          onBack={() => setCurrentScreen('home')}
          onShowCamera={() => setShowCamera(true)}
          onSuccess={() => setCurrentScreen('success')}
        />
      )}
      {showCamera && (
        <CameraScreen
          photos={photos}
          setPhotos={setPhotos}
          onClose={() => setShowCamera(false)}
        />
      )}
      {currentScreen === 'success' && (
        <SuccessScreen
          containerNumber={containerNumber}
          onComplete={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
}