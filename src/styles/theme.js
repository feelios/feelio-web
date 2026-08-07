export const emotionPalette = {
  신남: { color: '#FFCEB8', light: 'rgba(255,206,184,.20)', blob: ['#FFEBF0', '#FF9FAD', '#FFC9D2'] },
  설렘: { color: '#FFB8D9', light: 'rgba(255,184,217,.20)', blob: ['#FFE5F3', '#FF99CD', '#FFCBE6'] },
  뿌듯함: { color: '#FCE4A8', light: 'rgba(252,228,168,.24)', blob: ['#FFF6E6', '#FFC978', '#FFE3A0'] },
  스트레스: { color: '#D2C4FF', light: 'rgba(210,196,255,.20)', blob: ['#EFE9FF', '#B5A0FF', '#D8CCFF'] },
  외로움: { color: '#BDD4F5', light: 'rgba(189,212,245,.22)', blob: ['#EAF6FF', '#86C9FF', '#AEE2E6'] },
  화남: { color: '#F5A6A6', light: 'rgba(245,166,166,.20)', blob: ['#FDEAE5', '#F58888', '#F8B6B6'] },
  평온: { color: '#A2E0D5', light: 'rgba(162,224,213,.22)', blob: ['#E3F7F3', '#71D4C2', '#B2EAE0'] },
  무덤덤: { color: '#CED2DD', light: 'rgba(206,210,221,.20)', blob: ['#EEF0F3', '#B8BECF', '#D8DBE3'] }
};

export const theme = {
  font: "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  displayFont: "'Fredoka', 'Pretendard', -apple-system, sans-serif",
  shadow: '0 20px 50px -36px rgba(70,55,44,.28)',
  darkShadow: '0 26px 62px -30px rgba(0,0,0,.60)',
  emotions: emotionPalette,
  auroras: {
    블루: ['#37B9A0', '#4E7EF0', '#F0A63E'],
    민트: ['#37C98C', '#37C6C9', '#F0C63E'],
    핑크: ['#F06AA8', '#7A6AE0', '#4E8EF0'],
    골드: ['#F0A03E', '#F0603A', '#6EC080'],
    라벤더: ['#B9A0F0', '#9A9AF0', '#F0A6C8'],
    스카이: ['#7EC8F0', '#4E9EF0', '#3A66E0'],
    피치: ['#F7C08A', '#F49CB0', '#F7D0A0'],
    라임: ['#8ED868', '#6FD0A0', '#E4E05E'],
    mint: ['rgba(131,201,176,.42)', 'rgba(242,199,102,.34)', 'rgba(118,167,232,.36)'],
    peach: ['rgba(255,138,98,.34)', 'rgba(242,138,183,.28)', 'rgba(131,201,176,.28)'],
    violet: ['rgba(166,139,234,.38)', 'rgba(118,167,232,.32)', 'rgba(242,138,183,.26)'],
    night: ['rgba(80,112,190,.28)', 'rgba(93,190,166,.20)', 'rgba(166,139,234,.24)']
  }
};
