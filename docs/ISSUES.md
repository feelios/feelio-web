## 프론트엔드 작업 핵심 원칙 (Core Directive)
**"현재 웹의 형태와 디자인(UI/UX)은 절대 훼손하지 않는다."**
모든 프론트엔드 작업은 기존 뷰(View) 템플릿과 스타일링을 100% 유지한 상태에서 **API 통신, 데이터 바인딩, 비즈니스 로직(오류 수정) 연결**에만 국한됩니다. 에이전트가 임의로 화면 디자인이나 레이아웃을 수정하는 것을 엄격히 금지합니다.

# Feelio 프론트엔드 기능 이슈 표 (SSOT)

> **Claude / Gemini 어떤 도구로 작업하든 이 표를 공통 기준으로 삼는다.**
> 이슈 코드(예: F1-1)로 브랜치·계약(§)·계층·캐시키·상태·완료기준을 확정한다.
> 규칙 전체는 [AGENTS.md](../AGENTS.md), API 계약은 [docs/API-CONTRACT.md](./API-CONTRACT.md)가 SSOT.
> 코드 체계: 
> - F1=기반 안정화, F2=온보딩, F3=핵심 거래, F4=목표·분석·설정, F5=UX 고도화, F6=보안 및 아키텍처 리팩토링,
> - **F7=동적 예산 및 자산 관리 고도화**: 추가 개선 외 총자산 스와이프 UI 및 거래 내역 수동 저금(목표 연동) 처리 (마일스톤 7)
> - **F8=핫픽스 및 UX 폴리싱 (Quick Wins)**: 사용자 경험에 직접적으로 영향을 미치는 버그를 해결하고 간단한 UI/UX 개선을 진행합니다.
> - **F9=데이터 시각화 및 대시보드 고도화**: 대시보드와 분석 페이지의 데이터 표시 방식 및 네비게이션 개선
> - **F10=트랜잭션 관리 및 고급 API 연동**: 새로운 API(다중 삭제, 패턴 분석 등) 연동을 통한 복잡한 기능 구현
> - **F11=UI 고도화**: 글래스모피즘 등 프리미엄 디자인 룰 적용 및 화면 간 상태 연동 고도화
> 상태: 완료(머지됨) · 예정 · 신규(백엔드 계약에 맞춰 신규 편성, 예정)

| 체크 | 이슈# | 코드 | 제목 | 브랜치 | 계약 | 계층 | 캐시키 | 상태 | 완료기준(핵심) |
| [x] | - | F1-1 | Axios 401 토큰 재발급(쿠키) | `fix/auth-interceptor-cookie` | §3 | api | — | 완료 | 로컬스토리지 토큰·Authorization 강제주입 제거 → 401 시 바디 없이 `/auth/token/refresh` 호출(쿠키 자동전송) → 원 요청 재시도 |
| [x] | - | F1-2 | 메타데이터 폼 바인딩 | `fix/meta-form-binding` | §5 | Page·Hook·api | `['meta']` | 완료 | `RecordPage` 하드코딩 카테고리 제거, `useMetadata`로 감정·카테고리 옵션 바인딩, 등록 후 캐시 무효화 |
| [x] | - | F2-1 | 온보딩 폼·닉네임 검증 | `feat/users-me` | §4 | Page·api·Store | `['user']` | 완료 | 닉네임 1~8자 검증 UI, 온보딩 API 연동 후 `{onboardingDone:true}` 갱신 → 홈 리다이렉트 |
| [x] | - | F3-1 | 거래 목록·무한스크롤 | `feat/tx-list` | §6 | Page·Hook·api | `['tx','list']` | 완료 | `mockTransactions` 제거, `useTransactionsQuery` 연동, 무한스크롤 + 연/월 필터 + 검색어 디바운스 |
| [x] | - | F3-2 | 거래 상세·수정·삭제 | `feat/tx-crud` | §6 | Page·Hook·api | `['tx','detail']` | 완료 | 상세 모달 바인딩, 수정/삭제 Mutation, 완료 시 목록 캐시 무효화 및 즉시 반영 |
| [x] | - | F4-1 | 목표 CRUD·대표목표 | `feat/goals` | §7 | Page·Hook·api | `['goals']` | 완료 | 목표 입력 폼 분리 + CRUD 바인딩, `isMain` 설정/해제 토글 연동 |
| [x] | - | F4-2 | 홈 캘린더 요약 | `feat/summary-cal` | §8 | Page·Hook·api | `['summary','calendar']` | 완료 | 일별 감정 아이콘·지출 합계 캘린더 매핑, 데이터 없는 날짜 예외처리 |
| [x] | - | F4-3 | 감정 요약 차트·전월대비 | `feat/summary-emo` | §8 | Page·Hook·api | `['summary','emotion']` | 완료 | 차트(Recharts/D3) 바인딩, `prevMonth` 증감률 계산·렌더 |
| [ ] | - | F4-4 | 설정(테마)·회원탈퇴 | `feat/user-settings` | §4 | Page·api·Store | `['user']` | 예정 | 테마 설정 Store 즉시 반영, 탈퇴 API + 로컬·전역 Store·캐시 전체 파기 |
| [x] | - | F4-5 | 평행우주 UI | `feat/universe` | §9 | Page·Hook·api | `['universe']` | 완료 | §9 시뮬 스키마 바인딩, 3D/인터랙티브 상태·애니메이션 연동 |
| [ ] | - | F4-6 | 월간 분석(analysis) 화면 | `feat/analysis` | §9 | Page·Hook·api | `['analysis']` | 신규 | §9 `/analysis/monthly` 연동(카테고리·시간대·감정 집계 + 인사이트). ※`AnalysisPage` 기존 상황(situation) 기반 evidence 제거·재연동 |
| [x] | - | F4-7 | 커스텀 카테고리 설정 | `feat/custom-category` | §12 | Page·Hook·api | `['categories']` | 완료 | §12 커스텀 카테고리 추가/삭제 + 공통·커스텀 통합 정렬(드래그) 저장·반환 (커밋 b7b91e1: api/hook + RecordPage 연동) |
| [ ] | - | F5-1 | Skeleton/Suspense 로딩 | `feat/ux-loading` | — | Page·컴포넌트 | — | 예정 | `isLoading` + Suspense 바운더리, 메인/상세 스켈레톤 컴포넌트 노출 |
| [ ] | - | F5-2 | 전역 ErrorBoundary | `feat/ux-error` | §1 | 컴포넌트 | — | 예정 | 라우트 단위 ErrorBoundary, 500 등 오류 시 재시도 버튼 포함 Fallback UI |
| [ ] | - | F5-3 | 거래·목표 낙관적 업데이트 | `feat/ux-optimistic` | §10 | Hook | `['tx']`·`['goals']` | 예정 | `onMutate` 캐시 선반영, `onError` 시 이전 캐시로 롤백 |
| [ ] | - | F6-1 | 전역 상태(로컬 스토리지) 보안 및 최적화 | `refactor/storage-whitelist` | §13 | Store·Hook | — | 신규 | §13 민감/비즈니스 데이터 스토리지에서 제거 + UI 상태(themeMode, aurora 등)만 로컬 유지(partialize 적용) |
| [ ] | - | F6-2 | JWT 보안 통신 및 Silent Refresh 구현 | `feat/auth-interceptor` | §14 | api·Store | — | 신규 | §14 Access 토큰 메모리(전역 상태) 관리 + 401 에러 감지 시 토큰 재발급 Axios 인터셉터 구현 (withCredentials 포함) |
| [ ] | - | F6-3 | 결제/목표 데이터 서버 연동(Fetching) 전환 | `refactor/data-fetching` | §15 | Page·Hook | `['transactions']`, `['goals']` | 신규 | §15 로컬 스토리지 의존성 100% 제거 + HomePage 등 남은 화면 컴포넌트 마운트 시 API 패칭(React Query)으로 완전 전환 |
| [ ] | - | F7-1 | '저축' 기본 카테고리 전환 및 UI 개편 | `refactor/default-category-savings` | - | Component·Page·api | `['categories']`, `['transactions']` | 신규 | 커스텀 '저축' 생성 UI/POST 로직 제거 → 스타일 상수(아이콘/테마) 매핑 → 기본 카테고리 하단(Order 9) 노출 및 거래 생성 검증 |
| [ ] | - | F7-2 | AI 분석: 데이터 부족 시 빈 박스(Empty Box) 예외 처리 | `feat/analysis-empty-state` | - | Component·Page | - | 신규 | 데이터 부재(배열 0 or 총합 0) 판별 → 차트 Early Return → 문구/버튼 없이 기존 영역 크기 유지하는 빈 박스(Empty Box) 렌더링 |
| [x] | - | F7-3 | AI 멘트 API 연동 및 더미 텍스트 제거 | `feat/analysis-ai-insights-api` | - | api·Page·Hook | `['aiInsights']` | 완료 | `AnalysisPageDc.jsx` 내 더미(`aiQuickInsights` 등) 전면 제거 → `useAiInsightsQuery` 훅 생성/바인딩 → Mock 갱신 시 UI 즉각 반영 |
| [x] | - | F7-4 | 지출 추이 차트 API 연동 및 하드코딩 제거 | `feat/analysis-trend-api` | - | api·Page·Hook | `['analysis', 'trend']` | 완료 | 1. `api/analysis.js` 통신 함수 및 `useMonthlyTrendQuery` 훅 생성.<br>2. 타겟 파일(`AnalysisPageDc.jsx`) 내 하드코딩된 금액, 증감률, 7개월 치 더미 배열 전면 삭제.<br>3. API 응답 데이터(`currentTotalAmount`, `monthlyData` 등)를 기반으로 우측 상단 텍스트 및 차트 동적 바인딩.<br>4. 데이터 빈 배열 시 "데이터 수집 중" UI 방어 로직 정상 연결 확인. |
| [x] | - | F7-5 | 예산 현황 UI 바인딩 및 프론트 임의 로직 제거 | `feat/analysis-budget-api` | - | api·Page·Hook | `['analysis', 'budget']` | 완료 | 1. `api/analysis.js` 통신 함수 및 `useBudgetStatusQuery` 훅 생성.<br>2. `AnalysisPageDc.jsx` 내부에서 임의로 95%(`prevAmount * 0.95`)를 곱해 예산을 산출하던 억지 연산 로직 완전 제거.<br>3. 서버 응답값(`budget`, `currentAmount`)을 온전히 사용하여 진행률 퍼센트 계산.<br>4. 진행률에 따른 "안정", "주의", "초과" 텍스트 및 분기 색상(`#E87573` 등) 렌더링 검증. |
| [x] | #132 | F7-6 | 온보딩 '총자산' 폼 추가 | `feat/onboarding-total-asset` | - | Page·Component | - | 완료 | 온보딩 완료 시 총자산 데이터를 함께 입력받아 서버로 전송 |
| [x] | - | F7-7 | 홈 화면 총자산·목표 스와이프 UI | `feat/home-asset-swipe` | - | Component | - | 완료 | 홈 화면 상단에 총자산 카드 및 개별 목표 카드들을 스와이프/토글로 넘겨보는 UI 구현 |
| [x] | - | F7-8 | 거래 폼 '목표 선택(저축)' 동적 UI | `feat/transaction-goal-select` | - | Component | - | 완료 | 카테고리를 '저축'으로 선택 시 하단에 어떤 목표인지 맵핑하는 Select 드롭다운 노출 |
| [x] | - | F7-9 | 목표 카드 다이렉트 저금 연동 | `feat/goal-direct-deposit` | - | Component | - | 완료 | 목표 카드 내 '저금하기' 버튼 클릭 시 카테고리(저축)/목표가 미리 선택된 상태로 거래 모달 팝업 |
| [ ] | - | F7-10 | 홈 화면 예산 달성/미달 동적 렌더링 | `feat/home-dynamic-budget-ui` | - | Component | `['analysis', 'budget']` | 신규 | 예산 초과 달성 및 미달 시나리오에 따라 차트와 알림 문구를 다르게 렌더링 |
| [ ] | - | F8-1 | 지출 수입 날짜 초기화 오류 수정 | `fix/transaction-date-init` | - | Component | - | 신규 | 날짜 선택기 저장 시 상태 유지 오류 수정 |
| [ ] | - | F8-2 | 거래 수정 카테고리 오류 해결 | `fix/transaction-category-edit` | - | Component | - | 신규 | 기존 카테고리 정상 렌더링 및 수정 API 연동 수정 |
| [ ] | - | F8-3 | 날짜 지정 달력 테마 수정 | `feat/transaction-calendar-theme` | - | Component | - | 신규 | 달력 날짜 클릭 시 하이라이트 테마/스타일링 적용 |
| [ ] | - | F8-4 | 달력 네비게이션 탭 구현 | `feat/calendar-time-tabs` | - | Component | - | 신규 | "지금" 버튼을 과거/지금/미래 탭으로 개편 및 라우팅 |
| [ ] | - | F8-5 | 목표 '모은 돈' 입력 버그 수정 | `fix/goal-amount-binding` | - | Component | - | 신규 | 목표 금액 입력 시 숫자 파싱 오류 및 NaN 방어 로직 추가 |
| [ ] | - | F8-6 | 거래 감정 Select 오류 수정 및 UI 확대 | `fix/transaction-emotion-select` | - | Component | - | 신규 | 감정 초기값 바인딩 오류 해결 및 카테고리/감정 Select 컴포넌트 터치 영역(패딩) 확대 (F8-2 연계) |
| [ ] | - | F8-7 | 캘린더 미래 날짜 선택 제한(Disabled) | `fix/calendar-future-disable` | - | Component | - | 신규 | 지출/수입 기록 캘린더 및 거래 수정 모달 내 캘린더에서 오늘 기준 '미래 날짜'는 클릭 불가능하도록(disabled) 방어 처리 |

| [x] | #121 | F8-8 | 거래 수정 캘린더 레이아웃 및 분 단위 추가 | `fix/transaction-edit-calendar` | - | Component | - | 완료 | 거래 수정 모달 내 캘린더 짤림 현상(CSS) 해결 및 기존 시간 선택 시 분(minute) 단위 설정 추가 |
| [ ] | #122 | F8-9 | 거래 수정 폼 '수입/지출' 타입 변경 추가 | `feat/transaction-edit-type` | - | Component | - | 신규 | 거래 수정 모달 내부에 '수입/지출'을 변경할 수 있는 Select(혹은 탭) 추가 및 수정 API 연동 |
| [ ] | #125 | F8-10 | 온보딩 '나만의 목표' 직접 입력 UI | `feat/onboarding-custom-goal` | - | Component | - | 신규 | 온보딩(2/6)에서 '나만의 목표' 클릭 시 텍스트 Input으로 전환되어 사용자가 직접 목표명을 작성하도록 구현 |
| [ ] | #126 | F8-11 | 홈 화면 UI 버그 종합 수정(말랑이/달력) | `fix/home-ui-bugs` | - | Component | - | 신규 | 홈 말랑이 위로 스와이프 시 렌더링 버그 수정, 캘린더 우측 끝 짤림(레이아웃) 수정, 캘린더 선택 날짜(7월 1일 고정)를 오늘 날짜로 동적 수정 |
| [ ] | - | F8-12 | 온보딩 완료 요청의 totalAsset 누락 수정 | `fix/onboarding-completion-request` | §4·§7 | Page·Hook·api·docs | `['users','me']` | 신규 | 온보딩 완료 요청에 `{totalAsset}` 전달 → 신규·재가입 사용자 `onboardingDone:true` 반영 및 홈 진입 → API 계약 문서 동기화, lint·build 통과 |
| [ ] | - | F8-13 | 온보딩 목표 생성 요청의 마감일 누락 수정 | `fix/onboarding-goal-due-date` | §7 | Page·Component·docs | `['goals']`·`['universe']` | 신규 | 온보딩 기간을 `YYYY-MM-DD` 형식의 `dueDate`로 변환해 목표 생성 요청에 전달 → 기타 선택 시 공통 `SegmentDatePicker` 재사용 → 과거 날짜 제출 방지 및 API 계약 문서 동기화 |

| [ ] | - | F9-1 | 소비 코어 감정 8종 노출 | `feat/core-emotion-display` | - | Component | - | 신규 | 데이터 0건인 감정도 누락 없이 8개 렌더링 처리 |
| [ ] | - | F9-2 | 감정 분석 퍼센트 로직 변경 | `feat/analysis-percentage-logic` | - | Utils·Component | - | 신규 | 분석 퍼센트를 금액 기준에서 횟수 기준으로 변경 |
| [ ] | - | F9-3 | 지출 추이 카드 클릭 이동 | `feat/monthly-trend-navigation` | - | Component | - | 신규 | 월별 바/포인트 클릭 시 해당 달 상세 뷰로 이동 |
| [ ] | - | F9-4 | AI 월별 분석 결과 연동 | `feat/ai-analysis-monthly-link` | - | Component | - | 신규 | AI 대시보드에 월별 리포트 이동 링크 추가 및 데이터 조회 연동 |
| [ ] | #123 | F9-5 | 평행우주 REC 목표 선택 및 행성 동적 변경 | `feat/universe-rec-target-select` | - | Component | `['universe']` | 신규 | REC 버튼 클릭 시 화면 하단에 목표 리스트 노출 → 목표 선택 시 시뮬레이션 행성(조금 줄여본다면) 결과값 동적 변경 |
| [x] | - | F10-1 | 거래내역 다중 삭제 UI | `feat/transaction-bulk-delete-ui` | - | api·Component | `['tx','list']` | 완료 | 체크박스 다중 선택 UI 및 삭제 API 연동 |
| [x] | - | F10-2 | 패턴 분석 연동 및 UI | `feat/recurring-pattern-ui` | §analysis/pattern | api·Component | `['analysis', 'pattern']` | 완료 | 결정론 집계 방향 확정(조합·횟수·근거=GROUP BY, 문구만 서버 생성/AI). `GET /analysis/pattern` 계약 문서화 + `analysisAPI.getPattern`·`usePatternQuery`·AnalysisPageDc 바인딩 완료(evidence 객체 shape). 백엔드 엔드포인트 구현 대기 |
| [ ] | - | F11-1 | 목표 글래스모피즘 및 만료 상태 스타일 | `feat/goal-design-update` | - | Component | - | 신규 | 목표 폼 투명도 5% 적용 및 과거 목표 흑백(Grayscale) 처리 |
| [ ] | - | F11-2 | 메인 달력 투명도(Glassmorphism) 적용 | `feat/calendar-glassmorphism` | - | Component | - | 보류 | 날짜 선택기(DatePickerDc) 글래스 시도(5%/모달+스크림)했으나 방향 미확정 → 현재 **불투명 원복**. 월/요일 한글화(2026년 N월 · 월 화 수 목 금 토 일)만 반영. ※모바일에서 시간 패널이 화면 밖으로 넘치는 레이아웃 버그 별도 발견 |
| [ ] | - | F11-3 | 활성 목표(isMain) 홈·평행우주 연동 | `feat/goal-main-sync` | - | Component | `['goals']` | 신규 | isMain=true 인 활성 목표 데이터를 실시간 구독하여 홈/우주에 렌더링 반영 |
| [ ] | - | F11-4 | 더치페이 미정산 내역 관리 모달 연동 | `feat/dutch-pay-modal` | - | Component·api | `['tx', 'dutch-pay']` | 신규 | 더치페이 미정산 리스트 조회 API 연동 모달 팝업 구현 및 체크 시 정산 완료(수입 자동 생성) API 통신, 캐시 무효화 |
| [ ] | - | F12-1 | 거래내역 다중 선택 및 월/년도 네비게이션 개선 | feat/tx-list-ux-improvements | - | Page·Component | - | 신규 | 다중 선택 겹침 디자인 제거, 월별 필터 1~12월 노출, 연월 선택기 추가 |
| [ ] | - | F12-2 | 카테고리 순서 변경 인디케이터 렌더링 | feat/category-dnd-indicator | - | Component | - | 신규 | 카테고리 드래그 시 마우스 방향에 세로 선 렌더링 |
| [ ] | - | F12-3 | 평행우주 시나리오 상호작용 및 목표 연동 | feat/universe-scenario-interaction | - | api·Page·Component | ['universe'] | 신규 | 시나리오 요소 버튼화 및 하단 목표 클릭 시 행성 시뮬레이션 동적 반영 |
| [ ] | - | F12-4 | 예산 데이터 글로벌 상태화 및 대시보드 연동 | feat/global-budget-sync | - | Store·Page·Component | - | 신규 | 홈 말랑이와 전역 예산 상태 연동 및 리스트 상위 5개 필터링 렌더링 |
| [ ] | - | F12-5 | 온보딩 '나만의 목표' 커스텀 입력 기능 구현 | feat/onboarding-custom-goal-input | - | Component | - | 신규 | 나만의 목표 클릭 시 Input 필드 전환 및 바인딩 |
| [ ] | - | F12-6 | 온보딩 '기타' 탭 선택 시 레이아웃 여백 버그 수정 | fix/onboarding-date-gap | - | Component | - | 신규 | 폼 컨테이너 팽창 시 상단 컨텐츠와의 간격(gap/margin) 유지 |



> **계층** = 프론트 레이어(`src/pages` · `src/hooks` · `src/api` · `src/store`). **캐시키** = TanStack Query Key(공유 자원 — 임의 생성 금지, 표의 배열을 정확히 사용).
> **GitHub 등록 이슈(Open)**: #32(F4-4) · #33(F5-1) · #34(F5-2) · #36(F5-3) — 이 4개가 실제 남  은 등록 작업.
> **F4-6**: ISSUES.md에만 있고 GitHub 미등록 (백엔드 §9 analysis 선행 필요) → 착수 전 이슈 등록 필요.
> **F4-7**: GitHub 이슈 없이 코드가 먼저 구현된 케이스(커밋 b7b91e1) → '완료' 처리. 별도 이슈 등록 불필요.

## 병렬 작업 규칙 (에이전트 간 충돌 방지)

- **도메인 단위 분할**: F1(인증/유저)·F3(거래)·F4(목표/분석/설정) 등은 서로 다른 에이전트가 동시에 작업해도 무방하다.
- **공통 컴포넌트 사전 고정**: 버튼·모달·입력창 등 `components/common/` 하위는 F 작업 전에 확정하며, 임의 수정 금지.
- **최우선 선행**: `F1-1` Axios 인터셉터는 전체 API에 영향을 미치므로 다른 API 연동 이전에 단일 에이전트가 먼저 완수한다. (현재 완료)
- **캐시 키(Query Key) 엄수**: 표에 명시된 규칙(`['tx','list']` 등)을 절대 따른다. 임의 캐시 키로 전역 상태가 꼬이는 것을 방지한다.
- **브랜치명 일치**: 표의 브랜치명을 그대로 사용한다. **1이슈 = 1브랜치 = 1PR.**

## [참고] 동적 예산 및 자산 관리 고도화 (백엔드 M6, 프론트엔드 M7) 핵심 비즈니스 로직
> **⚠️ AI 에이전트(Claude, Gemini 등) 필독:** A6(백엔드) 및 F7(프론트엔드) 작업을 수행할 때 아래의 회계 룰을 반드시 준수해야 합니다.

### 1. 기획 배경 및 핵심 목표
*   **기존의 한계:** 무조건 전월 지출의 5%를 절약하도록 예산 고정됨.
*   **변경되는 아키텍처:** 사용자가 설정한 모든 목표의 '월별 필요 저축액'을 합산하여 그 총액만큼 덜 쓰도록 **동적 예산** 편성.
*   **수동 할당(봉투 예산법) 도입:** 예산이 모자랄 때 사용자가 직접 어떤 목표에 우선적으로 돈을 넣을지 선택(수동 저금)하는 자산 관리 UX 구현.

### 2. 총자산(Total Asset)과 목표(Goal)의 회계 규칙
*   '총자산'은 사용자의 실제 전체 자산이며, '목표 금액'은 총자산 안에서 "안 쓸 돈"으로 꼬리표를 달아둔 돈입니다.
*   **이동(Transfer) 개념 적용:** 목표에 10만 원을 저축한다고 해서 '총자산'에서 돈을 빼버리면 안 됩니다. 내부적으로 `총자산(500만) = 미할당 자산(490만) + 묶인 자산(목표 10만)`으로 상태만 변경되어야 하며, 전체 총자산 수치는 유지됩니다.
*   **시나리오별 예산 동적 대응:**
    1. **예산 달성:** 계획된 예산만큼 절약 성공 시, 목표치 그래프 정상 성장.
    2. **예산 초과 달성:** 목표 저축액을 모두 채우고 남은 돈은 '나의 총자산(미할당 자산)'에 플러스 누적.
    3. **예산 미달:** 목표를 채울 수 없는 상태이므로 자동 성장이 멈추며, 사용자가 수동으로 홈 화면에서 [저금하기]를 눌러 거래 내역과 목표를 매핑(goal_id)해야 함.

### 3. UI/UX 구현 시 절대 주의사항 (AI 에이전트 행동 강령)
> **🚨 STOP! 코드를 짜기 전에 반드시 기획자에게 질문하세요.**
본 명세서(F7-6 ~ F7-10)에는 핵심 기능만 명시되어 있으며, 구체적인 시각적 디테일(예: 스와이프 인터랙션 방식, 드롭다운 애니메이션, 빈 화면(Empty State) 안내 문구 등)은 의도적으로 비워져 있습니다. 
따라서 AI 에이전트나 작업자는 **절대로 본인의 임의대로 디자인을 상상하여 코드를 작성하면 안 됩니다.** (디자인 법치 및 하네스 규정 위반 방지)

**[AI 필수 이행 프로세스]**
작업 시작 전, 반드시 사용자(기획자)에게 다음 형식으로 **먼저 질문하고 승인(Confirm)을 받아야 합니다.**
- *"이 기능(예: 목표 선택 동적 UI)에 대해 저는 [이런 레이아웃/애니메이션]을 적용하려고 하는데, 기존 DatePickerDc의 룰에 비추어 보았을 때 이렇게 구현해도 될까요?"*
승인이 떨어지기 전까지는 절대 코드를 작성하거나 수정하지 마십시오.
