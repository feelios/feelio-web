// 웹(Sidebar)·모바일(BottomNav) 공용 메뉴 아이콘 — 라우트 key로 동일 SVG를 렌더한다.
export function MenuIcon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 };
  if (name === 'home') return <svg {...common} strokeLinejoin="round"><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>;
  if (name === 'record') return <svg {...common} strokeLinecap="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 8v8M8 12h8" /></svg>;
  if (name === 'transactions') return <svg {...common} strokeLinecap="round"><path d="M5 6h14M5 12h14M5 18h9" /></svg>;
  if (name === 'analysis') return <svg {...common} strokeLinecap="round"><path d="M5 19V9M12 19V5M19 19v-6" /></svg>;
  return <svg {...common}><circle cx="11" cy="12" r="4" /><ellipse cx="11" cy="12" rx="10" ry="4.3" transform="rotate(28 11 12)" /><path d="M18.5 5.2l.5 1.4 1.4.5-1.4.5-.5 1.4-.5-1.4L16.6 7l1.4-.5z" fill="currentColor" stroke="none" /></svg>;
}
