import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const additionalStatuses = searchParams.get('additionalStatuses')?.split(',') || []

    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile to find customer ID
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, type')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile || userProfile.type !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      )
    }

    // Build query for renovation requests
    let query = supabase
      .from('renovation_requests')
      .select(`
        id,
        status,
        category,
        budget_range,
        timeline,
        postal_code,
        address,
        description,
        photos,
        inspection_date,
        created_at,
        customer:users!renovation_requests_customer_id_fkey(
          id,
          name,
          email,
          phone
        )
      `)
      .eq('customer_id', userProfile.id);
    
    if (status) {
      query = query.eq('status', status);
    } else if (additionalStatuses.length > 0) {
      query = query.in('status', additionalStatuses);
    }

    // Get renovation requests
    const { data: requests, error: requestsError } = await query
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    // Get bids count for each request
    const requestsWithCounts = await Promise.all(
      (requests || []).map(async (request) => {
        // Get bids count
        const { count: bidsCount } = await supabase
          .from('bids')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', request.id);

        // Get inspection interests count
        const { count: inspectionInterestsCount } = await supabase
          .from('inspection_interests')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', request.id);

        return {
          ...request,
          _count: {
            bids: bidsCount || 0,
            inspection_interests: inspectionInterestsCount || 0
          }
        };
      })
    );

    console.log(`✅ Fetched ${requestsWithCounts.length} projects for customer ${userProfile.id}`);

    return NextResponse.json({
      success: true,
      requests: requestsWithCounts
    })

  } catch (error) {
    console.error('Error fetching my projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch my projects' },
      { status: 500 }
    )
  }
}
