'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DurationFilter, Duration } from './duration-filter';
import { formatRate, formatDate } from '@/lib/utils';

interface FundingRate {
  id: string;
  rate: number;
  timestamp: string;
  venue?: string;
  instrument: {
    id: string;
    name: string;
    symbol: string;
  };
}

interface FundingRateChartProps {
  data: FundingRate[];
  selectedDuration: Duration;
  onDurationChange: (duration: Duration) => void;
  rateDisplay: 'hourly' | 'yearly';
}

export function FundingRateChart({ data, selectedDuration, onDurationChange, rateDisplay }: FundingRateChartProps) {
  const chartData = data.map(item => {
    const baseRate = item.rate * 100; // hourly as %
    const rate = rateDisplay === 'yearly' ? baseRate * 24 * 365 : baseRate;
    return {
      time: new Date(item.timestamp),
      rate,
      instrument: item.instrument.symbol,
      venue: item.venue || 'HlPerp',
    };
  });

  const getTimeRange = (duration: Duration) => {
    const now = new Date();
    switch (duration) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  };

  const filteredData = chartData.filter(item => 
    item.time >= getTimeRange(selectedDuration)
  );

  // Group data by time and venue
  const groupedData = filteredData.reduce((acc, item) => {
    const timeKey = item.time.getTime();
    if (!acc[timeKey]) {
      acc[timeKey] = {
        time: item.time,
        instrument: item.instrument,
        BinPerp: null,
        HlPerp: null,
        BybitPerp: null,
      };
    }
    acc[timeKey][item.venue] = item.rate;
    return acc;
  }, {} as Record<number, any>);

  const chartDataArray = Object.values(groupedData).sort((a, b) => a.time.getTime() - b.time.getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-300" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(6)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const venueColors = {
    BinPerp: '#10B981', // Green
    HlPerp: '#3B82F6',  // Blue
    BybitPerp: '#F59E0B', // Yellow
  };

  const venueNames = {
    BinPerp: 'Binance Perpetual',
    HlPerp: 'HyperLiquid Perpetual',
    BybitPerp: 'Bybit Perpetual',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg lg:text-xl font-bold text-white">Funding Rate History</h3>
        <DurationFilter selectedDuration={selectedDuration} onDurationChange={onDurationChange} />
      </div>
      
      <div className="w-full h-[350px] lg:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartDataArray}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(value) => formatDate(value)}
              stroke="#9CA3AF"
              fontSize={11}
              tick={{ fill: '#9CA3AF' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={11}
              tickFormatter={(value) => `${value.toFixed(4)}%`}
              tick={{ fill: '#9CA3AF' }}
              width={80}
              label={{
                value: rateDisplay === 'yearly' ? 'Annualized Rate (%)' : 'Hourly Rate (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 11 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
              iconType="line"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
            
            {/* Binance Perpetual */}
            <Line 
              type="monotone" 
              dataKey="BinPerp" 
              stroke={venueColors.BinPerp}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: venueColors.BinPerp, stroke: '#fff', strokeWidth: 2 }}
              name={venueNames.BinPerp}
            />
            
            {/* HyperLiquid Perpetual */}
            <Line 
              type="monotone" 
              dataKey="HlPerp" 
              stroke={venueColors.HlPerp}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: venueColors.HlPerp, stroke: '#fff', strokeWidth: 2 }}
              name={venueNames.HlPerp}
            />
            
            {/* Bybit Perpetual */}
            <Line 
              type="monotone" 
              dataKey="BybitPerp" 
              stroke={venueColors.BybitPerp}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: venueColors.BybitPerp, stroke: '#fff', strokeWidth: 2 }}
              name={venueNames.BybitPerp}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 