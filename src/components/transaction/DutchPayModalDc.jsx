/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { getEmotion } from '../../data/emotions.js';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  padding: 20px;
`;

const DialogCard = styled.div`
  width: 100%;
  max-width: 360px;
  background: color-mix(in srgb, var(--bg-1) 95%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  text-align: center;
`;

const ListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 0;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ItemCard = styled.div`
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border: 1px solid ${props => props.selected ? 'var(--accent)' : 'transparent'};
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemMemo = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
`;

const ItemDate = styled.div`
  font-size: 11px;
  color: var(--sub);
`;

const ItemAmount = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CheckCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--accent)' : 'var(--line)'};
  background: ${props => props.selected ? 'var(--accent)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;

  &::after {
    content: '';
    display: ${props => props.selected ? 'block' : 'none'};
    width: 4px;
    height: 8px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-top: -2px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 14px 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: ${props => props.primary ? 'var(--accent)' : 'var(--bg-2)'};
  color: ${props => props.primary ? '#fff' : 'var(--text)'};
`;

const EmptyState = styled.div`
  padding: 30px 0;
  text-align: center;
  color: var(--sub);
  font-size: 13px;
  font-weight: 600;
`;

export default function DutchPayModalDc({ open, onClose, onConfirm, pendingList = [], initialSelectedIds = [] }) {
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);

  if (!open) return null;

  const toggleItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  return createPortal(
    <Overlay onClick={onClose}>
      <DialogCard onClick={e => e.stopPropagation()}>
        <Title>정산할 더치페이 선택</Title>
        <ListContainer>
          {pendingList.length === 0 ? (
            <EmptyState>정산 대기 중인 내역이 없습니다.</EmptyState>
          ) : (
            pendingList.map(item => {
              const isSelected = selectedIds.includes(item.transactionId);
              return (
                <ItemCard key={item.transactionId} selected={isSelected} onClick={() => toggleItem(item.transactionId)}>
                  <ItemInfo>
                    <ItemMemo>{item.memo || '더치페이'}</ItemMemo>
                    <ItemDate>{new Date(item.occurredAt).toLocaleDateString()}</ItemDate>
                  </ItemInfo>
                  <div css={{ display: 'flex', alignItems: 'center' }}>
                    <ItemAmount>
                      <span css={{ 
                        display: 'inline-block', 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        background: getEmotion(item.emotion?.name).color 
                      }} />
                      {item.amount.toLocaleString()}원
                    </ItemAmount>
                    <CheckCircle selected={isSelected} />
                  </div>
                </ItemCard>
              );
            })
          )}
        </ListContainer>
        <ButtonRow>
          <Button onClick={onClose}>취소</Button>
          <Button primary onClick={handleConfirm}>
            {selectedIds.length}건 선택 완료
          </Button>
        </ButtonRow>
      </DialogCard>
    </Overlay>,
    document.body
  );
}
