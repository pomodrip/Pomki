// =========================
// 플래시카드 덱 목록 페이지
// =========================

// 🔹 라이브러리 및 훅 import
import React, { useState, useMemo, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  BookmarkBorder,
  Bookmark,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { setFilters } from '../../store/slices/studySlice';
import { showToast } from '../../store/slices/toastSlice';
import {
  fetchDecks,
  createDeck,
  updateDeck,
  deleteDeck,
  selectSearchLoading,
  selectSearchResults,
  searchCards,
  clearSearchResults,
} from '../../store/slices/deckSlice';
import {
  adjustFabForScreenSize,
  setFabVisible,
  selectFab,
} from '../../store/slices/uiSlice';
import type { CardDeck } from '../../types/card';
import { useResponsive } from '../../hooks/useResponsive';
import { useDispatch, useSelector } from 'react-redux';
import { FlashCard, type FlashCardData } from '../../components/ui';
import { RootState } from '../../store/store';
import { PayloadAction } from '@reduxjs/toolkit';

// 🔹 스타일 컴포넌트 정의
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  maxWidth: '100%',
  '& .MuiTextField-root': {
    width: '100%',
    maxWidth: '100%',
  },
}));

const DeckCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'white',
  cursor: 'pointer',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 120,
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  marginTop: '24px',
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  '& .MuiButton-root': {
    flex: 1,
    whiteSpace: 'nowrap',
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1),
    fontSize: '0.8rem',
    '&.MuiButton-containedPrimary': {
      color: theme.palette.common.white,
    },
    '&.MuiButton-outlinedError': {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
  },
}));

const FloatingFab = styled(Fab)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: isMobile ? 'fixed' : 'absolute',
  zIndex: theme.zIndex.fab || 1201,
  right: theme.spacing(2),
  ...(isMobile
    ? { bottom: 80 }
    : { top: theme.spacing(2) }),
  boxShadow: theme.shadows[4],
}));

// =========================
// 메인 컴포넌트
// =========================
const FlashcardDeckListPage: React.FC = () => {
  const searchResults = useSelector(selectSearchResults);
  const searchLoading = useSelector(selectSearchLoading);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isMobile } = useResponsive();
  const decks = useAppSelector((state: RootState) => state.deck.decks);
  const loading = useAppSelector((state: RootState) => state.deck.loading);
  const error = useAppSelector((state: RootState) => state.deck.error);
  const totalElements = useAppSelector((state: RootState) => state.deck.totalElements);
  const filters = useAppSelector((state: RootState) => state.study.filters);
  const user = useAppSelector((state: RootState) => state.auth.user);
  const fab = useAppSelector(selectFab);
  const { bottomNavVisible } = useAppSelector((state: RootState) => state.ui);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDecks());
  }, [dispatch, user?.memberId]);

  useEffect(() => {
    dispatch(setFabVisible(true));
    dispatch(adjustFabForScreenSize({
      isMobile,
      hasBottomNav: bottomNavVisible,
    }));
    return () => {
      dispatch(setFabVisible(false));
    };
  }, [dispatch, isMobile, bottomNavVisible]);

  const combinedDecks = useMemo(() => {
    if (Array.isArray(decks)) {
      return decks;
    } else {
      console.warn('⚠️ decks가 배열이 아닙니다:', decks);
      return [];
    }
  }, [decks]);

  const filteredDecks = useMemo(() => {
    return combinedDecks.filter((deck) => {
      const matchesSearch = filters.searchQuery.trim() === '' || 
                            deck.deckName.toLowerCase().includes(filters.searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [filters, combinedDecks]);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    if (event.target.value === '') {
      dispatch(searchCards(''));
    }
  };

  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      dispatch(clearSearchResults());
      console.log("검색");
      dispatch(searchCards(searchInput));
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  const handleDeckClick = (deckId: string) => {
    let routeId = deckId;
    if (deckId.startsWith('deck_')) {
      routeId = deckId.replace('deck_', '');
    }
    else if (deckId.startsWith('deck-uuid-')) {
      routeId = deckId.replace('deck-uuid-', '');
    }
    console.log('🎯 덱 클릭:', deckId, '→ 라우팅 ID:', routeId);
    navigate(`/flashcards/${routeId}/cards`);
  };

  const handleEditDeck = (deck: CardDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditMode(true);
    setEditingDeckId(deck.deckId);
    setNewDeckTitle(deck.deckName);
    setShowCreateDialog(true);
  };

  const handleDeleteDeck = async (deck: CardDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`'${deck.deckName}' 덱을 정말 삭제하시겠습니까?`)) {
      try {
        const result = await dispatch(deleteDeck(deck.deckId));
        if (result.meta.requestStatus === 'fulfilled') {
          dispatch(fetchDecks());
          dispatch(showToast({
            message: '덱이 성공적으로 삭제되었습니다.',
            severity: 'success'
          }));
        } else {
          throw new Error('Redux 덱 삭제 실패');
        }
      } catch (error) {
        console.error('❌ Redux 덱 삭제 실패:', error);
        dispatch(showToast({
          message: '덱 삭제에 실패했습니다.',
          severity: 'error'
        }));
      }
    }
  };
  
  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
    setIsEditMode(false);
    setEditingDeckId(null);
    setNewDeckTitle('');
  };

  const handleCreateDialogConfirm = async () => {
    if (!newDeckTitle.trim()) return;
    try {
      if (isEditMode && editingDeckId) {
        await dispatch(updateDeck({ deckId: editingDeckId, data: { deckName: newDeckTitle } })).unwrap();
        dispatch(showToast({ message: '덱이 수정되었습니다.', severity: 'success' }));
      } else {
        await dispatch(createDeck({ deckName: newDeckTitle })).unwrap();
        dispatch(showToast({ message: '덱이 성공적으로 생성되었습니다.', severity: 'success' }));
      }
      handleCreateDialogClose();
    } catch (err) {
      dispatch(showToast({ message: '덱 생성에 실패했습니다.', severity: 'error' }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleCreateDialogConfirm();
    }
  };

  useDialogKeyboardShortcuts(
    handleCreateDialogConfirm,
    handleCreateDialogClose,
    {
      enabled: false
    }
  );

  // =========================
  // 렌더링
  // =========================
  return (
    <StyledContainer maxWidth="md">
      <HeaderBox>
        <Typography variant="h4" fontWeight="bold">
          나의 덱
        </Typography>
      </HeaderBox>
      {fab.visible && (
        <FloatingFab
          color="primary"
          aria-label="덱 생성"
          isMobile={isMobile}
          onClick={() => setShowCreateDialog(true)}
          size={fab.size}
          disabled={fab.disabled}
        >
          <AddIcon />
        </FloatingFab>
      )}
      <SearchBox>
        <TextField
          variant="outlined"
          placeholder="카드 이름으로 검색하고 엔터를 누르세요..."
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchSubmit}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {(searchInput || filters.searchQuery) && (
                  <IconButton onClick={handleClearSearch} size="small" aria-label="검색 초기화">
                    <ClearIcon />
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Typography color="error" align="center" py={5}>오류: {error}</Typography>}
      
      {!loading && !error && searchInput && searchResults.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            검색 결과 ({searchResults.length}개 카드)
          </Typography>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)' 
              }, 
              gap: 2,
              mb: 4,
              alignItems: 'stretch'
            }}
          >
            {searchResults.map((result) => {
              const cardData: FlashCardData = {
                id: parseInt(result.cardId.toString()),
                front: result.content || '질문 없음',
                back: result.answer || '답변 없음',
                tags: [],
                deckName: result.deckName,
              };

              return (
                <FlashCard
                  key={result.cardId}
                  card={cardData}
                  isBookmarked={false}
                  showActions={false}
                  onClick={() => {
                    if (result.deckId) {
                      navigate(`/flashcards/${result.deckId}/cards`);
                    }
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {!loading && !error && (!searchInput || searchResults.length === 0) && (
        <Box>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(3, 1fr)' 
              }, 
              gap: 2 
            }}
          >
            {filteredDecks.map((deck) => (
              <DeckCard key={deck.deckId} onClick={() => handleDeckClick(deck.deckId)}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" noWrap sx={{ maxWidth: '100%' }}>{deck.deckName}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    카드 {deck.cardCnt}개
                  </Typography>
                  <Box mt={1.5} sx={{ minHeight: 24 }} />
                </CardContent>
                <ActionBox>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={(e) => handleEditDeck(deck, e)}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => handleDeleteDeck(deck, e)}
                  >
                    삭제
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SchoolIcon />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${deck.deckId}/practice`); }}
                  >
                    학습하기
                  </Button>
                </ActionBox>
              </DeckCard>
            ))}
          </Box>
        </Box>
      )}

      {!loading && !error && (!searchInput || searchResults.length === 0) && filteredDecks.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={8}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchInput ? '검색 결과가 없습니다' : '플래시카드 덱이 없습니다'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchInput ? '다른 검색어를 시도해보세요!' : '첫 번째 덱을 만들어보세요!'}
          </Typography>
          {!searchInput && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateDialog(true)}
            >
              덱 만들기
            </Button>
          )}
        </Box>
      )}
      <Dialog open={showCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? '덱 수정' : '덱 생성'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={isEditMode ? "덱 이름 수정" : "새 덱 이름"}
            type="text"
            fullWidth
            variant="outlined"
            value={newDeckTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeckTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>취소</Button>
          <Button onClick={handleCreateDialogConfirm} variant="contained" disabled={!newDeckTitle.trim()}>
            {isEditMode ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default FlashcardDeckListPage;