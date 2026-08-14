# feelio-web

**Feelio** 프론트엔드 — React 19 · Vite 8

> 감정을 입력하면 소비 인사이트가 출력되는 **감정 소비 분석 서비스**입니다.
> 서비스 소개·팀·ERD·화면 등 전체 문서는 **[Feelio 통합 README](https://github.com/feelios/feelio)** 를 봐주세요.
> 백엔드: [feelio-api](https://github.com/feelios/feelio-api)

---

## 실행 방법

> ⚠️ **[feelio-api](https://github.com/feelios/feelio-api)를 먼저 실행하세요.**
> 개발 서버가 `/api` 요청을 `localhost:8080`으로 프록시하므로, 순서가 바뀌면 초기 요청이 실패합니다.

### 사전 요구사항

`Node.js 20+` · 실행 중인 feelio-api (`localhost:8080`)

```bash
npm install
npm run dev          # http://localhost:5173
```

`.env` 없이도 동작합니다 (기본값 `http://localhost:8080`).
다른 주소를 쓰려면 `.env.local`에 지정합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080
```

### 기타 명령어

```bash
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # ESLint
```

> **`npm run build` 전에 `.env.production`이 필요합니다.** 배포 서버 주소가 팀원마다
> 다르기 때문에 이 파일은 `.gitignore` 대상이며, 각자 자신의 주소를 넣어 만듭니다.
>
> ```bash
> VITE_API_BASE_URL=http://your-domain.example
> ```
>
> 없으면 기본값(`http://localhost:8080`)으로 빌드되어, 배포된 화면에서 API 호출이 전부 실패합니다.

> 작업을 끝내기 전 **`npm run lint`와 `npm run build`가 모두 통과**해야 합니다.

---

## 기술 스택

| 분류 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | React 19.2 · Vite 8.1 | |
| 서버 상태 | TanStack Query 5 | 캐시 무효화 규칙은 API 계약서에 명시 |
| 클라이언트 상태 | Zustand 5 | 로그인 여부·온보딩 등 최소한만 |
| 스타일링 | Emotion 11 | 감정 8종 × 라이트/다크 동적 색상 |
| HTTP | axios 1.18 | 인터셉터로 토큰 자동 재발급 |
| 아이콘 | lucide-react | |
| 푸시 | firebase 12 | FCM |

> **라우팅 라이브러리를 쓰지 않습니다.** 화면이 5개인 단일 화면 전환 구조라
> [`src/app/routes.js`](src/app/routes.js)에 탭을 선언하고 상태로 전환합니다.

---

## 프로젝트 구조

```text
src/
├── app/
│   ├── App.jsx            # 최상위 · 화면 전환
│   └── routes.js          # 탭 정의 (홈·기록·거래내역·AI분석·평행우주)
├── pages/                 # 화면 단위
│   ├── HomePageDesign.jsx         # 홈 회고 — 말랑이·감정 색 캘린더·감정 능선
│   ├── RecordPageDc.jsx           # 기록 — 금액 + 감정 + 카테고리
│   ├── TransactionsPageDesign.jsx # 거래내역 — 일별·월별·감정별
│   ├── AnalysisPageDc.jsx         # AI 분석
│   ├── UniversePageDc.jsx         # 평행우주 시뮬레이션
│   ├── OnboardingPage.jsx         # 온보딩 — 목표 설정
│   └── LoginPage.jsx              # 소셜 로그인
├── components/            # 재사용 컴포넌트 (common · analysis · transactions · universe · profile)
├── api/                   # axios 인스턴스 및 API 호출 함수 (도메인별 1파일)
├── stores/                # Zustand 스토어
├── hooks/                 # 커스텀 훅
├── constants/             # 상수
├── styles/                # 전역 스타일·테마
└── utils/                 # 유틸
```

### 코딩 컨벤션

- 컴포넌트 파일·이름은 `PascalCase`, 함수·변수는 `camelCase`
- **API 호출은 반드시 `src/api/`의 함수를 통해서만** — 컴포넌트에서 직접 `fetch` 금지
- **서버 데이터는 TanStack Query로만 관리** — Zustand에 서버 응답을 복사해두지 않습니다

---

## 백엔드 연동

API 명세는 **[docs/API-CONTRACT.md](docs/API-CONTRACT.md)** 를 단일 기준으로 삼습니다.

### 인증

소셜 로그인 전용이며 **BFF 패턴**입니다. 프론트가 하는 일은
`GET /oauth2/authorization/{provider}`로 **리다이렉트하는 것뿐**입니다.

백엔드가 발급한 JWT는 **HttpOnly 쿠키**로 내려오므로, 프론트는 토큰을 저장하지도
읽지도 않습니다. axios 인스턴스에 `withCredentials: true`만 설정하면 요청마다 자동 첨부됩니다.

> `localStorage`에 토큰을 저장하지 않습니다. `Authorization` 헤더를 직접 붙이지 마세요.

### 토큰 재발급

리프레시 토큰이 **회전(rotation) + 재사용 감지** 방식이라, 동시에 여러 번 재발급하면
두 번째부터 "구 토큰 재사용"으로 판정되어 엉뚱한 로그아웃이 발생합니다.
이를 막기 위해 [`src/api/client.js`](src/api/client.js)에서 재발급을 **직렬화**합니다 —
첫 요청만 재발급을 수행하고 나머지는 대기 큐에서 기다렸다가 재시도합니다.

---

## 문서

| 문서 | 내용 |
|---|---|
| [docs/PRODUCT.md](docs/PRODUCT.md) | 서비스 정의와 범위 (feelio-api와 동일하게 유지) |
| [docs/API-CONTRACT.md](docs/API-CONTRACT.md) | API 명세 |
| [docs/DESIGN-GUIDE.md](docs/DESIGN-GUIDE.md) | 색상·타이포·컴포넌트 기준 |
| [docs/ISSUES.md](docs/ISSUES.md) | 이슈 정의·진행 기록 |

---

## 기여 규칙

- `main` 직접 push 금지 — **1 이슈 = 1 브랜치 = 1 PR**
- 브랜치: `feat/login`, `fix/token-expire`, `docs/readme`
- 커밋: Conventional Commits (`feat:` `fix:` `docs:` `refactor:` `test:` `chore:`)
- PR 본문에 **무엇을 / 왜 / 어떻게 테스트했는지** 작성
- 최소 1명 리뷰 승인 후 머지, 자기 코드는 자기가 머지하지 않습니다
- 머지 전 `npm run lint && npm run build` 통과 필수
