'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContainerForm from '@/app/components/ContainerForm';
import { ContainerData, PieceCountItem } from '@/app/types';

export default function NewContainerPage() {
  const router = useRouter();
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
  const [photos, setPhotos] = useState<any[]>([]);

  return (
    <ContainerForm
      mode="new"
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
      onBack={() => router.push('/dashboard')}
    />
  );
}