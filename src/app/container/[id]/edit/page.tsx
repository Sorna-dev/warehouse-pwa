'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ContainerForm from '@/app/components/ContainerForm';
import { ContainerData, PieceCountItem } from '@/app/types';
import { BOX_BLUE } from '@/app/types';

export default function EditContainerPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [container, setContainer] = useState<ContainerData | null>(null);
  
  // Form state
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

  useEffect(() => {
    loadContainer();
  }, [params.id]);

  const loadContainer = () => {
    const saved = localStorage.getItem('warehouse-containers');
    if (saved) {
      const containers: ContainerData[] = JSON.parse(saved);
      const found = containers.find(c => c.id === params.id);
      
      if (found) {
        setContainer(found);
        // Populate form state with existing data
        setContainerNumber(found.containerNumber);
        setOperationType(found.operationType);
        setDoorNumber(found.doorNumber);
        setPieceCount(found.pieceCount);
        setMaterials(found.materials);
        setDiscrepancies(found.discrepancies);
        setPhotos(found.photos);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
            style={{ borderColor: BOX_BLUE }}
          ></div>
          <p className="text-gray-600">Loading container...</p>
        </div>
      </div>
    );
  }

  if (!container) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Container Not Found</h2>
          <p className="text-gray-600 mb-4">The container you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => router.push('/dashboard')} 
            className="px-6 py-2 rounded font-medium text-white"
            style={{ backgroundColor: BOX_BLUE }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Don't allow editing completed containers
  if (container.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Container Completed</h2>
          <p className="text-gray-600 mb-6">
            This container has been finalized and cannot be edited. 
            You can view it in preview mode.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex-1 px-4 py-2 rounded font-medium border border-gray-300 text-gray-700"
            >
              Dashboard
            </button>
            <button 
              onClick={() => router.push(`/container/${container.id}/preview`)} 
              className="flex-1 px-4 py-2 rounded font-medium text-white"
              style={{ backgroundColor: BOX_BLUE }}
            >
              View Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ContainerForm
      mode="edit"
      existingContainer={container}
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