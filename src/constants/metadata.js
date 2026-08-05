import { emotionPalette } from '../styles/theme.js';

export const EMOTIONS = [
  { emotionId: 1, id: 'excited', name: '신남', ...emotionPalette['신남'] },
  { emotionId: 2, id: 'flutter', name: '설렘', ...emotionPalette['설렘'] },
  { emotionId: 3, id: 'proud', name: '뿌듯함', ...emotionPalette['뿌듯함'] },
  { emotionId: 4, id: 'stress', name: '스트레스', ...emotionPalette['스트레스'] },
  { emotionId: 5, id: 'lonely', name: '외로움', ...emotionPalette['외로움'] },
  { emotionId: 6, id: 'angry', name: '화남', ...emotionPalette['화남'] },
  { emotionId: 7, id: 'calm', name: '평온', ...emotionPalette['평온'] },
  { emotionId: 8, id: 'neutral', name: '무덤덤', ...emotionPalette['무덤덤'] }
];

export const DEFAULT_CATEGORIES = [
  { categoryId: 1, name: '식비', type: 'EXPENSE' },
  { categoryId: 2, name: '교통', type: 'EXPENSE' },
  { categoryId: 3, name: '카페', type: 'EXPENSE' },
  { categoryId: 4, name: '쇼핑', type: 'EXPENSE' },
  { categoryId: 5, name: '문화', type: 'EXPENSE' },
  { categoryId: 6, name: '건강', type: 'EXPENSE' },
  { categoryId: 7, name: '월급', type: 'INCOME' },
  { categoryId: 8, name: '용돈', type: 'INCOME' }
];

export function getEmotion(name = '물음표') {
  return EMOTIONS.find(e => e.name === name) || { emotionId: 0, id: 'unknown', name: '물음표', color: '#97A2B6' };
}
