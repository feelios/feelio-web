# Feelio API-CONTRACT v1

> **이 문서가 프론트(feelio-web)와 백엔드(feelio-api)의 유일한 API 계약이다.**
> 여기 없는 엔드포인트·필드를 임의로 만들지 않는다. 변경이 필요하면 **코드보다 이 문서를 먼저 수정하고 팀에 공유**한 뒤 구현한다. 양쪽 repo의 이 파일은 항상 동일하게 유지한다.
> 근거: 기획 문서 STEP7(DB 설계서)·STEP8(API 명세서)·STEP9(화면-API 워크플로우), 그리고 `feelio-web` 프론트엔드 코드(로컬 상태 및 Mock 데이터 구조) 교차 검증.
> ⚠️ 로그인은 **소셜 로그인(Google/Kakao/Naver) 전용**이다. 이메일/비밀번호 로그인은 만들지 않는다 (팀 확정).

- **API Version**: `v1`
- **Base URL**: `/api` (프론트는 `VITE_API_BASE_URL` 환경변수 사용)
- **인증**: **BFF 패턴**. 토큰은 `accessToken`·`refreshToken` **HttpOnly 쿠키**로만 오간다(브라우저 JS 노출 금지). 보호 API 호출 시 브라우저가 `accessToken` 쿠키를 자동 전송하며, 프론트는 요청에 `withCredentials`(쿠키 동봉)를 켠다
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
- 감정 색상·정렬의 원본은 웹 `src/styles/theme.js`의 emotionPalette → DB emotions 테이블 시드로 이관
- ⚠️ **감정소비 누수율 관련 API·필드는 만들지 않는다 (제거 확정 기능)**
- ⚠️ **상황(situation) 관련 API·필드·테이블은 만들지 않는다 (제거 확정 기능)**

## 3. 인증 (Auth)

> **BFF 패턴**(Spring Security `oauth2Login`). 프론트는 인가 코드(code)를 직접 다루지 않는다.
> 백엔드가 provider와 서버-투-서버로 교환·검증하고, 자체 JWT를 **HttpOnly 쿠키**로 발급한다.
> provider 토큰도 우리 JWT도 브라우저 JS에 노출되지 않는다.

### 소셜 로그인 (리다이렉트 플로우) · 인증 불필요

로그인 전용 `POST` 엔드포인트는 **없다**. 아래 리다이렉트 흐름으로 처리한다.

1. 프론트가 브라우저를 `GET /oauth2/authorization/{provider}`로 이동시킨다.
   - `{provider}`: `google` | `kakao` | `naver` (Spring Security registrationId, 소문자)
2. provider 로그인·동의 → provider가 백엔드 콜백(`/login/oauth2/code/{provider}`)으로 리다이렉트.
3. 서버: provider와 **서버-투-서버로 code 교환·검증**(client_secret 사용) → 프로필(식별자·이메일·닉네임·**프로필 이미지**) 수신 → `(provider, provider_user_id)` 조회, 없으면 신규 가입(users + social_accounts + notification_settings 기본값 + terms_agreements) → **provider 토큰은 검증 후 폐기(미저장)**.
4. 서버가 자체 JWT(`accessToken` 1h, `refreshToken` 14d)를 **HttpOnly 쿠키**로 구운 뒤 프론트 URL로 리다이렉트한다.

- ⚠️ accessToken·refreshToken은 **HttpOnly 쿠키로만** 내려온다. 응답 바디로 토큰을 주지 않으며, 브라우저 JS는 토큰 값을 읽을 수 없다.
- 로그인 후 사용자 정보는 `GET /api/users/me`(§4)로 조회한다(신규 가입 여부·온보딩 상태 포함). user 객체 구조는 §4 참조.
- 이후 보호 API는 브라우저가 `accessToken` 쿠키를 자동 전송해 인증한다(별도 Authorization 헤더 불필요).
- 지원하지 않는 provider·교환 실패는 로그인 실패로 처리되어 프론트 로그인 화면으로 리다이렉트된다.
- 호출 화면: LoginPage / Workflow: `LoginPage → 리다이렉트 → GET /api/users/me → (onboardingDone 값에 따라 OnboardingPage 또는 HomePage)`
- 관련 Entity: `User`, `SocialAccount`, `RefreshToken`

### POST /api/auth/token/refresh — 토큰 재발급 · 인증 불필요

- Request: **바디 없음**. 브라우저가 `refreshToken` 쿠키를 자동 전송한다(`withCredentials`).
- Response(200): 새 `accessToken`·`refreshToken`을 **HttpOnly 쿠키로 재발급**(회전). 브라우저는 갱신된 쿠키로 원 요청을 재시도한다.
- 에러: UNAUTHORIZED(401 — 쿠키 없음·검증 실패·만료·재사용) → 프론트는 로그인 화면으로

### POST /api/auth/logout — 로그아웃 · 인증 필요

Request 없음 → Response(200) `data`: `{ "loggedOut": true }`
- 서버: refresh_token 폐기 + `accessToken`·`refreshToken` 쿠키를 만료(삭제)시킨다. **users.onboarding_done은 유지** (재로그인 시 온보딩 재표시 없음 — 팀 확정)

## 4. 사용자 (Users)

### GET /api/users/me · 인증 필요
Response `data` (로그인 리다이렉트 직후 프론트가 사용자 상태를 확인하는 기준 객체):
```json
{
  "userId": 1,
  "nickname": "서연",
  "email": "user@example.com",
  "profileImageUrl": "https://.../photo.jpg",
  "provider": "GOOGLE",
  "onboardingDone": false,
  "themeMode": "LIGHT",
  "auroraTheme": "블루"
}
```

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
  "categories": [ { "categoryId": 3, "name": "카페", "type": "EXPENSE", "sortOrder": 3 } ]
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
  "memo": "달달한 라떼와 케이크",
  "occurredAt": "2026-07-01T21:30:00"
}
```
- type: `EXPENSE` | `INCOME` / 감정·카테고리는 단일

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
  "memo": "달달한 라떼와 케이크",
  "occurredAt": "2026-07-01T21:30:00"
}
```
- 필수: type, amount(>0 정수), categoryId, emotionId, occurredAt
- memo: 생략 시 **null 저장**(기본 문자열 저장 금지), 최대 200자
- 서버: transactions 저장(단건). 메모의 HTML/Script 태그는 XSS 방어 필터 적용 필수.

Response(201) `data`: 생성된 거래 객체. 에러: VALIDATION_ERROR
- 호출 화면: RecordPage / Workflow: `RecordPage 입력 → POST → 성공 시 폼 초기화 + 관련 캐시 무효화`
- 관련 Entity: `Transaction`, `Category`, `Emotion`

### GET /api/transactions/{transactionId} · 인증 필요 — 거래 객체 반환 (딥링크 대비용, 목록 재사용 가능하면 생략)
### PUT /api/transactions/{transactionId} · 인증 필요 — POST와 동일 필드. 에러: VALIDATION_ERROR·FORBIDDEN·NOT_FOUND
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

## 9. 분석·평행우주 (3순위 — 스키마 확정, A3-1)

> 스키마 확정 완료. A3-2(analysis)·A3-3(universe)는 아래 응답 형태를 기준으로 구현한다.
> 집계는 모두 **지출(EXPENSE) 기준**이며, 모든 접근은 인증 주체 user_id 기준.
> **"감정소비"의 정의**: 특정 **한 감정**에 소비가 지나치게 쏠리는 것을 짚어주는 개념이다. 긍정·부정을 가리지 않는다("설렘일 때 유독 많이 썼다"도 감정소비). 특정 부정 감정만 대상으로 삼지 않으며, 모든 지출을 무차별로 보지도 않는다 — **소비가 몰린 그 감정**에 초점을 둔다.
> ⚠️ 제거 확정된 "감정소비 누수율"(비율·점수)은 재도입하지 않는다. universe는 비율 지표가 아니라 **시나리오 비교**로만 표현한다.

### GET /api/analysis/monthly?year&month · 인증 필요

- month 필수. 해당 월의 카테고리·시간대·감정별 지출 집계 + 인사이트 문장.

Response(200) `data`:
```json
{
  "year": 2026,
  "month": 7,
  "totalIncome": 2600000,
  "totalExpense": 320000,
  "byCategory": [
    { "categoryId": 3, "name": "카페", "type": "EXPENSE", "amount": 48000, "count": 6 }
  ],
  "byEmotion": [
    { "emotionId": 4, "name": "스트레스", "color": "#A68BEA", "amount": 140600, "count": 6 }
  ],
  "byTimeSlot": [
    { "slot": "DAWN",      "label": "새벽", "amount": 12000,  "count": 1 },
    { "slot": "MORNING",   "label": "아침", "amount": 30000,  "count": 2 },
    { "slot": "AFTERNOON", "label": "오후", "amount": 88000,  "count": 4 },
    { "slot": "NIGHT",     "label": "밤",   "amount": 190000, "count": 8 }
  ],
  "insights": [
    { "type": "PATTERN", "content": "외로운 밤마다 배달 소비가 반복되고 있어요." }
  ]
}
```
- `byCategory`·`byEmotion`·`byTimeSlot`: 지출 기준 집계(금액 `amount`·건수 `count`). 기록 없는 항목은 배열에서 생략.
- `byEmotion`은 **amount 내림차순** 정렬 → 소비가 가장 몰린 감정이 맨 앞(긍정·부정 무관, "감정소비" 관점의 초점 감정).
- `byTimeSlot.slot`: `occurred_at` 시(hour) 기준 4구간 — `DAWN`(0–5) · `MORNING`(6–11) · `AFTERNOON`(12–17) · `NIGHT`(18–23). `label`은 한글 표기.
- `insights`: `ai_insights` 테이블 매핑(`insight_type`→`type`, `content`→`content`), 0..n건. 문구는 감정 중립(긍정 감정도 대상). 인사이트 생성 로직은 A3-2 소관.

### GET /api/analysis/pattern · 인증 필요

- 이번 달 거래를 `(감정, 카테고리, 시간대)` 조합으로 집계 → **가장 자주 반복된 조합 1건**과 그 근거 내역을 반환한다.
- 조합·횟수·근거 집계는 **결정론적**(GROUP BY + COUNT)이며, 문구(`title`·`desc`)만 서버가 생성(템플릿 또는 AI)한다. **숫자(횟수 등)는 집계값을 그대로 사용**하며 LLM이 임의 변경하지 않는다.
- 반복 조합이 임계 미만(예: 최다 조합 `count < 2`)이면 `pattern`은 `null`, `evidence`는 `[]`.

Response(200) `data`:
```json
{
  "pattern": {
    "count": 7,
    "emotion": "스트레스",
    "category": "배달",
    "time": "밤",
    "title": "스트레스한 밤의 배달 소비",
    "desc": "외로운 밤마다 배달 소비가 반복되고 있어요. 이번 달 7번 나타났어요."
  },
  "evidence": [
    { "date": "07.14", "category": "배달", "emotion": "스트레스", "amount": 15000 }
  ]
}
```
- `pattern`: 최다 `(emotion, category, time)` 조합. `count`=반복 횟수(집계), `time`=시간대 한글 라벨(§monthly `byTimeSlot.label`과 동일: 새벽/아침/오후/밤). 반복 패턴 없으면 `null`.
- `title`·`desc`: 서버 생성 문구. AI 미적용 시 템플릿(`${emotion}한 ${time}의 ${category} 소비`)으로 대체 가능.
- `evidence`: 해당 조합에 속한 거래 내역(최신순). `date`=`MM.DD`, `amount`=지출 금액(양수, 원). 없으면 `[]`.

### GET /api/universe/simulation?goalId · 인증 필요

- **goalId 필수**. 해당 목표에 대해 두 미래 시나리오(현재 소비 유지 / 소비를 줄임)를 비교한다.
- 목표 없음·타인 목표: `NOT_FOUND` / `FORBIDDEN`.

Response(200) `data`:
```json
{
  "goal": { "goalId": 1, "name": "제주도 여행", "targetAmount": 2000000, "currentAmount": 300000 },
  "monthlyIncome": 2600000,
  "monthlyExpense": 250000,
  "focusEmotion": { "emotionId": 2, "name": "설렘", "color": "#F28AB7", "monthlyAmount": 120000 },
  "reductionRate": 0.5,
  "scenarios": [
    { "key": "CURRENT", "title": "지금처럼 쓴다면",     "monthlyExpense": 250000, "monthlySaving": 150000, "monthsToGoal": 12, "estimatedAchieveDate": "2027-07", "narration": "지금 속도라면 약 12개월 걸려요." },
    { "key": "REDUCED", "title": "설렘 소비를 줄이면",   "monthlyExpense": 190000, "monthlySaving": 210000, "monthsToGoal": 9,  "estimatedAchieveDate": "2027-04", "narration": "설렘 소비를 절반 줄이면 3개월 빨라져요." }
  ]
}
```
- **감정소비 = 소비가 가장 몰린 한 감정**(긍정·부정 무관)에 초점. REDUCED는 월 지출 전체가 아니라 **그 감정의 지출만** 줄인 시나리오다.
- `focusEmotion`: 해당 기간 지출이 가장 큰 감정 1건 + 그 감정의 월 지출 `monthlyAmount`. 지출 기록이 전혀 없으면 `null`.
- `monthlyIncome`/`monthlyExpense`: 최근 활동 기준 월 수입·지출(산정 방식은 A3-3 구현 소관).
- `reductionRate`: 서버가 가정한 감축 비율(0~1, 예 `0.5`). 응답에 명시해 프론트 하드코딩을 피한다.
- `scenarios`: `CURRENT`(현행)·`REDUCED`(감축) 2건 고정. `REDUCED.title`은 focusEmotion 이름을 반영(예: "설렘 소비를 줄이면").
  - `REDUCED.monthlyExpense = monthlyExpense − round(focusEmotion.monthlyAmount × reductionRate)` (focusEmotion 이 `null`이면 CURRENT 와 동일).
  - `monthlySaving = monthlyIncome − 시나리오 monthlyExpense` (음수면 0 처리).
  - `monthsToGoal = ceil((targetAmount − currentAmount) / monthlySaving)`. `monthlySaving ≤ 0`이면 `monthsToGoal`·`estimatedAchieveDate` 모두 `null`(도달 불가).
- 에러: `NOT_FOUND`(목표 없음) · `FORBIDDEN`(타인 목표) · `VALIDATION_ERROR`(goalId 누락).

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

## 12. 카테고리 설정 (Categories)

### GET /api/categories?type=EXPENSE · 인증 필요
- 인증된 사용자의 공통 카테고리와 커스텀 카테고리를 `category_orders` 순서대로 통합 반환.
- Response `data`:
```json
{
  "categories": [
    { "categoryId": 1, "name": "식비", "type": "EXPENSE", "isCustom": false, "sortOrder": 1 },
    { "categoryId": 4, "name": "해외직구", "type": "EXPENSE", "isCustom": true, "sortOrder": 2 }
  ]
}
```

### POST /api/categories/custom · 인증 필요
- 커스텀 카테고리 추가. 추가 즉시 자동으로 맨 뒤 정렬 순서를 부여.
- Request: `{ "name": "해외직구", "type": "EXPENSE" }`
- Response(201) `data`: 생성된 객체 반환. 에러: `VALIDATION_ERROR`

### DELETE /api/categories/custom/{customCategoryId} · 인증 필요
- 해당 커스텀 카테고리 삭제 (동시에 `category_orders`에서도 제거).
- Response(200) `data`: `{ "deleted": true }`
- 에러: `NOT_FOUND` (없음), `FORBIDDEN` (내 것이 아님)

### PUT /api/categories/order · 인증 필요
- 드래그 앤 드롭 등으로 변경된 카테고리 통합 순서를 일괄 저장.
- Request:
```json
{
  "type": "EXPENSE",
  "orders": [
    { "categoryId": 1, "isCustom": false, "sortOrder": 1 },
    { "categoryId": 4, "isCustom": true, "sortOrder": 2 }
  ]
}
```
- Response(200) `data`: `{ "updated": true }`

---

## 13. Authentication Flow (BFF)

```text
+----------+                         +-----------------+                    +---------------+
|          |  1. GET /oauth2/authorization/{provider}   (브라우저 리다이렉트)   |               |
|  Client  | ---------------------------------------------------------------> |  Backend API  |
| (React)  |                         | OAuth Provider  |                    |  (Spring      |
|          |  2. provider 로그인/동의  |  (Google/Kakao  |                    |   Security)   |
|          | <---------------------> |  /Naver)        | <----------------> |               |
|          |                         +-----------------+   3. 콜백: code      |               |
|          |                          서버-투-서버 code 교환·검증 → 사용자 조회/생성 |               |
|          |  4. JWT(access/refresh)를 HttpOnly 쿠키로 굽고 프론트로 리다이렉트    |               |
|          | <--------------------------------------------------------------- |               |
|          |  5. 이후 요청은 브라우저가 accessToken 쿠키를 자동 전송(withCredentials)|              |
+----------+                                                                  +---------------+
```
- provider 토큰도 우리 JWT도 브라우저 JS에 노출되지 않는다(HttpOnly). Authorization 헤더를 프론트가 직접 세팅하지 않는다.

## 14. API Flow (화면 흐름)

```text
1. 로그인 흐름
LoginPage
  ↓ GET /oauth2/authorization/{provider} (브라우저 리다이렉트)
  ↓ provider 로그인 → 백엔드 콜백 → HttpOnly 쿠키 발급 → 프론트로 리다이렉트
  ↓ GET /api/users/me (사용자 상태 확인)
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

## 15. Naming Convention

- URL Path는 항상 명사형 소문자(kebab-case)를 사용한다. (예: `/api/notification-settings`)
- 자원 컬렉션은 복수형을 사용한다. (`/users`, `/transactions`, `/goals`)
- 특정 자원 식별은 경로 변수를 사용한다. (`/api/transactions/{transactionId}`)
- REST로 표현 불가능한 행위는 제한적으로 동사형 경로를 허용한다. (`/auth/logout`, `/auth/token/refresh`) — 로그인은 Spring Security `oauth2Login`(`/oauth2/authorization/{provider}`)이 담당한다.

## 16. 문서와 코드의 차이점 요약 (Cross-Verification Notes)

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

## 17. Revision History

- **2026-07-13**: 백엔드 계약(feelio-api SSOT)에 맞춰 동기화 — 로그인 BFF/HttpOnly 쿠키 반영, **상황(situation) 관련 필드·엔드포인트 전면 제거**(§2·§5·§6), §9 분석·평행우주 확정 스키마 반영, §12 카테고리 설정(커스텀 카테고리) 신설(이하 프론트 부록 섹션 번호 +1).
- **2026-07-07**: 루트 `API_CONTRACT.md`와 `docs/API-CONTRACT.md`를 병합해 단일 계약으로 통합. 응답 봉투(`success`/`data`)·에러 코드·Base URL(`/api`)·메모 200자 등 스펙은 docs 기준으로 통일하고, 인증/화면 흐름 다이어그램·Naming Convention·교차검증 노트를 흡수.

## 18. 최종 검토 체크리스트

- [x] Workflow와 API가 일치하는가 (화면 흐름 매핑 완료)
- [x] 코드와 문서가 일치하는가 (로컬 Store 방식과 비교 후 차이점 15절 기록)
- [x] 누락 API는 없는가 (탈퇴 사유·전체 초기화 등 반영)
- [x] 중복 Endpoint는 없는가 (URL 계층 설계로 충돌 방지)
- [x] Response 형식이 통일되어 있는가 (`success`/`data` 봉투)
- [x] Error 형식이 통일되어 있는가 (error.code 매핑)
- [x] Swagger(OpenAPI)로 변환 가능한 구조인가 (Data Type·Required·Body Schema 명시)
