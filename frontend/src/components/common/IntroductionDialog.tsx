import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { Text } from '../ui';

interface IntroductionDialogProps {
  open: boolean;
  onClose: () => void;
  onDontShowToday: () => void;
}

const IntroductionDialog: React.FC<IntroductionDialogProps> = ({ open, onClose, onDontShowToday }) => {
  const navigate = useNavigate();

  const handleGoToIntroduction = () => {
    navigate('/introduction');
    onClose();
  };

  const actions = (
    <>
      <Button onClick={onClose} variant="text">
        닫기
      </Button>
      <Button onClick={onDontShowToday} variant="outlined">
        오늘 하루 보지 않기
      </Button>
      <Button onClick={handleGoToIntroduction} variant="contained">
        소개 보러가기
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="새로운 소식"
      actions={actions}
    >
      <Text sx={{ color: 'text.secondary' }}>
        저희 서비스의 새로운 기능들을 확인해보시겠어요?
        <br />
        더욱 편리해진 기능들을 소개 페이지에서 만나보세요!
      </Text>
    </Modal>
  );
};

export default IntroductionDialog; 