'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronDown, Plus, Minus, Camera, AlertCircle, Save, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CameraCapture from './CameraCapture';
import PhotoGallery from './PhotoGallery';
import { Photo, PieceCountItem, ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_SUCCESS, BOX_GRAY, BOX_BORDER, PACKAGE_TYPES, OPERATION_TYPES, MATERIALS } from '../types';

interface ContainerFormProps {
  mode: 'new' | 'edit';
  existingContainer?: ContainerData;
  containerNumber: string;
  setContainerNumber: (val: string) => void;
  operationType: string;
  setOperationType: (val: string) => void;
  doorNumber: string;
  setDoorNumber: (val: string) => void;
  pieceCount: PieceCountItem[];
  setPieceCount: (val: PieceCountItem[]) => void;
  materials: Record<string, number>;
  setMaterials: (val: Record<string, number>) => void;
  discrepancies: string;
  setDiscrepancies: (val: string) => void;
  photos: Photo[];
  setPhotos: (val: Photo[]) => void;
  onBack: () => void;
}

export default function ContainerForm(props: ContainerFormProps) {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Use local state for editing
  const [localData, setLocalData] = useState({
    containerNumber: props.existingContainer?.containerNumber || props.containerNumber,
    operationType: props.existingContainer?.operationType || props.operationType,
    doorNumber: props.existingContainer?.doorNumber || props.doorNumber,
    pieceCount: props.existingContainer?.pieceCount || props.pieceCount,
    materials: props.existingContainer?.materials || props.materials,
    discrepancies: props.existingContainer?.discrepancies || props.discrepancies,
    photos: props.existingContainer?.photos || props.photos,
  });

  const updateLocalData = (field: string, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const addPieceType = () => {
    updateLocalData('pieceCount', [...localData.pieceCount, { type: 'Pallets', quantity: 0 }]);
  };

  const removePieceType = (index: number) => {
    updateLocalData('pieceCount', localData.pieceCount.filter((_, i) => i !== index));
  };

  const updatePieceCount = (index: number, field: keyof PieceCountItem, value: string | number) => {
    const updated = [...localData.pieceCount];
    updated[index] = { ...updated[index], [field]: value };
    updateLocalData('pieceCount', updated);
  };

  const updateMaterial = (material: string, value: number) => {
    updateLocalData('materials', { ...localData.materials, [material]: Math.max(0, value) });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 61, 128);
    doc.text('Container Loading/Unloading Report', 20, 20);
    
    // Container Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Container #: ${localData.containerNumber}`, 20, 35);
    doc.text(`Operation: ${localData.operationType}`, 20, 42);
    doc.text(`Door: ${localData.doorNumber}`, 20, 49);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
    
    // Piece Count Table
    const pieceData = localData.pieceCount.map(item => [item.type, item.quantity.toString()]);
    autoTable(doc, {
      startY: 65,
      head: [['Package Type', 'Quantity']],
      body: pieceData,
      theme: 'grid',
      headStyles: { fillColor: [0, 97, 213] },
    });
    
    const lastY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Materials Supplied:', 20, lastY);
    doc.setFontSize(10);
    const materialsList = Object.entries(localData.materials)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${name}: ${qty}`)
      .join(', ') || 'None';
    doc.text(materialsList, 20, lastY + 7);
    
    doc.setFontSize(12);
    doc.text('Discrepancies:', 20, lastY + 20);
    doc.setFontSize(10);
    const discText = localData.discrepancies || 'None reported';
    const splitDisc = doc.splitTextToSize(discText, 170);
    doc.text(splitDisc, 20, lastY + 27);
    
    // Photos
    if (localData.photos.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text(`Photos (${localData.photos.length} total)`, 20, 20);
      
      let yPos = 30;
      localData.photos.forEach((photo, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.addImage(photo.src, 'JPEG', 20, yPos, 170, 100);
        doc.setFontSize(10);
        doc.text(`Photo ${index + 1}`, 20, yPos + 105);
        yPos += 115;
      });
    }
    
    return doc;
  };

  const uploadToDrive = async (pdf: jsPDF, status: 'draft' | 'completed') => {
    console.log(pdf.output('blob'));
    try {
      // Upload PDF
      const pdfBlob = pdf.output('blob');
      const pdfFormData = new FormData();
      pdfFormData.append('file', pdfBlob);
      pdfFormData.append('fileName', `${localData.containerNumber}_Report.pdf`);
      pdfFormData.append('containerNumber', localData.containerNumber);
      pdfFormData.append('doorNumber', localData.doorNumber);
      pdfFormData.append('fileType', 'pdf');

      const pdfResponse = await fetch('/api/drive', {
        method: 'POST',
        body: pdfFormData,
      });

      if (!pdfResponse.ok) throw new Error('PDF upload failed');
      const pdfData = await pdfResponse.json();

      // Upload photos
      for (let i = 0; i < localData.photos.length; i++) {
        const photo = localData.photos[i];
        const photoBlob = await fetch(photo.src).then(r => r.blob());
        const photoFormData = new FormData();
        photoFormData.append('file', photoBlob);
        photoFormData.append('fileName', `Photo_${i + 1}.jpg`);
        photoFormData.append('containerNumber', localData.containerNumber);
        photoFormData.append('doorNumber', localData.doorNumber);
        photoFormData.append('fileType', 'image');

        await fetch('/api/drive', {
          method: 'POST',
          body: photoFormData,
        });
      }

      return {
        driveLink: pdfData.viewLink,
        driveFolderId: pdfData.folderId,
      };
    } catch (error) {
      console.error('Drive upload error:', error);
      throw error;
    }
  };

  const updateGoogleSheet = async (containerData: ContainerData) => {
    try {
      const totalPieces = localData.pieceCount.reduce((sum, item) => sum + item.quantity, 0);
      const packageTypes = localData.pieceCount.map(item => `${item.type}: ${item.quantity}`).join(', ');
      const materialsStr = Object.entries(localData.materials)
        .filter(([_, qty]) => qty > 0)
        .map(([name, qty]) => `${name}: ${qty}`)
        .join(', ');

      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          containerNumber: localData.containerNumber,
          operationType: localData.operationType,
          doorNumber: localData.doorNumber,
          status: containerData.status,
          totalPieces,
          packageTypes,
          materials: materialsStr,
          discrepancies: localData.discrepancies,
          driveLink: containerData.driveLink,
        }),
      });

      if (!response.ok) throw new Error('Sheet update failed');
    } catch (error) {
      console.error('Sheet update error:', error);
    }
  };

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!localData.containerNumber || !localData.operationType || !localData.doorNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const pdf = generatePDF();
      let driveLink = '';
      let driveFolderId = '';

      if (status === 'completed') {
        const driveData = await uploadToDrive(pdf, status);
        driveLink = driveData.driveLink;
        driveFolderId = driveData.driveFolderId;
      }

      const containerData: ContainerData = {
        id: props.existingContainer?.id || Date.now().toString(),
        containerNumber: localData.containerNumber,
        operationType: localData.operationType,
        doorNumber: localData.doorNumber,
        pieceCount: localData.pieceCount,
        materials: localData.materials,
        discrepancies: localData.discrepancies,
        photos: localData.photos,
        timestamp: props.existingContainer?.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status,
        driveLink,
        driveFolderId,
      };

      const saved = localStorage.getItem('warehouse-containers');
      const containers: ContainerData[] = saved ? JSON.parse(saved) : [];
      
      if (props.mode === 'edit') {
        const index = containers.findIndex(c => c.id === props.existingContainer?.id);
        if (index >= 0) {
          containers[index] = containerData;
        }
      } else {
        containers.push(containerData);
      }
      
      localStorage.setItem('warehouse-containers', JSON.stringify(containers));

      await updateGoogleSheet(containerData);

      pdf.save(`${localData.containerNumber}_Report.pdf`);

      setProcessing(false);

      if (status === 'completed') {
        router.push(`/container/${containerData.id}/preview`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save container. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={props.onBack} className="p-1">
            <ChevronLeft size={24} style={{ color: BOX_DARK_BLUE }} />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: BOX_DARK_BLUE }}>
            {props.mode === 'edit' ? 'Edit Container' : 'New Container'}
          </h1>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {/* Container Info */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>Container Information</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>
                Container Number *
              </label>
              <input
                type="text"
                value={localData.containerNumber}
                onChange={(e) => updateLocalData('containerNumber', e.target.value.toUpperCase())}
                placeholder="CONT12345"
                disabled={props.mode === 'edit'}
                className="w-full px-3 py-2.5 border rounded text-sm disabled:bg-gray-100"
                style={{ borderColor: BOX_BORDER }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>
                Operation Type *
              </label>
              <select
                value={localData.operationType}
                onChange={(e) => updateLocalData('operationType', e.target.value)}
                className="w-full px-3 py-2.5 border rounded text-sm"
                style={{ borderColor: BOX_BORDER }}
              >
                <option value="">Select...</option>
                {OPERATION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>
                Door Number *
              </label>
              <input
                type="text"
                value={localData.doorNumber}
                onChange={(e) => updateLocalData('doorNumber', e.target.value)}
                placeholder="Door 3"
                className="w-full px-3 py-2.5 border rounded text-sm"
                style={{ borderColor: BOX_BORDER }}
              />
            </div>
          </div>
        </div>

        {/* Piece Count */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b flex justify-between" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>Piece Count</h2>
            <button onClick={addPieceType} className="text-sm flex items-center gap-1" style={{ color: BOX_BLUE }}>
              <Plus size={16} />Add
            </button>
          </div>
          <div className="p-4 space-y-2">
            {localData.pieceCount.map((item, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={item.type}
                  onChange={(e) => updatePieceCount(i, 'type', e.target.value)}
                  className="flex-1 px-3 py-2.5 border rounded text-sm"
                  style={{ borderColor: BOX_BORDER }}
                >
                  {PACKAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updatePieceCount(i, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2.5 border rounded text-sm text-center"
                  style={{ borderColor: BOX_BORDER }}
                />
                {localData.pieceCount.length > 1 && (
                  <button onClick={() => removePieceType(i)} className="px-3 border rounded" style={{ borderColor: BOX_BORDER }}>
                    <Minus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm" style={{ color: BOX_DARK_BLUE }}>Materials</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {MATERIALS.map(m => (
              <div key={m} className="border rounded p-3" style={{ borderColor: BOX_BORDER }}>
                <label className="block text-xs font-medium mb-2">{m}</label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => updateMaterial(m, localData.materials[m] - 1)}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: '#E8F2FF', color: BOX_BLUE }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={localData.materials[m]}
                    onChange={(e) => updateMaterial(m, parseInt(e.target.value) || 0)}
                    className="flex-1 px-2 py-1.5 border rounded text-center text-sm"
                    style={{ borderColor: BOX_BORDER }}
                  />
                  <button
                    onClick={() => updateMaterial(m, localData.materials[m] + 1)}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: '#E8F2FF', color: BOX_BLUE }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b flex justify-between" style={{ borderColor: BOX_BORDER }}>
            <h2 className="font-medium text-sm">Photos ({localData.photos.length})</h2>
            <button
              onClick={() => setShowCamera(true)}
              className="text-sm px-3 py-1.5 rounded flex items-center gap-1.5"
              style={{ backgroundColor: BOX_BLUE, color: 'white' }}
            >
              <Camera size={16} />Capture
            </button>
          </div>
          <div className="p-4">
            {localData.photos.length === 0 ? (
              <div className="text-center py-8">
                <Camera size={24} className="mx-auto mb-3" style={{ color: BOX_GRAY }} />
                <p className="text-sm" style={{ color: BOX_GRAY }}>No photos</p>
              </div>
            ) : (
              <PhotoGallery photos={localData.photos} setPhotos={(photos) => updateLocalData('photos', photos)} />
            )}
          </div>
        </div>

        {/* Discrepancies */}
        <div className="bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: BOX_BORDER }}>
        <h2 className="font-medium text-sm">Discrepancies</h2>
      </div>
      <div className="p-4">
        <textarea
          value={localData.discrepancies}
          onChange={(e) => updateLocalData('discrepancies', e.target.value)}
          placeholder="Note any issues..."
          className="w-full px-3 py-2.5 border rounded text-sm h-24 resize-none"
          style={{ borderColor: BOX_BORDER }}
        />
      </div>
    </div>
  </div>

  {/* Fixed Bottom Actions */}
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-2" style={{ borderColor: BOX_BORDER }}>
    <button
      onClick={() => handleSave('draft')}
      disabled={processing}
      className="w-full py-3 rounded font-medium flex items-center justify-center gap-2 border"
      style={{ borderColor: BOX_BORDER, color: BOX_BLUE }}
    >
      <Save size={20} />
      Save as Draft
    </button>
    <button
      onClick={() => handleSave('completed')}
      disabled={processing}
      className="w-full py-3 rounded font-medium flex items-center justify-center gap-2"
      style={{ backgroundColor: processing ? BOX_GRAY : BOX_SUCCESS, color: 'white' }}
    >
      {processing ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      ) : (
        <>
          <CheckCircle size={20} />
          Finalize & Upload
        </>
      )}
    </button>
  </div>

  {showCamera && (
    <CameraCapture
      photos={localData.photos}
      setPhotos={(photos) => updateLocalData('photos', photos)}
      onClose={() => setShowCamera(false)}
    />
  )}
</div>
);
}