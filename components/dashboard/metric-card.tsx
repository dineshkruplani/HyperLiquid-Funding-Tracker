'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRate, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  format?: 'rate' | 'percentage' | 'number';
  decimals?: number;
  tooltip?: string;
  icon?: React.ReactNode;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  format = 'rate',
  decimals = 4,
  tooltip,
  icon
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formatValue = (val: number) => {
    switch (format) {
      case 'rate':
        return `${(val * 100).toFixed(decimals)}%`;
      case 'percentage':
        return `${val.toFixed(decimals)}%`;
      case 'number':
        return val.toFixed(decimals);
      default:
        return val.toString();
    }
  };

  const getChangeIcon = () => {
    if (change === undefined) return <Minus className="h-4 w-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-400';
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-blue-600/20 rounded-lg">
              {icon}
            </div>
          )}
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-gray-200">{title}</CardTitle>
            {tooltip && (
              <div className="relative">
                <HelpCircle 
                  className="h-4 w-4 text-gray-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 max-w-xs border border-gray-700">
                    {tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {getChangeIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{formatValue(value)}</div>
        {change !== undefined && (
          <p className={`text-xs ${getChangeColor()}`}>
            {change > 0 ? '+' : ''}{formatValue(change)} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
} 