import { hyperliquidAPI, HyperLiquidFundingRate } from './hyperliquid';
import { prisma, createFundingRate, createAnalytics } from './database';
import { AnalyticsEngine, FundingRateData } from './analytics';

export class DataCollector {
  private isRunning = false;
  private interval: NodeJS.Timeout | null = null;

  async startCollection(intervalMs: number = 60000) { // Default: 1 minute
    if (this.isRunning) {
      console.log('Data collection is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting HyperLiquid funding rate data collection...');

    // Initial collection
    await this.collectData();

    // Set up periodic collection
    this.interval = setInterval(async () => {
      await this.collectData();
    }, intervalMs);
  }

  async stopCollection() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('Stopped data collection');
  }

  private async collectData() {
    try {
      console.log('Collecting funding rate data...');
      
      // Fetch current funding rates from HyperLiquid
      const fundingRates = await hyperliquidAPI.getFundingRates();
      
      // Get or create instruments
      const instruments = await this.ensureInstruments();
      
      // Store funding rates for all venues
      for (const rate of fundingRates) {
        const instrument = instruments.find(i => i.symbol === rate.instrument);
        if (instrument) {
          const timestamp = new Date(rate.timestamp);
          
          // Store data with venue information from API
          await createFundingRate({
            instrumentId: instrument.id,
            rate: rate.rate,
            timestamp: timestamp,
            venue: rate.venue || 'HlPerp',
            blockNumber: rate.blockNumber ? BigInt(rate.blockNumber) : undefined,
            txHash: rate.txHash,
          });
        }
      }

      // Calculate and store analytics
      await this.calculateAnalytics();

      console.log(`Collected ${fundingRates.length * 3} funding rates across all venues`);
    } catch (error) {
      console.error('Error collecting data:', error);
    }
  }

  private async ensureInstruments() {
    try {
      // Get existing instruments
      let instruments = await prisma.instrument.findMany();
      
      if (instruments.length === 0) {
        // Fetch instruments from HyperLiquid
        const hyperliquidInstruments = await hyperliquidAPI.getInstruments();
        
        // Create instruments in database
        for (const instrument of hyperliquidInstruments) {
          await prisma.instrument.create({
            data: {
              name: instrument.name,
              symbol: instrument.symbol,
              type: instrument.type,
            },
          });
        }
        
        instruments = await prisma.instrument.findMany();
      }
      
      return instruments;
    } catch (error) {
      console.error('Error ensuring instruments:', error);
      return [];
    }
  }

  private async calculateAnalytics() {
    try {
      const instruments = await prisma.instrument.findMany();
      const periods = ['1h', '4h', '1d', '1w', '1m'];
      const venues = ['BinPerp', 'HlPerp', 'BybitPerp'];

      for (const instrument of instruments) {
        for (const period of periods) {
          for (const venue of venues) {
            // Get funding rate data for the period and venue
            const { start } = AnalyticsEngine.getTimeRange(period);
            
            const fundingRates = await prisma.fundingRate.findMany({
              where: {
                instrumentId: instrument.id,
                venue: venue,
                timestamp: {
                  gte: start,
                },
              },
              orderBy: { timestamp: 'asc' },
            });

            if (fundingRates.length > 0) {
              const data: FundingRateData[] = fundingRates.map(fr => ({
                rate: fr.rate,
                timestamp: fr.timestamp,
              }));

              const analytics = AnalyticsEngine.calculateAnalytics(data, period);

              await createAnalytics({
                instrumentId: instrument.id,
                period: analytics.period,
                avgRate: analytics.avgRate,
                maxRate: analytics.maxRate,
                minRate: analytics.minRate,
                volatility: analytics.volatility,
                yield: analytics.yield,
                timestamp: analytics.timestamp,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error calculating analytics:', error);
    }
  }

  async getCollectionStatus() {
    return {
      isRunning: this.isRunning,
      lastCollection: new Date(),
    };
  }
}

// Singleton instance
export const dataCollector = new DataCollector(); 