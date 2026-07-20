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
  padding: 18px;
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
  margin-bottom: 12px;
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
  padding: 6px 0;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  flex-shrink: 0;
`;

const DateCell = styled.button`
  height: 34px;
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
  margin-top: 16px;
  padding-top: 12px;
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
    align-self: stretch;
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
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  scrollbar-width: none;
  scroll-snap-type: y mandatory;
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
  scroll-snap-align: center;
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
function WheelColumn({ options, value, onSelect }) {
  const ref = useRef(null);
  const [pad, setPad] = useState(0);
  const settleRef = useRef(null);

  // 스크롤 뷰 높이에 맞춰 위·아래 여백 → 첫/마지막 항목도 밴드 중앙까지 올 수 있게
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setPad(Math.max(0, (el.clientHeight - ITEM_H) / 2));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 여백이 정해진 뒤(또는 리사이즈) 현재값을 밴드 중앙으로 위치
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || pad === 0) return;
    const idx = options.indexOf(value);
    if (idx >= 0) el.scrollTop = idx * ITEM_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pad]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / ITEM_H)));
      if (options[idx] !== value) onSelect(options[idx]);
    }, 100);
  };

  return (
    <WheelColScroll ref={ref} onScroll={handleScroll} style={{ paddingTop: pad, paddingBottom: pad }}>
      {options.map((opt, i) => (
        <WheelItem
          key={opt}
          type="button"
          active={opt === value}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' }); }}
        >
          {opt}
        </WheelItem>
      ))}
    </WheelColScroll>
  );
}

export default function DatePickerDc({ value, onChange, onClose, scale = 1, placement = 'top', initialTimePanelOpen = false, overlay = false }) {
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
      <PopoverWrapper scale={scale} placement={placement} overlay={overlay} style={{ "--accent": ACCENT_COLOR }}>
        <Card overlay={overlay}>
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
        <TimeListPanel overlay={overlay}>
          <WheelHeadRow><span>시</span><span>분</span></WheelHeadRow>
          <WheelBody>
            <WheelBand />
            <WheelColumn options={HOUR_OPTIONS} value={selectedTime} onSelect={handleSelectTime} />
            <WheelColumn options={MINUTE_OPTIONS} value={selectedMinute} onSelect={handleSelectMinute} />
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
