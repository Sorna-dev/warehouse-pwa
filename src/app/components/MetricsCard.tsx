'use client';

import { LucideIcon } from 'lucide-react';
import { BOX_BORDER, BOX_DARK_BLUE, BOX_GRAY } from '../types';

interface MetricsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export default function MetricsCard({ icon: Icon, label, value, color }: MetricsCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border" style={{ borderColor: BOX_BORDER }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} style={{ color }} />
        <span className="text-xs font-medium" style={{ color: BOX_GRAY }}>{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color: color === BOX_DARK_BLUE ? BOX_DARK_BLUE : color }}>
        {value}
      </div>
    </div>
  );
}