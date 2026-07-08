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

// 카테고리 기준은 API-CONTRACT §2 (EXPENSE·INCOME). 실제 목록은 서버 GET /api/meta 사용 권장.
export const categories = [
  { name: '식비', type: 'EXPENSE' },
  { name: '배달', type: 'EXPENSE' },
  { name: '카페', type: 'EXPENSE' },
  { name: '교통', type: 'EXPENSE' },
  { name: '쇼핑', type: 'EXPENSE' },
  { name: '문화', type: 'EXPENSE' },
  { name: '건강', type: 'EXPENSE' },
  { name: '기타', type: 'EXPENSE' },
  { name: '급여', type: 'INCOME' },
  { name: '용돈', type: 'INCOME' },
  { name: '기타', type: 'INCOME' }
];
// 상황(situations) 기능은 팀 결정으로 제거됨 (API-CONTRACT §2 참조)

export function getEmotion(name = '평온') {
  return emotionPalette[name] || emotionPalette.평온;
}

