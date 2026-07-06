# STEP 8. API 명세서

**프로젝트명:** Feelio
**작성일:** 2026-07-06 (수정됨)
**작성 기준:** 현재 저장소에 백엔드 코드가 존재하지 않아 프론트엔드 로컬 상태 및 localStorage 기반으로 동작 중입니다. 본 문서는 백엔드(Spring Boot) 개발 착수 시 기준이 되는 **API 설계 초안**입니다.
**제거 확정:** 커스텀 태그 관리(FUNC-024) 및 감정소비 누수율 관련 API는 STEP 5의 확정 정책에 따라 본 명세에서 제외되었습니다.

---

## 1. 수정 요약 및 기능명세서 반영 내역 (2026-07-06 업데이트)

**핵심 변경 사항:**
기존 정상 흐름(Happy Path) 위주였던 API 명세에 유효성 검증(Validation), 예외 상황(Edge Case), 에러 코드 매핑, 보안 정책(XSS 방어)을 대폭 추가했습니다.
- **추가된 명세**: 온보딩 목표 금액 최소값(100원), 기록 등록 시 메모 글자 수 제한(500자) 및 빈 값(Null) 처리, 상황 태그 N:M 복수 선택 처리 로직.
- **변경된 명세**: 소셜 로그인 API 응답에 profileImageUrl 추가, 감정 동률 시 우선순위 로직(최근 기록 우선).
- **제외된 API**: 사용자 커스텀 태그 관리 (삭제).

| 기능 식별자 | 기능명 | STEP5_기능명세서 변경 내용 | STEP8_API명세서 반영 방식 | 반영 상태 |
|---|---|---|---|---|
| FUNC-001 | 소셜 로그인 | 제공자로부터 프로필 이미지 수신 및 저장 | `/api/auth/login` 응답 객체에 `profileImageUrl` 추가 | 완료 |
| FUNC-005 | 온보딩 목표 설정 | 목표 금액 최소값(100원 이상), 기간 필수 저장 | `/api/goals` POST 요청 시 `targetAmount` 유효성 검증 추가 | 완료 |
| FUNC-008 | 기록 등록 | 메모 500자 제한, 상황 태그 N:M 복수 선택, XSS 방어 | `/api/transactions` POST 검증 룰 명시, `situationIds` 배열 처리 로직 추가 | 완료 |
| FUNC-011 | 기록 상세 조회 | 데이터 삭제 및 매칭 실패 시 404 에러 처리 보완 | `/api/transactions/{id}` 실패 응답 404 조건 구체화 | 완료 |
| FUNC-015 | 대표 감정 표시 | 감정 동률 시 최근 기록 우선 | `/api/summary/calendar` 집계 쿼리 정렬 기준 명시 | 완료 |
| FUNC-017 | 감정 능선 | 8개 감정 전체를 능선 축으로 사용 | `/api/summary/emotions` 응답 배열 8개 고정 반환 | 완료 |
| FUNC-024 | 태그 관리 | 메뉴 숨김 및 범위 제외 확정 | 커스텀 태그 CRUD API 전체 삭제 | 완료 |

---

## 2. 공통 규격

| 항목 | 내용 |
|---|---|
| Base URL | `/api` |
| 인증 | **Bearer JWT** (소셜 로그인 성공 시 서버에서 발급한 accessToken) |
| 데이터 격리 | 토큰에 포함된 user_id 기준으로만 데이터 조회 및 변경 수행 |
| 명명 규칙 | 클라이언트 요청/응답은 JSON `camelCase`, DB 컬럼은 `snake_case` 매핑 |
| 공통 응답 | `{ "status": 200, "message": "success", "body": { ... } }` |
| 실패 응답 | `{ "status": 400, "message": "에러 사유", "body": null }` |

**공통 Status Code:**
- **200 OK**: 조회, 수정, 삭제 성공
- **201 Created**: 생성 성공 (기록, 목표 등)
- **400 Bad Request**: 유효성 검증 실패 (예: 금액 ≤ 0, 메모 길이 초과, 필수값 누락)
- **401 Unauthorized**: JWT 토큰 없음, 만료 또는 유효하지 않음
- **403 Forbidden**: 타인 리소스 접근 시도
- **404 Not Found**: 존재하지 않는 ID (삭제된 기록 등) 조회 요청 시
- **500 Internal Server Error**: 서버 장애

---

## 3. 핵심 API 상세 명세

본 문서에서는 핵심 트랜잭션인 '기록 등록', '목록 조회', '소셜 로그인', '목표 생성' API를 상세 양식으로 전개하며, 나머지 API도 동일한 규격을 따릅니다.

### [API-01] 기록 등록 (Transactions Create)

**1. 기본 정보**
- **기능명**: 기록 등록 (지출/수입)
- **설명**: 사용자가 새로운 지출 또는 수입 기록을 생성합니다.
- **요청 주소**: `POST /api/transactions`
- **인증 필요 여부**: 필요 (Bearer JWT)
- **권한 조건**: 로그인한 일반 사용자 (본인 데이터만 생성 가능)
- **처리 우선순위**: 1순위 (핵심 기능)

**2. 요청 정보 (Body)**
| 필드명 | 자료형 | 필수 | 허용값 | 설명 / 예시 | 유효성 검증 규칙 |
|---|---|---|---|---|---|
| `type` | String | Y | EXPENSE, INCOME | 거래 유형 | Enum 값 검증 |
| `amount` | Integer | Y | - | 거래 금액 (예: 18600) | 0 초과 양의 정수 (Min: 1) |
| `categoryId` | Integer | Y | - | 카테고리 식별자 | 마스터 DB 존재 여부 확인 |
| `emotionId` | Integer | Y | 1~8 | 감정 식별자 | 마스터 DB 존재 여부 확인 |
| `situationIds` | Array | N | - | 상황 태그 식별자 배열 | 빈 배열(`[]`) 허용, 최대 5개 제한 |
| `memo` | String | N | null | 메모 내용 (예: 달달한 라떼) | 최대 500자, XSS 살균 필수 |
| `occurredAt` | String | Y | - | 발생 일시 (ISO 8601) | 올바른 날짜 포맷 (예: 2026-07-01T21:30:00) |

**3. 정상 응답 예시 (201 Created)**
```json
{
  "status": 201,
  "message": "기록이 성공적으로 등록되었습니다.",
  "body": {
    "transactionId": 10,
    "type": "EXPENSE",
    "amount": 18600,
    "category": { "categoryId": 3, "name": "카페" },
    "emotion": { "emotionId": 4, "name": "스트레스", "color": "#5042B3" },
    "situations": [
      { "situationId": 1, "name": "퇴근 후" },
      { "situationId": 2, "name": "혼자 있음" }
    ],
    "memo": "달달한 라떼와 케이크",
    "occurredAt": "2026-07-01T21:30:00"
  }
}
```

**4. 실패 응답 예시 (400 Bad Request)**
- `INVALID_AMOUNT`: amount가 0 이하로 입력된 경우 → "1원 이상의 금액을 입력해 주세요."
- `MEMO_LENGTH_EXCEEDED`: memo 길이가 500자를 초과한 경우 → "메모는 최대 500자까지 입력 가능합니다."
- `INVALID_REFERENCE`: 없는 카테고리/감정 ID 전송 시 → "유효하지 않은 선택값입니다. 다시 시도해 주세요."

**5. 처리 흐름 및 검증 룰**
- **입력값 검증**: 금액(>0), 메모 길이(≤500). 메모에 포함된 HTML/Script 태그는 XSS 방어 필터 적용(이스케이프/살균).
- **데이터베이스 트랜잭션**: `transactions` 테이블에 기본 정보 INSERT (memo 누락 시 NULL 저장). `situationIds` 존재 시 반환된 transactionId로 `transaction_situations` 조인 테이블에 복수 행 삽입(단일 트랜잭션). 미선택 태그는 무시.

---

### [API-02] 소셜 로그인 (Auth Login)

**1. 기본 정보**
- **요청 주소**: `POST /api/auth/login`
- **인증 필요 여부**: 불필요

**2. 요청 정보 (Body)**
- `provider` (String, 필수): GOOGLE, KAKAO, NAVER
- `providerToken` (String, 필수): 소셜 SDK/OAuth 콜백 수신 토큰

**3. 정상 응답 예시 (200 OK)**
```json
{
  "status": 200,
  "message": "로그인 성공",
  "body": {
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpcy...",
    "user": {
      "userId": 1,
      "nickname": "서연",
      "email": "user@example.com",
      "profileImageUrl": "https://url.to/photo.jpg", 
      "provider": "GOOGLE",
      "onboardingDone": false
    }
  }
}
```

---

### [API-03] 기록 목록 조회 (Transactions List)

**1. 기본 정보**
- **요청 주소**: `GET /api/transactions`
- **처리 흐름**: 클라이언트는 Array 형태로만 받으며, 일/월/감정별 묶음 처리는 프론트 로컬 로직에서 수행.

**2. 요청 정보 (Query Parameters)**
- `year` (Integer, 필수): 조회 기준 연도 (예: 2026)
- `month` (Integer, 선택): 조회 기준 월. 생략 시 연 전체 조회.
- `emotionId` (String, 선택): 콤마로 구분된 복수 ID 허용 (예: 4,5)
- `queryString` (String, 선택): 메모 또는 카테고리 검색어 (예: 커피)
- `sort` (String, 선택): 정렬 기준. 기본값 `date_desc`. (예: `amount_desc`)

---

### [API-04] 목표 생성 (Goals Create)

**1. 기본 정보**
- **요청 주소**: `POST /api/goals`
- **상태 전이**: `isMain: true` 로 새 목표 생성 시 서버 트랜잭션을 통해 기존 사용자의 대표 목표 상태를 강제로 `false`로 업데이트(Toggle) 해야 함.

**2. 요청 정보 및 유효성 검증 규칙**
- `name` (String, 필수): 최대 20자
- `targetAmount` (Integer, 필수): **최소값 100 이상** (극단값 0원 분석 오류 방지)
- `currentAmount` (Integer, 필수): 0 이상, targetAmount 이하
- `dueDate` (String, 필수): YYYY-MM-DD 형식, 내일 이후
- `isMain` (Boolean, 필수)

---

## 4. 보조 API 목록 요약 (추가 필요)

위 핵심 API 외 나머지 API의 엔드포인트 목록입니다. (상세 내용은 위 공통 규격을 따름)

- **`POST /api/auth/logout`**: 로그아웃 (토큰 무효화)
- **`GET /api/users/me`**: 내 정보 조회
- **`PATCH /api/users/me`**: 프로필 수정 (nickname)
- **`DELETE /api/users/me`**: 회원탈퇴 및 사용자 데이터 삭제
- **`PATCH /api/users/me/onboarding`**: 온보딩 완료 처리
- **`PATCH /api/users/me/settings`**: 테마 설정(다크모드, 오로라) 변경
- **`GET /api/meta`**: 감정, 카테고리, 상황 마스터 목록 및 색상 조회
- **`GET /api/transactions/{id}`**: 단일 기록 상세 조회 (삭제 시 404 에러)
- **`PUT /api/transactions/{id}`**: 기록 수정
- **`DELETE /api/transactions/{id}`**: 기록 삭제
- **`DELETE /api/transactions`**: 전체 기록 초기화
- **`GET /api/summary/calendar`**: 월별 캘린더 요약 (동률 감정 시 최근 기록 우선)
- **`GET /api/summary/emotions`**: 월별 감정 분포 능선 (8개 감정 데이터 고정 반환)
- **`GET /api/analysis/monthly`** (3순위): 월간 소비 인사이트 분석
- **`GET /api/universe/simulation`** (3순위): 평행우주 시뮬레이션 계산 결과

---

## 5. 기존 명세서 대비 누락/충돌 점검 결과

**1. 요청/응답값 충돌 점검 (해결됨)**
- `POST /api/transactions` 스키마: 기존 단일 식별자로 암시되었던 상황 태그 속성을 `situationIds` 배열화로 수정하고 메모(memo) 정책(길이, 널 처리) 명시를 보완.
- `POST /api/auth/login` 응답: 소셜 계정 프로필 이미지 적용 정책을 반영하여 `profileImageUrl` 필드 추가.
- `POST /api/goals` 요청: 극단값(0원) 입력 방지를 위해 `targetAmount` 검증 규칙 추가(Min: 100).
- 에러 처리 세분화: 400, 401, 403, 404 에러를 상황에 맞게 분리하여 프론트엔드가 정확한 다이얼로그를 표출하도록 에러 매핑 구체화.

**2. 누락 및 삭제 점검**
- **STEP 5에는 있으나 STEP 8에 없는 기능 (정상)**: 커스텀 태그 관리(FUNC-024)는 범위 제외로 확정되어 의도적으로 삭제됨. 알림 설정(FUNC-025)은 후순위 보류.
- **STEP 8에는 있으나 STEP 5에 없는 기능 (없음)**: 요구사항과 1:1 매핑 원칙 준수.

---

## 6. 최종 검토 및 향후 확정 필요 사항

- [x] 변경 기능 수정 (상황 태그 N:M 조인 테이블 저장 등 적용)
- [x] 삭제 기능 정리 (커스텀 태그 관리 API 배제)
- [x] 요청/응답값 상세화 및 오류 응답 분리 (400, 401, 404의 상황별 분리)
- [x] 유효성 검증 규칙 정리 (XSS 필터, 메모 길이 500자, 금액 하한선 100원 등)
- [ ] **백엔드 팀 협의(확인 필요 사항)**: 
  1. 인증 토큰 전달 방식 결정 (프론트 SDK 직접 전달 vs 백엔드 OAuth 리다이렉트 콜백).
  2. XSS 필터링을 프론트엔드에서 1차로 수행할지, 백엔드 전역 미들웨어로 일괄 처리할지 아키텍처 확정 필요.
