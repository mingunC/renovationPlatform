import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 간단한 테스트 응답
    return NextResponse.json({
      success: true,
      exists: false,
      message: 'Test response - API is working'
    });

  } catch (error) {
    console.error('Contractor profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Test update response'
    });
  } catch (error) {
    console.error('Contractor profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
