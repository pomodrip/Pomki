import React, { lazy, Suspense } from 'react';
import { Dialog, DialogContent, Box, Typography } from '@mui/material';
import CircularProgress from '../ui/CircularProgress';
import { AIEnhanceResponse } from '../../api/noteApi';

// AIEnhanceDialog를 동적으로 로드
const AIEnhanceDialog = lazy(() => 
  import('./AIEnhanceDialog').then(module => ({ 
    default: module.AIEnhanceDialog 
  }))
);

interface LazyAIEnhanceDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (content: string) => void;
  aiResponse: AIEnhanceResponse | null;
  loading: boolean;
}

// 로딩 다이얼로그 컴포넌트
const LoadingDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogContent>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '40px 0',
        gap: '16px',
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          AI 기능을 로드하는 중...
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
);

const LazyAIEnhanceDialog: React.FC<LazyAIEnhanceDialogProps> = (props) => {
  const { open, onClose } = props;

  // 다이얼로그가 열려있지 않으면 아무것도 렌더링하지 않음
  if (!open) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingDialog open={open} onClose={onClose} />}>
      <AIEnhanceDialog {...props} />
    </Suspense>
  );
};

export default LazyAIEnhanceDialog; 