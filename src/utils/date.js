/**
 * 달을 옮길 때 전역 선택일로 삼을 날짜.
 *
 * 화면마다 달을 바꿀 때 그 달 1일을 그대로 선택일로 넣고 있었다(홈 달력·전역 월 선택기·
 * 거래내역·분석 네 곳). 그래서 다른 달에 갔다가 이번 달로 돌아오면 선택이 1일에 남고,
 * 홈 달력에서 선택 링이 오늘 대신 1일에 붙었다 — 오늘은 숫자 아래 점만 남아서,
 * 사용자가 오늘을 한 번 더 눌러야 원래 상태로 돌아왔다.
 *
 * 이번 달로 오면 오늘을, 다른 달이면 그 달 1일을 고른다.
 */
export function monthAnchorDate(year, monthIndex) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && monthIndex === now.getMonth();
  return isCurrentMonth
    ? new Date(year, monthIndex, now.getDate())
    : new Date(year, monthIndex, 1);
}
