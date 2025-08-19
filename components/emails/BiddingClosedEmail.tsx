import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'
import { BaseEmailStyles } from './BaseEmailTemplate'

interface BiddingClosedEmailProps {
  customerName: string
  project: {
    id: string
    category: string
    property_type: string
    budget_range: string
    address: string
    description: string
    bidding_start_date: Date
    bidding_end_date: Date
  }
  bids: Array<{
    id: string
    contractor: {
      business_name?: string
      user: {
        name: string
        email: string
      }
    }
    total_amount: number
    timeline_weeks: number
    included_items: string
    notes: string
  }>
  projectUrl: string
}

export const BiddingClosedEmail = ({
  customerName,
  project,
  bids,
  projectUrl,
}: BiddingClosedEmailProps) => {
  const previewText = `🏁 ${project.category} 프로젝트 입찰이 마감되었습니다!`

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount)
  }

  const getBudgetRangeText = (range: string) => {
    const budgetMap: Record<string, string> = {
      'UNDER_50K': '50만원 미만',
      'RANGE_50_100K': '50만원 - 100만원',
      'OVER_100K': '100만원 이상',
    }
    return budgetMap[range] || range
  }

  const getCategoryText = (category: string) => {
    const categoryMap: Record<string, string> = {
      'KITCHEN': '주방 리노베이션',
      'BATHROOM': '욕실 리노베이션',
      'BASEMENT': '지하실 리노베이션',
      'FLOORING': '바닥재',
      'PAINTING': '페인팅',
      'OTHER': '기타',
      'OFFICE': '사무실',
      'RETAIL': '상업용',
      'CAFE_RESTAURANT': '카페/레스토랑',
      'EDUCATION': '교육시설',
      'HOSPITALITY_HEALTHCARE': '호텔/의료시설',
    }
    return categoryMap[category] || category
  }

  const getPropertyTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      'DETACHED_HOUSE': '단독주택',
      'TOWNHOUSE': '타운하우스',
      'CONDO': '콘도',
      'COMMERCIAL': '상업용 부동산',
    }
    return typeMap[type] || type
  }

  const lowestBid = bids.length > 0 ? Math.min(...bids.map(bid => bid.total_amount)) : 0
  const highestBid = bids.length > 0 ? Math.max(...bids.map(bid => bid.total_amount)) : 0

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={BaseEmailStyles.body}>
        <Container style={BaseEmailStyles.container}>
          <Section style={BaseEmailStyles.header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="40"
              alt="Renovate Platform"
              style={BaseEmailStyles.logo}
            />
          </Section>

          <Section style={BaseEmailStyles.content}>
            <Heading style={BaseEmailStyles.heading}>
              🏁 입찰이 마감되었습니다!
            </Heading>

            <Text style={BaseEmailStyles.text}>
              안녕하세요, <strong>{customerName}</strong>님!
            </Text>

            <Text style={BaseEmailStyles.text}>
              요청하신 프로젝트의 입찰 기간이 마감되었습니다. 
              제출된 견적서들을 검토하고 최적의 업체를 선택해 주세요.
            </Text>

            <Section style={BaseEmailStyles.highlightBox}>
              <Heading as="h2" style={BaseEmailStyles.subHeading}>
                📋 프로젝트 요약
              </Heading>
              
              <ul style={BaseEmailStyles.list}>
                <li style={BaseEmailStyles.listItem}>
                  <strong>프로젝트 ID:</strong> {project.id}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>카테고리:</strong> {getCategoryText(project.category)}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>부동산 유형:</strong> {getPropertyTypeText(project.property_type)}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>예산 범위:</strong> {getBudgetRangeText(project.budget_range)}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>주소:</strong> {project.address}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>입찰 시작:</strong> {formatDate(project.bidding_start_date)}
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>입찰 마감:</strong> {formatDate(project.bidding_end_date)}
                </li>
              </ul>

              <Text style={BaseEmailStyles.description}>
                <strong>프로젝트 설명:</strong><br />
                {project.description}
              </Text>
            </Section>

            <Section style={BaseEmailStyles.infoBox}>
              <Heading as="h3" style={BaseEmailStyles.subHeading}>
                📊 입찰 결과 요약
              </Heading>
              
              <Text style={BaseEmailStyles.text}>
                • <strong>총 입찰 수:</strong> {bids.length}개<br />
                • <strong>최저가:</strong> {formatCurrency(lowestBid)}<br />
                • <strong>최고가:</strong> {formatCurrency(highestBid)}<br />
                • <strong>평균가:</strong> {bids.length > 0 ? formatCurrency(Math.round(bids.reduce((sum, bid) => sum + bid.total_amount, 0) / bids.length)) : 'N/A'}
              </Text>
            </Section>

            {bids.length > 0 && (
              <Section style={BaseEmailStyles.highlightBox}>
                <Heading as="h3" style={BaseEmailStyles.subHeading}>
                  🏗️ 제출된 견적서 목록
                </Heading>
                
                <table style={BaseEmailStyles.table}>
                  <tr style={BaseEmailStyles.tableHeader}>
                    <td style={BaseEmailStyles.tableCell}>업체명</td>
                    <td style={BaseEmailStyles.tableCell}>총 견적</td>
                    <td style={BaseEmailStyles.tableCell}>작업 기간</td>
                    <td style={BaseEmailStyles.tableCell}>포함 항목</td>
                  </tr>
                  
                  {bids.map((bid, index) => (
                    <tr key={bid.id} style={index % 2 === 0 ? BaseEmailStyles.tableRowEven : BaseEmailStyles.tableRowOdd}>
                      <td style={BaseEmailStyles.tableCell}>
                        <strong>{bid.contractor.business_name || bid.contractor.user.name}</strong><br />
                        <small>{bid.contractor.user.email}</small>
                      </td>
                      <td style={BaseEmailStyles.tableCell}>
                        <strong>{formatCurrency(bid.total_amount)}</strong>
                        {bid.total_amount === lowestBid && (
                          <span style={{ color: '#10b981', fontSize: '12px' }}> 🏆 최저가</span>
                        )}
                      </td>
                      <td style={BaseEmailStyles.tableCell}>{bid.timeline_weeks}주</td>
                      <td style={BaseEmailStyles.tableCell}>
                        {bid.included_items.length > 50 
                          ? `${bid.included_items.substring(0, 50)}...` 
                          : bid.included_items
                        }
                      </td>
                    </tr>
                  ))}
                </table>
              </Section>
            )}

            <Section style={BaseEmailStyles.ctaSection}>
              <Text style={BaseEmailStyles.text}>
                🎯 <strong>이제 최적의 업체를 선택하세요!</strong>
              </Text>
              
              <Text style={BaseEmailStyles.text}>
                제출된 견적서들을 자세히 검토하고, 가격, 일정, 업체 신뢰도를 종합적으로 고려하여 
                프로젝트에 가장 적합한 업체를 선택해 주세요.
              </Text>
              
              <Button style={BaseEmailStyles.button} href={projectUrl}>
                견적서 상세 보기
              </Button>
            </Section>

            <Section style={BaseEmailStyles.tipsSection}>
              <Heading as="h3" style={BaseEmailStyles.subHeading}>
                💡 업체 선택 가이드
              </Heading>
              
              <ul style={BaseEmailStyles.list}>
                <li style={BaseEmailStyles.listItem}>
                  <strong>가격 비교:</strong> 최저가만이 아닌, 적정가를 고려하세요
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>일정 확인:</strong> 요청하신 타임라인과 일치하는지 확인하세요
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>작업 범위:</strong> 포함/제외 항목을 명확히 파악하세요
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>업체 신뢰도:</strong> 평점, 리뷰, 이전 작업 이력을 확인하세요
                </li>
                <li style={BaseEmailStyles.listItem}>
                  <strong>의사소통:</strong> 견적서에 포함된 메모를 통해 업체의 전문성을 평가하세요
                </li>
              </ul>
            </Section>

            <Section style={BaseEmailStyles.warningBox}>
              <Heading as="h3" style={BaseEmailStyles.subHeading}>
                ⚠️ 중요한 안내사항
              </Heading>
              
              <Text style={BaseEmailStyles.text}>
                • 업체 선택은 <strong>24시간 이내</strong>에 완료해 주세요<br />
                • 24시간 내에 업체를 선택하지 않으면 프로젝트가 자동으로 취소됩니다<br />
                • 선택한 업체와의 계약은 별도로 진행됩니다<br />
                • 문의사항이 있으시면 언제든지 연락주세요
              </Text>
            </Section>

            <Hr style={BaseEmailStyles.divider} />

            <Text style={BaseEmailStyles.footer}>
              문의사항이 있으시면 언제든지 연락주세요.<br />
              <Link href="mailto:support@renovate.com" style={BaseEmailStyles.link}>
                support@renovate.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default BiddingClosedEmail
