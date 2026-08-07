export const emotionPalette = {
  신남: { color: '#FF9574', light: 'rgba(255,149,116,.20)', blob: ['#FFEBF0', '#FF9FAD', '#FFC9D2'] },
  설렘: { color: '#FF7DBE', light: 'rgba(255,125,190,.20)', blob: ['#FFE5F3', '#FF99CD', '#FFCBE6'] },
  뿌듯함: { color: '#F4CD78', light: 'rgba(244,205,120,.24)', blob: ['#FFF6E6', '#FFC978', '#FFE3A0'] },
  스트레스: { color: '#A087FF', light: 'rgba(160,135,255,.20)', blob: ['#EFE9FF', '#B5A0FF', '#D8CCFF'] },
  외로움: { color: '#8BB3EE', light: 'rgba(139,179,238,.22)', blob: ['#EAF6FF', '#86C9FF', '#AEE2E6'] },
  화남: { color: '#F26A6A', light: 'rgba(242,106,106,.20)', blob: ['#FDEAE5', '#F58888', '#F8B6B6'] },
  평온: { color: '#50C7B2', light: 'rgba(80,199,178,.22)', blob: ['#E3F7F3', '#71D4C2', '#B2EAE0'] },
  무덤덤: { color: '#A9AEBF', light: 'rgba(169,174,191,.20)', blob: ['#EEF0F3', '#B8BECF', '#D8DBE3'] }
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
