# Feelio 프론트엔드 기능 이슈 표 (SSOT)

> **Claude / Gemini 어떤 도구로 작업하든 이 표를 공통 기준으로 삼는다.**
> 이슈 코드(예: F1-1)로 브랜치·API계약·계층·상태·완료기준을 확정한다.
> 규칙 전체는 [AGENTS_WEB.md](../AGENTS_WEB.md), API 계약은 [docs/API-CONTRACT.md](./API-CONTRACT.md)가 SSOT.
> 코드 체계: F1=1차(인증/기본), F2=2차(핵심기능), F3=3차(분석/부가설정)

| 코드 | 제목 | 브랜치 | 계약 | 계층 (Layer) | 상태/캐시 (Store/QueryKey) | 완료기준 (핵심) |
|---|---|---|---|---|---|---|
| **F1-1** | 소셜 로그인 연동 | `feat/auth-login` | §3 | UI·API·Store | `authStore` (Zustand) | Provider 콜백 처리 → API 전송 → 응답 토큰/프로필 Store 저장 → 온보딩 여부에 따른 라우팅 분기 |
| **F1-2** | 토큰 갱신 & 로그아웃 | `feat/auth-refresh` | §3 | API(Interceptor)·Store | `authStore` | Interceptor 401 감지 시 재발급 루프 구현. 로그아웃(또는 만료) 시 Store/Storage 파기 및 로그인 이동 |
| **F1-3** | 온보딩 및 내 정보 | `feat/users-me` | §4 | UI·Hook·API | `userStore`, `['users', 'me']` | 닉네임 유효성 검사(1~8자) 폼 구현, 온보딩 완료 시 `{onboardingDone: true}` 갱신 및 홈으로 리다이렉트 |
| **F2-1** | 메타 데이터 캐싱 | `feat/meta` | §5 | Hook·API | `['meta']` (staleTime: Infinity) | API 호출 후 감정/카테고리 데이터 전역 캐싱, 컴포넌트 리마운트 시 중복 호출 방지 |
| **F2-2** | 거래 생성 (등록 폼) | `feat/tx-create` | §6 | UI·Hook·API | `['tx', 'list']` 무효화 | 폼 유효성 검증(필수값), 제출 성공 시 목록 Query 무효화(invalidate) 후 목록 뷰 이동 |
| **F2-3** | 거래 목록 조회 | `feat/tx-list` | §6 | UI·Hook·API | `['tx', 'list']` | 무한 스크롤(또는 페이지네이션) 연동, 연/월 필터 및 검색어 디바운스 적용, 평면 목록 렌더링 |
| **F2-4** | 거래 상세·수정·삭제 | `feat/tx-crud` | §6 | UI·Hook·API | `['tx', 'detail']` | 상세 모달/페이지 바인딩, 삭제/수정 완료 시 기존 목록 캐시 무효화 및 UI 즉각 반영 |
| **F3-1** | 목표 CRUD | `feat/goals` | §7 | UI·Hook·API | `['goals']` | 주 목표(isMain) 설정/해제 UI 토글 연동, 입력 폼 컴포넌트 분리 및 데이터 바인딩 |
| **F3-2** | 홈 캘린더 요약 | `feat/summary-cal` | §8 | UI·Hook·API | `['summary', 'calendar']` | 달력 UI에 일별 데이터(감정, 지출합) 매핑, 빈 날짜 예외 처리 디자인 적용 |
| **F3-3** | 감정 요약 및 분석 | `feat/summary-emo`| §8,9| UI·Hook·API | `['summary', 'emotion']` | D3/Recharts 등 차트 UI 바인딩, 전월 대비 증감률(prevMonth) UI 렌더링 |
| **F3-4** | 평행우주 시뮬레이션 | `feat/universe` | §9 | UI·Hook·API | `['universe']` | §9 응답 스키마 기준 3D 컴포넌트 또는 인터랙티브 UI 상태 바인딩 |
| **F3-5** | 사용자 설정 & 탈퇴 | `feat/user-settings`| §4 | UI·Store·API | `userStore`, `['tx']` 초기화 | 테마/오로라 변경 시 로컬 상태 즉각 반영, 탈퇴/초기화 시 모든 로컬 데이터 및 캐시 파기 (Clear) |

## 🚀 병렬 작업 규칙 (Claude ↔ Gemini 충돌 방지)
- **도메인 단위로 분할**한다. 예를 들어 `F1` (인증/유저) 도메인과 `F2` (거래/메타) 도메인은 서로 다른 에이전트가 동시에 작업해도 무방하다.
- **공통 컴포넌트(버튼, 모달, 입력창 등)는 F1/F2 작업 전에 미리 고정**한다. 에이전트가 임의로 `components/common/` 하위 코드를 수정하는 것을 금지한다.
- `F1-2`의 **Axios Interceptor** 작업은 프로젝트 전체 API에 영향을 미치므로, 다른 API 연동 작업 이전에 **가장 먼저 단일 에이전트가 완수**해야 한다.
- 캐시 키(Query Key)는 표에 명시된 규칙(`['tx', 'list']` 등)을 절대적으로 따른다. 임의의 캐시 키를 생성하여 전역 상태가 꼬이는 것을 방지한다.
- 각자 위 표의 **브랜치명 그대로** 사용해 브랜치 충돌을 막는다. 한 이슈 = 한 브랜치 = 한 PR.