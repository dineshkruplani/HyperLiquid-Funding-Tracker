import { NextRequest, NextResponse } from 'next/server';
import { dataCollector } from '@/lib/data-collector';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start':
        await dataCollector.startCollection();
        return NextResponse.json({
          success: true,
          message: 'Data collection started',
        });

      case 'stop':
        await dataCollector.stopCollection();
        return NextResponse.json({
          success: true,
          message: 'Data collection stopped',
        });

      case 'status':
        const status = await dataCollector.getCollectionStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error with data collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage data collection' },
      { status: 500 }
    );
  }
} 