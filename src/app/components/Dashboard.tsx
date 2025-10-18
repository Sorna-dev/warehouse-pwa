'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, CheckCircle2, Clock } from 'lucide-react';
import ContainerList from './ContainerList';
import MetricsCard from './MetricsCard';
import { ContainerData, BOX_BLUE, BOX_DARK_BLUE, BOX_SUCCESS, BOX_WARNING, BOX_BORDER } from '../types';

export default function Dashboard() {
  const router = useRouter();
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContainers();
  }, []);

  const loadContainers = () => {
    const saved = localStorage.getItem('warehouse-containers');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Sort by most recent first
      const sorted = parsed.sort((a: ContainerData, b: ContainerData) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setContainers(sorted);
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
          <MetricsCard
            icon={Package}
            label="Total"
            value={totalContainers}
            color={BOX_BLUE}
          />
          <MetricsCard
            icon={CheckCircle2}
            label="Completed"
            value={completedContainers}
            color={BOX_SUCCESS}
          />
          <MetricsCard
            icon={Clock}
            label="In Progress"
            value={inProgressContainers}
            color={BOX_WARNING}
          />
        </div>

        {/* Container List */}
        <div className="mb-3">
          <h2 className="text-sm font-semibold mb-3" style={{ color: BOX_DARK_BLUE }}>
            All Containers
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div 
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" 
              style={{ borderColor: BOX_BLUE }}
            ></div>
            <p style={{ color: BOX_DARK_BLUE }}>Loading...</p>
          </div>
        ) : (
          <ContainerList 
            containers={containers} 
            onContainerClick={handleContainerClick} 
          />
        )}
      </div>
    </div>
  );
}