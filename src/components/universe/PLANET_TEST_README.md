# 소비 행성 관측 (PlanetTest)

평행우주 탭의 인터랙티브 기질 테스트. 9문항 양자택일 → 3축(P·E·C) 스코어링 → 8유형 행성 → 가장 가까운 평행우주(해밍거리 1) 항해 제안.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `src/data/planetTest.mjs` | 확정 데이터 (질문지·유형·게이지 매핑·BRIDGE) — 빌드 프롬프트 §5 그대로 |
| `src/utils/planetScoring.mjs` | 순수 로직 (스코어링·항해) — node로 단독 테스트 가능 |
| `src/components/universe/PlanetTest.jsx` | UI 컴포넌트 (intro → scan → reveal → result → warp) |
| `tests/planetScoring.test.mjs` | 단위 테스트 — `node tests/planetScoring.test.mjs` |

## 데이터 주입 (실서비스 전환 지점)

- `PlanetTest`는 `questions` / `types` / `bridge` prop을 받는다(기본값 = §5 확정값). 백엔드 연동 시 API 응답을 그대로 넘기면 됨.
- BRIDGE의 `save`(절약액)·`days`(단축일)는 현재 고정값. 실제 사용자 거래 데이터 기반 계산으로 교체하려면 `bridge` prop으로 주입.
- 상태는 전부 인메모리 — localStorage 미사용(스펙 제약). "항해하기"는 데모 알림만 표시하며, 실제 목표 기록 연동은 후속 작업.

## 스펙 대비 가정/미구현

- **§5-4 항해 우선순위**: "우선순위 [C,E,P], 동순위는 axisScore 높은 순"을 문자 그대로 구현 — 후보(비트 1인 축)를 C→E→P 순으로 정렬, 기본 항로는 첫 후보. axisScore는 보조 정렬 기준.
- **공유 카드 이미지 export**: 미구현(스펙상 선택). 버튼은 있고 TODO 안내만 표시.
- **Three.js 3D 구체**: 미구현(스펙상 선택, 모바일 성능 우선). SVG 버전이 기본.
- **참조 이미지 vision 대조**: planet.png/warp.png가 전달되지 않아 §4 서면 스펙 기준으로만 구현·검증함.

## 검증 결과 (2026-07-02)

- 단위 테스트 12/12 통과: §5-2 예시 일치(P2/E3/C2→111), 8유형 전부 도달 가능, 게이지 매핑 {0:12,1:36,2:64,3:88}, 항해 해밍거리 1·우선순위, 000 안정 엣지, 데이터 무결성.
- `npm run build` 통과, 외부 UI 라이브러리·스토리지 미사용.
- 접근성: 버튼 focus-visible, 게이지/행성 aria-label + 양극 텍스트 병기, `prefers-reduced-motion`에서 애니메이션 전부 정지(리빌 대기도 350ms로 단축).
- 반응형: 게이지 3열→1열(520px), 행성/버튼 clamp. 360px 기준 레이아웃 확인은 브라우저 스모크 테스트 권장.
