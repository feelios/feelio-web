export const auroras = [
  { id: '블루', name: '블루', colors: ['#37B9A0', '#4E7EF0', '#F0A63E'] },
  { id: '민트', name: '민트', colors: ['#37C98C', '#37C6C9', '#F0C63E'] },
  { id: '핑크', name: '핑크', colors: ['#F06AA8', '#7A6AE0', '#4E8EF0'] },
  { id: '골드', name: '골드', colors: ['#F0A03E', '#F0603A', '#6EC080'] },
  { id: '라벤더', name: '라벤더', colors: ['#B9A0F0', '#9A9AF0', '#F0A6C8'] },
  { id: '스카이', name: '스카이', colors: ['#7EC8F0', '#4E9EF0', '#3A66E0'] },
  { id: '피치', name: '피치', colors: ['#F7C08A', '#F49CB0', '#F7D0A0'] },
  { id: '라임', name: '라임', colors: ['#8ED868', '#6FD0A0', '#E4E05E'] }
];

export function getAurora(id) {
  return auroras.find(item => item.id === id) || auroras[0];
}
