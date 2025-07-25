import { NextRequest, NextResponse } from 'next/server';
import { backgroundService } from '@/lib/background-service';

export async function GET(request: NextRequest) {
  try {
    const status = backgroundService.getStatus();
    
    return NextResponse.json({
      success: true,
      data: {
        server: {
          status: 'running',
          timestamp: new Date().toISOString(),
        },
        backgroundService: status,
        message: 'HyperLiquid Funding Tracker is running with automatic data collection',
      },
    });
  } catch (error) {
    console.error('Error getting status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get status' },
      { status: 500 }
    );
  }
} 