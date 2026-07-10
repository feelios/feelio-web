# AGENTS.md — Web (React)

## 실행 명령어
- 설치: `npm install`
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 린트: `npm run lint`
> 작업을 끝내기 전 `npm run lint`와 `npm run build`가 통과해야 한다.

## 기술 스택 (버전 고정)
- React 19 + Vite
- react-router-dom v7 (라우팅)
- TanStack Query v5 (서버 상태)
- Zustand (클라이언트 전역 상태)
- axios (HTTP)
> 위 버전의 API만 사용한다. 구버전 문법을 쓰지 말 것.

## 폴더 구조
- `src/pages/` — 라우트 단위 페이지
- `src/components/` — 재사용 컴포넌트
- `src/api/` — axios 인스턴스 및 API 호출 함수
- `src/stores/` — Zustand 스토어
- `src/hooks/` — 커스텀 훅

## 코딩 컨벤션
- 컴포넌트 파일/이름: PascalCase (예: LoginForm.jsx)
- 함수/변수: camelCase
- API 호출은 반드시 src/api/ 안의 함수를 통해서만 (컴포넌트에서 직접 fetch 금지)
- 서버 데이터는 TanStack Query로만 관리한다

## 백엔드 연동
- API 명세는 docs/API-CONTRACT.md를 단일 기준으로 삼는다
- baseURL: 환경변수 VITE_API_BASE_URL
- 인증: 보호 요청에 Authorization: Bearer <accessToken> 헤더

## 공통 규칙 (api 레포와 동일) — Part 4 참조

## 에이전트 행동 규칙
- 한 번에 하나의 작업 단위만 수정한다
- 새 라이브러리 추가 전 먼저 물어본다
- .env / 시크릿을 만지지 않는다
- 작업 후 변경 요약을 3줄 이내로 보고한다

## 작업 진행 방식 (루프)
기능 이슈는 아래 루프로 진행한다. 한 단계씩, 검증을 통과하며 수렴시킨다.
1. 현재 코드 + 먼저 완성된 유사 페이지/컴포넌트 패턴 분석
2. `docs/API-CONTRACT.md` 해당 섹션을 인용해 요구사항 확정
3. 애매하면 먼저 질문한다 (아래 '질문 우선 원칙')
4. 계획(건드릴 파일 목록)을 제시하고 멈춰 승인 대기
   (단, 오타·문구 수정 등 단순 이슈는 계획 생략하고 바로 구현 가능)
5. 구현 순서: API 함수(src/api/) → 훅(useQuery/useMutation) → 컴포넌트
6. `npm run lint && npm run build` 로 검증
7. 실패 시 원인(린트 규칙 위반 / 타입·문법 오류 / 빌드 오류) 분류 → 최소 수정 → 재검증
8. 변경 파일 정리 후 보고

> lint와 build를 모두 통과하기 전에는 "완료"라고 하지 않는다.
> 통과 결과(마지막 출력 요약)를 보고에 함께 남긴다 — 실행하지 않고 "통과했다"고 말하지 않는다.
> 한 이슈 = 한 브랜치 = 한 PR. 이슈 범위 밖 파일은 만들지도 고치지도 않는다.

## 질문 우선 원칙 (추측 금지)
다음 중 하나라도 불명확하면 코드 작성 전에 먼저 질문한다.
- API 응답이 계약서와 일치하는지 (특히 에러 봉투 {success, data|error})
- 서버 상태(TanStack Query) vs 클라이언트 상태(Zustand) 중 어디로 관리할지
- 로딩/에러 UI 처리 방식 (스켈레톤/토스트, 기존 컴포넌트 재사용 여부)
- 인증 실패(401) 시 처리 흐름 (로그아웃 / 리프레시 토큰 재시도)
- 신규 라우트 vs 기존 라우트 확장 여부
- 기존 컴포넌트 재사용 vs 신규 생성

## 협업 충돌 사전 점검 (병렬 작업 시)
> 브랜치/PR이 2개 이상 동시에 열려 있을 때, 구현 전에 수행한다.
> 혼자 이슈를 순차로 진행할 때는 생략 가능.

1. 이 이슈가 수정할 파일 예측 (특히 공유 자원)
2. 열린 PR·다른 작업 브랜치가 같은 파일을 건드리는지 확인 (`gh pr list` / `git branch -r`)
3. 겹치면 구현 전에 먼저 제안한다: 충돌 지점과 원인 / 분리 가능한 구조 / 먼저 머지해야 할 이슈
4. 충돌 위험이 크면 구현보다 구조 변경·작업 순서 조정을 먼저 제안한다

> 충돌 상습 지점(참고): src/api/instance.js, src/stores/*, 라우터 설정(src/pages 진입점),
> 전역 레이아웃(Header/Layout), tailwind.config, package.json

## 공통 협업 규칙

### 브랜치 전략 (GitHub Flow)
- main 브랜치는 항상 동작하는 상태로 유지 (직접 push 금지)
- 모든 작업은 feature 브랜치 → PR로 머지
- 브랜치 이름: feat/login, fix/token-expire, docs/readme

### 커밋 메시지 (Conventional Commits)
- 형식: type: 한 줄 요약
- type: feat / fix / docs / refactor / test / chore
- 예: "feat: 로그인 API 연동", "fix: 토큰 만료 시 401 처리"

### PR 규칙
- PR 제목도 커밋 규칙을 따른다
- 본문에 "무엇을 / 왜 / 어떻게 테스트했는지" 작성
- 최소 1명 리뷰 승인 후 머지
- 자기 코드는 자기가 머지하지 않는다 (리뷰어가 머지)


