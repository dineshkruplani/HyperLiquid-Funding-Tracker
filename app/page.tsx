'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { FundingRateChart } from '@/components/dashboard/funding-rate-chart';
import { InstrumentSelector } from '@/components/dashboard/instrument-selector';
import { Duration } from '@/components/dashboard/duration-filter';
import { RefreshCw, TrendingUp, BarChart3, Star, Zap } from 'lucide-react';

interface Instrument {
  id: string;
  name: string;
  symbol: string;
  type: string;
  fundingRates: Array<{
    rate: number;
    timestamp: string;
  }>;
}

interface FundingRate {
  id: string;
  rate: number;
  timestamp: string;
  instrument: {
    id: string;
    name: string;
    symbol: string;
  };
}

interface Analytics {
  id: string;
  period: string;
  avgRate: number;
  maxRate: number;
  minRate: number;
  volatility: number;
  yield: number;
  timestamp: string;
  instrument: {
    id: string;
    name: string;
    symbol: string;
  };
}

export default function Dashboard() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [fundingRates, setFundingRates] = useState<FundingRate[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<Duration>('1d');
  const [activeRateFilter, setActiveRateFilter] = useState<'positive' | 'negative'>('positive');
  const [rateDisplay, setRateDisplay] = useState<'hourly' | 'yearly'>('hourly');
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchInstruments = async () => {
    try {
      console.log('Fetching instruments...');
      const response = await fetch('/api/instruments');
      const data = await response.json();
      console.log('Instruments response:', data);
      if (data.success) {
        setInstruments(data.data);
        console.log('Set instruments:', data.data.length);
      }
    } catch (error) {
      console.error('Error fetching instruments:', error);
    }
  };

  const fetchFundingRates = async () => {
    try {
      console.log('Fetching funding rates...');
      const params = new URLSearchParams();
      if (selectedInstrument) {
        params.append('instrumentId', selectedInstrument);
      }
      params.append('limit', '100');

      const response = await fetch(`/api/funding-rates?${params}`);
      const data = await response.json();
      console.log('Funding rates response:', data);
      if (data.success) {
        setFundingRates(data.data);
        console.log('Set funding rates:', data.data.length);
      }
    } catch (error) {
      console.error('Error fetching funding rates:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedInstrument) {
        params.append('instrumentId', selectedInstrument);
      }
      params.append('period', '1d');
      params.append('limit', '10');

      const response = await fetch(`/api/analytics?${params}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchInstruments(),
      fetchFundingRates(),
      fetchAnalytics(),
    ]);
    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  // Refetch when instrument selection changes
  useEffect(() => {
    if (!loading) {
      fetchFundingRates();
      fetchAnalytics();
    }
  }, [selectedInstrument, loading]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchFundingRates();
        fetchAnalytics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading]);

  const currentRates = fundingRates.slice(0, 10);
  const latestAnalytics = analytics[0];

  // Calculate annualized rates and sort by absolute value
  const annualizedRates = fundingRates.map(rate => ({
    ...rate,
    annualizedRate: rate.rate * 24 * 365 * 100, // Convert to annualized percentage
  }));

  // Sort by absolute annualized rate (highest first)
  const topAnnualizedRates = [...annualizedRates]
    .sort((a, b) => Math.abs(b.annualizedRate) - Math.abs(a.annualizedRate))
    .slice(0, 20);

  // Separate positive and negative rates
  const positiveRates = topAnnualizedRates
    .filter(rate => rate.annualizedRate > 0)
    .slice(0, 10);

  const negativeRates = topAnnualizedRates
    .filter(rate => rate.annualizedRate < 0)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  HyperLiquid Funding Tracker
                </h1>
                <p className="text-gray-300 text-base lg:text-lg">
                  Real-time funding rate analytics for perpetual swaps
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={refreshData}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh Data
          </button>
        </div>

        {/* Instrument Selector */}
        <div className="relative z-40">
          <InstrumentSelector
            instruments={instruments}
            selectedInstrument={selectedInstrument}
            onInstrumentChange={setSelectedInstrument}
          />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <MetricCard
            title="Current Rate"
            value={currentRates[0]?.rate || 0}
            format="rate"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Average Rate (24h)"
            value={latestAnalytics?.avgRate || 0}
            format="rate"
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <MetricCard
            title="Volatility (24h)"
            value={latestAnalytics?.volatility || 0}
            format="rate"
            tooltip="Standard deviation of funding rates over the past 24 hours. Higher values indicate more price volatility."
            icon={<Zap className="h-5 w-5" />}
          />
          <MetricCard
            title="Annualized Yield"
            value={latestAnalytics?.yield || 0}
            format="percentage"
            icon={<Star className="h-5 w-5" />}
          />
        </div>

        {/* Chart */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="p-6 lg:p-8">
            {/* Rate Display Dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <span className="text-gray-300 font-medium whitespace-nowrap">Rate Display:</span>
              <select
                value={rateDisplay}
                onChange={e => setRateDisplay(e.target.value as 'hourly' | 'yearly')}
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
              >
                <option value="hourly">Hourly</option>
                <option value="yearly">Yearly (Annualized)</option>
              </select>
            </div>
            <FundingRateChart
              data={fundingRates}
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              rateDisplay={rateDisplay}
            />
          </CardContent>
        </Card>

        {/* Top Funding Rates Table */}
        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl lg:text-2xl font-bold">
              <Star className="h-6 w-6 text-yellow-400" />
              Top Annualized Funding Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setActiveRateFilter('positive')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeRateFilter === 'positive'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Positive Rates ({positiveRates.length})
              </button>
              <button
                onClick={() => setActiveRateFilter('negative')}
                className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeRateFilter === 'negative'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Negative Rates ({negativeRates.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 lg:p-4 text-gray-300 font-semibold text-sm">Rank</th>
                    <th className="text-left p-3 lg:p-4 text-gray-300 font-semibold text-sm">Instrument</th>
                    <th className="text-left p-3 lg:p-4 text-gray-300 font-semibold text-sm">Annualized Rate</th>
                    <th className="text-left p-3 lg:p-4 text-gray-300 font-semibold text-sm">Hourly Rate</th>
                    <th className="text-left p-3 lg:p-4 text-gray-300 font-semibold text-sm">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeRateFilter === 'positive' ? positiveRates : negativeRates).length > 0 ? (
                    (activeRateFilter === 'positive' ? positiveRates : negativeRates).map((rate, index) => (
                      <tr key={rate.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200">
                        <td className="p-3 lg:p-4 text-sm font-medium">#{index + 1}</td>
                        <td className="p-3 lg:p-4 text-sm font-semibold">{rate.instrument.symbol}</td>
                        <td className={`p-3 lg:p-4 text-sm font-bold ${
                          rate.annualizedRate > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {rate.annualizedRate.toFixed(2)}%
                        </td>
                        <td className={`p-3 lg:p-4 text-sm ${
                          rate.rate > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {(rate.rate * 100).toFixed(6)}%
                        </td>
                        <td className="p-3 lg:p-4 text-sm text-gray-400">
                          {new Date(rate.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 lg:p-8 text-center text-gray-400">
                        No {activeRateFilter} funding rates available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 