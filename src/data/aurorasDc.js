export const auroras = [
  { id: '\uBE14\uB8E8', name: '\uBE14\uB8E8', colors: ['#37B9A0', '#4E7EF0', '#F0A63E'] },
  { id: '\uBBFC\uD2B8', name: '\uBBFC\uD2B8', colors: ['#37C98C', '#37C6C9', '#F0C63E'] },
  { id: '\uD551\uD06C', name: '\uD551\uD06C', colors: ['#F06AA8', '#7A6AE0', '#4E8EF0'] },
  { id: '\uACE8\uB4DC', name: '\uACE8\uB4DC', colors: ['#F0A03E', '#F0603A', '#6EC080'] },
  { id: '\uB77C\uBCA4\uB354', name: '\uB77C\uBCA4\uB354', colors: ['#B9A0F0', '#9A9AF0', '#F0A6C8'] },
  { id: '\uC2A4\uCE74\uC774', name: '\uC2A4\uCE74\uC774', colors: ['#7EC8F0', '#4E9EF0', '#3A66E0'] },
  { id: '\uD53C\uCE58', name: '\uD53C\uCE58', colors: ['#F7C08A', '#F49CB0', '#F7D0A0'] },
  { id: '\uB77C\uC784', name: '\uB77C\uC784', colors: ['#8ED868', '#6FD0A0', '#E4E05E'] }
];

export function getAurora(id) {
  return auroras.find(item => item.id === id) || auroras[0];
}
