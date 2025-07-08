import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, width: '100%', flexWrap: 'wrap' }}>

      <Button onClick={handleGoToIntroduction} variant="contained" color="primary">
        소개 보러 가기
      </Button>

      <Button onClick={onDontShowToday} variant="text" color="inherit" sx={{ color: 'text.secondary', fontSize: '0.875rem', padding: '0.5rem' }}>
        오늘 하루 보지 않기
      </Button>

    </Box>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      actions={actions}
      hideTitle
    >
      <Box sx={{ textAlign: 'left', width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Text variant="h6" fontWeight="bold">
            새로운 소식
          </Text>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Text sx={{
          color: 'text.secondary',
          display: 'block',
          marginBottom: 2,
        }}>
          더욱 편리해진 Pomki의 새로운 기능들을 소개 페이지에서 만나보세요!
        </Text>
      </Box>
    </Modal>
  );
};

export default IntroductionDialog; 