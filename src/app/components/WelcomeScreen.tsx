'use client';

import { Package, ArrowRight } from 'lucide-react';
import { BOX_BLUE } from '../types';

interface WelcomeScreenProps {
  onSkip: () => void;
}

export default function WelcomeScreen({ onSkip }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: BOX_BLUE }}>
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-bounce" style={{ backgroundColor: 'white' }}>
          <Package size={48} style={{ color: BOX_BLUE }} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Warehouse Manager</h1>
        <p className="text-xl text-white/90 mb-8">Container Documentation System</p>
        <div className="flex items-center justify-center gap-2 text-white/80">
          <span>Loading</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
      <button
        onClick={onSkip}
        className="absolute bottom-8 right-8 px-6 py-3 bg-white rounded-full flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        style={{ color: BOX_BLUE }}
      >
        Skip <ArrowRight size={20} />
      </button>
    </div>
  );
}