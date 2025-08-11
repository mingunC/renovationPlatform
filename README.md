# 🏠 GTA 리노베이션 플랫폼

GTA 지역의 고객과 리노베이션 업체를 연결하는 현대적인 플랫폼입니다. 현장 방문 일정 관리와 체계적인 입찰 시스템을 통해 투명하고 효율적인 리노베이션 프로세스를 제공합니다.

## ✨ 주요 기능

### 🎯 **고객 기능**
- **다단계 견적 요청 폼**: 프로젝트 세부사항을 체계적으로 입력
- **예산 범위 선택**: Under $50K, $50K-$100K, Over $100K
- **위치 기반 서비스**: 캐나다 우편번호 자동 인식
- **업체 비교**: 입찰서 비교 및 업체 선택

### 🔨 **업체 기능**
- **4-탭 대시보드**: 새 요청, 현장 방문, 입찰 진행중, 내 입찰
- **현장 방문 참여**: 원클릭 참여/불참 의사 표시
- **실시간 입찰**: 경쟁력 있는 견적 제출
- **프로젝트 관리**: 진행 중인 프로젝트 추적

### 🤖 **자동화 시스템**
- **Inspection & Bidding Workflow**: 체계적인 현장 방문 → 입찰 프로세스
- **Cron Job 자동화**: 입찰 시작/마감 자동 처리
- **이메일 알림**: 각 단계별 자동 알림 발송
- **실시간 업데이트**: 15분마다 데이터 자동 갱신

## 🛠 기술 스택

### **Frontend**
- **Next.js 14** - App Router, Server Components
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 모던 스타일링
- **Shadcn/ui** - 재사용 가능한 컴포넌트

### **Backend**
- **Next.js API Routes** - 서버리스 API
- **Prisma ORM** - 데이터베이스 관리
- **Supabase** - 인증 및 데이터베이스
- **Zod** - 스키마 검증

### **Infrastructure**
- **Vercel** - 배포 및 호스팅
- **Vercel Cron Jobs** - 자동화 스케줄링
- **PostgreSQL** - 관계형 데이터베이스

## 📋 프로젝트 구조

```
renovate-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (contractor)/      # 업체 전용 페이지
│   ├── (customer)/        # 고객 전용 페이지
│   └── api/               # API 엔드포인트
├── components/            # 재사용 컴포넌트
│   ├── dashboard/         # 대시보드 컴포넌트
│   ├── emails/            # 이메일 템플릿
│   ├── forms/             # 폼 컴포넌트
│   └── ui/                # 기본 UI 컴포넌트
├── lib/                   # 유틸리티 라이브러리
├── prisma/                # 데이터베이스 스키마
└── types/                 # TypeScript 타입 정의
```

## 🚀 시작하기

### **1. 저장소 클론**
```bash
git clone https://github.com/mingunC/renovationPlatform.git
cd renovationPlatform
```

### **2. 의존성 설치**
```bash
npm install
```

### **3. 환경 변수 설정**
```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수 설정
```

필요한 환경 변수:
```
DATABASE_URL="your-supabase-database-url"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
CRON_SECRET="your-cron-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### **4. 데이터베이스 설정**
```bash
npx prisma generate
npx prisma db push
```

### **5. 개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

## 🔄 새로운 Inspection & Bidding 워크플로우

### **단계별 프로세스**

1. **견적 요청 등록** (`OPEN`)
   - 고객이 리노베이션 요청 제출

2. **현장 방문 일정 설정** (`INSPECTION_SCHEDULED`)
   - 관리자가 현장 방문 일정 설정
   - 관련 업체들에게 자동 이메일 발송

3. **업체 참여 의사 표시**
   - 업체들이 현장 방문 참여/불참 표시
   - 대시보드에서 원클릭 응답

4. **입찰 시작** (`BIDDING_OPEN`)
   - 현장 방문일 당일 자동으로 입찰 시작
   - 참여 업체들에게 입찰 시작 알림

5. **입찰 마감** (`BIDDING_CLOSED`)
   - 입찰 마감일 자동 처리
   - 고객에게 입찰 결과 알림

6. **업체 선택** (`CONTRACTOR_SELECTED`)
   - 고객이 최적 업체 선택

## 📊 데이터베이스 스키마

### **핵심 모델**
- `User`: 사용자 (고객/업체)
- `Contractor`: 업체 정보
- `RenovationRequest`: 리노베이션 요청
- `Bid`: 입찰서
- `InspectionInterest`: 현장 방문 참여 의사 (신규)

### **새로운 상태값**
```prisma
enum RequestStatus {
  OPEN                    // 기존: 견적 요청 등록됨
  INSPECTION_SCHEDULED    // 신규: 현장 방문 일정 설정됨
  BIDDING_OPEN           // 신규: 입찰 진행 중
  BIDDING_CLOSED         // 신규: 입찰 마감
  CONTRACTOR_SELECTED    // 신규: 업체 선택됨
  CLOSED                 // 기존: 마감됨
  COMPLETED              // 기존: 완료됨
}
```

## 🤖 자동화 기능

### **Vercel Cron Jobs**
```json
{
  "crons": [
    {
      "path": "/api/cron/start-bidding",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/close-bidding", 
      "schedule": "0 0 * * *"
    }
  ]
}
```

### **실시간 업데이트**
- 15분마다 자동 데이터 새로고침
- 마지막 업데이트 시간 표시

## 📧 이메일 시스템

### **자동 발송 이메일**
- `InspectionDateSetEmail`: 현장 방문 일정 설정 알림
- `BiddingStartedEmail`: 입찰 시작 알림
- `NewBidEmail`: 새 입찰서 제출 알림
- `BidAcceptedEmail`: 입찰 수락 알림

## 🚀 배포

### **Vercel 배포**
```bash
npm run build
vercel --prod
```

### **환경 변수 설정**
Vercel 대시보드에서 프로덕션 환경 변수 설정

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/mingunC/renovationPlatform](https://github.com/mingunC/renovationPlatform)

---

**🏠 GTA 리노베이션 플랫폼 - 더 나은 리노베이션 경험을 위해** 🚀