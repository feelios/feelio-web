# API Contract

**프로젝트명:** Feelio
**작성일:** 2026-07-07
**문서 기준:** `STEP9_화면흐름_API워크플로우.md`, `STEP8_API명세서.md`, 그리고 `feelio-web` 프론트엔드 코드(로컬 상태 및 Mock 데이터 구조) 기반 교차 검증

---

## 1. 프로젝트 개요

- **API Version**: `v1`
- **Base URL**: `https://api.feelio.app/api/v1` (실제 운영계 적용 기준)
- **Authentication 방식**: `JWT (JSON Web Token)` (Bearer Token)
- **Content-Type**: `application/json; charset=utf-8`
- **API Naming Rule**: RESTful API 명명 규칙 준수 (Kebab-case 적용)
- **Version 관리 정책**: URI 버저닝을 사용하여 하위 호환성 유지 (예: `/api/v1/users`)

---

## 2. Authentication

- **Login**: OAuth2 제공자로부터 받은 SDK Provider Token을 백엔드로 전달하여 인증. 성공 시 `AccessToken`, `RefreshToken` 발급.
- **Logout**: 사용자의 `RefreshToken` 무효화 (DB 또는 Redis 등에서 삭제).
- **Access Token**: 만료 기한이 짧은 (예: 30분) JWT. 매 API 요청 시 사용.
- **Refresh Token**: 만료 기한이 긴 (예: 14일) JWT. Access Token 재발급 전용.
- **Authorization Header**: 
  - 규격: `Authorization: Bearer <Access_Token>`
- **Token 재발급 흐름**:
  - API 호출 → `401 Unauthorized` 반환 (Access Token 만료) → 프론트엔드 인터셉터에서 `Refresh Token`을 담아 `/api/v1/auth/token/refresh` 호출 → 발급받은 새 `Access Token`으로 원본 API 재요청.

---

## 3. 공통 Response 규칙

Spring Boot 기반 전사 표준 Response Wrapper 구조를 사용합니다.

```json
{
  "status": 200,
  "message": "success",
  "body": {
    "key": "value"
  }
}
```
- `status`: HTTP 상태 코드가 아닌 커스텀 상태 코드 (기본적으로 HTTP Status와 동일하게 매핑)
- `message`: 프론트엔드에서 노출 가능하거나 디버깅용 메시지
- `body`: 실제 데이터 페이로드 (실패 시 `null` 또는 빈 배열)

---

## 4. 공통 Error 규칙

에러 발생 시에도 HTTP Status 코드는 적절하게 설정되며(4xx, 5xx), Body 형식은 통일합니다.

```json
{
  "status": 400,
  "message": "메모는 최대 500자까지 입력 가능합니다.",
  "body": null,
  "errorCode": "MEMO_LENGTH_EXCEEDED"
}
```

---

## 5. Error Code Table

| HTTP Status | Error Code | Description |
|---|---|---|
| 400 Bad Request | `INVALID_INPUT` | 입력값 형식 오류 (필수값 누락 등) |
| 400 Bad Request | `INVALID_AMOUNT` | 금액이 0원 이하일 경우 |
| 400 Bad Request | `MEMO_LENGTH_EXCEEDED` | 메모 500자 초과 |
| 400 Bad Request | `INVALID_REFERENCE` | 존재하지 않는 참조 ID 전송 시 |
| 401 Unauthorized | `TOKEN_EXPIRED` | Access Token 만료 |
| 401 Unauthorized | `TOKEN_INVALID` | Access Token 변조/유효하지 않음 |
| 403 Forbidden | `ACCESS_DENIED` | 본인 리소스가 아닌 항목에 접근 시도 |
| 404 Not Found | `RESOURCE_NOT_FOUND` | 삭제된 거래 내역이나 없는 유저 접근 시 |
| 500 Internal Server | `SERVER_ERROR` | 예상치 못한 백엔드 서버 에러 |

---

## 6. API 목록

- **Auth**
  - `POST /api/v1/auth/login` - 소셜 로그인
  - `POST /api/v1/auth/logout` - 로그아웃
  - `POST /api/v1/auth/token/refresh` - 토큰 재발급
- **User**
  - `GET /api/v1/users/me` - 내 정보 조회
  - `PATCH /api/v1/users/me` - 내 정보 수정 (닉네임 등)
  - `PATCH /api/v1/users/me/onboarding` - 온보딩 상태 완료 처리
  - `PATCH /api/v1/users/me/settings` - 사용자 환경 설정 (테마 등) 변경
  - `DELETE /api/v1/users/me` - 회원 탈퇴
- **Transaction (기록)**
  - `POST /api/v1/transactions` - 거래 기록 등록
  - `GET /api/v1/transactions` - 거래 기록 목록 조회
  - `GET /api/v1/transactions/{id}` - 특정 거래 기록 상세 조회
  - `PUT /api/v1/transactions/{id}` - 특정 거래 기록 수정
  - `DELETE /api/v1/transactions/{id}` - 특정 거래 기록 삭제
  - `DELETE /api/v1/transactions` - 전체 기록 초기화
- **Goal (목표)**
  - `POST /api/v1/goals` - 새로운 목표 생성
  - `GET /api/v1/goals` - 내 목표 목록 조회
  - `PUT /api/v1/goals/{id}` - 목표 수정 (대표 목표 여부 변경 포함)
  - `DELETE /api/v1/goals/{id}` - 목표 삭제
- **Summary & Meta**
  - `GET /api/v1/meta` - 감정, 카테고리, 상황 마스터 데이터 조회
  - `GET /api/v1/summary/calendar` - 월간 캘린더 요약 조회 (감정 동률 처리 포함)
  - `GET /api/v1/summary/emotions` - 감정 능선 요약 (8종 감정 축)
- **Analysis & Universe**
  - `GET /api/v1/analysis/monthly` - 월간 AI 소비 분석 인사이트
  - `GET /api/v1/universe/simulation` - 평행우주 시뮬레이션
- **추가 필요 / 보류 대상** (확인 필요)
  - `GET, PUT /api/v1/users/me/notifications` - 알림 설정 조회/변경 [권장 설계 포함]
  - `POST /api/v1/backup` - 데이터 백업 [권장 설계 포함]
  - `POST /api/v1/terms/agreements` - 약관 동의 내역 저장 [권장 설계 포함]

---

## 7. 각 API 상세

### 7.1. Auth - 소셜 로그인
- **Endpoint**: `/api/v1/auth/login`
- **Method**: `POST`
- **Description**: OAuth2 제공자의 SDK를 통해 발급받은 Token으로 백엔드 인증을 수행.
- **Authentication**: 불필요
- **Request Header**: `Content-Type: application/json`
- **Path Variable**: 없음
- **Query Parameter**: 없음
- **Request Body**:
  ```json
  {
    "provider": "GOOGLE",
    "providerToken": "ya29.a0A..."
  }
  ```
- **Response Body**:
  ```json
  {
    "status": 200, "message": "로그인 성공",
    "body": {
      "accessToken": "eyJ...",
      "refreshToken": "dGh...",
      "user": {
        "userId": 1, "nickname": "서연", "email": "user@example.com",
        "profileImageUrl": "https://url.to/photo.jpg", "provider": "GOOGLE",
        "onboardingDone": false
      }
    }
  }
  ```
- **Error Response**: `401 Unauthorized` (유효하지 않은 제공자 토큰)
- **HTTP Status**: 200 OK
- **호출 화면**: LoginPage
- **Workflow 위치**: `LoginPage → (성공 시 onboardingDone 값에 따라 OnboardingPage 또는 HomePage)`
- **관련 Entity**: `User`, `SocialAccount`, `RefreshToken`
- **비고**: 가입되지 않은 회원의 경우 신규 생성 처리 포함

### 7.2. Transaction - 거래 기록 등록
- **Endpoint**: `/api/v1/transactions`
- **Method**: `POST`
- **Description**: 사용자의 지출 또는 수입을 기록함 (최대 5개의 상황 태그 배열 지원).
- **Authentication**: 필요
- **Request Header**: `Authorization: Bearer <Access_Token>`
- **Path Variable**: 없음
- **Query Parameter**: 없음
- **Request Body**:
  ```json
  {
    "type": "EXPENSE", "amount": 18600,
    "categoryId": 3, "emotionId": 4,
    "situationIds": [1, 2],
    "memo": "달달한 라떼", "occurredAt": "2026-07-01T21:30:00"
  }
  ```
- **Response Body**:
  ```json
  {
    "status": 201, "message": "기록이 등록되었습니다.",
    "body": { "transactionId": 10 }
  }
  ```
- **Error Response**: 
  ```json
  {
    "status": 400,
    "message": "메모는 최대 500자까지 입력 가능합니다.",
    "body": null,
    "errorCode": "MEMO_LENGTH_EXCEEDED"
  }
  ```
- **HTTP Status**: 201 Created
- **호출 화면**: RecordPageDc
- **Workflow 위치**: `RecordPage 진입 → 폼 입력 → 저장(POST) → (캐시 무효화) → 동일 화면 내 폼 초기화`
- **관련 Entity**: `Transaction`, `TransactionSituation`, `Emotion`, `Category`
- **비고**: 금액(>0) 필수 검증, 메모에 포함된 HTML/Script 태그는 XSS 방어 필터 적용 필수

### 7.3. Goal - 새로운 목표 생성
- **Endpoint**: `/api/v1/goals`
- **Method**: `POST`
- **Description**: 온보딩 또는 프로필 모달 내에서 새 목표를 설정함. `targetAmount` 최소 100원 이상 제한.
- **Authentication**: 필요
- **Request Header**: `Authorization: Bearer <Access_Token>`
- **Path Variable**: 없음
- **Query Parameter**: 없음
- **Request Body**:
  ```json
  {
    "name": "제주도 여행", "targetAmount": 500000,
    "currentAmount": 0, "dueDate": "2026-12-31",
    "isMain": true
  }
  ```
- **Response Body**:
  ```json
  {
    "status": 201, "message": "목표 생성 성공",
    "body": { "goalId": 1 }
  }
  ```
- **Error Response**: `400 Bad Request` (targetAmount가 100원 미만일 경우 `INVALID_AMOUNT` 반환)
- **HTTP Status**: 201 Created
- **호출 화면**: OnboardingPage (및 Profile Modal)
- **Workflow 위치**: `OnboardingPage 진입 → 입력 → 저장(POST) → PATCH /api/v1/users/me/onboarding → HomePage 이동`
- **관련 Entity**: `Goal`
- **비고**: `isMain: true` 로 새 목표 생성 시 서버 트랜잭션을 통해 기존 사용자의 대표 목표 상태를 강제로 `false`로 토글해야 함.

### 7.4. User - 온보딩 완료 처리
- **Endpoint**: `/api/v1/users/me/onboarding`
- **Method**: `PATCH`
- **Description**: 온보딩 단계를 모두 마치고 첫 목표를 생성한 후, 사용자의 온보딩 완료 여부를 갱신.
- **Authentication**: 필요
- **Request Header**: `Authorization: Bearer <Access_Token>`
- **Path Variable**: 없음
- **Query Parameter**: 없음
- **Request Body**: 
  ```json
  { 
    "onboardingDone": true 
  }
  ```
- **Response Body**: 
  ```json
  { 
    "status": 200, "message": "온보딩 완료 처리 성공", "body": null 
  }
  ```
- **Error Response**: `401 Unauthorized`
- **HTTP Status**: 200 OK
- **호출 화면**: OnboardingPage
- **Workflow 위치**: `OnboardingPage의 "시작하기" 버튼 클릭 후 Goal 생성 직후`
- **관련 Entity**: `User`
- **비고**: 목표 생성과 온보딩 처리를 분리한 설계. (단일 API로 처리하는 권장 구조는 하단 차이점 요약 참고)

*(추가 API 상세 명세들은 문서 최상단 API 목록의 룰과 동일하게 적용됨)*

---

## 8. Authentication Flow

```text
+----------+                           +-----------+                            +---------------+
|          |    1. 소셜 제공자 SDK 로그인   |           |                            |               |
|  Client  | ------------------------> | OAuth SDK |                            | Backend API   |
| (React)  | <------------------------ | (Google)  |                            |               |
|          |    2. Provider Token 발급  |           |                            |               |
|          |                           +-----------+                            |               |
|          |    3. POST /api/v1/auth/login (Provider Token 전달)                  |               |
|          | -----------------------------------------------------------------> |               |
|          |    4. 토큰 유효성 검증 후 사용자 조회/생성, JWT(Access/Refresh) 발급       |               |
|          | <----------------------------------------------------------------- |               |
|          |    5. 발급된 Access Token 저장 및 이후 모든 요청 Header에 추가         |               |
+----------+                                                                    +---------------+
```

---

## 9. API Flow

```text
1. 로그인 흐름
LoginPage
  ↓ POST /api/v1/auth/login
[응답 onboardingDone 분기]
  ├─ false → OnboardingPage
  └─ true  → HomePage

2. 온보딩 흐름
OnboardingPage
  ↓ POST /api/v1/goals (첫 목표 등록)
  ↓ PATCH /api/v1/users/me/onboarding (완료 마킹)
HomePage

3. 기록 등록 흐름
HomePage → RecordPage
  ↓ GET /api/v1/meta (선택지 옵션 캐시)
  ↓ POST /api/v1/transactions (지출/수입 등록)
  ↓ (성공 시 프론트에서 폼 초기화 및 홈/분석 캘린더 데이터 캐시 무효화)
RecordPage (새 기록 입력 대기)

4. 거래 내역 조회 및 삭제 흐름
TransactionsPage
  ↓ GET /api/v1/transactions?year=2026&month=7 (목록 조회)
  ↓ DELETE /api/v1/transactions/{id} (삭제 시)
  ↓ (삭제 성공 시 로컬 목록 갱신 및 캐시 무효화)
TransactionsPage
```

---

## 10. Entity Mapping

- **Auth API**: `User`, `SocialAccount`, `RefreshToken`
- **Transactions API**: `Transaction`, `TransactionSituation`, `Category`, `Emotion`
- **Goals API**: `Goal`
- **User API**: `User`, `NotificationSetting`
- **Summary API**: `MonthlySummary` (집계용 캐시 테이블 또는 뷰), `Emotion`
- **Analysis/Universe API**: `AiInsight`, `MonthlySummary`, `Goal`

---

## 11. Naming Convention

- URL Path는 항상 명사형 및 소문자(kebab-case)를 사용합니다. (예: `/api/v1/notification-settings`)
- 자원의 컬렉션은 복수형을 사용합니다. (`/users`, `/transactions`, `/goals`)
- 특정 자원의 식별은 경로 변수를 사용합니다. (`/api/v1/transactions/{id}`)
- 행위(Action)를 암시하는 경로는 명사를 통해 상태를 변형하는 방향으로 처리하되, REST로 완전히 표현 불가능한 경우 동사형 패스를 제한적으로 허용합니다. (`/auth/login`, `/auth/logout`)

---

## 12. 문서와 코드의 차이점 요약 (Cross-Verification Notes)

1. **온보딩 API 설계 변경**
   - **문서(STEP 9)**: `PATCH /api/users/me/onboarding` API를 두어 목표 등록(POST) 이후 온보딩 완료 상태를 별도 통신으로 갱신하게 설계.
   - **코드(useFeelioStoreDc.js)**: 프론트엔드의 `completeOnboarding()` 액션에서 목표 추가와 `onboardingDone: true` 상태 갱신이 동시에 단일 처리됨.
   - **해결(계약)**: 문서 기준으로 API를 정의하되, 실무적으로는 **`POST /api/v1/goals` 요청 Body 내에 `isOnboardingTarget: true` 플래그를 추가하여 한 번의 API 호출로 온보딩 상태 갱신까지 원 트랜잭션으로 처리하는 설계 개선**을 권장합니다.
2. **누수율 및 챌린지 API**
   - **문서(STEP 5, 8)**: 누수율 기능이 제외됨.
   - **코드**: 실제 `AnalysisPageDc.jsx` 내 코드 확인 시 누수율 관련된 KPI 컴포넌트가 더 이상 보이지 않음.
   - **해결(계약)**: 코드와 정책이 일치하므로 해당 API는 제외 완료됨.
3. **사용 확인 필요/누락 API 보완 제안**
   - `DELETE /api/v1/users/me`의 `reason` 파라미터 누락 → Body에 `{ "reason": "사용 빈도 낮음" }` 형태 추가 제안.
   - `GET, PUT /api/v1/users/me/notifications` (알림 설정) → 4순위이지만 모달 구현 시 필요하므로 계약에 "보류 대상(확인 필요)"으로 명시.
   - `POST /api/v1/terms/agreements` (약관 동의) → 로그인(`POST /api/v1/auth/login`) API의 Body로 `agreedTermsIds` 배열을 함께 던지도록 소셜 로그인 API 스펙을 병합하는 것을 권장.
   - 평행우주 시뮬레이션의 파라미터(`reductionRate`) → `GET /api/v1/universe/simulation?goalId=1&reductionRate=50` 쿼리 파라미터 방식을 권장 설계로 제안함.

---

## 13. Revision History

- **2026-07-07**: 최초 API Contract 생성. 프론트엔드 로컬 상태 코드(`useFeelioStoreDc.js`)와 STEP8/9 문서 간 교차 검증 적용 완료. RESTful 원칙 적용.

---

## 14. 최종 검토 체크리스트

- [x] Workflow와 API가 일치하는가 (모든 화면 흐름 매핑 완료)
- [x] 코드와 문서가 일치하는가 (로컬 Store 방식과 문서 비교 후 차이점 '12절' 기록)
- [x] 누락 API는 없는가 (알림, 백업, 탈퇴 사유 등을 파악하여 권장 제안서 포함)
- [x] 중복 Endpoint는 없는가 (URL 계층 설계로 충돌 방지)
- [x] Response 형식이 통일되어 있는가 (JSON Wrapper 규격 지정)
- [x] Error 형식이 통일되어 있는가 (ErrorCode 필드 추가 및 상태코드 매핑)
- [x] Spring Boot에서 바로 구현 가능한 수준인가 (API 명명, 상태 전이 구조가 Spring MVC 친화적임)
- [x] Swagger(OpenAPI)로 변환 가능한 구조인가 (Data Type, Required 여부, Body Schema 명시 완료)
