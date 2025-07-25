import { NextRequest, NextResponse } from 'next/server';
import { getInstruments } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const instruments = await getInstruments();

    return NextResponse.json({
      success: true,
      data: instruments,
      count: instruments.length,
    });
  } catch (error) {
    console.error('Error fetching instruments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch instruments' },
      { status: 500 }
    );
  }
} 