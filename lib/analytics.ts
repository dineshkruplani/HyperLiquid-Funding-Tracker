import { format, subHours, subDays, subWeeks, subMonths } from 'date-fns';

export interface AnalyticsResult {
  period: string;
  avgRate: number;
  maxRate: number;
  minRate: number;
  volatility: number;
  yield: number;
  count: number;
  timestamp: Date;
}

export interface FundingRateData {
  rate: number;
  timestamp: Date;
}

export class AnalyticsEngine {
  static calculateVolatility(rates: number[]): number {
    if (rates.length < 2) return 0;
    
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const variance = rates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / rates.length;
    return Math.sqrt(variance);
  }

  static calculateYield(rates: number[], periodHours: number): number {
    if (rates.length === 0) return 0;
    
    // Convert hourly rates to annualized yield
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const periodsPerYear = (365 * 24) / periodHours;
    return avgRate * periodsPerYear * 100; // Convert to percentage
  }

  static calculateAnalytics(
    data: FundingRateData[],
    period: string
  ): AnalyticsResult {
    if (data.length === 0) {
      throw new Error('No data provided for analytics calculation');
    }

    const rates = data.map(d => d.rate);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const volatility = this.calculateVolatility(rates);

    // Calculate period-specific yield
    const periodHours = this.getPeriodHours(period);
    const yieldValue = this.calculateYield(rates, periodHours);

    return {
      period,
      avgRate,
      maxRate,
      minRate,
      volatility,
      yield: yieldValue,
      count: data.length,
      timestamp: new Date(),
    };
  }

  static getPeriodHours(period: string): number {
    switch (period) {
      case '1h': return 1;
      case '4h': return 4;
      case '1d': return 24;
      case '1w': return 24 * 7;
      case '1m': return 24 * 30;
      default: return 24;
    }
  }

  static getTimeRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;

    switch (period) {
      case '1h':
        start = subHours(end, 1);
        break;
      case '4h':
        start = subHours(end, 4);
        break;
      case '1d':
        start = subDays(end, 1);
        break;
      case '1w':
        start = subWeeks(end, 1);
        break;
      case '1m':
        start = subMonths(end, 1);
        break;
      default:
        start = subDays(end, 1);
    }

    return { start, end };
  }

  static filterDataByPeriod(
    data: FundingRateData[],
    period: string
  ): FundingRateData[] {
    const { start } = this.getTimeRange(period);
    return data.filter(item => item.timestamp >= start);
  }

  static calculateMovingAverage(
    data: FundingRateData[],
    window: number
  ): { timestamp: Date; value: number }[] {
    const result = [];
    
    for (let i = window - 1; i < data.length; i++) {
      const windowData = data.slice(i - window + 1, i + 1);
      const avg = windowData.reduce((sum, item) => sum + item.rate, 0) / window;
      result.push({
        timestamp: data[i].timestamp,
        value: avg,
      });
    }

    return result;
  }

  static detectAnomalies(
    data: FundingRateData[],
    threshold: number = 2
  ): FundingRateData[] {
    if (data.length < 2) return [];

    const rates = data.map(d => d.rate);
    const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const stdDev = this.calculateVolatility(rates);

    return data.filter(item => {
      const zScore = Math.abs((item.rate - mean) / stdDev);
      return zScore > threshold;
    });
  }

  static calculateCumulativeYield(
    data: FundingRateData[],
    period: string
  ): number {
    if (data.length === 0) return 0;

    const periodHours = this.getPeriodHours(period);
    const totalRate = data.reduce((sum, item) => sum + item.rate, 0);
    const periodsPerYear = (365 * 24) / periodHours;
    
    return (totalRate / data.length) * periodsPerYear * 100;
  }
} 