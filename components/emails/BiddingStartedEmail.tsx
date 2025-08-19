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

interface BiddingStartedEmailProps {
  contractorName: string
  businessName?: string
  project: {
    id: string
    category: string
    property_type: string
    budget_range: string
    address: string
    description: string
    bidding_end_date: Date
  }
  customerName: string
  biddingUrl: string
}

export const BiddingStartedEmail = ({
  contractorName,
  businessName,
  project,
  customerName,
  biddingUrl,
}: BiddingStartedEmailProps) => {
  const previewText = `🎯 ${project.category} 프로젝트 입찰이 시작되었습니다!`

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
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
              🎯 입찰이 시작되었습니다!
            </Heading>

            <Text style={BaseEmailStyles.text}>
              안녕하세요, <strong>{businessName || contractorName}</strong>님!
            </Text>

            <Text style={BaseEmailStyles.text}>
              현장 방문에 참여하신 프로젝트의 입찰이 시작되었습니다. 
              경쟁력 있는 견적을 제출하여 프로젝트를 성공적으로 수주하세요!
            </Text>

            <Section style={BaseEmailStyles.highlightBox}>
              <Heading as="h2" style={BaseEmailStyles.subHeading}>
                📋 프로젝트 정보
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
                  <strong>입찰 마감일:</strong> {formatDate(project.bidding_end_date)}
                </li>
              </ul>

              <Text style={BaseEmailStyles.description}>
                <strong>프로젝트 설명:</strong><br />
                {project.id}
              </Text>
            </Section>

            <Section style={BaseEmailStyles.ctaSection}>
              <Text style={BaseEmailStyles.text}>
                🚀 <strong>지금 바로 입찰서를 제출하세요!</strong>
              </Text>
              
              <Button style={BaseEmailStyles.button} href={biddingUrl}>
                입찰서 제출하기
              </Button>
            </Section>

            <Section style={BaseEmailStyles.infoBox}>
              <Heading as="h3" style={BaseEmailStyles.subHeading}>
                ⏰ 중요한 일정
              </Heading>
              
              <Text style={BaseEmailStyles.text}>
                • <strong>입찰 시작:</strong> {formatDate(new Date())}<br />
                • <strong>입찰 마감:</strong> {formatDate(project.bidding_end_date)}<br />
                • <strong>입찰 기간:</strong> 7일
              </Text>
              
              <Text style={BaseEmailStyles.warning}>
                ⚠️ 입찰 마감일을 놓치지 마세요! 마감 후에는 입찰서를 제출할 수 없습니다.
          </Text>
            </Section>

            <Section style={BaseEmailStyles.tipsSection}>
              <Heading as="h3" style={BaseEmailStyles.subHeading}>
                💡 입찰 성공 팁
              </Heading>
              
              <ul style={BaseEmailStyles.list}>
                <li style={BaseEmailStyles.listItem}>
                  상세하고 정확한 견적서 작성
                </li>
                <li style={BaseEmailStyles.listItem}>
                  경쟁력 있는 가격 제시
                </li>
                <li style={BaseEmailStyles.listItem}>
                  명확한 작업 범위와 일정 제시
                </li>
                <li style={BaseEmailStyles.listItem}>
                  고객의 요구사항을 정확히 파악하여 반영
                </li>
              </ul>
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

export default BiddingStartedEmail
