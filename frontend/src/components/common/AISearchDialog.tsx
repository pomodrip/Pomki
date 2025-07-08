import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useDialog } from '../../hooks/useDialog';
import { resetAIState, selectAIState } from '../../store/slices/aiSlice';
import { Modal, Flex, Button } from '../ui';
import AISearchBar from '../ai/AISearchBar';
import AIResultDisplay from '../ai/AIResultDisplay';

const AISearchDialog: React.FC = () => {
  const { dialog, closeDialog } = useDialog();
  const dispatch = useAppDispatch();
  const { data } = useAppSelector(selectAIState);

  const isOpen = dialog.isOpen && dialog.id === 'aiSearch';

  // 다이얼로그가 닫힐 때 AI 상태를 초기화합니다.
  useEffect(() => {
    if (!isOpen) {
      // 약간의 딜레이를 주어 닫히는 애니메이션 중에 내용이 사라지는 것을 방지
      setTimeout(() => {
        dispatch(resetAIState());
      }, 300);
    }
  }, [isOpen, dispatch]);

  const handleCopy = () => {
    if (data?.answer) {
      navigator.clipboard.writeText(data.answer);
      // TODO: 복사 완료 토스트 메시지 표시
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={closeDialog}
      title="AI에게 무엇이든 물어보세요"
      actions={
        <Button onClick={handleCopy} disabled={!data?.answer}>
          답변 복사
        </Button>
      }
    >
      <Flex direction="column" gap={4}>
        <AISearchBar />
        <AIResultDisplay />
      </Flex>
    </Modal>
  );
};

export default AISearchDialog; 