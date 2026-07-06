import { emotionPalette } from '../styles/theme.js';

export const emotions = [
  { id: 'excited', name: '신남', ...emotionPalette.신남 },
  { id: 'flutter', name: '설렘', ...emotionPalette.설렘 },
  { id: 'proud', name: '뿌듯함', ...emotionPalette.뿌듯함 },
  { id: 'stress', name: '스트레스', ...emotionPalette.스트레스 },
  { id: 'lonely', name: '외로움', ...emotionPalette.외로움 },
  { id: 'angry', name: '화남', ...emotionPalette.화남 },
  { id: 'calm', name: '평온', ...emotionPalette.평온 },
  { id: 'neutral', name: '무덤덤', ...emotionPalette.무덤덤 }
];

export const categories = ['식비', '카페', '교통', '쇼핑', '문화', '건강', '월급', '용돈'];
export const situations = ['퇴근 후', '혼자 있을 때', '친구와', '보상', '습관', '이동 중', '아침', '밤'];

export function getEmotion(name = '평온') {
  return emotionPalette[name] || emotionPalette.평온;
}

