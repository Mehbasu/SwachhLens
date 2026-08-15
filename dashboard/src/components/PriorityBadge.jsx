import React from 'react';
import { priorityConfig } from '../data/mockData';
import { AlertTriangle, ArrowUpRight, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function PriorityBadge({ score, showIcon = true, size = 'normal' }) {
  let config = priorityConfig.low;
  let Icon = ShieldCheck;

  if (score >= 75) {
    config = priorityConfig.urgent;
    Icon = AlertTriangle;
  } else if (score >= 50) {
    config = priorityConfig.high;
    Icon = ShieldAlert;
  } else if (score >= 25) {
    config = priorityConfig.medium;
    Icon = ArrowUpRight;
  }

  const isSmall = size === 'small';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${config.badge} ${
        isSmall ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs tracking-wide'
      }`}
    >
      {showIcon && <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
      <span className="font-mono opacity-80 font-bold">({score})</span>
    </span>
  );
}
