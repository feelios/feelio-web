export const emotionPalette = {
  신남: { color: '#FF8A62', light: 'rgba(255,138,98,.20)', blob: ['#FFF0F6', '#FF9DC4', '#FFC49A'] },
  설렘: { color: '#F28AB7', light: 'rgba(242,138,183,.20)', blob: ['#FBEEFA', '#E191DD', '#F3C6EF'] },
  뿌듯함: { color: '#F2C766', light: 'rgba(242,199,102,.24)', blob: ['#FFF6E6', '#FFC978', '#FFE3A0'] },
  스트레스: { color: '#A68BEA', light: 'rgba(166,139,234,.20)', blob: ['#ECEAFB', '#9E96EE', '#B4AAF2'] },
  외로움: { color: '#76A7E8', light: 'rgba(118,167,232,.22)', blob: ['#EAF6FF', '#86C9FF', '#AEE2E6'] },
  화남: { color: '#E87573', light: 'rgba(232,117,115,.20)', blob: ['#FFEEEC', '#FF8F89', '#FFB27E'] },
  평온: { color: '#83C9B0', light: 'rgba(131,201,176,.22)', blob: ['#ECFBF4', '#82E2C2', '#CBEEA0'] },
  무덤덤: { color: '#AEB4C1', light: 'rgba(174,180,193,.20)', blob: ['#F0F0F4', '#C2C2CE', '#D0C8D8'] }
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
