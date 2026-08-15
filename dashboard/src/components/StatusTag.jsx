import React from 'react';
import { statusConfig } from '../data/mockData';
import { Clock, Loader2, CheckCircle2 } from 'lucide-react';

export default function StatusTag({ status, size = 'normal' }) {
  const config = statusConfig[status] || statusConfig.submitted;

  const isSmall = size === 'small';

  const icons = {
    submitted: <Clock className={isSmall ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />,
    in_progress: <Loader2 className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-blue-400 animate-spin`} />,
    resolved: <CheckCircle2 className={isSmall ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.badgeClass} ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
