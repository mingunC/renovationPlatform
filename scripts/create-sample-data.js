const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data...')

    // 1. 샘플 고객 생성
    const customer = await prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'customer@example.com',
        name: '김고객',
        phone: '010-1234-5678',
        type: 'CUSTOMER'
      }
    })
    console.log('✅ Customer created:', customer.email)

    // 2. 샘플 업체 생성
    const contractor = await prisma.user.upsert({
      where: { email: 'mystars100826@gmail.com' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'mystars100826@gmail.com',
        name: 'mystars100826',
        phone: '010-9876-5432',
        type: 'CONTRACTOR'
      }
    })
    console.log('✅ Contractor created:', contractor.email)

    // 3. 업체 프로필 생성
    const contractorProfile = await prisma.contractor.upsert({
      where: { user_id: contractor.id },
      update: {},
      create: {
        user_id: contractor.id,
        business_name: 'mystars100826 업체',
        phone: '010-9876-5432',
        categories: ['KITCHEN', 'BATHROOM'],
        service_areas: ['서울', '경기'],
        business_license_number: 'LIC-001',
        insurance_document_url: 'https://example.com/insurance.pdf',
        wsib_certificate_url: 'https://example.com/wsib.pdf',
        insurance_verified: true,
        wsib_verified: true,
        profile_completed: true,
        completion_percentage: 100
      }
    })
    console.log('✅ Contractor profile created:', contractorProfile.business_name)

    // 4. 샘플 프로젝트 1 생성 (OPEN 상태)
    const project1 = await prisma.renovationRequest.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        customer_id: customer.id,
        property_type: 'DETACHED_HOUSE',
        category: 'KITCHEN',
        budget_range: 'RANGE_50_100K',
        postal_code: '12345',
        address: '서울시 강남구 테헤란로 123',
        description: '주방 리노베이션 프로젝트입니다. 현대적인 디자인으로 업그레이드하고 싶습니다.',
        status: 'OPEN',
        timeline: 'WITHIN_3MONTHS',
        photos: ['https://example.com/kitchen1.jpg', 'https://example.com/kitchen2.jpg'],
        created_at: new Date('2024-08-10')
      }
    })
    console.log('✅ Project 1 created:', project1.description.substring(0, 30) + '...')

    // 5. 샘플 프로젝트 2 생성 (BIDDING_OPEN 상태)
    const project2 = await prisma.renovationRequest.create({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        customer_id: customer.id,
        property_type: 'CONDO',
        category: 'BATHROOM',
        budget_range: 'UNDER_50K',
        postal_code: '67890',
        address: '서울시 서초구 서초대로 456',
        description: '욕실 리노베이션 프로젝트입니다. 깔끔하고 실용적인 디자인으로 바꾸고 싶습니다.',
        status: 'BIDDING_OPEN',
        timeline: 'WITHIN_1MONTH',
        photos: ['https://example.com/bathroom1.jpg'],
        bidding_start_date: new Date('2024-08-12'),
        bidding_end_date: new Date('2024-08-19'),
        created_at: new Date('2024-08-11'),
        updated_at: new Date('2024-08-11')
      }
    })
    console.log('✅ Project 2 created:', project2.description.substring(0, 30) + '...')

    // 6. 샘플 입찰 생성 (프로젝트 2에 대해)
    const bid = await prisma.bid.create({
      data: {
        request_id: project2.id,
        contractor_id: contractorProfile.id,
        total_amount: 45000000, // 4,500만원
        timeline_weeks: 6,
        start_date: new Date('2024-09-01'),
        labor_cost: 25000000,
        material_cost: 15000000,
        permit_cost: 2000000,
        disposal_cost: 3000000,
        included_items: '욕실 타일, 수도 설비, 조명, 환기 시스템',
        excluded_items: '가구, 액세서리',
        notes: '품질 좋은 재료를 사용하여 내구성 있는 욕실을 만들어드리겠습니다.',
        status: 'PENDING'
      }
    })
    console.log('✅ Sample bid created:', bid.id)

    console.log('🎉 Sample data created successfully!')
    console.log('\n📊 Summary:')
    console.log('- Customers: 1')
    console.log('- Contractors: 1')
    console.log('- Projects: 2')
    console.log('- Bids: 1')

  } catch (error) {
    console.error('❌ Error creating sample data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()
