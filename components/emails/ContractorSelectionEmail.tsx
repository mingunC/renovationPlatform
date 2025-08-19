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

interface ContractorSelectionEmailProps {
  customerName: string
  project: {
    id: string
    category: string
    property_type: string
    budget_range: string
    address: string
    description: string
  }
  selectedContractor: {
    business_name?: string
    user: {
      name: string
      email: string
      phone?: string
    }
    rating: number
    review_count: number
  }
  bid: {
    total_amount: number
    timeline_weeks: number
    included_items: string
    notes: string
  }
  projectUrl: string
}

export const ContractorSelectionEmail = ({
  customerName,
  project,
  selectedContractor,
  bid,
  projectUrl,
}: ContractorSelectionEmailProps) => {
  const previewText = `🎉 ${project.category} 프로젝트 업체가 선정되었습니다!`

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
              🎉 프로젝트 업체가 선정되었습니다!
            </Heading>

            <Text style={BaseEmailStyles.text}>
              안녕하세요, <strong>{customerName}</strong>님!
            </Text>

            <Text style={BaseEmailStyles.text}>
              축하합니다! 요청하신 프로젝트에 최적의 업체가 선정되었습니다. 
              이제 프로젝트 진행을 위한 다음 단계를 안내해 드리겠습니다.
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
              </ul>

              <Text style={BaseEmailStyles.description}>
                <strong>프로젝트 설명:</strong><br />
                {project.description}
              </Text>
            </Section>

            <Section style={BaseEmailTemplate.successBox}>
              <Heading as="h2" style={BaseEmailTemplate.subHeading}>
                🏆 선정된 업체 정보
              </Heading>
              
              <List style={BaseEmailTemplate.list}>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>업체명:</strong> {selectedContractor.business_name || selectedContractor.user.name}
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>담당자:</strong> {selectedContractor.user.name}
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>이메일:</strong> {selectedContractor.user.email}
                </ListItem>
                {selectedContractor.user.phone && (
                  <ListItem style={BaseEmailTemplate.listItem}>
                    <strong>전화번호:</strong> {selectedContractor.user.phone}
                  </ListItem>
                )}
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>평점:</strong> ⭐ {selectedContractor.rating}/5 ({selectedContractor.review_count}개 리뷰)
                </ListItem>
              </List>
            </Section>

            <Section style={BaseEmailTemplate.highlightBox}>
              <Heading as="h3" style={BaseEmailTemplate.subHeading}>
                💰 승인된 견적서
              </Heading>
              
              <List style={BaseEmailTemplate.list}>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>총 견적:</strong> {formatCurrency(bid.total_amount)}
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>작업 기간:</strong> {bid.timeline_weeks}주
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>포함 항목:</strong> {bid.included_items}
                </ListItem>
                {bid.notes && (
                  <ListItem style={BaseEmailTemplate.listItem}>
                    <strong>특이사항:</strong> {bid.notes}
                  </ListItem>
                )}
              </List>
            </Section>

            <Section style={BaseEmailTemplate.ctaSection}>
              <Text style={BaseEmailTemplate.text}>
                🚀 <strong>프로젝트 진행을 위한 다음 단계</strong>
              </Text>
              
              <Button style={BaseEmailTemplate.button} href={projectUrl}>
                프로젝트 상세 보기
              </Button>
            </Section>

            <Section style={BaseEmailTemplate.infoBox}>
              <Heading as="h3" style={BaseEmailTemplate.subHeading}>
                📋 다음 단계 안내
              </Heading>
              
              <List style={BaseEmailTemplate.list}>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>1단계:</strong> 선정된 업체와 연락하여 프로젝트 세부사항 논의
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>2단계:</strong> 계약서 작성 및 서명 (업체에서 제공)
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>3단계:</strong> 프로젝트 시작일 및 일정 조율
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>4단계:</strong> 프로젝트 진행 및 모니터링
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>5단계:</strong> 프로젝트 완료 후 리뷰 작성
                </ListItem>
              </List>
            </Section>

            <Section style={BaseEmailTemplate.tipsSection}>
              <Heading as="h3" style={BaseEmailTemplate.subHeading}>
                💡 프로젝트 성공을 위한 팁
              </Heading>
              
              <List style={BaseEmailTemplate.list}>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>명확한 소통:</strong> 프로젝트 요구사항과 기대사항을 명확히 전달하세요
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>정기적인 업데이트:</strong> 업체와 정기적으로 진행상황을 확인하세요
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>변경사항 공유:</strong> 프로젝트 진행 중 변경사항이 있으면 즉시 공유하세요
                </ListItem>
                <ListItem style={BaseEmailTemplate.listItem}>
                  <strong>품질 관리:</strong> 각 단계별로 작업 품질을 확인하고 피드백을 제공하세요
                </ListItem>
              </List>
            </Section>

            <Section style={BaseEmailTemplate.warningBox}>
              <Heading as="h3" style={BaseEmailTemplate.subHeading}>
                ⚠️ 주의사항
              </Heading>
              
              <Text style={BaseEmailTemplate.text}>
                • 계약서에 명시된 조건과 일정을 준수해 주세요<br />
                • 프로젝트 진행 중 문제가 발생하면 즉시 업체와 소통하세요<br />
                • 결제는 계약서에 명시된 조건에 따라 진행하세요<br />
                • 프로젝트 완료 후 만족스러운 결과를 위해 리뷰를 작성해 주세요
              </Text>
            </Section>

            <Hr style={BaseEmailTemplate.divider} />

            <Text style={BaseEmailTemplate.footer}>
              프로젝트 진행 중 문의사항이 있으시면 언제든지 연락주세요.<br />
              <Link href="mailto:support@renovate.com" style={BaseEmailTemplate.link}>
                support@renovate.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ContractorSelectionEmail
