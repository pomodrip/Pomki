import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useNotifications } from '../../hooks/useUI';
import {
  fetchDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  clearError,
} from '../../store/slices/deckSlice';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const DeckCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const DeckManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { decks, loading, error } = useAppSelector((state) => state.deck);
  const { user } = useAppSelector((state) => state.auth);
  
  // 다이얼로그 상태
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  
  // 🔔 Redux 기반 알림 시스템
  const { error: notifyError, success: notifySuccess } = useNotifications();

  // 🎯 컴포넌트 마운트 시 덱 목록 로드 
  useEffect(() => {
    if (user?.memberId) {
      dispatch(fetchDecks());
    }
  }, [dispatch, user?.memberId]);

  // 에러가 발생하면 알림 표시
  useEffect(() => {
    if (error) {
      notifyError('오류 발생', error);
      dispatch(clearError());
    }
  }, [error, notifyError, dispatch]);

  // 🎨 환경 모드 표시 (개발용)
  const mockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  // 덱 생성 다이얼로그 열기
  const handleCreateDeck = () => {
    setIsEditing(false);
    setDeckName('');
    setOpenDialog(true);
  };

  // 덱 수정 다이얼로그 열기
  const handleEditDeck = (deckId: string, currentName: string) => {
    setIsEditing(true);
    setEditingDeckId(deckId);
    setDeckName(currentName);
    setOpenDialog(true);
  };

  // 덱 삭제
  const handleDeleteDeck = async (deckId: string, deckName: string) => {
    if (window.confirm(`"${deckName}" 덱을 정말 삭제하시겠습니까?`)) {
      try {
        await dispatch(deleteDeck(deckId)).unwrap();
        notifySuccess('삭제 완료', `"${deckName}" 덱이 삭제되었습니다.`);
      } catch {
        // 에러는 useEffect에서 처리됨
      }
    }
  };

  // 다이얼로그 확인
  const handleDialogConfirm = async () => {
    if (!deckName.trim()) {
      notifyError('입력 오류', '덱 이름을 입력해주세요.');
      return;
    }

    try {
      if (isEditing && editingDeckId) {
        await dispatch(updateDeck({
          deckId: editingDeckId,
          data: { deckName: deckName.trim() }
        })).unwrap();
        notifySuccess('수정 완료', `"${deckName.trim()}" 덱이 수정되었습니다.`);
      } else {
        await dispatch(createDeck({ deckName: deckName.trim() })).unwrap();
        notifySuccess('생성 완료', `"${deckName.trim()}" 덱이 생성되었습니다.`);
      }

      setOpenDialog(false);
      setDeckName('');
      setEditingDeckId(null);
    } catch {
      // 에러는 useEffect에서 처리됨
    }
  };

  // 다이얼로그 취소
  const handleDialogCancel = () => {
    setOpenDialog(false);
    setDeckName('');
    setEditingDeckId(null);
  };

  return (
          <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            덱 관리
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={mockMode ? "🎭 Mock 모드" : "🌐 Real API 모드"} 
              color={mockMode ? "warning" : "success"}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              총 {decks.length}개의 덱
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDeck}
          disabled={loading}
        >
          새 덱 만들기
        </Button>
      </HeaderBox>

      {/* 로딩 표시 */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* 덱 목록 */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}
      >
        {decks.map((deck) => (
          <DeckCard key={deck.deckId}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                {deck.deckName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                카드 수: {deck.cardCnt}개
              </Typography>
              <Typography variant="caption" color="text.secondary">
                생성일: {new Date(deck.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            
            <CardActions>
              <Button 
                size="small" 
                startIcon={<PlayIcon />}
                color="primary"
              >
                학습하기
              </Button>
              <Button 
                size="small" 
                startIcon={<EditIcon />}
                onClick={() => handleEditDeck(deck.deckId, deck.deckName)}
              >
                수정
              </Button>
              <Button 
                size="small" 
                startIcon={<DeleteIcon />}
                color="error"
                onClick={() => handleDeleteDeck(deck.deckId, deck.deckName)}
              >
                삭제
              </Button>
            </CardActions>
          </DeckCard>
        ))}
      </Box>

      {/* 덱이 없을 때 */}
      {!loading && decks.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            아직 덱이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            새로운 덱을 만들어서 학습을 시작해보세요!
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateDeck}
            sx={{ mt: 2 }}
          >
            첫 번째 덱 만들기
          </Button>
        </Box>
      )}

      {/* 덱 생성/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleDialogCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? '덱 수정' : '새 덱 만들기'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="덱 이름"
            fullWidth
            variant="outlined"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="예: React 기초 개념"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>취소</Button>
          <Button 
            onClick={handleDialogConfirm} 
            variant="contained"
            disabled={!deckName.trim()}
          >
            {isEditing ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>


    </StyledContainer>
  );
};

export default DeckManagementPage; 