'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Package, CheckCircle2, Clock, FileText, Image, ChevronRight } from 'lucide-react';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_LIGHT_BLUE, BOX_SUCCESS, BOX_WARNING, BOX_GRAY, BOX_BORDER } from '../types';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [loading, setLoading] = useState(true);

    // Auth check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Existing useEffect for loading containers
  useEffect(() => {
    if (session) {
      loadContainers();
    }
  }, [session]);

  // Show loading while checking auth
  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0061D5' }}></div>
      </div>
    );
  }
  
  const loadContainers = () => {
    const saved = localStorage.getItem('warehouse-containers');
    if (saved) {
      setContainers(JSON.parse(saved));
    }
    setLoading(false);
  };

  const totalContainers = containers.length;
  const completedContainers = containers.filter(c => c.status === 'completed').length;
  const inProgressContainers = containers.filter(c => c.status === 'draft').length;

  const handleContainerClick = (container: ContainerData) => {
    if (container.status === 'completed') {
      router.push(`/container/${container.id}/preview`);
    } else {
      router.push(`/container/${container.id}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: BOX_BORDER }}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: BOX_BLUE }}>
                <Package size={20} className="m-1" style={{ color: 'white' }} />
              </div>
              <h1 className="text-xl font-semibold" style={{ color: BOX_DARK_BLUE }}>Dashboard</h1>
            </div>
            <button
              onClick={() => router.push('/container/new')}
              className="px-4 py-2 rounded font-medium flex items-center gap-2"
              style={{ backgroundColor: BOX_BLUE, color: 'white' }}
            >
              <Plus size={18} />
              New Container
            </button>
          </div>
        </div>
      </header>

      <div className="p-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BOX_BORDER }}>
            <div className="flex items-center gap-2 mb-2">
              <Package size={18} style={{ color: BOX_BLUE }} />
              <span className="text-xs font-medium" style={{ color: BOX_GRAY }}>Total</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: BOX_DARK_BLUE }}>{totalContainers}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BOX_BORDER }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} style={{ color: BOX_SUCCESS }} />
              <span className="text-xs font-medium" style={{ color: BOX_GRAY }}>Completed</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: BOX_SUCCESS }}>{completedContainers}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BOX_BORDER }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} style={{ color: BOX_WARNING }} />
              <span className="text-xs font-medium" style={{ color: BOX_GRAY }}>In Progress</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: BOX_WARNING }}>{inProgressContainers}</div>
          </div>
        </div>

        {/* Container List */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold mb-3" style={{ color: BOX_DARK_BLUE }}>All Containers</h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: BOX_BLUE }}></div>
            <p style={{ color: BOX_GRAY }}>Loading...</p>
          </div>
        ) : containers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border" style={{ borderColor: BOX_BORDER }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: BOX_LIGHT_BLUE }}>
              <Package size={32} style={{ color: BOX_BLUE }} />
            </div>
            <p className="font-medium mb-2" style={{ color: BOX_DARK_BLUE }}>No containers yet</p>
            <p className="text-sm mb-4" style={{ color: BOX_GRAY }}>Start by creating your first container</p>
            <button
              onClick={() => router.push('/container/new')}
              className="px-6 py-2 rounded font-medium"
              style={{ backgroundColor: BOX_BLUE, color: 'white' }}
            >
              Create Container
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {containers.map(container => (
              <div
                key={container.id}
                onClick={() => handleContainerClick(container)}
                className="bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                style={{ borderColor: BOX_BORDER }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: container.status === 'completed' ? '#E8F5E9' : '#FFF4E5' }}>
                    <FileText size={20} style={{ color: container.status === 'completed' ? BOX_SUCCESS : BOX_WARNING }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold truncate" style={{ color: BOX_DARK_BLUE }}>{container.containerNumber}</h3>
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
                      <div className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium" style={{ 
                        backgroundColor: container.status === 'completed' ? '#E8F5E9' : '#FFF4E5',
                        color: container.status === 'completed' ? BOX_SUCCESS : BOX_WARNING 
                      }}>
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
        )}
      </div>
    </div>
  );
}