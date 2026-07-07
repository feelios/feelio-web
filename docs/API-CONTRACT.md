# Feelio API-CONTRACT v1

> **이 문서가 프론트(feelio-web)와 백엔드(feelio-api)의 유일한 API 계약이다.**
> 여기 없는 엔드포인트·필드를 임의로 만들지 않는다. 변경이 필요하면 **코드보다 이 문서를 먼저 수정하고 팀에 공유**한 뒤 구현한다. 양쪽 repo의 이 파일은 항상 동일하게 유지한다.
> 근거: 기획 문서 STEP7(DB 설계서)·STEP8(API 명세서)·STEP9(화면-API 워크플로우), 그리고 `feelio-web` 프론트엔드 코드(로컬 상태 및 Mock 데이터 구조) 교차 검증.
> ⚠️ 로그인은 **소셜 로그인(Google/Kakao/Naver) 전용**이다. 이메일/비밀번호 로그인은 만들지 않는다 (팀 확정).

- **API Version**: `v1`
- **Base URL**: `/api` (프론트는 `VITE_API_BASE_URL` 환경변수 사용)
- **인증**: 보호 API는 `Authorization: Bearer <accessToken>` 헤더 필수
- **Content-Type**: `application/json; charset=utf-8`
- **JSON 표기**: camelCase (DB snake_case ↔ 서버 매핑)
- **Naming Rule**: RESTful, 리소스 경로는 kebab-case·복수형 명사
- **Version 관리**: URI 버저닝으로 하위 호환 유지 (필요 시 `/api/v1/...` 도입)
- 모든 개인 데이터는 **인증 주체의 user_id 기준으로만** 조회·변경 (클라;이언트가 보낸 userId는 신뢰하지 않음)

---

## 1. 공통 응답 봉투

성공:
```json
{ "success": true, "data": { } }
```

실패:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "금액은 1원 이상이어야 합니다." } }
```

- HTTP Status는 상황에 맞게 설정(2xx/4xx/5xx)하고, Body는 위 봉투로 통일한다.
- `data`: 실제 페이로드 (실패 시 미포함). `error.message`: 프론트 노출 가능·디버깅용 메시지.

### 에러 코드

| code | HTTP | 의미 |
|---|---|---|
| VALIDATION_ERROR | 400 | 필수 값 누락·형식 오류 (금액 ≤ 0, 메모 200자 초과, 존재하지 않는 emotionId 등) |
| INVALID_PROVIDER | 400 | 지원하지 않는 소셜 제공자 |
| UNAUTHORIZED | 401 | 토큰 없음·검증 실패 |
| TOKEN_EXPIRED | 401 | 액세스 토큰 만료 (프론트: refresh 후 재시도) |
| FORBIDDEN | 403 | 타인 리소스 접근 |
| NOT_FOUND | 404 | 대상 없음 |
| INTERNAL_ERROR | 500 | 서버 오류 |

프론트 공통 처리: `TOKEN_EXPIRED` → `POST /api/auth/token/refresh` → 원 요청 재시도 → 실패 시 로그인 화면. 요청 타임아웃 5초.

## 2. 코드 값 (마스터 시드 — 서버·프론트 공통 기준)

- **감정 8종 (고정, 커스텀 불가):** 신남, 설렘, 뿌듯함, 스트레스, 외로움, 화남, 평온, 무덤덤
- **카테고리:** EXPENSE — 식비, 배달, 카페, 교통, 쇼핑, 문화, 건강, 기타 / INCOME — 급여, 용돈, 기타
- **상황:** 퇴근 후, 혼자 있음, 친구와, 보상, 습관, 이동 중, 아침, 밤
- 감정 색상·정렬의 원본은 웹 `src/styles/theme.js`의 emotionPalette → DB emotions 테이블 시드로 이관
- ⚠️ **감정소비 누수율 관련 API·필드는 만들지 않는다 (제거 확정 기능)**

## 3. 인증 (Auth)

### POST /api/auth/login — 소셜 로그인 · 인증 불필요

Request:
```json
{ "provider": "GOOGLE", "code": "<provider가 리다이렉트로 준 인가 코드>", "redirectUri": "https://feelio.app/auth/callback" }
```
- provider: `GOOGLE` | `KAKAO` | `NAVER`
- code: provider 인가 서버가 redirect로 돌려준 **1회용 authorization code** (짧은 만료·재사용 불가)
- redirectUri: authorize 요청 때 사용한 값과 **정확히 동일**해야 함 (각 provider 콘솔에 사전 등록)
- (PKCE 적용 시) `codeVerifier` 필드 추가 — 권장
- ⚠️ provider access token은 **브라우저로 내려오지 않는다**(백엔드가 서버-투-서버로만 교환)

Response(200) `data`:
```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "user": {
    "userId": 1,
    "nickname": "서연",
    "email": "user@example.com",
    "profileImageUrl": "https://.../photo.jpg",
    "provider": "GOOGLE",
    "onboardingDone": false,
    "themeMode": "LIGHT",
    "auroraTheme": "블루"
  }
}
```
- 서버: **code + redirectUri로 provider와 서버-투-서버 토큰 교환**(client_secret 사용) → 받은 ID/access 토큰 검증 → 제공자 프로필(식별자·이메일·닉네임·**프로필 이미지**) 수신 → `(provider, provider_user_id)` 조회, 없으면 신규 가입(users + social_accounts + notification_settings 기본값 + terms_agreements) → **provider 토큰은 검증 후 폐기(미저장)**
- 에러: INVALID_PROVIDER(400), UNAUTHORIZED(401 — code 만료·재사용·교환 실패 포함)
- 호출 화면: LoginPage / Workflow: `LoginPage → (onboardingDone 값에 따라 OnboardingPage 또는 HomePage)`
- 관련 Entity: `User`, `SocialAccount`, `RefreshToken`

### POST /api/auth/token/refresh — 토큰 재발급 · 인증 불필요

Request: `{ "refreshToken": "..." }`
Response(200) `data`: `{ "accessToken": "...", "refreshToken": "..." }`
- 에러: UNAUTHORIZED(401) → 프론트는 로그인 화면으로

### POST /api/auth/logout — 로그아웃 · 인증 필요

Request 없음 → Response(200) `data`: `{ "loggedOut": true }`
- 서버: refresh_token 폐기. **users.onboarding_done은 유지** (재로그인 시 온보딩 재표시 없음 — 팀 확정)

## 4. 사용자 (Users)

### GET /api/users/me · 인증 필요
Response `data`: login 응답의 `user` 객체와 동일 구조.

### PATCH /api/users/me · 인증 필요
Request: `{ "nickname": "새닉네임" }` (1~8자) → Response `data`: 갱신된 user 객체. 에러: VALIDATION_ERROR

### PATCH /api/users/me/onboarding · 인증 필요
Request 없음 → Response `data`: `{ "onboardingDone": true }`
- 호출 화면: OnboardingPage / Workflow: 첫 목표 생성(`POST /api/goals`) 직후 호출.

### PATCH /api/users/me/settings · 인증 필요
Request: `{ "themeMode": "DARK", "auroraTheme": "핑크" }` (부분 전송 허용) → Response `data`: 갱신된 설정.
- themeMode: `LIGHT` | `DARK` / auroraTheme: theme.js auroras 키

### DELETE /api/users/me — 회원탈퇴 · 인증 필요
Request: `{ "reason": "탈퇴 사유 (선택)" }` → Response `data`: `{ "withdrawn": true }`
- 서버: users.status=WITHDRAWN + 하위 데이터 CASCADE 삭제. 탈퇴 계정 재로그인 정책은 미확정(팀 확정 필요)

## 5. 마스터 (Meta)

### GET /api/meta · 인증 필요
Response `data`:
```json
{
  "emotions":   [ { "emotionId": 4, "name": "스트레스", "color": "#A68BEA", "sortOrder": 4 } ],
  "categories": [ { "categoryId": 3, "name": "카페", "type": "EXPENSE", "sortOrder": 3 } ],
  "situations": [ { "situationId": 1, "name": "퇴근 후", "sortOrder": 1 } ]
}
```
- `is_active=true`만 반환. 프론트는 세션 캐시(TanStack Query staleTime 길게). 기록 입력 폼·필터 옵션·수정 폼이 사용.

## 6. 거래 기록 (Transactions)

### 거래 객체 (응답 공통)
```json
{
  "transactionId": 10,
  "type": "EXPENSE",
  "amount": 18600,
  "category":  { "categoryId": 3, "name": "카페" },
  "emotion":   { "emotionId": 4, "name": "스트레스", "color": "#A68BEA" },
  "situations": [ { "situationId": 1, "name": "퇴근 후" }, { "situationId": 2, "name": "혼자 있음" } ],
  "memo": "달달한 라떼와 케이크",
  "occurredAt": "2026-07-01T21:30:00"
}
```
- type: `EXPENSE` | `INCOME` / 감정·카테고리는 단일, **상황은 복수(N:M)** — 팀 확정

### GET /api/transactions · 인증 필요

| Query | 필수 | 설명 |
|---|---|---|
| year | Y | 연도 |
| month | N | 월 (없으면 연 전체) |
| day | N | 일 |
| emotionId | N | 복수 콤마: `4,5` |
| categoryId | N | 복수 콤마: `1,3` |
| query | N | 메모·카테고리명 부분 검색 |
| sort | N | `date_desc`(기본) `date_asc` `category_asc` `category_desc` `amount_desc` `amount_asc` |

Response `data`:
```json
{ "transactions": [ ], "totalIncome": 2600000, "totalExpense": 320000 }
```
- 서버는 **평면 목록 + 기간 합계**만 반환. 일별/월별/감정별 그룹핑은 프론트 책임.

### POST /api/transactions · 인증 필요
Request:
```json
{
  "type": "EXPENSE",
  "amount": 18600,
  "categoryId": 3,
  "emotionId": 4,
  "situationIds": [1, 2],
  "memo": "달달한 라떼와 케이크",
  "occurredAt": "2026-07-01T21:30:00"
}
```
- 필수: type, amount(>0 정수), categoryId, emotionId, occurredAt
- situationIds: 생략·빈 배열 허용 (최대 5개) / memo: 생략 시 **null 저장**(기본 문자열 저장 금지), 최대 200자
- 서버: transactions + transaction_situations **단일 트랜잭션** 저장. 메모의 HTML/Script 태그는 XSS 방어 필터 적용 필수.

Response(201) `data`: 생성된 거래 객체. 에러: VALIDATION_ERROR
- 호출 화면: RecordPage / Workflow: `RecordPage 입력 → POST → 성공 시 폼 초기화 + 관련 캐시 무효화`
- 관련 Entity: `Transaction`, `TransactionSituation`, `Category`, `Emotion`

### GET /api/transactions/{transactionId} · 인증 필요 — 거래 객체 반환 (딥링크 대비용, 목록 재사용 가능하면 생략)
### PUT /api/transactions/{transactionId} · 인증 필요 — POST와 동일 필드, situationIds는 전량 교체. 에러: VALIDATION_ERROR·FORBIDDEN·NOT_FOUND
### DELETE /api/transactions/{transactionId} · 인증 필요 → `data`: `{ "deleted": true }` (확인 다이얼로그는 프론트 책임)
### DELETE /api/transactions — 전체 초기화 · 인증 필요 → `data`: `{ "deletedCount": 42 }` (프로필>데이터 관리 전용)

## 7. 목표 (Goals)

### 목표 객체
```json
{
  "goalId": 1,
  "name": "제주도 여행",
  "targetAmount": 2000000,
  "currentAmount": 0,
  "startDate": "2026-07-06",
  "dueDate": "2026-10-31",
  "isMain": true,
  "status": "ACTIVE"
}
```

- `GET /api/goals` → `data`: `{ "goals": [ ] }` (isMain은 항상 최대 1건)
- `POST /api/goals` — name, targetAmount(>0) 필수. `isMain: true`면 기존 대표 목표를 서버가 같은 트랜잭션에서 해제
- `PUT /api/goals/{goalId}` — POST와 동일 필드
- `DELETE /api/goals/{goalId}` → `data`: `{ "deleted": true }`
- 온보딩 완료: `POST /api/goals`(isMain=true) 성공 → `PATCH /api/users/me/onboarding` 순서 호출
- 호출 화면: OnboardingPage, Profile Modal / 관련 Entity: `Goal`

## 8. 요약 (Summary) — 홈 화면용

### GET /api/summary/calendar?year&month · 인증 필요
Response `data`:
```json
{
  "days": [
    { "date": "2026-07-01", "dominantEmotion": { "emotionId": 4, "name": "스트레스", "color": "#A68BEA" }, "transactionCount": 2, "totalExpense": 50600 }
  ]
}
```
- 기록 없는 날짜는 배열에서 생략. 대표 감정 동률 시 최근 기록 우선(초안).

### GET /api/summary/emotions?year&month · 인증 필요
Response `data`:
```json
{
  "emotions":  [ { "emotionId": 4, "name": "스트레스", "count": 6, "amount": 140600 } ],
  "prevMonth": [ { "emotionId": 4, "name": "스트레스", "count": 4, "amount": 98000 } ]
}
```
- 지출 기록 기준 집계. 감정 능선(8종 전체 축)·홈 감정 신호(전월 대비)에 사용.

## 9. 분석·평행우주 (3순위 — 스키마 미확정)

- `GET /api/analysis/monthly?year&month` — 카테고리·시간대·감정 집계 + 인사이트 문장
- `GET /api/universe/simulation?goalId&reductionRate` — 두 미래 시나리오 수치·내레이션 (감축률은 쿼리 파라미터)
- **응답 스키마 확정 전 구현 금지. 확정하면 이 문서를 먼저 갱신한다.**

## 10. 캐시 무효화 규칙 (프론트 TanStack Query)

| 변경 | invalidate 대상 |
|---|---|
| 기록 생성/수정/삭제/전체 초기화 | transactions, summary/calendar, summary/emotions, analysis, universe |
| 목표 생성/수정/삭제/대표 변경 | goals, universe |
| 프로필/설정 변경 | users/me |

## 11. 구현 우선순위

| 차수 | 범위 |
|---|---|
| 1차 | auth(login/refresh/logout), meta, users/me(조회·수정·온보딩), transactions CRUD·목록 |
| 2차 | goals CRUD, summary 2종, users/me/settings |
| 3차 | analysis, universe, 회원탈퇴, 전체 초기화 |

---

## 12. Authentication Flow

```text
+----------+                           +-----------+                            +---------------+
|          |   1. 소셜 제공자 SDK 로그인    |           |                            |               |
|  Client  | ------------------------> | OAuth SDK |                            | Backend API   |
| (React)  | <------------------------ | (Google)  |                            |               |
|          |   2. Provider Token 발급   |           |                            |               |
|          |                           +-----------+                            |               |
|          |   3. POST /api/auth/login (Provider Token 전달)                     |               |
|          | -----------------------------------------------------------------> |               |
|          |   4. 토큰 검증 후 사용자 조회/생성, JWT(Access/Refresh) 발급            |               |
|          | <----------------------------------------------------------------- |               |
|          |   5. Access Token 저장 및 이후 모든 요청 Header에 추가                 |               |
+----------+                                                                    +---------------+
```

## 13. API Flow (화면 흐름)

```text
1. 로그인 흐름
LoginPage
  ↓ POST /api/auth/login
[응답 onboardingDone 분기]
  ├─ false → OnboardingPage
  └─ true  → HomePage

2. 온보딩 흐름
OnboardingPage
  ↓ POST /api/goals (첫 목표 등록, isMain=true)
  ↓ PATCH /api/users/me/onboarding (완료 마킹)
HomePage

3. 기록 등록 흐름
HomePage → RecordPage
  ↓ GET /api/meta (선택지 옵션 캐시)
  ↓ POST /api/transactions (지출/수입 등록)
  ↓ (성공 시 프론트 폼 초기화 및 홈/분석 캘린더 캐시 무효화)
RecordPage (새 기록 입력 대기)

4. 거래 내역 조회 및 삭제 흐름
TransactionsPage
  ↓ GET /api/transactions?year=2026&month=7 (목록 조회)
  ↓ DELETE /api/transactions/{id} (삭제 시)
  ↓ (삭제 성공 시 로컬 목록 갱신 및 캐시 무효화)
TransactionsPage
```

## 14. Naming Convention

- URL Path는 항상 명사형 소문자(kebab-case)를 사용한다. (예: `/api/notification-settings`)
- 자원 컬렉션은 복수형을 사용한다. (`/users`, `/transactions`, `/goals`)
- 특정 자원 식별은 경로 변수를 사용한다. (`/api/transactions/{transactionId}`)
- REST로 표현 불가능한 행위는 제한적으로 동사형 경로를 허용한다. (`/auth/login`, `/auth/logout`)

## 15. 문서와 코드의 차이점 요약 (Cross-Verification Notes)

1. **온보딩 API 설계**
   - 문서(STEP 9): `PATCH /api/users/me/onboarding`으로 목표 등록 후 온보딩 완료를 별도 통신으로 갱신.
   - 코드(`useFeelioStoreDc.js`): `completeOnboarding()`에서 목표 추가와 `onboardingDone: true`가 단일 처리됨.
   - **계약**: 문서 기준 2회 호출(`POST /api/goals` → `PATCH /api/users/me/onboarding`)로 확정. 단일 트랜잭션 통합은 향후 개선 후보.
2. **누수율/챌린지 기능**
   - 문서·코드 모두 감정소비 누수율 KPI 제거됨 → 관련 API·필드 만들지 않음(확정).
3. **보완/확인 필요**
   - `DELETE /api/users/me`에 `reason`(선택) 필드 반영 완료.
   - 알림 설정(`/api/users/me/notifications`)은 미확정 기능으로 이번 계약 범위에서 제외(모달 구현 시 재논의).
   - 약관 동의는 로그인 시 서버 신규가입 처리에 포함(별도 엔드포인트 미도입).
   - 평행우주 `reductionRate`는 쿼리 파라미터 방식으로 반영(9절).

## 16. Revision History

- **2026-07-07**: 루트 `API_CONTRACT.md`와 `docs/API-CONTRACT.md`를 병합해 단일 계약으로 통합. 응답 봉투(`success`/`data`)·에러 코드·Base URL(`/api`)·메모 200자 등 스펙은 docs 기준으로 통일하고, 인증/화면 흐름 다이어그램·Naming Convention·교차검증 노트를 흡수.

## 17. 최종 검토 체크리스트

- [x] Workflow와 API가 일치하는가 (화면 흐름 매핑 완료)
- [x] 코드와 문서가 일치하는가 (로컬 Store 방식과 비교 후 차이점 15절 기록)
- [x] 누락 API는 없는가 (탈퇴 사유·전체 초기화 등 반영)
- [x] 중복 Endpoint는 없는가 (URL 계층 설계로 충돌 방지)
- [x] Response 형식이 통일되어 있는가 (`success`/`data` 봉투)
- [x] Error 형식이 통일되어 있는가 (error.code 매핑)
- [x] Swagger(OpenAPI)로 변환 가능한 구조인가 (Data Type·Required·Body Schema 명시)
