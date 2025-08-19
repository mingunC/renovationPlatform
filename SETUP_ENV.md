# 환경 변수 설정 가이드

## 🚨 현재 문제
파일 업로드 API에서 500 에러가 발생하고 있습니다. 이는 Supabase 환경 변수가 설정되지 않았기 때문입니다.

## 🔧 해결 방법

### 1. 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하세요:

```bash
cp env.example .env.local
```

### 2. Supabase 설정
1. [Supabase](https://supabase.com/)에 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Settings > API에서 다음 값들을 복사:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 3. .env.local 파일 수정
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# 기타 설정...
```

### 4. Supabase Storage 버킷 생성
1. Supabase 대시보드에서 Storage로 이동
2. `estimate-files` 버킷 생성
3. Public 버킷으로 설정 (또는 적절한 정책 설정)

### 5. 서버 재시작
```bash
npm run dev
```

## 🧪 테스트
환경 변수 설정 후 `/test-mobile-popup` 페이지에서 파일 업로드를 테스트해보세요.

## 📝 참고사항
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션에서는 Vercel 등의 플랫폼에서 환경 변수를 설정하세요
- Supabase Service Role Key는 서버에서만 사용하고 클라이언트에 노출하지 마세요
