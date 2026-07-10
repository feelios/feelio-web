---
name: feature
description: "Feelio 프론트엔드 기능(Feature)을 하네스+루프로 구현 (사용법 /feature F1-1)"
---

# Gemini CLI 커스텀 커맨드 — Claude Code 의 .claude/commands/feature.md 와 동일 동작.
# 두 파일은 항상 같은 내용을 유지한다(도구만 다름): $ARGUMENTS ↔ {{args}} 만 차이.

너는 Feelio 프론트엔드 시니어 개발자다. 인자로 받은 **기능(Feature) 하나만** 처리한다: {{args}}
다른 기능 범위나 공통 컴포넌트는 절대 임의로 건드리지 않는다.

## 0. 기능 식별
**`docs/WEB-FEATURES.md`의 프론트엔드 기능 표(SSOT)** 에서 `{{args}}`(예: F1-1)에 해당하는 행을 찾아
브랜치·API계약·계층·상태·완료기준을 확정한다.
표에 없거나 인자가 비었으면 추측하지 말고 사용자에게 어떤 기능인지 먼저 물어라.
> 기능 표는 Claude/Gemini 공통 기준이라 `docs/WEB-FEATURES.md` 한 곳에서만 관리한다(여기에 중복 정의하지 않음).

## 1. 하네스 (AGENTS_WEB.md 자동 로딩 + 아래 재확인)
- [UI/UX 절대 보존 원칙]: 기존 화면의 레이아웃, CSS, 스타일 컴포넌트, DOM 구조는 절대 변경하지 않는다. 오직 API 연동(데이터 바인딩), 상태 관리 로직 추가, 오류 수정에만 집중하며, 시각적인 형태를 훼손하는 어떠한 코드 변경도 금지한다.
- 아키텍처 구조: `src/pages`, `src/components`, `src/hooks`, `src/api`, `src/store` 분리 준수
- API 통신: `api/client.js`의 Axios 인스턴스 사용 (엔드포인트 및 DTO는 `docs/API-CONTRACT.md` 절대 준수)
- 상태 및 캐싱: 서버 상태는 TanStack Query(표에 명시된 Query Key 배열 정확히 일치), 전역 클라이언트 상태는 Zustand(또는 지정된 Store) 사용
- UI/UX: 로딩(Skeleton/Suspense), 에러(ErrorBoundary), 낙관적 업데이트(Optimistic Update) 적용 원칙 준수
- `components/common/` 하위의 공통 UI 컴포넌트는 사전 합의 없이 수정 금지
- 계약에 없는 임의의 뷰(View)나 목업 데이터 생성 금지 (실제 API 연동 우선)

## 2. 진행(루프)
1) 현재 코드 + 먼저 완성된 유사 도메인 패턴(커스텀 훅 등) 확인
2) 계약 해당 섹션 인용해 렌더링/통신 요구사항 확정
3) 애매하면 질문(추측 금지, 아래 §3)
4) 계획(건드릴 파일 목록) 제시 후 멈춤 → 사용자 확인 대기
5) 슬롯 순서로 구현(API 함수 → Custom Hook → UI Component → Page 연결)
6) `npm run lint` 및 브라우저/콘솔 에러 사전 검증
7) 실패 시 (규칙위반/계약불일치/논리오류)로 분류 → 최소 수정 → 재검증
8) 코드 검증이 완전히 통과되면 작업을 마무리한다.
9) [이슈/PR 템플릿 출력]: 작업이 완료되면 사용자가 GitHub에 바로 복사/붙여넣기 할 수 있도록 아래 형식의 마크다운 템플릿을 생성하여 출력한다.
   - Title: `[{{args}}] feat/fix: 작업한 핵심 내용 요약`
   - Description: 수정한 파일 목록, 주요 구현 내용(API 연동, 상태 관리 흐름 등), 다음 작업자가 알아야 할 특이사항을 불릿포인트로 깔끔하게 정리.
10) [Git 자동화 명령어 제공]: 9번의 템플릿 출력이 끝나면, 사용자가 바로 커밋과 푸시를 할 수 있도록 아래의 Git 명령어를 코드 블록으로 제공한다. 커밋 메시지는 9번의 Title과 정확히 일치해야 한다.
    ```bash
    git add .
    git commit -m "[{{args}}] feat/fix: 작업한 핵심 내용 요약"
    git push origin {현재_작업중인_브랜치명}
    ```

## 3. 질문 우선 (추측 금지)
API 통신 응답의 바인딩 위치 / Query Key 계층 구조 / 공통 컴포넌트 재사용 여부 / 라우팅(URL) 구조 / 새 파일 vs 기존 수정 중 하나라도 애매하면 코드 작성 전에 반드시 질문.

## 4. 지금 할 것
먼저 해당 기능의 브랜치 생성 명령(`git checkout main && git pull && git checkout -b {브랜치}`)을
안내하고, **계획(파일 목록)만 제시한 뒤 멈춰라.** 내가 확인하면 구현을 시작한다.
에러/경고 없는 렌더링 검증 전에는 "완료"라고 하지 않는다. 이 기능(Feature) 범위 밖 파일은 만들지도 고치지도 않는다.