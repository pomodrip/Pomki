import React, { useState, useMemo, useEffect } from 'react';
import { styled } from '@mui/material/styles'; // alpha
import { 
  Box, 
  Typography, 
  IconButton, 
  InputAdornment,
  Container,
  Menu,
  MenuItem,
  Chip,
  Button,
  TextField,
  Card as MuiCard,
  CardContent,
  // CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  BookmarkBorder,
  Bookmark,
  Edit as EditIcon,
  Delete as DeleteIcon,
  //ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { setFilters } from '../../store/slices/studySlice'; 
import { 
  fetchCardsInDeck, 
  updateCard, 
  deleteCard, 
  setCurrentDeck 
} from '../../store/slices/deckSlice';
import { deckApiWithFallback } from '../../api/apiWithFallback';
import type { Card } from '../../types/card';
import { showToast } from '../../store/slices/toastSlice';

// 🎯 기존 구조 유지: Flashcard 인터페이스 (원본과 동일)
interface Flashcard {
  id: number;
  front: string;
  back: string;
  tags?: string[];
}

// 🎯 기존 구조 유지: FlashcardDeck 인터페이스 (원본과 동일)
interface FlashcardDeck {
  id: number;
  category: string;
  title: string;
  isBookmarked: boolean;
  tags: string[];
  flashcards: Flashcard[];
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const FlashCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  // minHeight: 150,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));



const ActionButton = styled(Button)({
  whiteSpace: 'nowrap',
});

const SelectedTagsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  minHeight: theme.spacing(4),
  flexWrap: 'wrap',
}));

const FlashCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const dispatch = useAppDispatch();
  
  // 🎯 기존 구조 유지: studySlice에서 필터만 가져오기
  const { filters } = useAppSelector((state) => state.study);
  
  // 🎯 새로운 덱 시스템에서 실제 데이터 가져오기
  const { currentDeckCards, loading } = useAppSelector((state) => state.deck);
  
  // 🎯 API Fallback을 위한 상태
  const [fallbackCards, setFallbackCards] = useState<Card[]>([]);
  
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);
  const [cardBookmarks, setCardBookmarks] = useState<{[key: number]: boolean}>({
    1: false,
    2: true,
    3: false,
    4: true,
    5: false,
    6: true,
    7: false,
    8: true,
    9: false,
  });
  
  // 카드별 사용자 정의 태그 저장
  const [customCardTags, setCustomCardTags] = useState<{[key: number]: string[]}>({});
  
  // 수정 다이얼로그 상태
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [editCardTags, setEditCardTags] = useState('');

  // 🎯 Redux 데이터와 Fallback 데이터를 합치기 (중복 제거)
  const allCards = useMemo(() => {
    const combinedCards = new Map<string, Card>();
    
    // 1. Redux에서 가져온 카드들 추가
    currentDeckCards.forEach(card => {
      combinedCards.set(card.cardId.toString(), card);
    });
    
    // 2. Fallback 카드들 추가 (중복 아닌 것만)
    fallbackCards.forEach(card => {
      if (!combinedCards.has(card.cardId.toString())) {
        combinedCards.set(card.cardId.toString(), card);
      }
    });
    
    return Array.from(combinedCards.values());
  }, [currentDeckCards, fallbackCards]);

  // 🎯 현재 덱에 해당하는 카드들만 필터링
  const currentDeckTitle = useMemo(() => {
    const targetDeckId = `deck_${deckId}`;
    
    // 덱 이름 매핑
    const deckTitles: { [key: string]: string } = {
      'deck_1': '영어 단어장',
      'deck_2': '일본어 단어장', 
      'deck_3': '프로그래밍 용어'
    };
    
    return deckTitles[targetDeckId] || `덱 ${deckId}`;
  }, [deckId]);

  // 🎯 Mock 덱 데이터 (기존 구조 유지하면서 새로운 API 데이터와 병합)
  const mockDecks: FlashcardDeck[] = useMemo(() => {
    if (!deckId || allCards.length === 0) return [];
    
    return [{
      id: parseInt(deckId),
      category: '학습',
      title: currentDeckTitle,
      isBookmarked: false,
      tags: [`#${currentDeckTitle.split(' ')[0]}`, '#학습'],
      flashcards: allCards
        .filter(card => card.deckId === `deck_${deckId}`)
        .map(card => {
          const cardId = parseInt(card.cardId.toString());
          return {
            id: cardId,
            front: card.content || 'No content',
            back: card.answer || 'No answer',
            tags: customCardTags[cardId] || [`#카드${card.cardId}`, '#학습'],
          };
        })
    }];
  }, [deckId, allCards, currentDeckTitle, customCardTags]);

  // 🎯 현재 덱 찾기 (기존 로직 유지)
  const currentDeck = useMemo(() => {
    return mockDecks.find(deck => deck.id === parseInt(deckId || '0'));
  }, [mockDecks, deckId]);

  // 🎯 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    if (deckId) {
      // Redux를 통한 기존 로드
      const realDeckId = `deck_${deckId}`;
      dispatch(setCurrentDeck(realDeckId));
      dispatch(fetchCardsInDeck(realDeckId));
      
      // API Fallback으로 카드 데이터 로드
      const loadCardsWithFallback = async () => {
        try {
          const fallbackData = await deckApiWithFallback.getCardsInDeck(realDeckId);
          setFallbackCards(fallbackData);
          console.log('✅ FlashCardListPage API Fallback으로 카드 목록 로드:', fallbackData);
        } catch (error) {
          console.error('❌ FlashCardListPage API Fallback 카드 로드 실패:', error);
        }
      };

      loadCardsWithFallback();
    }
  }, [dispatch, deckId]);

  // 🎯 플래시카드 목록 (기존 로직 유지)
  const flashCards = useMemo(() => {
    if (!currentDeck) return [];
    return currentDeck.flashcards.map(card => ({
      ...card,
      tags: card.tags ?? [], // 카드의 개별 태그 사용, 없으면 빈 배열
    }));
  }, [currentDeck]);

  // 모든 태그 목록 추출 (기존 로직 유지)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashCards.forEach((card) => {
      card.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [flashCards]);

  // 필터링된 카드 목록 (기존 로직 유지)
  const filteredCards = useMemo(() => {
    return flashCards.filter((card) => {
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => card.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || cardBookmarks[card.id];

      const matchesSearch = filters.searchQuery.trim() === '' || 
                            card.front.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                            card.back.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return matchesTags && matchesBookmark && matchesSearch;
    });
  }, [filters, flashCards, cardBookmarks]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ searchQuery: event.target.value }));
  };

  const handleTagSelect = (tag: string) => {
    const newSelectedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t: string) => t !== tag)
      : [...filters.selectedTags, tag];
    
    dispatch(setFilters({ selectedTags: newSelectedTags }));
    setTagMenuAnchor(null);
  };

  const handleBookmarkFilter = (showBookmarkedValue: boolean) => {
    dispatch(setFilters({ showBookmarked: showBookmarkedValue }));
    setBookmarkMenuAnchor(null);
  };

  // 카드 선택 기능 (현재 사용하지 않음)
  // const handleCardSelect = (id: number, selected: boolean) => {
  //   if (selected) {
  //     setSelectedCards([...selectedCards, id]);
  //   } else {
  //     setSelectedCards(selectedCards.filter(cardId => cardId !== id));
  //   }
  // };

  const handleEditCard = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const card = flashCards.find(c => c.id === id);
    if (card) {
      setEditingCardId(id);
      setEditCardFront(card.front);
      setEditCardBack(card.back);
      // 기존 태그에서 # 제거하여 표시 (사용자 입력 형태로)
      setEditCardTags(card.tags.map(tag => tag.startsWith('#') ? tag.slice(1) : tag).join(', '));
      setShowEditDialog(true);
    }
  };

  const handleDeleteCard = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = window.confirm('이 카드를 정말 삭제하시겠습니까?');
    if (confirmed) {
      // 먼저 fallback 카드에서 해당 카드를 찾아 삭제 (타입 안전하게 비교)
      const fallbackCardIndex = fallbackCards.findIndex(card => Number(card.cardId) === Number(id));
      if (fallbackCardIndex !== -1) {
        // fallback 카드에서 삭제
        setFallbackCards(prev => prev.filter(card => Number(card.cardId) !== Number(id)));
        
        // 해당 카드의 사용자 정의 태그도 삭제
        setCustomCardTags(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        
        dispatch(showToast({
          message: '카드가 성공적으로 삭제되었습니다.',
          severity: 'success'
        }));
      } else {
        // Redux 카드 삭제 시도
        try {
          const result = await dispatch(deleteCard(id.toString()));
          if (result.meta.requestStatus === 'fulfilled') {
            // Redux 삭제 성공 시에도 사용자 정의 태그 삭제
            setCustomCardTags(prev => {
              const updated = { ...prev };
              delete updated[id];
              return updated;
            });
            
            dispatch(showToast({
              message: '카드가 성공적으로 삭제되었습니다.',
              severity: 'success'
            }));
          } else {
            throw new Error('Redux 카드 삭제 실패');
          }
        } catch (error) {
          console.error('카드 삭제 실패:', error);
          dispatch(showToast({
            message: '카드 삭제에 실패했습니다.',
            severity: 'error'
          }));
        }
      }
    }
  };

  const handleToggleBookmark = async (cardId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // 클라이언트 상태 즉시 업데이트 (UI 반응성)
      const newBookmarkState = !cardBookmarks[cardId];
      setCardBookmarks(prev => ({
        ...prev,
        [cardId]: newBookmarkState
      }));
      
      // 향후 API 연동 시 서버 동기화
      // await dispatch(updateCardBookmark({ cardId, isBookmarked: newBookmarkState }));
      
      console.log(`📌 카드 ${cardId} 북마크 ${newBookmarkState ? '추가' : '제거'}`);
      
      // 성공 토스트 메시지
      dispatch(showToast({
        message: newBookmarkState ? '북마크에 추가되었습니다.' : '북마크에서 제거되었습니다.',
        severity: 'success'
      }));
      
    } catch (error) {
      // 실패 시 상태 롤백
      console.error('북마크 상태 변경 실패:', error);
      setCardBookmarks(prev => ({
        ...prev,
        [cardId]: cardBookmarks[cardId] // 원래 상태로 되돌림
      }));
      
      dispatch(showToast({
        message: '북마크 상태 변경에 실패했습니다.',
        severity: 'error'
      }));
    }
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setEditingCardId(null);
    setEditCardFront('');
    setEditCardBack('');
    setEditCardTags('');
  };

  const handleEditDialogConfirm = async () => {
    const confirmed = window.confirm('플래시카드를 정말 수정하시겠습니까?');
    if (!confirmed || !editCardFront.trim() || !editCardBack.trim() || editingCardId === null) {
      return;
    }

    try {
      console.log('🔍 수정 시도:', { editingCardId, fallbackCards: fallbackCards.map(c => ({ cardId: c.cardId, type: typeof c.cardId })) });
      
      // 태그 처리: 쉼표로 분리하고 # 자동 추가
      const processedTags = editCardTags
        .split(',')
        .map(tag => {
          const trimmed = tag.trim();
          return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
        })
        .filter(tag => tag.length > 1); // 빈 태그나 #만 있는 것 제거
      
      // 먼저 fallback 카드에서 해당 카드를 찾아 수정 (타입 안전하게 비교)
      const fallbackCardIndex = fallbackCards.findIndex(card => 
        Number(card.cardId) === Number(editingCardId)
      );
      
      if (fallbackCardIndex !== -1) {
        console.log('✅ Fallback 카드에서 찾음, 수정 진행');
        // fallback 카드 업데이트
        setFallbackCards(prev => prev.map(card => 
          Number(card.cardId) === Number(editingCardId)
            ? { 
                ...card, 
                content: editCardFront.trim(),
                answer: editCardBack.trim()
              }
            : card
        ));
        
        console.log('📝 Fallback 태그 업데이트:', processedTags);
      } else {
        console.log('⚠️ Fallback 카드에서 찾지 못함, Redux 시도');
        // Redux 카드 수정 시도
        const result = await dispatch(updateCard({ 
          cardId: editingCardId.toString(), 
          data: { 
            content: editCardFront.trim(), 
            answer: editCardBack.trim() 
          } 
        }));
        
        if (result.meta.requestStatus !== 'fulfilled') {
          throw new Error('Redux 카드 수정 실패');
        }
        
        console.log('📝 Redux 태그 업데이트:', processedTags);
      }
      
      // 성공 시 항상 태그 업데이트 (두 시스템 모두)
      setCustomCardTags(prev => ({
        ...prev,
        [editingCardId]: processedTags
      }));
      
      dispatch(showToast({
        message: '카드가 성공적으로 수정되었습니다.',
        severity: 'success'
      }));
      
    } catch (error) {
      console.error('카드 수정 실패:', error);
      dispatch(showToast({
        message: '카드 수정에 실패했습니다.',
        severity: 'error'
      }));
    } finally {
      handleEditDialogClose();
    }
  };

  // 🎯 카드 수정 다이얼로그 키보드 단축키
  useDialogKeyboardShortcuts(
    handleEditDialogConfirm,
    handleEditDialogClose,
    {
      enabled: showEditDialog
    }
  );

  // 덱이 없는 경우 (기존 로직 유지)
  if (!currentDeck) {
    return (
      <StyledContainer maxWidth="md">
        <Box
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={8}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            덱을 찾을 수 없습니다
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/flashcards')}
          >
            덱 목록으로 이동
          </Button>
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Typography variant="h5" fontWeight="bold">
          {currentDeck.title}
        </Typography>
      </HeaderBox>

      {/* API Fallback 정보 표시 */}
      {fallbackCards.length > 0 && (
        <Box
          sx={{
            bgcolor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: 1,
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="#1976d2">
            ℹ️ API Fallback이 활성화되어 Mock 데이터를 표시하고 있습니다. ({fallbackCards.length}개 카드)
          </Typography>
        </Box>
      )}

      {/* 검색 */}
      <SearchBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="카드 내용 검색..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>

      {/* 필터 */}
      <FilterBox>
        <Button
          startIcon={<FilterListIcon />}
          onClick={(e) => setTagMenuAnchor(e.currentTarget)}
        >
          태그 필터 ({filters.selectedTags.length})
        </Button>
        <Button
          startIcon={filters.showBookmarked ? <Bookmark /> : <BookmarkBorder />}
          onClick={(e) => setBookmarkMenuAnchor(e.currentTarget)}
        >
          북마크
        </Button>
      </FilterBox>

      {/* 선택된 태그들 표시 */}
      <SelectedTagsBox>
        {filters.selectedTags.map((tag: string) => (
          <Chip
            key={tag}
            label={tag}
            onDelete={() => handleTagSelect(tag)}
            size="small"
            color="primary"
            variant="filled"
          />
        ))}
      </SelectedTagsBox>

      {/* 태그 메뉴 */}
      <Menu
        anchorEl={tagMenuAnchor}
        open={Boolean(tagMenuAnchor)}
        onClose={() => setTagMenuAnchor(null)}
      >
        {allTags.map(tag => (
          <MenuItem key={tag} onClick={() => handleTagSelect(tag)}>
            {tag}
          </MenuItem>
        ))}
      </Menu>

      {/* 북마크 메뉴 */}
      <Menu
        anchorEl={bookmarkMenuAnchor}
        open={Boolean(bookmarkMenuAnchor)}
        onClose={() => setBookmarkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBookmarkFilter(true)}>북마크된 항목만 보기</MenuItem>
        <MenuItem onClick={() => handleBookmarkFilter(false)}>모든 항목 보기</MenuItem>
      </Menu>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>카드를 불러오는 중...</Typography>
        </Box>
      )}

      {/* 카드 리스트 */}
      {!loading && (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            }, 
            gap: 2,
            alignItems: 'stretch'
          }}
        >
          {filteredCards.map((card) => (
            <FlashCard key={card.id}>
              <CardContent sx={{ flexGrow: 1 }}>
                {/* 제목(질문)과 북마크 */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 32px)' }}>
                    {card.front}
                  </Typography>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleBookmark(card.id, e); }}>
                    {cardBookmarks[card.id] ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
                
                {/* 카드 정보 */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  플래시카드
                </Typography>
                
                {/* 태그들 */}
                <Box 
                  mt={1.5} 
                  sx={{ 
                    minHeight: 24,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  {card.tags.slice(0, 3).map((tag: string, index: number) => (
                    <TagChip key={index} label={tag} size="small" color="primary" variant="outlined" />
                  ))}
                  {card.tags.length > 3 && (
                    <TagChip label={`+${card.tags.length - 3}`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              </CardContent>
              
              {/* 액션 버튼들 */}
              <Box sx={{ justifyContent: 'flex-end', display: 'flex', p: 1 }}>
                <ActionButton size="small" startIcon={<EditIcon />} onClick={(e) => { e.stopPropagation(); handleEditCard(card.id, e); }}>
                  수정
                </ActionButton>
                <ActionButton size="small" startIcon={<DeleteIcon />} color="error" onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id, e); }}>
                  삭제
                </ActionButton>
              </Box>
            </FlashCard>
          ))}
        </Box>
      )}

      {/* 빈 상태 */}
      {!loading && filteredCards.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={8}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            카드가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {filters.searchQuery.trim() || filters.selectedTags.length > 0 || filters.showBookmarked
              ? '검색 조건을 변경해보세요.'
              : '첫 번째 카드를 만들어보세요!'
            }
          </Typography>
        </Box>
      )}

      {/* 카드 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>카드 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              질문 (앞면)
            </Typography>
            <TextField
              fullWidth
              placeholder="질문을 입력하세요"
              value={editCardFront}
              onChange={(e) => setEditCardFront(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              답변 (뒷면)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="답변을 입력하세요"
              value={editCardBack}
              onChange={(e) => setEditCardBack(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              태그 (쉼표로 구분, 자동으로 # 추가)
            </Typography>
            <TextField
              fullWidth
              placeholder="React, JavaScript, Frontend"
              value={editCardTags}
              onChange={(e) => setEditCardTags(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>취소</Button>
          <Button onClick={handleEditDialogConfirm} variant="contained">
            수정
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default FlashCardListPage;
