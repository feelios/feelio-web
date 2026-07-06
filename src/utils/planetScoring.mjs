// 「소비 행성 관측」 스코어링·항해 순수 로직 — UI와 분리, node로 단독 테스트 가능.
import { AXIS_ORDER, QUESTIONS, GAUGE_POS, WARP_PRIORITY, TYPES } from '../data/planetTest.mjs';

// answers: { [questionId]: 'A' | 'B' } (9문항 전부)
// → { axisScores: {P,E,C: 0~3}, bits: {P,E,C: 0|1}, code: '000'~'111' }
export function scoreAnswers(answers) {
  const axisScores = { P: 0, E: 0, C: 0 };
  for (const item of QUESTIONS) {
    if (answers[item.id] === item.one) axisScores[item.axis] += 1;
  }
  const bits = {};
  for (const axis of AXIS_ORDER) {
    bits[axis] = axisScores[axis] >= 2 ? 1 : 0;
  }
  const code = AXIS_ORDER.map(axis => bits[axis]).join('');
  return { axisScores, bits, code };
}

export function gaugePercent(axisScore) {
  return GAUGE_POS[axisScore];
}

// 항해 후보 = 비트가 1인(새는) 축. 우선순위 C→E→P, 동순위는 axisScore 높은 순(§5-4).
export function getWarpCandidates(bits, axisScores) {
  return WARP_PRIORITY
    .filter(axis => bits[axis] === 1)
    .sort((a, b) =>
      WARP_PRIORITY.indexOf(a) - WARP_PRIORITY.indexOf(b) || axisScores[b] - axisScores[a]
    );
}

// 선택 축의 비트를 0으로 뒤집은 이웃 코드(해밍거리 1)
export function flipAxisToZero(code, axis) {
  const idx = AXIS_ORDER.indexOf(axis);
  return code.slice(0, idx) + '0' + code.slice(idx + 1);
}

// 항해 계획. selectedAxis 미지정 시 기본 후보 사용.
// 새는 축이 없으면(코드 000) { stable: true } — 목적지 없이 안정 안내.
export function getWarpPlan({ bits, axisScores, code }, selectedAxis) {
  const candidates = getWarpCandidates(bits, axisScores);
  if (candidates.length === 0) return { stable: true, candidates: [] };
  const axis = selectedAxis && candidates.includes(selectedAxis) ? selectedAxis : candidates[0];
  const destCode = flipAxisToZero(code, axis);
  return { stable: false, axis, candidates, destCode, destType: TYPES[destCode] };
}
