/** @jsxImportSource @emotion/react */
import { useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT_COLOR = "#3E5FF5";
const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

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
  position: absolute;
  ${({ placement }) => placement === 'bottom' ? 'top: calc(100% + 8px);' : 'bottom: calc(100% + 8px);'}
  left: 0;
  z-index: 100;
  /* TimeListPanel is positioned absolutely relative to this wrapper */
  transform: ${({ scale }) => scale !== 1 ? `scale(${scale})` : 'none'};
  transform-origin: ${({ placement }) => placement === 'bottom' ? 'top left' : 'bottom left'};
  --date-card-w: 300px;

  /* 모바일: 옆 시간기둥 대신 카드 안 인라인 시간 → 단일 카드 팝오버, 폭만 화면에 맞춤 */
  @media (max-width: 560px) {
    --date-card-w: min(300px, calc(100vw - 56px));
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99;
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
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--date-card-w, 300px) + 12px); /* Card width + gap */
  width: 64px;
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 8px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const TimeSlot = styled.button`
  width: 100%;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  padding: 6px 0;
  border-radius: 8px;
  border: 0;
  transition: all 0.2s;
  margin-bottom: 3px;
  cursor: pointer;
  &:last-child { margin-bottom: 0; }

  ${({ active }) => active ? `
    color: #ffffff;
    background-color: var(--accent);
  ` : `
    color: var(--text);
    background-color: transparent;
    &:hover { background-color: var(--line); }
  `}
`;

const InlineTimeScroll = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-top: 12px;
  padding: 12px 2px 2px;
  border-top: 1px solid var(--line);
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const InlineTimeSlot = styled.button`
  flex: 0 0 auto;
  min-width: 42px;
  padding: 9px 0;
  border-radius: 10px;
  border: 1px solid ${({ active }) => active ? 'transparent' : 'var(--line)'};
  background: ${({ active }) => active ? 'var(--accent)' : 'transparent'};
  color: ${({ active }) => active ? '#fff' : 'var(--text)'};
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
`;

export default function DatePickerDc({ value, onChange, onClose, scale = 1, placement = 'top', initialTimePanelOpen = false }) {
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
  const [period, setPeriod] = useState(p);
  const [timePanelOpen, setTimePanelOpen] = useState(initialTimePanelOpen);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 560);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 560);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
    dateCopy.setMinutes(0);
    
    const tzOffset = dateCopy.getTimezoneOffset() * 60000;
    const localISOTime = new Date(dateCopy.getTime() - tzOffset).toISOString().slice(0, 16);
    
    if (onChange) onChange(localISOTime);
  }, [selectedDate, selectedTime, period, onChange]);

  function handleSelectDate(date) {
    if (isAfterDay(date, today)) return;
    setSelectedDate(date);
  }
 
  function handleSelectTime(time) {
    setSelectedTime(time);
    setTimePanelOpen(false);
  }
 
  return (
    <>
      <Backdrop onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} />
      <PopoverWrapper scale={scale} placement={placement} style={{ "--accent": ACCENT_COLOR }}>
        <Card>
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
            {selectedTime.padStart(2, "0")}:00
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

        {isMobile && timePanelOpen && (
          <InlineTimeScroll>
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
        )}
      </Card>

      {!isMobile && timePanelOpen && (
        <TimeListPanel>
          {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((time) => {
            const isSelected = time === selectedTime;
            return (
              <TimeSlot
                key={time}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectTime(time); }}
                active={isSelected}
              >
                {time}
              </TimeSlot>
            );
          })}
        </TimeListPanel>
      )}
    </PopoverWrapper>
    </>
  );
}
