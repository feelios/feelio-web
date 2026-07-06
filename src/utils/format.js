export function money(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`;
}

export function signedMoney(item) {
  const sign = item.type === 'income' ? '+' : '-';
  return `${sign}${money(item.amount)}`;
}

export function monthKey(date) {
  return String(date).slice(0, 7);
}

export function dayKey(date) {
  return String(date).slice(0, 10);
}

export function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

