import React, { useState, useRef, useEffect } from 'react';
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
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  border-radius: 12px;
  border: 1px solid var(--line);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 4px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

const Option = styled.button`
  width: 100%;
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
`;

export default function SelectDc({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = '선택해주세요',
  isClearable = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

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
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  return (
    <SelectWrapper ref={wrapperRef}>
      {label && <Label>{label}</Label>}
      <Trigger 
        type="button" 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? (
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

      {isOpen && (
        <Menu>
          {options.map((option) => (
            <Option
              key={option.value}
              type="button"
              isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </Option>
          ))}
        </Menu>
      )}
    </SelectWrapper>
  );
}
