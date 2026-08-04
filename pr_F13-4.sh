#!/bin/bash
gh pr create \
  --title "[F13-4] fix: 모바일 테마 토글 DB 동기화 버그 수정" \
  --body "## 📝 PR 요약
모바일 환경에서 테마(다크/라이트) 변경 시 DB 저장 API 호출이 누락되어 새로고침 시 초기화되는 버그에 대한 확인 및 종결 PR입니다.
(이전 릴리스에서 프로필 모달 내 토글의 DB 업데이트 로직이 이미 정상적으로 추가되어 있어, 코드 수정 없이 상태를 종결 처리합니다.)

## 🎯 주요 변경 사항
- 이미 \`main\` 브랜치 내 \`ProfileModalDc.jsx\`의 \`handleThemeToggle\` 함수에서 \`updateSettingsMutation.mutateAsync\` API 호출 로직이 정상적으로 구현되어 있음을 확인하였습니다.
- 코드 수정 사항 없이 이슈 확인 및 종결을 위해 빈 커밋으로 PR 생성

## 🧪 테스트 결과
- 로컬 환경 빌드 및 Lint 통과 확인
- 기존 기능 정상 작동 확인
" \
  --base main \
  --head fix/mobile-theme-sync
