import { useRef, useState, useEffect } from "react";
import styled from '@emotion/styled';
import { ChevronDown, X } from 'lucide-react';

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Label = styled.div`
  font-size: 11.5px;
  color: var(--sub);
  margin-bottom: 6px;
  font-weight: 900;
`;

const Trigger = styled.button`
  width: 100%;
  min-height: 41px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 13px;
  border: 1px solid ${({ isOpen }) => isOpen ? 'var(--accent)' : 'var(--line)'};
  background: var(--card);
  color: var(--text);
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;

  &:hover {
    border-color: ${({ isOpen }) => isOpen ? 'var(--accent)' : 'var(--sub)'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const Placeholder = styled.span`
  color: var(--sub);
`;

const ValueText = styled.span`
  color: var(--text);
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--sub);
`;

const ClearButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  color: var(--sub);
  &:hover {
    background: var(--line);
    color: var(--text);
  }
`;

const Menu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background: var(--modal-bg);
  border-radius: 12px;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
  padding: 4px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  backdrop-filter: blur(28px) saturate(1.25);
  -webkit-backdrop-filter: blur(28px) saturate(1.25);
`;

const Option = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 500;
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

  span.check {
    opacity: ${({ isSelected }) => isSelected ? 1 : 0};
    color: var(--accent, var(--text));
    font-weight: 900;
  }
`;

export default function SelectDc({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = '선택해주세요',
  isClearable = false,
  disabled = false,
  multiple = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedValues = multiple ? (value || []) : [];
  const selectedOption = multiple ? null : options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    if (multiple) {
      // 다중선택: 토글 후 메뉴 유지
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(next);
      return;
    }
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
    setIsOpen(false);
  };

  return (
    <SelectWrapper ref={wrapperRef}>
      {label && <Label>{label}</Label>}
      <Trigger
        type="button"
        isOpen={isOpen}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
      >
        {multiple ? (
          selectedValues.length ? (
            <ValueText>{selectedValues.length}개 선택</ValueText>
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )
        ) : selectedOption ? (
          <ValueText>{selectedOption.label}</ValueText>
        ) : (
          <Placeholder>{placeholder}</Placeholder>
        )}
        <IconWrapper>
          {isClearable && selectedOption && (
            <ClearButton onClick={handleClear}>
              <X size={14} />
            </ClearButton>
          )}
          <ChevronDown size={16} />
        </IconWrapper>
      </Trigger>

      {isOpen && !disabled && (
        <Menu>
          {multiple && (
            <Option
              type="button"
              isSelected={selectedValues.length === 0}
              onClick={() => onChange([])}
            >
              {placeholder}
              <span className="check">✓</span>
            </Option>
          )}
          {options.map((option) => {
            const isSelected = multiple ? selectedValues.includes(option.value) : option.value === value;
            return (
              <Option
                key={option.value}
                type="button"
                isSelected={isSelected}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {multiple && <span className="check">✓</span>}
              </Option>
            );
          })}
        </Menu>
      )}
    </SelectWrapper>
  );
}
