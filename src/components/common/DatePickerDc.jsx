/** @jsxImportSource @emotion/react */
import { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import styled from "@emotion/styled";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT_COLOR = "#3E5FF5";
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const ITEM_H = 34; // 휠 아이템 높이(px) — 밴드 중앙 정렬 계산 기준

function buildMonthGrid(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  // Adjust so Monday is first (index 0) and Sunday is last (index 6)
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
 
  const cells = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  return cells;
}
 
function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isAfterDay(date, referenceDate) {
  if (!date || !referenceDate) return false;
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const referenceAtMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  return dateAtMidnight > referenceAtMidnight;
}

const PopoverWrapper = styled.div`
  /* overlay: 모달 등 overflow 컨테이너에 잘리지 않도록 화면 중앙 고정 */
  position: ${({ overlay }) => overlay ? 'fixed' : 'absolute'};
  ${({ overlay, placement }) => overlay
    ? 'top: 50%; left: 50%;'
    : (placement === 'bottom' ? 'top: calc(100% + 8px); left: 0;' : 'bottom: calc(100% + 8px); left: 0;')}
  z-index: ${({ overlay }) => overlay ? 231 : 100};
  /* TimeListPanel is positioned absolutely relative to this wrapper */
  transform: ${({ overlay, scale }) => overlay
    ? `translate(-50%, -50%) scale(${scale})`
    : (scale !== 1 ? `scale(${scale})` : 'none')};
  transform-origin: ${({ overlay, placement }) => overlay ? 'center' : (placement === 'bottom' ? 'top left' : 'bottom left')};
  --date-card-w: 300px;

  /* overlay: 캘린더 카드 + 옆 시간 패널을 한 묶음으로 중앙 정렬 (패널이 flex 자식으로 붙음) */
  ${({ overlay }) => overlay ? 'display: flex; align-items: flex-start; gap: 12px;' : ''}

  /* 모바일: 옆 시간기둥 대신 카드 안 인라인 시간 → 단일 카드 팝오버, 폭만 화면에 맞춤 */
  @media (max-width: 560px) {
    --date-card-w: min(300px, calc(100vw - 56px));
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ overlay }) => overlay ? 230 : 99};
`;

const Card = styled.div`
  width: var(--date-card-w, 300px);
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  border-radius: 28px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 14px 15px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  ${({ overlay }) => overlay ? `
    max-height: 92vh;
    overflow-y: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  ` : ''}
`;

const MonthHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
`;

const NavBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sub);
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: var(--line);
    color: var(--text);
  }
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.025em;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex-shrink: 0;
`;

const DayLabel = styled.div`
  text-align: center;
  font-size: 10px;
  font-weight: 500;
  color: var(--sub);
  padding: 4px 0;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  flex-shrink: 0;
`;

const DateCell = styled.button`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 0;
  font-size: 12.5px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  
  ${({ isSelected, isToday }) => {
    if (isSelected) {
      return `
        color: #ffffff;
        background-color: var(--accent);
      `;
    }
    if (isToday) {
      return `
        color: var(--text);
        background-color: transparent;
        box-shadow: inset 0 0 0 1px var(--line);
        &:hover {
          background-color: var(--line);
        }
      `;
    }
    return `
      color: var(--text);
      background-color: transparent;
      &:hover {
        background-color: var(--line);
      }
    `;
  }}

  &:disabled {
    color: var(--sub);
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.38;

    &:hover {
      background-color: transparent;
    }
  }
`;

const TimeRow = styled.div`
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimePill = styled.button`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  padding: 8px 0;
  border-radius: 12px;
  border: 0;
  transition: all 0.2s;
  cursor: pointer;

  ${({ active }) => active ? `
    color: #ffffff;
    background-color: var(--accent);
  ` : `
    background-color: var(--line);
    color: var(--text);
    &:hover { filter: brightness(0.95); }
  `}
`;

const PeriodGroup = styled.div`
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--line);
`;

const PeriodBtn = styled.button`
  padding: 8px 10px;
  font-size: 10px;
  font-weight: 600;
  border: 0;
  transition: all 0.2s;
  cursor: pointer;

  ${({ active }) => active ? `
    color: #ffffff;
    background-color: var(--accent);
  ` : `
    color: var(--sub);
    background-color: transparent;
    &:hover { background-color: var(--line); }
  `}
`;

const TimeListPanel = styled.div`
  /* non-overlay(팝오버): 카드 오른쪽에 absolute로 붙음 / overlay(모달): flex 자식으로 카드 옆에, 카드와 동일 높이 */
  ${({ overlay }) => overlay ? `
    position: relative;
    min-height: 0;
  ` : `
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--date-card-w, 300px) + 12px); /* Card width + gap */
  `}
  width: 150px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 8px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const WheelHeadRow = styled.div`
  display: flex;
  flex: 0 0 auto;
  padding-bottom: 6px;
  margin-bottom: 2px;
  border-bottom: 1px solid var(--line);

  span {
    flex: 1;
    text-align: center;
    font-size: 10px;
    font-weight: 800;
    color: var(--text);
  }
`;

const WheelBody = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
`;

const WheelBand = styled.div`
  position: absolute;
  left: 2px;
  right: 2px;
  top: 50%;
  height: ${ITEM_H}px;
  transform: translateY(-50%);
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-radius: 10px;
  pointer-events: none;
`;

const WheelColScroll = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  -webkit-overflow-scrolling: touch;

  & + & { border-left: 1px solid var(--line); }
`;

const WheelItem = styled.button`
  display: block;
  width: 100%;
  height: ${ITEM_H}px;
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  font-size: ${({ active }) => active ? '16px' : '13px'};
  font-weight: ${({ active }) => active ? 900 : 600};
  color: ${({ active }) => active ? 'var(--accent)' : 'var(--sub)'};
  transition: color .15s, font-size .15s, font-weight .15s;
`;

const InlineTimeWrap = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
`;

const InlineTimeLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: var(--sub);
  margin-bottom: 5px;
`;

const InlineTimeScroll = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 2px 4px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  -webkit-overflow-scrolling: touch;
`;

const InlineTimeSlot = styled.button`
  flex: 0 0 auto;
  min-width: 44px;
  padding: 9px 0;
  border-radius: 10px;
  scroll-snap-align: center;
  border: 1px solid ${({ active }) => active ? 'transparent' : 'var(--line)'};
  background: ${({ active }) => active ? 'var(--accent)' : 'transparent'};
  color: ${({ active }) => active ? '#fff' : 'var(--text)'};
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background .15s, border-color .15s;
`;

// 세로 밴드 휠: 스크롤이 멈추면 가운데 밴드에 온 값이 선택됨. 항목 클릭 시 해당 값으로 스크롤.
function WheelColumn({ options, value, onSelect, bandRef }) {
  const ref = useRef(null);
  const settleRef = useRef(null);
  const lockRef = useRef(false); // 프로그램 스크롤 중 onScroll 무시(피드백 방지)

  // 정렬 목표 = 실제 밴드 요소의 화면상 세로 중앙 (없으면 스크롤 뷰 중앙)
  const bandMid = () => {
    const b = bandRef?.current?.getBoundingClientRect();
    if (b) return b.top + b.height / 2;
    const er = ref.current.getBoundingClientRect();
    return er.top + er.height / 2;
  };

  // 밴드 위치 기준으로 위·아래 여백 계산 → 첫·마지막 값도 밴드까지 스크롤 도달 가능
  const applyPadding = () => {
    const el = ref.current;
    if (!el) return;
    const er = el.getBoundingClientRect();
    const mid = bandMid();
    el.style.paddingTop = `${Math.max(0, mid - er.top - ITEM_H / 2)}px`;
    el.style.paddingBottom = `${Math.max(0, er.bottom - mid - ITEM_H / 2)}px`;
  };

  // 항목 idx를 밴드 정중앙에 오도록 화면 좌표 기준으로 이동
  const centerIdx = (idx, smooth) => {
    const el = ref.current;
    const child = el?.children[idx];
    if (!el || !child) return;
    const cr = child.getBoundingClientRect();
    const delta = (cr.top + cr.height / 2) - bandMid();
    if (Math.abs(delta) < 0.5) return;
    lockRef.current = true;
    el.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => { lockRef.current = false; }, smooth ? 340 : 60);
  };

  const layout = () => {
    applyPadding();
    const idx = options.indexOf(value);
    if (idx >= 0) centerIdx(idx, false);
  };

  // 마운트/크기변화 시 여백 재계산 + 현재값 정렬
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    layout();
    const ro = new ResizeObserver(() => layout());
    ro.observe(el);
    if (bandRef?.current) ro.observe(bandRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 값 변경 시 재정렬
  useLayoutEffect(() => {
    layout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // overlay 패널 높이는 비동기로 확정 → 열린 뒤 몇 프레임 후 한 번 더
  useEffect(() => {
    const t1 = setTimeout(layout, 40);
    const t2 = setTimeout(layout, 160);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (lockRef.current) return;
    const el = ref.current;
    if (!el) return;
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      // 밴드 중앙에 가장 가까운 항목 실측(화면 좌표)
      const mid = bandMid();
      let best = 0, bestD = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const cr = el.children[i].getBoundingClientRect();
        const d = Math.abs((cr.top + cr.height / 2) - mid);
        if (d < bestD) { bestD = d; best = i; }
      }
      centerIdx(best, true);
      if (options[best] !== value) onSelect(options[best]);
    }, 120);
  };

  return (
    <WheelColScroll ref={ref} onScroll={handleScroll}>
      {options.map((opt, i) => (
        <WheelItem
          key={opt}
          type="button"
          active={opt === value}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); centerIdx(i, true); onSelect(opt); }}
        >
          {opt}
        </WheelItem>
      ))}
    </WheelColScroll>
  );
}

export default function DatePickerDc({ value, onChange, onClose, scale = 1, placement = 'top', initialTimePanelOpen = false, overlay = false, anchorRef = null }) {
  const initDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date();
  
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(initDate);
  
  let h = initDate.getHours();
  let p = "AM";
  if (h >= 12) {
    p = "PM";
    if (h > 12) h -= 12;
  }
  if (h === 0) h = 12;

  const [selectedTime, setSelectedTime] = useState(String(h));
  const [selectedMinute, setSelectedMinute] = useState(
    String(Math.min(55, Math.round(initDate.getMinutes() / 5) * 5)).padStart(2, "0")
  );
  const [period, setPeriod] = useState(p);
  const [timePanelOpen, setTimePanelOpen] = useState(initialTimePanelOpen || overlay);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 560);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 560);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // 모바일에서만 카드 안 인라인 시/분 선택 (데스크톱은 모달이어도 옆 시간 패널 사용)
  const useInline = isMobile;

  // overlay 휠 패널 높이를 달력 카드와 동일하게 (달력은 월에 따라 5~6줄로 높이가 달라짐)
  const cardRef = useRef(null);
  const bandRef = useRef(null);
  const [panelH, setPanelH] = useState(null);
  useLayoutEffect(() => {
    if (!overlay || useInline) return;
    const measure = () => { if (cardRef.current) setPanelH(cardRef.current.offsetHeight); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [overlay, useInline, timePanelOpen, viewMonth, viewYear]);

  // overlay + anchorRef: 트리거(날짜 필드) 바로 위에 좌측 정렬로 위치 (포털이라 모달에 안 잘림)
  const [anchorStyle, setAnchorStyle] = useState(null);
  useLayoutEffect(() => {
    if (!overlay || !anchorRef?.current) return;
    const measure = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const GAP = 10, M = 12, ASSEMBLY_W = 474; // 카드(300)+gap(12)+휠(150) + 여유
      const left = Math.max(M, Math.min(rect.left, window.innerWidth - ASSEMBLY_W - M));
      const bottom = window.innerHeight - rect.top + GAP; // 필드 위쪽에 조립 하단을 붙임
      setAnchorStyle({ left, bottom });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [overlay, anchorRef, timePanelOpen, panelH]);

  // 인라인 시/분 스와이프: 열 때 현재 선택값이 가운데 오도록 스크롤
  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);
  useEffect(() => {
    if (!timePanelOpen || !useInline) return;
    const centerOn = (node, index) => {
      if (!node) return;
      const child = node.children[index];
      if (!child) return;
      node.scrollLeft = child.offsetLeft - node.clientWidth / 2 + child.offsetWidth / 2;
    };
    centerOn(hourScrollRef.current, HOUR_OPTIONS.indexOf(selectedTime));
    centerOn(minuteScrollRef.current, MINUTE_OPTIONS.indexOf(selectedMinute));
    // 열릴 때 한 번만 정렬 (선택 시마다 재정렬하면 튐)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timePanelOpen, useInline]);

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
 
  function goPrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }
 
  function goNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  useEffect(() => {
    if (!selectedDate) return;
    const dateCopy = new Date(selectedDate);
    let hour = parseInt(selectedTime, 10);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    
    dateCopy.setHours(hour);
    dateCopy.setMinutes(parseInt(selectedMinute, 10));

    const tzOffset = dateCopy.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateCopy.getTime() - tzOffset).toISOString().slice(0, 16);

    if (onChange) onChange(localISOTime);
  }, [selectedDate, selectedTime, selectedMinute, period, onChange]);

  function handleSelectDate(date) {
    if (isAfterDay(date, today)) return;
    setSelectedDate(date);
  }

  function handleSelectTime(time) {
    setSelectedTime(time);
  }

  function handleSelectMinute(minute) {
    setSelectedMinute(minute);
  }
 
  const tree = (
    <>
      <Backdrop overlay={overlay} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />
      <PopoverWrapper
        scale={scale}
        placement={placement}
        overlay={overlay}
        style={{
          "--accent": ACCENT_COLOR,
          ...(overlay && anchorStyle ? {
            left: anchorStyle.left,
            top: 'auto',
            bottom: anchorStyle.bottom,
            transform: scale !== 1 ? `scale(${scale})` : 'none',
            transformOrigin: 'bottom left',
          } : {}),
        }}
      >
        <Card overlay={overlay} ref={cardRef}>
        <MonthHeader>
          <NavBtn onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrevMonth(); }} aria-label="Previous month">
            <ChevronLeft size={16} />
          </NavBtn>
          <MonthTitle>
            {viewYear}년 {viewMonth + 1}월
          </MonthTitle>
          <NavBtn onClick={(e) => { e.preventDefault(); e.stopPropagation(); goNextMonth(); }} aria-label="Next month">
            <ChevronRight size={16} />
          </NavBtn>
        </MonthHeader>

        <WeekRow>
          {DAY_LABELS.map((d, i) => (
            <DayLabel key={i}>{d}</DayLabel>
          ))}
        </WeekRow>

        <DateGrid>
          {cells.map((date, idx) => {
            if (!date) return <div key={`blank-${idx}`} />;
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const isFutureDate = isAfterDay(date, today);

            return (
              <DateCell
                key={date.toISOString()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectDate(date); }}
                isSelected={isSelected}
                isToday={isToday}
                disabled={isFutureDate}
                aria-label={isFutureDate ? `${date.getDate()}일, 선택할 수 없는 미래 날짜` : undefined}
              >
                {date.getDate()}
              </DateCell>
            );
          })}
        </DateGrid>

        <TimeRow>
          <TimePill
            active={timePanelOpen}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTimePanelOpen((v) => !v); }}
          >
            {selectedTime.padStart(2, "0")}:{selectedMinute}
          </TimePill>
          <PeriodGroup>
            <PeriodBtn
              active={period === "AM"}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPeriod("AM"); }}
            >
              AM
            </PeriodBtn>
            <PeriodBtn
              active={period === "PM"}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPeriod("PM"); }}
            >
              PM
            </PeriodBtn>
          </PeriodGroup>
        </TimeRow>

        {useInline && timePanelOpen && (
          <InlineTimeWrap>
            <InlineTimeLabel>시</InlineTimeLabel>
            <InlineTimeScroll ref={hourScrollRef}>
              {HOUR_OPTIONS.map((time) => (
                <InlineTimeSlot
                  key={time}
                  type="button"
                  active={time === selectedTime}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectTime(time); }}
                >
                  {time}
                </InlineTimeSlot>
              ))}
            </InlineTimeScroll>
            <InlineTimeLabel css={{ marginTop: 10 }}>분</InlineTimeLabel>
            <InlineTimeScroll ref={minuteScrollRef}>
              {MINUTE_OPTIONS.map((minute) => (
                <InlineTimeSlot
                  key={minute}
                  type="button"
                  active={minute === selectedMinute}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectMinute(minute); }}
                >
                  {minute}
                </InlineTimeSlot>
              ))}
            </InlineTimeScroll>
          </InlineTimeWrap>
        )}
      </Card>

      {!useInline && timePanelOpen && (
        <TimeListPanel overlay={overlay} style={overlay && panelH ? { height: panelH } : undefined}>
          <WheelHeadRow><span>시</span><span>분</span></WheelHeadRow>
          <WheelBody>
            <WheelBand ref={bandRef} />
            <WheelColumn options={HOUR_OPTIONS} value={selectedTime} onSelect={handleSelectTime} bandRef={bandRef} />
            <WheelColumn options={MINUTE_OPTIONS} value={selectedMinute} onSelect={handleSelectMinute} bandRef={bandRef} />
          </WheelBody>
        </TimeListPanel>
      )}
    </PopoverWrapper>
    </>
  );

  // overlay(모달)일 때는 테마 루트로 포털 → 모달의 overflow/containing block에 잘리지 않음
  if (overlay && typeof document !== 'undefined') {
    return createPortal(tree, document.getElementById('app-root') || document.body);
  }
  return tree;
}
