import { ReactNode, ForwardedRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'green' | 'blue' | 'red' | 'purple';
  variant?: 'default' | 'compact';
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-100 text-primary-600',
  secondary: 'bg-secondary-100 text-secondary-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export const StatCard = ({
  label,
  value,
  change,
  icon: Icon,
  color = 'primary',
  variant = 'default',
  className = ''
}: StatCardProps) => {
  if (variant === 'compact') {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <span className="text-green-500">↑</span>
              {change}
              <span className="text-gray-400">vs last period</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};