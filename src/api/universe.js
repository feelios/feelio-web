import client from './client.js';

/**
 * 이 요청만 기본 타임아웃(5초)보다 길게 잡는다.
 *
 * 평행우주 서술은 한 번의 GPT 호출로 문장 6개(2우주 × 3코멘트)를 만든다. 앱에서 출력이
 * 가장 큰 호출인데, 5초 안에 못 끝내면 서버가 규칙기반 문구로 떨어뜨린다. 그러면 화면에
 * 늘 같은 문장이 나와 AI 분석이라는 말이 무색해진다.
 *
 * 서버도 이 호출만 openai.timeout-seconds-universe(기본 10초)로 따로 잡는다.
 * 프론트가 그보다 먼저 끊으면 서버가 만들어 둔 답을 못 받으므로 여유를 두고 15초로 둔다.
 */
const UNIVERSE_TIMEOUT_MS = 15000;

export const universeAPI = {
  getUniverseSimulation: async (goalId) => {
    const response = await client.get('/universe/simulation', {
      params: { goalId },
      timeout: UNIVERSE_TIMEOUT_MS
    });
    return response.data.data;
  }
};
