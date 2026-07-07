# Feelio DESIGN-GUIDE (디자인 동결 문서)

> **이 문서는 feelio-web의 디자인 기준이다. 현재 데모에서 확정된 디자인을 그대로 유지하는 것이 목표다.**
> AI 에이전트는 화면·컴포넌트 작업 전 반드시 이 문서를 읽는다.
> 디자인 "개선"·리디자인·테마 변경을 제안하거나 실행하지 않는다. 어긋나는 요구를 받으면 구현하지 말고 보고한다.

---

## 1. 디자인 정체성 (절대 유지)

| 요소 | 설명 |
|---|---|
| **감정 말랑이 (EmotionBlob)** | 감정 8종을 표현하는 젤리형 SVG 캐릭터. 서비스의 얼굴. 홈 대표 감정, 기록 화면 감정 선택, 거래 상세 등 감정이 등장하는 모든 곳에 사용 |
| **글래스모피즘 카드** | 반투명 배경 + backdrop blur + 얇은 테두리(GlassCard). 모든 카드·모달의 기본 질감 |
| **오로라 배경** | 화면 뒤에 떠다니는 blur 처리된 색상 orb 3개. 테마(블루/민트/핑크 등)에 따라 색 변경 |
| **감정 8색 팔레트** | 감정마다 고유 색. 캘린더 날짜 색, 능선, 칩, 차트가 전부 이 팔레트에서 나옴 |
| **감정 능선 (MoodRidge)** | 월간 감정 분포를 산 능선 실루엣으로 표현하는 홈 시각화 |

## 2. 동결(수정 금지) 파일 — 비주얼 자산

아래 파일은 **픽셀·색·좌표·애니메이션 값을 바꾸지 않는다.** (버그 수정도 팀 보고 후)

```text
src/styles/theme.js            ← 감정 팔레트·오로라 색 원본 (단일 진실 원천)
src/styles/animations.js
src/styles/glass.js
src/styles/globalStyles.jsx
src/styles/global.css
src/components/common/EmotionBlob.jsx
src/components/common/GlassCard.jsx
src/components/common/Modal.jsx
src/components/common/Toast.jsx
src/components/SpaceBlob.jsx
src/components/UniversePlanet.jsx
src/components/UniverseConsole.jsx
src/components/UniverseEasterEgg.jsx
src/pages/UniversePageDc.jsx   ← 평행우주 연출 (핵심 차별화 화면)
src/data/aurorasDc.js
```

페이지 컴포넌트(`src/pages/*.jsx`)는 API 연동·라우터 전환을 위해 **로직 수정은 허용**하되, **시각 결과물(레이아웃·색·간격·애니메이션)은 동일하게 유지**한다. 스타일 코드를 옮기더라도 값은 바꾸지 않는다.

## 3. 감정 팔레트 (src/styles/theme.js — 여기 값이 원본, 이 표는 참조용)

| 감정 | color | 용도 |
|---|---|---|
| 신남 | `#FF8A62` | 캘린더·칩·능선·차트의 감정 색 |
| 설렘 | `#F28AB7` | 〃 |
| 뿌듯함 | `#F2C766` | 〃 |
| 스트레스 | `#A68BEA` | 〃 |
| 외로움 | `#76A7E8` | 〃 |
| 화남 | `#E87573` | 〃 |
| 평온 | `#83C9B0` | 〃 |
| 무덤덤 | `#AEB4C1` | 〃 |

- 각 감정은 `color` 외에 `light`(투명 배경용), `blob`(말랑이 그라데이션 3색)을 가진다.
- **감정 색은 반드시 `getEmotion(감정명)` 또는 theme.js 경유로 사용한다. 컴포넌트에 hex 하드코딩 금지.**
- 백엔드 연동 후에는 `GET /api/meta`의 색상이 기준이 되며, 그 시드 값이 곧 이 팔레트다.

## 4. 스타일 토큰 (CSS 변수 — 라이트/다크 모두 정의됨)

새 UI의 색은 **아래 변수만** 사용한다. 임의 색 추가 금지.

| 변수 | 역할 |
|---|---|
| `--bg-1`, `--bg-2` | 화면 배경 그라데이션 |
| `--card` | 기본 카드 배경 (반투명) |
| `--card-strong` | 강조 카드 배경 |
| `--card-border` | 카드 테두리 |
| `--text` | 본문 텍스트 |
| `--sub` | 보조 텍스트 |
| `--ink` / `--on-ink` | 주요 버튼 배경 / 버튼 위 텍스트 |
| `--muted`, `--soft` | 약한 강조 텍스트/요소 |
| `--glass`, `--glass-strong` | 글래스모피즘 보조 효과 |
| `--line` | 구분선·연한 테두리 |
| `--modal-bg`, `--scrim` | 모달 배경·딤 |
| `--shadow` | 카드 그림자 |

## 5. 스타일링 기술 규칙

- **CSS-in-JS는 Emotion만 사용한다**: `@emotion/react`(css prop) + `@emotion/styled`
- **금지**: Tailwind, Bootstrap, MUI/Chakra 등 UI 킷, styled-components, CSS Module 신규 도입
- **Typography Scale**: `H1(32px)`, `H2(24px)`, `Body1(16px)`, `Caption(13px)` 등 일관된 텍스트 크기를 유지한다.
- **Spacing Grid**: 모든 패딩과 마진은 4px 또는 8px 배수를 권장한다 (예: 4, 8, 12, 16, 24, 32px).
- **Z-Index Layering**: 충돌 방지를 위해 `Background(0) < Card(1) < Modal(100) < Toast(200)` 계층을 준수한다.
- 폰트: `Inter, 'Pretendard', system-ui` (theme.js 정의)
- 카드 radius 큰 값(24~28px), backdrop blur — 기존 GlassCard를 재사용하고 새로 만들지 않는다
- 모든 화면은 **라이트/다크 모드 양쪽에서 확인** 후 완료 처리 (모드는 CSS 변수로 자동 전환 — 변수만 쓰면 자동 대응)
- **표준 Breakpoints**: 모바일은 980px 이하, 스몰 모바일은 560px 이하를 기준으로 미디어 쿼리를 작성한다 (예: `@media (max-width: 980px)`).

## 6. 새 화면·컴포넌트를 만들 때

1. 기존 유사 화면(예: 홈 카드, 거래내역 행)의 패턴을 먼저 찾아 재사용한다
2. 색은 4절 변수 + 3절 감정 팔레트만
3. 감정이 등장하면 텍스트가 아니라 **말랑이 또는 감정 색 요소**로 표현한다
4. 문구 톤: 부드러운 반말체 유지 (예: "얼마나 썼어요?", "기록 저장됨") — 딱딱한 시스템 문구 금지
5. **"가계부"라는 단어를 UI 문구·주석에 쓰지 않는다** (서비스 표현 규칙)

