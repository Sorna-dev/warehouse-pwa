'use client';

import { FileText, Image, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_SUCCESS, BOX_WARNING, BOX_GRAY, BOX_BORDER, BOX_LIGHT_BLUE } from '../types';

interface ContainerListProps {
  containers: ContainerData[];
  onContainerClick: (container: ContainerData) => void;
}

export default function ContainerList({ containers, onContainerClick }: ContainerListProps) {
  if (containers.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: BOX_LIGHT_BLUE }}>
          <FileText size={32} style={{ color: BOX_BLUE }} />
        </div>
        <p className="font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>No containers yet</p>
        <p className="text-sm" style={{ color: BOX_GRAY }}>Start by creating your first container</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {containers.map(container => (
        <div
          key={container.id}
          onClick={() => onContainerClick(container)}
          className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
          style={{ borderColor: BOX_BORDER }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div 
              className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" 
              style={{ backgroundColor: container.status === 'completed' ? '#E8F5E9' : '#FFF4E5' }}
            >
              <FileText 
                size={20} 
                style={{ color: container.status === 'completed' ? BOX_SUCCESS : BOX_WARNING }} 
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold truncate" style={{ color: BOX_DARK_BLUE }}>
                  {container.containerNumber}
                </h3>
                <ChevronRight size={18} style={{ color: BOX_GRAY }} />
              </div>

              <div className="flex items-center gap-3 text-sm mb-2" style={{ color: BOX_GRAY }}>
                <span>{container.doorNumber}</span>
                <span>•</span>
                <span>{container.operationType}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs" style={{ color: BOX_GRAY }}>
                  <div className="flex items-center gap-1">
                    <Image size={14} />
                    <span>{container.photos.length} photos</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(container.updatedAt).toLocaleDateString()}</span>
                </div>

                {/* Status Badge */}
                <div 
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" 
                  style={{ 
                    backgroundColor: container.status === 'completed' ? '#E8F5E9' : '#FFF4E5',
                    color: container.status === 'completed' ? BOX_SUCCESS : BOX_WARNING 
                  }}
                >
                  {container.status === 'completed' ? (
                    <>
                      <CheckCircle2 size={12} />
                      Completed
                    </>
                  ) : (
                    <>
                      <Clock size={12} />
                      Draft
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}