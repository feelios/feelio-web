import { emotionPalette } from '../styles/theme.js';

/**
 * 감정의 **시각 정의**만 담는다. emotionId 는 여기 두지 않는다.
 *
 * ID 는 DB 가 만드는 값이라 프론트가 알 수 없고, 환경(KEC/KMJ/NPR)마다 다르며
 * 마스터를 다시 시드할 때마다 바뀐다. 예전에 여기 1~8 을 박아뒀다가 DB 가
 * 9~16 으로 바뀌면서 거래 저장이 FK 위반으로 전부 실패했다 (#266).
 *
 * ID·순서는 항상 GET /api/meta(useMetadata)에서 받고, 색·모양만 여기서 입힌다.
 */
export const EMOTION_VISUALS = [
  { key: 'excited', name: '신남', ...emotionPalette['신남'] },
  { key: 'flutter', name: '설렘', ...emotionPalette['설렘'] },
  { key: 'proud', name: '뿌듯함', ...emotionPalette['뿌듯함'] },
  { key: 'stress', name: '스트레스', ...emotionPalette['스트레스'] },
  { key: 'lonely', name: '외로움', ...emotionPalette['외로움'] },
  { key: 'angry', name: '화남', ...emotionPalette['화남'] },
  { key: 'calm', name: '평온', ...emotionPalette['평온'] },
  { key: 'neutral', name: '무덤덤', ...emotionPalette['무덤덤'] }
];

const UNKNOWN_EMOTION = { key: 'unknown', name: '물음표', color: '#97A2B6' };

/**
 * 서버 감정 목록(GET /api/meta)에 로컬 시각 정의를 입힌다.
 * emotionId·정렬은 서버를 그대로 따르고, 색·말랑이 키만 이름으로 맞춰 붙인다.
 * 서버에만 있는 감정이 와도 목록에서 빠지지 않도록 기본값을 둔다.
 */
export function mergeEmotions(serverEmotions) {
  return (serverEmotions ?? []).map(emotion => {
    const visual = EMOTION_VISUALS.find(v => v.name === emotion.name);
    return {
      // 색·말랑이 키는 로컬 정의를 쓴다. 서버 color 를 그대로 쓰면 디자인과 어긋난다.
      ...UNKNOWN_EMOTION,
      ...(visual ?? {}),
      // 신원(ID·이름·순서)은 서버가 기준이다.
      emotionId: emotion.emotionId,
      name: emotion.name,
      sortOrder: emotion.sortOrder
    };
  });
}

import { generateEmotionPalette } from '../utils/color.js';

/** 이름 혹은 메타데이터 객체를 전달하면 시각 정보를 덧붙여 반환한다. */
export function getEmotion(emotionParam) {
  if (typeof emotionParam === 'object' && emotionParam !== null) {
    if (emotionParam.color) {
      return {
        ...emotionParam,
        ...generateEmotionPalette(emotionParam.color)
      };
    }
    return getEmotion(emotionParam.name);
  }

  const name = emotionParam || '평온';
  return EMOTION_VISUALS.find(e => e.name === name) || UNKNOWN_EMOTION;
}
