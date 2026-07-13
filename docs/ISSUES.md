## ⚠️ 프론트엔드 작업 핵심 원칙 (Core Directive)
**"현재 웹의 형태와 디자인(UI/UX)은 절대 훼손하지 않는다."**
모든 프론트엔드 작업은 기존 뷰(View) 템플릿과 스타일링을 100% 유지한 상태에서 **API 통신, 데이터 바인딩, 비즈니스 로직(오류 수정) 연결**에만 국한됩니다. 에이전트가 임의로 화면 디자인이나 레이아웃을 수정하는 것을 엄격히 금지합니다.

# Feelio 프론트엔드 기능 이슈 표 (SSOT)

> **Claude / Gemini 어떤 도구로 작업하든 이 표를 공통 기준으로 삼는다.**
> 이슈 코드(예: F1-1)로 브랜치·계약(§)·계층·캐시키·상태·완료기준을 확정한다.
> 규칙 전체는 [AGENTS.md](../AGENTS.md), API 계약은 [docs/API-CONTRACT.md](./API-CONTRACT.md)가 SSOT.
> 코드 체계: F1=기반 안정화, F2=온보딩, F3=핵심 거래, F4=목표·분석·설정, F5=UX 고도화 (계약 §11 우선순위와 정렬).
> 상태: ✅ 완료(머지됨) · ⏳ 예정 · 🆕 예정(백엔드 계약에 맞춰 신규 추가)

| 코드 | 제목 | 브랜치 | 계약 | 계층 | 캐시키 | 상태 | 완료기준(핵심) |
|---|---|---|---|---|---|---|---|
| F1-1 | Axios 401 토큰 재발급(쿠키) | `fix/auth-interceptor-cookie` | §3 | api | — | ✅ | 로컬스토리지 토큰·Authorization 강제주입 제거 → 401 시 바디 없이 `/auth/token/refresh` 호출(쿠키 자동전송) → 원 요청 재시도 |
| F1-2 | 메타데이터 폼 바인딩 | `fix/meta-form-binding` | §5 | Page·Hook·api | `['meta']` | ✅ | `RecordPage` 하드코딩 카테고리 제거, `useMetadata`로 감정·카테고리 옵션 바인딩, 등록 후 캐시 무효화 |
| F2-1 | 온보딩 폼·닉네임 검증 | `feat/users-me` | §4 | Page·api·Store | `['user']` | ✅ | 닉네임 1~8자 검증 UI, 온보딩 API 연동 후 `{onboardingDone:true}` 갱신 → 홈 리다이렉트 |
| F3-1 | 거래 목록·무한스크롤 | `feat/tx-list` | §6 | Page·Hook·api | `['tx','list']` | ✅ | `mockTransactions` 제거, `useTransactionsQuery` 연동, 무한스크롤 + 연/월 필터 + 검색어 디바운스 |
| F3-2 | 거래 상세·수정·삭제 | `feat/tx-crud` | §6 | Page·Hook·api | `['tx','detail']` | ✅ | 상세 모달 바인딩, 수정/삭제 Mutation, 완료 시 목록 캐시 무효화 및 즉시 반영 |
| F4-1 | 목표 CRUD·대표목표 | `feat/goals` | §7 | Page·Hook·api | `['goals']` | ⏳ | 목표 입력 폼 분리 + CRUD 바인딩, `isMain` 설정/해제 토글 연동 |
| F4-2 | 홈 캘린더 요약 | `feat/summary-cal` | §8 | Page·Hook·api | `['summary','calendar']` | ✅ | 일별 감정 아이콘·지출 합계 캘린더 매핑, 데이터 없는 날짜 예외처리 |
| F4-3 | 감정 요약 차트·전월대비 | `feat/summary-emo` | §8 | Page·Hook·api | `['summary','emotion']` | ✅ | 차트(Recharts/D3) 바인딩, `prevMonth` 증감률 계산·렌더 |
| F4-4 | 설정(테마)·회원탈퇴 | `feat/user-settings` | §4 | Page·api·Store | `['user']` | ⏳ | 테마 설정 Store 즉시 반영, 탈퇴 API + 로컬·전역 Store·캐시 전체 파기 |
| F4-5 | 평행우주 UI | `feat/universe` | §9 | Page·Hook·api | `['universe']` | ✅ | §9 시뮬 스키마 바인딩, 3D/인터랙티브 상태·애니메이션 연동 |
| F4-6 | 월간 분석(analysis) 화면 | `feat/analysis` | §9 | Page·Hook·api | `['analysis']` | 🆕 | §9 `/analysis/monthly` 연동(카테고리·시간대·감정 집계 + 인사이트). ※`AnalysisPage` 기존 상황(situation) 기반 evidence 제거·재연동 |
| F4-7 | 커스텀 카테고리 설정 | `feat/custom-category` | §12 | Page·Hook·api | `['categories']` | 🆕 | §12 커스텀 카테고리 추가/삭제 + 공통·커스텀 통합 정렬(드래그) 저장·반환 |
| F5-1 | Skeleton/Suspense 로딩 | `feat/ux-loading` | — | Page·컴포넌트 | — | ⏳ | `isLoading` + Suspense 바운더리, 메인/상세 스켈레톤 컴포넌트 노출 |
| F5-2 | 전역 ErrorBoundary | `feat/ux-error` | §1 | 컴포넌트 | — | ⏳ | 라우트 단위 ErrorBoundary, 500 등 오류 시 재시도 버튼 포함 Fallback UI |
| F5-3 | 거래·목표 낙관적 업데이트 | `feat/ux-optimistic` | §10 | Hook | `['tx']`·`['goals']` | ⏳ | `onMutate` 캐시 선반영, `onError` 시 이전 캐시로 롤백 |

> **계층** = 프론트 레이어(`src/pages` · `src/hooks` · `src/api` · `src/store`). **캐시키** = TanStack Query Key(공유 자원 — 임의 생성 금지, 표의 배열을 정확히 사용).
> 🆕(F4-6·F4-7)는 백엔드가 이미 제공하지만(§9 analysis · §12 categories) 프론트 이슈가 없던 부분으로, 백엔드 계약에 맞춰 신규 편성했다.

## 병렬 작업 규칙 (에이전트 간 충돌 방지)

- **도메인 단위 분할**: F1(인증/유저)·F3(거래)·F4(목표/분석/설정) 등은 서로 다른 에이전트가 동시에 작업해도 무방하다.
- **공통 컴포넌트 사전 고정**: 버튼·모달·입력창 등 `components/common/` 하위는 F 작업 전에 확정하며, 임의 수정 금지.
- **최우선 선행**: `F1-1` Axios 인터셉터는 전체 API에 영향을 미치므로 다른 API 연동 이전에 단일 에이전트가 먼저 완수한다. (현재 ✅ 완료)
- **캐시 키(Query Key) 엄수**: 표에 명시된 규칙(`['tx','list']` 등)을 절대 따른다. 임의 캐시 키로 전역 상태가 꼬이는 것을 방지한다.
- **브랜치명 일치**: 표의 브랜치명을 그대로 사용한다. **1이슈 = 1브랜치 = 1PR.**
