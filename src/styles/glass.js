export const glass = ({ strong = false } = {}) => ({
  background: strong ? 'var(--card-strong)' : 'var(--card)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow)',
  backdropFilter: 'blur(26px) saturate(1.25)',
  WebkitBackdropFilter: 'blur(26px) saturate(1.25)'
});

