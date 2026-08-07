export const emotionPalette = {
  신남: { color: '#FF7A8C', light: 'rgba(255,122,140,.20)', blob: ['#FFEBF0', '#FF9FAD', '#FFC9D2'] },
  설렘: { color: '#FF66B2', light: 'rgba(255,102,178,.20)', blob: ['#FFE5F3', '#FF99CD', '#FFCBE6'] },
  뿌듯함: { color: '#F35FA8', light: 'rgba(243,95,168,.24)', blob: ['#FDE6F1', '#F799CB', '#F9C4E0'] },
  스트레스: { color: '#8A6CFF', light: 'rgba(138,108,255,.20)', blob: ['#EFE9FF', '#B5A0FF', '#D8CCFF'] },
  외로움: { color: '#FF7A6B', light: 'rgba(255,122,107,.22)', blob: ['#FFEBE8', '#FFAF9E', '#FFD1C9'] },
  화남: { color: '#F25555', light: 'rgba(242,85,85,.20)', blob: ['#FDEAE5', '#F58888', '#F8B6B6'] },
  평온: { color: '#2FBFA6', light: 'rgba(47,191,166,.22)', blob: ['#E3F7F3', '#71D4C2', '#B2EAE0'] },
  무덤덤: { color: '#9AA0B4', light: 'rgba(154,160,180,.20)', blob: ['#EEF0F3', '#B8BECF', '#D8DBE3'] }
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
