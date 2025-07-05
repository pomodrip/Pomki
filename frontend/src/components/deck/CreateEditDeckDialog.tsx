import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import { useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import type { CardDeck } from '../../types/card';

interface CreateEditDeckDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void | Promise<void>;
  deck?: CardDeck | null; // 수정 모드일 때 전달되는 덱 정보
}

const CreateEditDeckDialog: React.FC<CreateEditDeckDialogProps> = ({
  open,
  onClose,
  onSubmit,
  deck,
}) => {
  const [title, setTitle] = useState('');
  const isEditMode = !!deck;

  useEffect(() => {
    if (open) {
      // 다이얼로그가 열릴 때, 수정 모드이면 기존 제목을, 아니면 빈 문자열로 설정
      setTitle(isEditMode && deck ? deck.deckName : '');
    }
  }, [open, deck, isEditMode]);

  const handleConfirm = () => {
    if (title.trim()) {
      onSubmit(title.trim());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleConfirm();
    }
  };
  
  // 키보드 단축키 (ESC로 닫기)
  useDialogKeyboardShortcuts(handleConfirm, onClose, { enabled: open });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? '덱 이름 수정' : '새 덱 만들기'}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {isEditMode
            ? '덱의 새로운 이름을 입력하세요.'
            : '새로운 덱의 이름을 입력하세요. 덱을 만들어 학습을 시작해보세요!'}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="덱 이름"
          type="text"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 제1장 컴퓨터의 이해"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!title.trim()}>
          {isEditMode ? '수정' : '생성'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateEditDeckDialog; 