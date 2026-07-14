import { useMemo, useRef, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { ChevronDown } from "lucide-react";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 14px;

  ${({ disabled }) => disabled && `
    background: var(--line);
    opacity: 0.7;
    pointer-events: none;
  `}
`;

const Divider = styled.span`
  color: var(--sub);
  font-size: 15px;
  font-weight: 500;
`;

const SegmentWrapper = styled.div`
  position: relative;
  min-width: ${({ minWidth }) => minWidth}px;
`;

const SegmentButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--accent);
  }
`;

const SegmentMenu = styled.div`
  position: absolute;
  z-index: 10;
  top: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  max-height: 180px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  border-radius: 12px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 4px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

const SegmentOption = styled.button`
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  padding: 6px 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;

  &:last-child {
    margin-bottom: 0;
  }

  ${({ isSelected }) => isSelected ? `
    background: var(--card-strong);
    color: var(--text);
  ` : `
    background: transparent;
    color: var(--sub);
    &:hover {
      background: var(--line);
      color: var(--text);
    }
  `}
`;

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);
  return ref;
}

function Segment({ value, options, onChange, minWidth = 52 }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);

  // 선택된 항목이 열릴 때 중앙에 오도록 스크롤 이동
  const activeRef = useRef(null);
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'center' });
    }
  }, [open]);

  return (
    <SegmentWrapper minWidth={minWidth} ref={ref}>
      <SegmentButton type="button" onClick={() => setOpen((v) => !v)}>
        <span>{value}</span>
        <ChevronDown
          size={14}
          color="var(--sub)"
          style={{ 
            transition: 'transform 0.2s', 
            transform: open ? "rotate(180deg)" : "none" 
          }}
        />
      </SegmentButton>

      {open && (
        <SegmentMenu>
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <SegmentOption
                key={opt}
                type="button"
                isSelected={isSelected}
                ref={isSelected ? activeRef : null}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </SegmentOption>
            );
          })}
        </SegmentMenu>
      )}
    </SegmentWrapper>
  );
}

export default function SegmentDatePicker({ value, onChange, disabled }) {
  const initDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date();
  
  const [year, setYear] = useState(initDate.getFullYear());
  const [month, setMonth] = useState(initDate.getMonth() + 1);
  const [day, setDay] = useState(initDate.getDate());

  const today = useMemo(() => new Date(), []);
  
  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, i) => today.getFullYear() + i - 5), // ±5 years from today
    [today]
  );
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // Clamp day when switching to a shorter month
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (day > daysInMonth) setDay(daysInMonth);
  }, [daysInMonth, day]);

  // Synchronize changes to parent
  useEffect(() => {
    // Avoid firing onChange on mount if the parent value is already perfectly aligned
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00.000Z`;
    if (value && value.startsWith(dateStr.slice(0, 10))) return;
    
    // Pass the new date to parent
    if (onChange) {
      onChange(dateStr);
    }
  }, [year, month, day, value, onChange]);

  return (
    <Container disabled={disabled}>
      <Segment 
        value={year} 
        options={yearOptions} 
        onChange={setYear} 
        minWidth={64} 
      />
      <Divider>-</Divider>
      <Segment
        value={String(month).padStart(2, "0")}
        options={monthOptions.map((m) => String(m).padStart(2, "0"))}
        onChange={(v) => setMonth(Number(v))}
        minWidth={52}
      />
      <Divider>-</Divider>
      <Segment
        value={String(day).padStart(2, "0")}
        options={dayOptions.map((d) => String(d).padStart(2, "0"))}
        onChange={(v) => setDay(Number(v))}
        minWidth={52}
      />
    </Container>
  );
}
