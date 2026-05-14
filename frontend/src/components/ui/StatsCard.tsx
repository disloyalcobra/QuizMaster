import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'green' | 'amber';
}

const colorMap = {
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-500',
  },
};

/**
 * StatsCard: Tarjeta informativa para mostrar métricas clave del dashboard.
 * Utiliza íconos de Lucide y una paleta de colores predefinida para facilitar la lectura.
 */
export const StatsCard = ({ label, value, icon: Icon, color }: StatsCardProps) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm', colorMap[color].bg, colorMap[color].text)}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-1">{label}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};
