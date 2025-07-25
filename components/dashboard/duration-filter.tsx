'use client';

import React from 'react';
import { Clock } from 'lucide-react';

export type Duration = '1d' | '30d' | '90d' | '1y';

interface DurationFilterProps {
  selectedDuration: Duration;
  onDurationChange: (duration: Duration) => void;
}

const durationOptions: { value: Duration; label: string }[] = [
  { value: '1d', label: '1D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
];

export function DurationFilter({ selectedDuration, onDurationChange }: DurationFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Duration:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {durationOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onDurationChange(option.value)}
            className={`px-3 py-2 text-xs rounded-lg font-semibold transition-all duration-200 ${
              selectedDuration === option.value
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
} 