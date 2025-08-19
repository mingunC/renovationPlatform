# Manual Fix Guide for User Types

## 현재 상태
- ✅ `admin@renovate.com` - 삭제 완료
- ❌ `canadabeavers8@gmail.com` - CUSTOMER (ADMIN으로 변경 필요)
- ❌ `mingun.ryan.choi@gmail.com` - ADMIN (CUSTOMER로 변경 필요)

## 방법 1: 스크립트 실행 (권장)

```bash
# 1. 프로젝트 디렉토리로 이동
cd renovationPlatform

# 2. Retry 로직이 포함된 스크립트 실행
npx tsx scripts/fix-user-types-retry.ts
```

이 스크립트는:
- 자동 재시도 (최대 3회)
- 타임아웃 설정 (10초)
- Exponential backoff (재시도 간격 증가)

## 방법 2: Supabase 대시보드에서 수동 수정

### Step 1: Supabase 대시보드 접속
1. [Supabase Dashboard](https://app.supabase.com) 로그인
2. 해당 프로젝트 선택

### Step 2: Table Editor 접근
1. 왼쪽 메뉴에서 **Table Editor** 클릭
2. `users` 테이블 선택

### Step 3: 사용자 타입 수정

#### canadabeavers8@gmail.com → ADMIN
1. 테이블에서 `canadabeavers8@gmail.com` 찾기
2. `type` 컬럼 클릭
3. `CUSTOMER` → `ADMIN` 변경
4. 저장

#### mingun.ryan.choi@gmail.com → CUSTOMER
1. 테이블에서 `mingun.ryan.choi@gmail.com` 찾기
2. `type` 컬럼 클릭
3. `ADMIN` → `CUSTOMER` 변경
4. 저장

## 방법 3: SQL Editor 사용

Supabase Dashboard > SQL Editor에서:

```sql
-- canadabeavers8@gmail.com을 ADMIN으로 변경
UPDATE users 
SET type = 'ADMIN' 
WHERE email = 'canadabeavers8@gmail.com';

-- mingun.ryan.choi@gmail.com을 CUSTOMER로 변경
UPDATE users 
SET type = 'CUSTOMER' 
WHERE email = 'mingun.ryan.choi@gmail.com';

-- 결과 확인
SELECT email, type 
FROM users 
WHERE email IN (
  'canadabeavers8@gmail.com', 
  'mingun.ryan.choi@gmail.com'
);
```

## 최종 확인

변경 후 확인할 사항:
- `canadabeavers8@gmail.com` = **ADMIN** ✅
- `mingun.ryan.choi@gmail.com` = **CUSTOMER** ✅
- `admin@renovate.com` = 존재하지 않음 ✅

## 문제 해결

### 네트워크 오류가 계속되는 경우:
1. VPN 연결 확인/해제
2. 인터넷 연결 상태 확인
3. Supabase 서비스 상태 확인: https://status.supabase.com
4. 잠시 후 다시 시도

### 권한 오류가 발생하는 경우:
1. `.env.local` 파일의 `SUPABASE_SERVICE_ROLE_KEY` 확인
2. Supabase Dashboard > Settings > API에서 Service Role Key 재확인

## 완료 후 테스트

```bash
# 변경사항 확인
npx tsx scripts/check-users.ts

# 또는 웹사이트에서 직접 로그인 테스트
# canadabeavers8@gmail.com으로 로그인 → /admin 페이지 접근 가능 확인
# mingun.ryan.choi@gmail.com으로 로그인 → 일반 사용자 화면 확인
```
