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