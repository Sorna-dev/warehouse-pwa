'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Package, Folder, FileText, Image } from 'lucide-react';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_LIGHT_BLUE, BOX_SUCCESS, BOX_GRAY, BOX_BORDER } from '../types';

interface HomeScreenProps {
  onNewContainer: () => void;
}

export default function HomeScreen({ onNewContainer }: HomeScreenProps) {
  const [containers, setContainers] = useState<ContainerData[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('warehouse-containers');
    if (saved) {
      setContainers(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded" style={{ backgroundColor: BOX_BLUE }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-full h-full p-1.5">
                <path d="M19.5 3h-15C3.67 3 3 3.67 3 4.5v15c0 .83.67 1.5 1.5 1.5h15c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-7.5 14.5l-5-3.5V9l5 3.5 5-3.5v5l-5 3.5z"/>
              </svg>
            </div>
            <h1 className="text-xl font-semibold" style={{ color: BOX_DARK_BLUE }}>Warehouse</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        <button
          onClick={onNewContainer}
          className="w-full py-3.5 rounded font-medium text-base flex items-center justify-center gap-2 shadow-sm mb-6"
          style={{ backgroundColor: BOX_BLUE, color: 'white' }}
        >
          <Plus size={20} />
          New Container
        </button>

        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: BOX_GRAY }}>
            <Folder size={16} />
            <span>Completed Containers ({containers.length})</span>
          </div>
        </div>

        {containers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: BOX_LIGHT_BLUE }}>
              <Package size={32} style={{ color: BOX_BLUE }} />
            </div>
            <p style={{ color: BOX_GRAY }}>No containers yet</p>
            <p className="text-sm mt-1" style={{ color: BOX_GRAY }}>Get started by creating a new container</p>
          </div>
        ) : (
          <div className="space-y-2">
            {containers.map(container => (
              <div key={container.id} className="bg-white border rounded p-4" style={{ borderColor: BOX_BORDER }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BOX_LIGHT_BLUE }}>
                    <FileText size={20} style={{ color: BOX_BLUE }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" style={{ color: BOX_DARK_BLUE }}>{container.containerNumber}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm" style={{ color: BOX_GRAY }}>
                      <span>{container.doorNumber}</span>
                      <span>•</span>
                      <span>{container.operationType}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: BOX_GRAY }}>
                      <div className="flex items-center gap-1">
                        <Image size={14} />
                        <span>{container.photos.length} photos</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(container.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#E8F5E9', color: BOX_SUCCESS }}>
                    Completed
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}