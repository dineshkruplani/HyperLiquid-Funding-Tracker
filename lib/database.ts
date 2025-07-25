import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getInstruments() {
  return await prisma.instrument.findMany({
    include: {
      fundingRates: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });
}

export async function getFundingRates(
  instrumentId?: string,
  limit: number = 100,
  offset: number = 0
) {
  const where = instrumentId ? { instrumentId } : {};
  
  return await prisma.fundingRate.findMany({
    where,
    include: {
      instrument: true,
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function getAnalytics(
  instrumentId?: string,
  period: string = '1d',
  limit: number = 100
) {
  const where = instrumentId ? { instrumentId, period } : { period };
  
  return await prisma.analytics.findMany({
    where,
    include: {
      instrument: true,
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function createFundingRate(data: {
  instrumentId: string;
  rate: number;
  timestamp: Date;
  venue?: string;
  blockNumber?: bigint;
  txHash?: string;
}) {
  return await prisma.fundingRate.upsert({
    where: {
      instrumentId_venue_timestamp: {
        instrumentId: data.instrumentId,
        venue: data.venue || 'HlPerp',
        timestamp: data.timestamp,
      },
    },
    update: data,
    create: data,
  });
}

export async function createAnalytics(data: {
  instrumentId: string;
  period: string;
  avgRate: number;
  maxRate: number;
  minRate: number;
  volatility: number;
  yield: number;
  timestamp: Date;
}) {
  return await prisma.analytics.upsert({
    where: {
      instrumentId_period_timestamp: {
        instrumentId: data.instrumentId,
        period: data.period,
        timestamp: data.timestamp,
      },
    },
    update: data,
    create: data,
  });
} 