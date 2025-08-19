import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Test API is working' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Test API received:', body)
    
    return NextResponse.json({ 
      message: 'Test POST successful',
      receivedData: body 
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({ error: 'Test failed' }, { status: 500 })
  }
}
