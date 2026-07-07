# STEP 7. 데이터베이스 설계서

**프로젝트명:** Feelio
**작성일:** 2026-07-06
**작성 기준:** STEP 6 ERD(운영 기준, 12테이블)를 상세화한다. 현재 데모 코드 범위가 아니라 **실제 운영 서비스 런칭을 전제로** 컬럼·제약·인덱스를 정의한다. 확정 컬럼과 별도로 필요 시점에 채택할 컬럼은 8절 "추가 제안"으로 분리한다.
**목표 DBMS:** MySQL 8.x (Spring Boot + MyBatis)

---

## 1. 공통 설계 규칙

| 항목 | 규칙 |
|---|---|
| 문자셋/콜레이션 | `utf8mb4` / `utf8mb4_unicode_ci` |
| 네이밍 | 테이블·컬럼 snake_case, 테이블명 복수형 |
| PK | `BIGINT AUTO_INCREMENT` 대리키 |
| 시간 | `DATETIME`, Asia/Seoul. 발생 시각(`occurred_at`)과 이력 시각(`created_at`/`updated_at`) 분리 |
| 공통 컬럼 | 도메인·이력 테이블에 `created_at`(DEFAULT CURRENT_TIMESTAMP), `updated_at`(ON UPDATE CURRENT_TIMESTAMP) |
| 금액 | `INT`, 원 단위 정수 |
| 삭제 | 사용자 하위 데이터는 탈퇴 시 CASCADE 물리 삭제. 마스터 코드 값은 삭제 대신 `is_active=false` |
| 코드 값 검증 | 마스터 테이블 FK로 무결성 보장. 상태 문자열(status·type 등)은 VARCHAR + 서비스 검증 |
| 인증 | JWT 액세스 + 리프레시 토큰 구조 (인증 방식은 백엔드 착수 시 최종 확정) |

## 2. 테이블 정의서 — 핵심 도메인

### 2-1. `users` — 사용자

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| users | user_id | BIGINT | Y | N | N | AUTO_INCREMENT | 사용자 식별자 |
| users | nickname | VARCHAR(50) | N | N | N | — | 표시 이름 |
| users | email | VARCHAR(100) | N | N | Y | NULL | 대표 이메일 (소셜 수신) |
| users | profile_image_url | VARCHAR(500) | N | N | Y | NULL | 소셜 프로필 이미지 URL |
| users | onboarding_done | TINYINT(1) | N | N | N | 0 | 온보딩 완료 여부 (로그아웃 무관 보존) |
| users | theme_mode | VARCHAR(10) | N | N | N | 'LIGHT' | LIGHT / DARK |
| users | aurora_theme | VARCHAR(20) | N | N | N | '블루' | 오로라 테마 키 |
| users | status | VARCHAR(10) | N | N | N | 'ACTIVE' | ACTIVE / WITHDRAWN |
| users | created_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 가입 일시 |
| users | updated_at | DATETIME | N | N | N | CURRENT_TIMESTAMP (ON UPDATE) | 수정 일시 |

### 2-2. `social_accounts` — 소셜 로그인 연결

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| social_accounts | social_account_id | BIGINT | Y | N | N | AUTO_INCREMENT | 소셜 연결 ID |
| social_accounts | user_id | BIGINT | N | Y | N | — | 사용자 (users.user_id) |
| social_accounts | provider | VARCHAR(20) | N | N | N | — | GOOGLE / KAKAO / NAVER |
| social_accounts | provider_user_id | VARCHAR(100) | N | N | N | — | 제공자 발급 식별자 |
| social_accounts | connected_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 연결 일시 |

### 2-3. `transactions` — 수입·지출 기록 (핵심)

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| transactions | transaction_id | BIGINT | Y | N | N | AUTO_INCREMENT | 기록 ID |
| transactions | user_id | BIGINT | N | Y | N | — | 소유 사용자 |
| transactions | emotion_id | BIGINT | N | Y | N | — | 감정 (필수, emotions.emotion_id) |
| transactions | category_id | BIGINT | N | Y | N | — | 카테고리 (필수, categories.category_id) |
| transactions | type | VARCHAR(10) | N | N | N | 'EXPENSE' | EXPENSE / INCOME |
| transactions | amount | INT | N | N | N | — | 금액(원), 0 초과 |
| transactions | memo | VARCHAR(200) | N | N | Y | NULL | 메모 (미입력 NULL) |
| transactions | occurred_at | DATETIME | N | N | N | — | 발생 일시 |
| transactions | created_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 생성 일시 |
| transactions | updated_at | DATETIME | N | N | N | CURRENT_TIMESTAMP (ON UPDATE) | 수정 일시 |

### 2-4. `goals` — 목표

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| goals | goal_id | BIGINT | Y | N | N | AUTO_INCREMENT | 목표 ID |
| goals | user_id | BIGINT | N | Y | N | — | 소유 사용자 |
| goals | name | VARCHAR(100) | N | N | N | — | 목표명 |
| goals | target_amount | INT | N | N | N | — | 목표 금액(원), 0 초과 |
| goals | current_amount | INT | N | N | N | 0 | 현재 금액(원) |
| goals | start_date | DATE | N | N | Y | NULL | 시작일 |
| goals | due_date | DATE | N | N | Y | NULL | 기한 (온보딩 기간 → 계산) |
| goals | is_main | TINYINT(1) | N | N | N | 0 | 대표 목표 (사용자당 1건) |
| goals | status | VARCHAR(12) | N | N | N | 'ACTIVE' | ACTIVE / ACHIEVED / ARCHIVED |
| goals | created_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 생성 일시 |
| goals | updated_at | DATETIME | N | N | N | CURRENT_TIMESTAMP (ON UPDATE) | 수정 일시 |

## 3. 테이블 정의서 — 코드/마스터 · 연결

### 3-1. `emotions` — 감정 마스터

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| emotions | emotion_id | BIGINT | Y | N | N | AUTO_INCREMENT | 감정 ID |
| emotions | name | VARCHAR(20) | N | N | N | — | 감정명 (UNIQUE) |
| emotions | color | VARCHAR(20) | N | N | N | — | 대표 색상(HEX) |
| emotions | character_key | VARCHAR(30) | N | N | Y | NULL | 말랑이 캐릭터 키 |
| emotions | sort_order | INT | N | N | N | 0 | 표시·능선 정렬 순서 |
| emotions | is_active | TINYINT(1) | N | N | N | 1 | 사용 여부 |

### 3-2. `categories` — 카테고리 마스터

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| categories | category_id | BIGINT | Y | N | N | AUTO_INCREMENT | 카테고리 ID |
| categories | name | VARCHAR(30) | N | N | N | — | 카테고리명 |
| categories | type | VARCHAR(10) | N | N | N | — | EXPENSE / INCOME |
| categories | sort_order | INT | N | N | N | 0 | 정렬 순서 |
| categories | is_active | TINYINT(1) | N | N | N | 1 | 사용 여부 |

## 4. 테이블 정의서 — 분석 · 운영

### 4-1. `monthly_summaries` — 월별 집계 캐시

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| monthly_summaries | summary_id | BIGINT | Y | N | N | AUTO_INCREMENT | 집계 ID |
| monthly_summaries | user_id | BIGINT | N | Y | N | — | 사용자 |
| monthly_summaries | year | INT | N | N | N | — | 연도 |
| monthly_summaries | month | INT | N | N | N | — | 월 |
| monthly_summaries | total_income | INT | N | N | N | 0 | 월 수입 합계 |
| monthly_summaries | total_expense | INT | N | N | N | 0 | 월 지출 합계 |
| monthly_summaries | updated_at | DATETIME | N | N | N | CURRENT_TIMESTAMP (ON UPDATE) | 갱신 일시 |

> 감정별·카테고리별 세부 집계는 실시간 쿼리로 산출(인덱스 활용). 본 테이블은 홈·목록의 월 합계 성능 캐시용. `(user_id, year, month)` UNIQUE.

### 4-2. `ai_insights` — 인사이트/AI 문장

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| ai_insights | insight_id | BIGINT | Y | N | N | AUTO_INCREMENT | 인사이트 ID |
| ai_insights | user_id | BIGINT | N | Y | N | — | 사용자 |
| ai_insights | year | INT | N | N | N | — | 기준 연도 |
| ai_insights | month | INT | N | N | N | — | 기준 월 |
| ai_insights | insight_type | VARCHAR(20) | N | N | N | — | HOME / MONTHLY |
| ai_insights | content | VARCHAR(500) | N | N | N | — | 생성 문장 |
| ai_insights | created_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 생성 일시 |

### 4-3. `notification_settings` — 알림 설정

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| notification_settings | notification_setting_id | BIGINT | Y | N | N | AUTO_INCREMENT | 설정 ID |
| notification_settings | user_id | BIGINT | N | Y | N | — | 사용자 (UNIQUE, 1:1) |
| notification_settings | record_reminder | TINYINT(1) | N | N | N | 1 | 기록 리마인더 |
| notification_settings | weekly_report | TINYINT(1) | N | N | N | 1 | 주간 리포트 |
| notification_settings | goal_nudge | TINYINT(1) | N | N | N | 0 | 목표 근접 알림 |
| notification_settings | remind_time | VARCHAR(5) | N | N | Y | NULL | 알림 시간 (HH:mm) |
| notification_settings | updated_at | DATETIME | N | N | N | CURRENT_TIMESTAMP (ON UPDATE) | 갱신 일시 |

### 4-4. `terms_agreements` — 약관 동의 이력

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| terms_agreements | agreement_id | BIGINT | Y | N | N | AUTO_INCREMENT | 동의 ID |
| terms_agreements | user_id | BIGINT | N | Y | N | — | 사용자 |
| terms_agreements | terms_type | VARCHAR(15) | N | N | N | — | SERVICE / PRIVACY / MARKETING |
| terms_agreements | agreed | TINYINT(1) | N | N | N | — | 동의 여부 |
| terms_agreements | version | VARCHAR(20) | N | N | N | — | 약관 버전 |
| terms_agreements | agreed_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 동의 일시 |

### 4-5. `refresh_tokens` — 리프레시 토큰

| 테이블명 | 컬럼명 | 타입 | PK | FK | NULL | Default | 설명 |
|---|---|---|---|---|---|---|---|
| refresh_tokens | token_id | BIGINT | Y | N | N | AUTO_INCREMENT | 토큰 ID |
| refresh_tokens | user_id | BIGINT | N | Y | N | — | 사용자 |
| refresh_tokens | token_hash | VARCHAR(255) | N | N | N | — | 해시된 리프레시 토큰 (UNIQUE) |
| refresh_tokens | expires_at | DATETIME | N | N | N | — | 만료 일시 |
| refresh_tokens | created_at | DATETIME | N | N | N | CURRENT_TIMESTAMP | 발급 일시 |

## 5. 제약조건 정의

| 제약명 | 테이블 | 유형 | 내용 |
|---|---|---|---|
| uq_social_provider | social_accounts | UNIQUE | `(provider, provider_user_id)` |
| fk_social_user | social_accounts | FK | user_id → users, ON DELETE CASCADE |
| fk_tx_user | transactions | FK | user_id → users, ON DELETE CASCADE |
| fk_tx_emotion | transactions | FK | emotion_id → emotions, ON DELETE RESTRICT |
| fk_tx_category | transactions | FK | category_id → categories, ON DELETE RESTRICT |
| chk_tx_amount | transactions | CHECK | amount > 0 |
| fk_goal_user | goals | FK | user_id → users, ON DELETE CASCADE |
| chk_goal_amount | goals | CHECK | target_amount > 0 AND current_amount >= 0 |
| uq_emotion_name | emotions | UNIQUE | name |
| uq_category_name_type | categories | UNIQUE | (name, type) |
| uq_summary | monthly_summaries | UNIQUE | (user_id, year, month) |
| uq_noti_user | notification_settings | UNIQUE | user_id (1:1) |
| uq_refresh_token | refresh_tokens | UNIQUE | token_hash |
| (서비스 검증) | 전반 | 애플리케이션 | status·type·provider·insight_type·terms_type 코드 값 |
| (서비스 검증) | goals | 애플리케이션 | 사용자당 is_main=1 최대 1건 (교체는 트랜잭션) |

## 6. 인덱스 정의

| 인덱스명 | 테이블 | 컬럼 | 근거 |
|---|---|---|---|
| idx_tx_user_occurred | transactions | (user_id, occurred_at) | **필수** — 기간 조회, 캘린더·능선 집계 |
| idx_tx_user_emotion | transactions | (user_id, emotion_id) | **권장** — 감정별 조회·분포 |
| idx_tx_user_category | transactions | (user_id, category_id) | 카테고리별 분석 |
| idx_goals_user_main | goals | (user_id, is_main) | 대표 목표 조회 |
| idx_ai_user_ym | ai_insights | (user_id, year, month) | 월별 인사이트 조회 |
| idx_refresh_user | refresh_tokens | (user_id) | 사용자 토큰 조회·정리 |
| (자동) | social_accounts, monthly_summaries, notification_settings | UNIQUE 인덱스 | 로그인·집계·설정 조회에 재사용 |

## 7. 참고 DDL 초안 (핵심 테이블)

```sql
CREATE TABLE users (
  user_id           BIGINT       NOT NULL AUTO_INCREMENT,
  nickname          VARCHAR(50)  NOT NULL,
  email             VARCHAR(100) NULL,
  profile_image_url VARCHAR(500) NULL,
  onboarding_done   TINYINT(1)   NOT NULL DEFAULT 0,
  theme_mode        VARCHAR(10)  NOT NULL DEFAULT 'LIGHT',
  aurora_theme      VARCHAR(20)  NOT NULL DEFAULT '블루',
  status            VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE social_accounts (
  social_account_id BIGINT       NOT NULL AUTO_INCREMENT,
  user_id           BIGINT       NOT NULL,
  provider          VARCHAR(20)  NOT NULL,
  provider_user_id  VARCHAR(100) NOT NULL,
  connected_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (social_account_id),
  UNIQUE KEY uq_social_provider (provider, provider_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE emotions (
  emotion_id    BIGINT      NOT NULL AUTO_INCREMENT,
  name          VARCHAR(20) NOT NULL,
  color         VARCHAR(20) NOT NULL,
  character_key VARCHAR(30) NULL,
  sort_order    INT         NOT NULL DEFAULT 0,
  is_active     TINYINT(1)  NOT NULL DEFAULT 1,
  PRIMARY KEY (emotion_id),
  UNIQUE KEY uq_emotion_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  category_id BIGINT      NOT NULL AUTO_INCREMENT,
  name        VARCHAR(30) NOT NULL,
  type        VARCHAR(10) NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0,
  is_active   TINYINT(1)  NOT NULL DEFAULT 1,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name_type (name, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transactions (
  transaction_id BIGINT       NOT NULL AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL,
  emotion_id     BIGINT       NOT NULL,
  category_id    BIGINT       NOT NULL,
  type           VARCHAR(10)  NOT NULL DEFAULT 'EXPENSE',
  amount         INT          NOT NULL,
  memo           VARCHAR(200) NULL,
  occurred_at    DATETIME     NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (transaction_id),
  KEY idx_tx_user_occurred (user_id, occurred_at),
  KEY idx_tx_user_emotion (user_id, emotion_id),
  KEY idx_tx_user_category (user_id, category_id),
  CONSTRAINT chk_tx_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goals (
  goal_id        BIGINT       NOT NULL AUTO_INCREMENT,
  user_id        BIGINT       NOT NULL,
  name           VARCHAR(100) NOT NULL,
  target_amount  INT          NOT NULL,
  current_amount INT          NOT NULL DEFAULT 0,
  start_date     DATE         NULL,
  due_date       DATE         NULL,
  is_main        TINYINT(1)   NOT NULL DEFAULT 0,
  status         VARCHAR(12)  NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (goal_id),
  KEY idx_goals_user_main (user_id, is_main),
  CONSTRAINT chk_goal_amount CHECK (target_amount > 0 AND current_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE monthly_summaries (
  summary_id    BIGINT   NOT NULL AUTO_INCREMENT,
  user_id       BIGINT   NOT NULL,
  year          INT      NOT NULL,
  month         INT      NOT NULL,
  total_income  INT      NOT NULL DEFAULT 0,
  total_expense INT      NOT NULL DEFAULT 0,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (summary_id),
  UNIQUE KEY uq_summary (user_id, year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_insights (
  insight_id   BIGINT       NOT NULL AUTO_INCREMENT,
  user_id      BIGINT       NOT NULL,
  year         INT          NOT NULL,
  month        INT          NOT NULL,
  insight_type VARCHAR(20)  NOT NULL,
  content      VARCHAR(500) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (insight_id),
  KEY idx_ai_user_ym (user_id, year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notification_settings (
  notification_setting_id BIGINT     NOT NULL AUTO_INCREMENT,
  user_id                 BIGINT     NOT NULL,
  record_reminder         TINYINT(1) NOT NULL DEFAULT 1,
  weekly_report           TINYINT(1) NOT NULL DEFAULT 1,
  goal_nudge              TINYINT(1) NOT NULL DEFAULT 0,
  remind_time             VARCHAR(5) NULL,
  updated_at              DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_setting_id),
  UNIQUE KEY uq_noti_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE terms_agreements (
  agreement_id BIGINT      NOT NULL AUTO_INCREMENT,
  user_id      BIGINT      NOT NULL,
  terms_type   VARCHAR(15) NOT NULL,
  agreed       TINYINT(1)  NOT NULL,
  version      VARCHAR(20) NOT NULL,
  agreed_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (agreement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
  token_id   BIGINT       NOT NULL AUTO_INCREMENT,
  user_id    BIGINT       NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token_id),
  UNIQUE KEY uq_refresh_token (token_hash),
  KEY idx_refresh_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 7-1. 외래키(FK) 제약조건 추가 스크립트 (운영 전환 시 주입용)

> 데이터베이스 초기 구성의 유연성과 빠른 스키마 마이그레이션을 위해 테이블 생성 시 FK 제약조건은 제외하고, 추후 데이터 안정화 및 무결성 강화가 필요한 시점에 아래 스크립트를 통해 일괄 주입합니다.

```sql
ALTER TABLE social_accounts 
  ADD CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE transactions 
  ADD CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_tx_emotion FOREIGN KEY (emotion_id) REFERENCES emotions (emotion_id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_tx_category FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE RESTRICT;

ALTER TABLE goals 
  ADD CONSTRAINT fk_goal_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE monthly_summaries 
  ADD CONSTRAINT fk_summary_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE ai_insights 
  ADD CONSTRAINT fk_ai_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE notification_settings 
  ADD CONSTRAINT fk_noti_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE terms_agreements 
  ADD CONSTRAINT fk_terms_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;

ALTER TABLE refresh_tokens 
  ADD CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;
```

## 8. 코드 값 · 시드 데이터

### 8-1. 감정 (emotions) — 확정

신남 · 설렘 · 뿌듯함 · 스트레스 · 외로움 · 화남 · 평온 · 무덤덤 (각 color·character_key·sort_order는 프론트 `src/data/emotions.js` 값을 이관)

### 8-2. 카테고리 (categories) — 확정됨

| type | 시드 |
|---|---|
| EXPENSE | 식비, 배달, 마트/편의점, 패션/미용, 주거/통신, 문화/취미, 구독료, 생활용품, 사회생활, 보험, 세금, 차량/교통, 저축 |
| INCOME | 월급, 금융소득, 용돈, 더치페이, 환급금 |

> 최신 앱 UI 기획에 맞춰 카테고리 목록이 확정되었습니다. (저축 포함)

## 9. 추가 제안 컬럼 (확정과 분리)

| 테이블 | 제안 컬럼 | 용도 | 채택 시점 |
|---|---|---|---|
| users | last_login_at | 마지막 로그인 추적 | 운영 지표 필요 시 |
| users | withdrawn_at | 탈퇴 시각 (유예·통계) | 탈퇴 정책 상세화 시 |
| transactions | source | 기록 출처 (MANUAL / 자동 감지) | 자동 연동 로드맵 확정 시 |
| goals | sort_order | 목표 정렬 | 목표 다건 관리 UI 시 |
| emotions/categories | user_id | 커스텀 태그 소유자 (기본=NULL) | 사용자 커스텀 허용 시 |

## 10. 보완 필요 사항

| # | 항목 | 내용 |
|---|---|---|
| 1 | 마스터 값 저장 방식 | 감정·카테고리명을 한글로 저장(현재 코드 일치). 다국어 요구 시 name 다국어 컬럼 재검토 |
| 2 | 온보딩 기간 → due_date 계산 | 3·6·12·24개월 선택 → start_date + 기간 |
| 3 | 대표 목표 교체 | is_main 변경 시 기존 해제+신규 지정 단일 트랜잭션 |
| 4 | monthly_summaries 갱신 시점 | 기록 생성·수정·삭제 시 동기 갱신 vs 배치 — 트래픽 규모에 따라 결정 |
| 5 | 시드 데이터 스크립트 | emotions·categories 마스터 + 시연 계정 거래 시드 |
