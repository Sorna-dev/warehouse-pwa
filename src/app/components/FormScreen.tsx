'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Plus, Minus, Camera, X, RotateCw, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Photo, PieceCountItem, ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_LIGHT_BLUE, BOX_SUCCESS, BOX_GRAY, BOX_BORDER, PACKAGE_TYPES, OPERATION_TYPES, MATERIALS } from '../types';

interface FormScreenProps {
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
  onShowCamera: () => void;
  onSuccess: () => void;
}

export default function FormScreen(props: FormScreenProps) {
  const [processing, setProcessing] = useState(false);

  const addPieceType = () => {
    props.setPieceCount([...props.pieceCount, { type: 'Pallets', quantity: 0 }]);
  };

  const removePieceType = (index: number) => {
    props.setPieceCount(props.pieceCount.filter((_, i) => i !== index));
  };

  const updatePieceCount = (index: number, field: keyof PieceCountItem, value: string | number) => {
    const updated = [...props.pieceCount];
    updated[index] = { ...updated[index], [field]: value };
    props.setPieceCount(updated);
  };

  const updateMaterial = (material: string, value: number) => {
    props.setMaterials({ ...props.materials, [material]: Math.max(0, value) });
  };

  const rotatePhoto = (id: number) => {
    props.setPhotos(props.photos.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePhoto = (id: number) => {
    props.setPhotos(props.photos.filter(p => p.id !== id));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Container Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Container: ${props.containerNumber}`, 20, 35);
    doc.text(`Type: ${props.operationType}`, 20, 42);
    doc.text(`Door: ${props.doorNumber}`, 20, 49);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 56);
    
    const pieceData = props.pieceCount.map(item => [item.type, item.quantity.toString()]);
    autoTable(doc, {
      startY: 65,
      head: [['Package Type', 'Quantity']],
      body: pieceData,
      theme: 'grid',
    });
    
    const lastY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Materials:', 20, lastY);
    const materialsList = Object.entries(props.materials)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => `${name}: ${qty}`)
      .join(', ') || 'None';
    doc.setFontSize(10);
    doc.text(materialsList, 20, lastY + 7);
    
    doc.setFontSize(12);
    doc.text('Discrepancies:', 20, lastY + 20);
    doc.setFontSize(10);
    const discText = props.discrepancies || 'None';
    doc.text(discText, 20, lastY + 27);
    
    if (props.photos.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text(`Photos (${props.photos.length})`, 20, 20);
      
      let yPos = 30;
      props.photos.forEach((photo, index) => {
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

  const handleFinish = async () => {
    if (!props.containerNumber || !props.operationType || !props.doorNumber) {
      alert('Please fill required fields');
      return;
    }
    
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newContainer: ContainerData = {
      id: Date.now().toString(),
      containerNumber: props.containerNumber,
      operationType: props.operationType,
      doorNumber: props.doorNumber,
      pieceCount: props.pieceCount,
      materials: props.materials,
      discrepancies: props.discrepancies,
      photos: props.photos,
      timestamp: new Date().toISOString(),
      status: 'Completed',
    };
    
    const saved = localStorage.getItem('warehouse-containers');
    const containers = saved ? JSON.parse(saved) : [];
    containers.push(newContainer);
    localStorage.setItem('warehouse-containers', JSON.stringify(containers));
    
    const pdf = generatePDF();
    pdf.save(`Container_${props.containerNumber}.pdf`);
    
    setProcessing(false);
    props.onSuccess();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={props.onBack} className="p-1">
            <ChevronLeft size={24} style={{ color: BOX_DARK_BLUE }} />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: BOX_DARK_BLUE }}>Container Details</h1>
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
                value={props.containerNumber}
                onChange={(e) => props.setContainerNumber(e.target.value.toUpperCase())}
                placeholder="CONT12345"
                className="w-full px-3 py-2.5 border rounded text-sm"
                style={{ borderColor: BOX_BORDER }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>
                Operation Type *
              </label>
              <select
                value={props.operationType}
                onChange={(e) => props.setOperationType(e.target.value)}
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
                value={props.doorNumber}
                onChange={(e) => props.setDoorNumber(e.target.value)}
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
            {props.pieceCount.map((item, i) => (
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
                {props.pieceCount.length > 1 && (
                  <button onClick={() => removePieceType(i)} className="px-3 border rounded" style={{ borderColor: BOX_BORDER }}>
                    <X size={18} />
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
                    onClick={() => updateMaterial(m, props.materials[m] - 1)}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: BOX_LIGHT_BLUE, color: BOX_BLUE }}
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={props.materials[m]}
                    onChange={(e) => updateMaterial(m, parseInt(e.target.value) || 0)}
                    className="flex-1 px-2 py-1.5 border rounded text-center text-sm"
                    style={{ borderColor: BOX_BORDER }}
                  />
                  <button
                    onClick={() => updateMaterial(m, props.materials[m] + 1)}
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: BOX_LIGHT_BLUE, color: BOX_BLUE }}
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
            <h2 className="font-medium text-sm">Photos ({props.photos.length})</h2>
            <button
              onClick={props.onShowCamera}
              className="text-sm px-3 py-1.5 rounded flex items-center gap-1.5"
              style={{ backgroundColor: BOX_BLUE, color: 'white' }}
            >
              <Camera size={16} />Capture
            </button>
          </div>
          <div className="p-4">
            {props.photos.length === 0 ? (
              <div className="text-center py-8">
                <Camera size={24} className="mx-auto mb-3" style={{ color: BOX_GRAY }} />
                <p className="text-sm" style={{ color: BOX_GRAY }}>No photos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {props.photos.map((photo, i) => (
                  <div key={photo.id} className="relative border rounded overflow-hidden" style={{ borderColor: BOX_BORDER }}>
                    <img src={photo.src} alt={`Photo ${i + 1}`} style={{ transform: `rotate(${photo.rotation}deg)` }} className="w-full h-32 object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2 flex justify-between">
                      <button onClick={() => rotatePhoto(photo.id)} className="w-7 h-7 bg-white/95 rounded flex items-center justify-center">
                        <RotateCw size={14} />
                      </button>
                      <button onClick={() => deletePhoto(photo.id)} className="w-7 h-7 bg-white/95 rounded flex items-center justify-center text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
              value={props.discrepancies}
              onChange={(e) => props.setDiscrepancies(e.target.value)}
              placeholder="Note any issues..."
              className="w-full px-3 py-2.5 border rounded text-sm h-24 resize-none"
              style={{ borderColor: BOX_BORDER }}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: BOX_BORDER }}>
        <button
          onClick={handleFinish}
          disabled={processing}
          className="w-full py-3 rounded font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: processing ? BOX_GRAY : BOX_SUCCESS, color: 'white' }}
        >
          {processing ? 'Processing...' : <><Download size={20} />Generate PDF</>}
        </button>
      </div>
    </div>
  );
}