/** @jsxImportSource @emotion/react */
import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styled from '@emotion/styled';

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function useOutsideClose(setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setOpen]);
  return ref;
}

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sub);
  background: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;

  &:hover {
    color: var(--text);
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TitleButton = styled.button`
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  background: transparent;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Popup = styled.div`
  position: absolute;
  z-index: 50;
  top: 100%;
  margin-top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 256px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--bg-1);
  padding: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
`;

const YearScroll = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const YearItem = styled.button`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: ${({ selected }) => selected ? 'var(--text)' : 'transparent'};
  color: ${({ selected }) => selected ? 'var(--bg-1)' : 'var(--sub)'};

  &:hover {
    background: ${({ selected }) => selected ? 'var(--text)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;

const MonthItem = styled.button`
  font-size: 12px;
  font-weight: 700;
  padding: 8px 0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: ${({ selected }) => selected ? 'var(--text)' : 'transparent'};
  color: ${({ selected }) => selected ? 'var(--bg-1)' : 'var(--sub)'};

  &:hover {
    background: ${({ selected }) => selected ? 'var(--text)' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

export default function MonthlyAnalysisSwitcher({ year, month, onChangeMonth }) {
  const [jumpOpen, setJumpOpen] = useState(false);
  const jumpRef = useOutsideClose(setJumpOpen);
  const [tempYear, setTempYear] = useState(year);

  const yearOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => today.getFullYear() - 3 + i);
  }, []);

  function goPrev() {
    if (month === 0) {
      onChangeMonth(year - 1, 11);
    } else {
      onChangeMonth(year, month - 1);
    }
  }

  function goNext() {
    if (month === 11) {
      onChangeMonth(year + 1, 0);
    } else {
      onChangeMonth(year, month + 1);
    }
  }

  function jumpTo(y, m) {
    onChangeMonth(y, m);
    setJumpOpen(false);
  }

  return (
    <Wrapper>
      <Container>
        <NavButton type="button" onClick={goPrev} aria-label="이전 달">
          <ChevronLeft size={18} />
        </NavButton>

        <div style={{ position: 'relative' }} ref={jumpRef}>
          <TitleButton type="button" onClick={() => {
            if (!jumpOpen) setTempYear(year);
            setJumpOpen((v) => !v);
          }}>
            {year}년 {MONTH_LABELS[month]}
          </TitleButton>

          {jumpOpen && (
            <Popup>
              <YearScroll>
                {yearOptions.map((y) => (
                  <YearItem
                    key={y}
                    type="button"
                    selected={y === tempYear}
                    onClick={() => setTempYear(y)}
                  >
                    {y}
                  </YearItem>
                ))}
              </YearScroll>
              <MonthGrid>
                {MONTH_LABELS.map((label, idx) => {
                  const isSelected = idx === month && tempYear === year;
                  return (
                    <MonthItem
                      key={label}
                      type="button"
                      selected={isSelected}
                      onClick={() => jumpTo(tempYear, idx)}
                    >
                      {label}
                    </MonthItem>
                  );
                })}
              </MonthGrid>
            </Popup>
          )}
        </div>

        <NavButton type="button" onClick={goNext} aria-label="다음 달">
          <ChevronRight size={18} />
        </NavButton>
      </Container>
    </Wrapper>
  );
}
