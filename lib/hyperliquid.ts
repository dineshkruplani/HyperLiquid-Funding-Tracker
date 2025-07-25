import axios from 'axios';

export interface HyperLiquidInstrument {
  name: string;
  symbol: string;
  type: string;
}

export interface HyperLiquidFundingRate {
  instrument: string;
  rate: number;
  timestamp: string;
  venue?: string;
  blockNumber?: number;
  txHash?: string;
}

export interface HyperLiquidMeta {
  universe: HyperLiquidInstrument[];
}

export class HyperLiquidAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz';
  }

  async getMeta(): Promise<HyperLiquidMeta> {
    try {
      // Use the correct HyperLiquid API endpoint
      const response = await axios.post('https://api.hyperliquid.xyz/info', {
        type: 'meta'
      });
      
      const data = response.data;
      
      // Validate response structure
      if (!data || !data.universe || !Array.isArray(data.universe)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from HyperLiquid API');
      }
      
      // Transform the universe data to our expected format
      const instruments = data.universe
        .filter((item: any) => !item.isDelisted) // Filter out delisted instruments
        .map((item: any) => ({
          name: item.name,
          symbol: item.name,
          type: 'perp'
        }));
      
      return {
        universe: instruments
      };
    } catch (error) {
      console.error('Error fetching HyperLiquid meta:', error);
      throw new Error('Failed to fetch HyperLiquid meta data');
    }
  }

  async getFundingRates(): Promise<HyperLiquidFundingRate[]> {
    try {
      // Use the correct HyperLiquid API endpoint for predicted funding rates
      const response = await axios.post('https://api.hyperliquid.xyz/info', {
        type: 'predictedFundings'
      });
      
      const data = response.data;
      
      // Validate response structure
      if (!data || !Array.isArray(data)) {
        console.error('Invalid funding rates response format:', typeof data, data);
        throw new Error('Invalid response format from HyperLiquid API');
      }
      
      return this.parseFundingRates(data);
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      throw new Error('Failed to fetch funding rates');
    }
  }

  private parseFundingRates(data: any[]): HyperLiquidFundingRate[] {
    // Parse the predicted funding rates data structure
    // Data format: [instrumentName, [venueData]] where venueData is [venueName, {fundingRate, nextFundingTime, fundingIntervalHours}]
    const rates: HyperLiquidFundingRate[] = [];
    
    data.forEach((item: any) => {
      if (Array.isArray(item) && item.length === 2) {
        const instrumentName = item[0];
        const venueData = item[1];
        
        if (Array.isArray(venueData)) {
          venueData.forEach((venue: any) => {
            if (Array.isArray(venue) && venue.length === 2) {
              const venueName = venue[0];
              const fundingInfo = venue[1];
              
              if (fundingInfo && typeof fundingInfo.fundingRate === 'string') {
                const rate = parseFloat(fundingInfo.fundingRate);
                if (!isNaN(rate)) {
                  rates.push({
                    instrument: instrumentName,
                    rate: rate,
                    timestamp: new Date().toISOString(),
                    venue: venueName, // Add venue information
                  });
                }
              }
            }
          });
        }
      }
    });
    
    return rates;
  }

  async getFundingRateForInstrument(instrument: string): Promise<HyperLiquidFundingRate | null> {
    try {
      const rates = await this.getFundingRates();
      return rates.find(rate => rate.instrument === instrument) || null;
    } catch (error) {
      console.error(`Error fetching funding rate for ${instrument}:`, error);
      return null;
    }
  }

  async getInstruments(): Promise<HyperLiquidInstrument[]> {
    try {
      const meta = await this.getMeta();
      return meta.universe.filter(instrument => instrument.type === 'perp');
    } catch (error) {
      console.error('Error fetching instruments:', error);
      throw new Error('Failed to fetch instruments');
    }
  }
}

// Singleton instance
export const hyperliquidAPI = new HyperLiquidAPI(); 