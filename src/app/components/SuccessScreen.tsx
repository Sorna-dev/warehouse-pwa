'use client';

import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BOX_SUCCESS, BOX_DARK_BLUE, BOX_GRAY } from '../types';

interface SuccessScreenProps {
  containerNumber: string;
  onComplete: () => void;
}

export default function SuccessScreen({ containerNumber, onComplete }: SuccessScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#E8F5E9' }}>
        <CheckCircle2 size={48} style={{ color: BOX_SUCCESS }} />
      </div>
      <h1 className="text-2xl font-semibold mb-2" style={{ color: BOX_DARK_BLUE }}>Complete!</h1>
      <p className="text-center mb-6" style={{ color: BOX_GRAY }}>
        Container {containerNumber} has been saved
      </p>
      <div className="bg-gray-50 rounded-lg p-4 w-full max-w-md space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: BOX_SUCCESS }} />
          <span style={{ color: BOX_DARK_BLUE }}>PDF report generated</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: BOX_SUCCESS }} />
          <span style={{ color: BOX_DARK_BLUE }}>Data saved locally</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} style={{ color: BOX_SUCCESS }} />
          <span style={{ color: BOX_DARK_BLUE }}>Ready for next container</span>
        </div>
      </div>
      <div className="mt-6 text-sm" style={{ color: BOX_GRAY }}>
        Returning to home...
      </div>
    </div>
  );
}