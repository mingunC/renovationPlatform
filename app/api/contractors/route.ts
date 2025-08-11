import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      business_name,
      business_number,
      service_areas,
      categories,
    } = await request.json()

    // Find the user in our database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.type !== 'CONTRACTOR') {
      return NextResponse.json({ error: 'User is not a contractor' }, { status: 400 })
    }

    // Create contractor profile
    const contractor = await prisma.contractor.create({
      data: {
        user_id: dbUser.id,
        business_name,
        business_number,
        service_areas,
        categories,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ contractor })
  } catch (error) {
    console.error('Contractor creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      // Get specific contractor by user ID
      const contractor = await prisma.contractor.findUnique({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      if (!contractor) {
        return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
      }

      return NextResponse.json({ contractor })
    } else {
      // Get all contractors
      const contractors = await prisma.contractor.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          rating: 'desc'
        }
      })

      return NextResponse.json({ contractors })
    }
  } catch (error) {
    console.error('Contractor fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      business_name,
      business_number,
      service_areas,
      categories,
    } = await request.json()

    // Update contractor profile
    const contractor = await prisma.contractor.update({
      where: { user_id: user.id },
      data: {
        business_name,
        business_number,
        service_areas,
        categories,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json({ contractor })
  } catch (error) {
    console.error('Contractor update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
