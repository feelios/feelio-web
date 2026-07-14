/** @jsxImportSource @emotion/react */
import { useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACCENT_COLOR = "#3E5FF5";
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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

const PopoverWrapper = styled.div`
  position: absolute;
  ${({ placement }) => placement === 'bottom' ? 'top: calc(100% + 8px);' : 'bottom: calc(100% + 8px);'}
  left: 0;
  z-index: 100;
  /* TimeListPanel is positioned absolutely relative to this wrapper */
  transform: ${({ scale }) => scale !== 1 ? `scale(${scale})` : 'none'};
  transform-origin: ${({ placement }) => placement === 'bottom' ? 'top left' : 'bottom left'};
`;

const Card = styled.div`
  width: 300px;
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  border-radius: 28px;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  padding: 20px;
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
  font-size: 8px;
  font-weight: 500;
  color: var(--sub);
  padding: 4px 0;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  flex-shrink: 0;
`;

const DateCell = styled.button`
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 0;
  font-size: 11px;
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
  left: calc(300px + 12px); /* Card width + gap */
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
  padding: 8px 0;
  border-radius: 8px;
  border: 0;
  transition: all 0.2s;
  margin-bottom: 4px;
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
    setSelectedDate(date);
  }
 
  function handleSelectTime(time) {
    setSelectedTime(time);
    setTimePanelOpen(false);
  }
 
  return (
    <>
      <div 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        style={{ position: 'fixed', inset: 0, zIndex: 99 }}
      />
      <PopoverWrapper scale={scale} placement={placement} style={{ "--accent": ACCENT_COLOR }}>
        <Card>
        <MonthHeader>
          <NavBtn onClick={(e) => { e.preventDefault(); e.stopPropagation(); goPrevMonth(); }} aria-label="Previous month">
            <ChevronLeft size={16} />
          </NavBtn>
          <MonthTitle>
            {MONTH_LABELS[viewMonth]} {viewYear}
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

            return (
              <DateCell
                key={date.toISOString()}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelectDate(date); }}
                isSelected={isSelected}
                isToday={isToday}
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
      </Card>

      {timePanelOpen && (
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
