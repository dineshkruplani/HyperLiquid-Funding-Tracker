import { NextRequest, NextResponse } from 'next/server';
import { getFundingRates } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const fundingRates = await getFundingRates(
      instrumentId || undefined,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: fundingRates,
      count: fundingRates.length,
    });
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch funding rates' },
      { status: 500 }
    );
  }
} 