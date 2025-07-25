import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const period = searchParams.get('period') || '1d';
    const limit = parseInt(searchParams.get('limit') || '100');

    const analytics = await getAnalytics(
      instrumentId || undefined,
      period,
      limit
    );

    return NextResponse.json({
      success: true,
      data: analytics,
      count: analytics.length,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
} 