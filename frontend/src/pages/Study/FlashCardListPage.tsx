import React, { useState, useMemo, useEffect } from 'react';
import { styled, alpha } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  IconButton, 
  InputAdornment,
  Container,
  Menu,
  MenuItem,
  Checkbox,
  Chip,
  Button,
  TextField,
  Card,
  CardContent,
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
import { setFilters } from '../../store/slices/studySlice'; 
import { 
  fetchCardsInDeck, 
  updateCard, 
  deleteCard, 
  setCurrentDeck 
} from '../../store/slices/deckSlice';

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

const FlashCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
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

const ActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FlashCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const dispatch = useAppDispatch();
  
  // 🎯 기존 구조 유지: studySlice에서 필터만 가져오기
  const { filters } = useAppSelector((state) => state.study);
  
  // 🎯 새로운 덱 시스템에서 실제 데이터 가져오기
  const { decks, currentDeckCards, loading } = useAppSelector((state) => state.deck);
  
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
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
  
  // 수정 다이얼로그 상태
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editCardFront, setEditCardFront] = useState('');
  const [editCardBack, setEditCardBack] = useState('');
  const [editCardTags, setEditCardTags] = useState('');

  // 🎯 Mock 덱 데이터 (기존 구조 유지하면서 새로운 API 데이터와 병합)
  const mockDecks: FlashcardDeck[] = useMemo(() => {
    // 새로운 API에서 가져온 덱 정보를 기존 구조로 변환
    return decks.map(deck => ({
      id: parseInt(deck.deckId.replace('deck-uuid-', '')), // deckId를 숫자로 변환
      category: '학습',
      title: deck.deckName,
      isBookmarked: Math.random() > 0.5, // Mock 데이터
      tags: [`#${deck.deckName.split(' ')[0]}`, '#학습'], // Mock 태그
      flashcards: currentDeckCards
        .filter(card => card.deckId === deck.deckId)
        .map(card => ({
          id: card.cardId,
          front: card.content, // content -> front 변환
          back: card.answer,   // answer -> back 변환
          tags: [`#카드${card.cardId}`, '#학습'], // Mock 태그
        }))
    }));
  }, [decks, currentDeckCards]);

  // 🎯 현재 덱 찾기 (기존 로직 유지)
  const currentDeck = useMemo(() => {
    return mockDecks.find(deck => deck.id === parseInt(deckId || '0'));
  }, [mockDecks, deckId]);

  // 🎯 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    if (deckId) {
      // 실제 덱 ID 형식으로 변환 (숫자 -> UUID 형식)
      const realDeckId = `deck-uuid-${deckId}`;
      dispatch(setCurrentDeck(realDeckId));
      dispatch(fetchCardsInDeck(realDeckId));
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

  const handleCardSelect = (id: number, selected: boolean) => {
    if (selected) {
      setSelectedCards([...selectedCards, id]);
    } else {
      setSelectedCards(selectedCards.filter(cardId => cardId !== id));
    }
  };

  const handleEditCard = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const card = flashCards.find(c => c.id === id);
    if (card) {
      setEditingCardId(id);
      setEditCardFront(card.front);
      setEditCardBack(card.back);
      setEditCardTags(card.tags.join(', '));
      setShowEditDialog(true);
    }
  };

  const handleDeleteCard = (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = window.confirm('이 카드를 정말 삭제하시겠습니까?');
    if (confirmed) {
      // 🎯 새로운 API 호출 (실제 cardId 사용) - string으로 변환
      dispatch(deleteCard(id.toString()));
    }
  };

  const handleToggleBookmark = (cardId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setCardBookmarks(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
    setEditingCardId(null);
    setEditCardFront('');
    setEditCardBack('');
    setEditCardTags('');
  };

  const handleEditDialogConfirm = () => {
    const confirmed = window.confirm('플래시카드를 정말 수정하시겠습니까?');
    if (confirmed && editCardFront.trim() && editCardBack.trim() && editingCardId !== null) {
      // 🎯 새로운 API 형식으로 업데이트 - string으로 변환
      dispatch(updateCard({ 
        cardId: editingCardId.toString(), 
        data: { 
          content: editCardFront.trim(), 
          answer: editCardBack.trim() 
        } 
      }));
      
      handleEditDialogClose();
    }
  };

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

      {/* 검색 */}
      <SearchBox>
        <TextField
          fullWidth
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
          variant="outlined"
          onClick={(e) => setTagMenuAnchor(e.currentTarget)}
          endIcon={<FilterListIcon />}
          sx={{
            borderRadius: 2,
            color: 'primary.main',
            borderColor: 'primary.main',
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Tags {filters.selectedTags.length > 0 && `(${filters.selectedTags.length})`}
        </Button>
        
        <Button
          variant="outlined"
          onClick={(e) => setBookmarkMenuAnchor(e.currentTarget)}
          endIcon={<FilterListIcon />}
          sx={{
            borderRadius: 2,
            color: 'primary.main',
            borderColor: 'primary.main',
            '&:hover': {
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Bookmarked
        </Button>

        {/* 선택된 태그들 표시 */}
        {filters.selectedTags.map((tag: string) => (
          <TagChip
            key={tag}
            label={tag}
            onDelete={() => handleTagSelect(tag)}
            color="primary"
            variant="filled"
          />
        ))}
      </FilterBox>

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
        <MenuItem onClick={() => handleBookmarkFilter(false)}>
          모든 카드
        </MenuItem>
        <MenuItem onClick={() => handleBookmarkFilter(true)}>
          북마크된 카드만
        </MenuItem>
      </Menu>

      {/* 로딩 상태 */}
      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <Typography>카드를 불러오는 중...</Typography>
        </Box>
      )}

      {/* 카드 리스트 */}
      {!loading && filteredCards.map((card) => (
        <FlashCard key={card.id}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              {/* 체크박스 */}
              <Checkbox
                checked={selectedCards.includes(card.id)}
                onChange={(event) => handleCardSelect(card.id, event.target.checked)}
                sx={{ mt: -1 }}
              />
              
              {/* 카드 내용 */}
              <Box sx={{ flex: 1 }}>
                {/* 제목(질문)과 북마크 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      flexGrow: 1, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                    }}
                  >
                    {card.front}
                  </Typography>
                  <IconButton
                    onClick={(event) => handleToggleBookmark(card.id, event)}
                    size="small"
                    sx={{ flexShrink: 0 }}
                  >
                    {cardBookmarks[card.id] ? <Bookmark sx={{ color: '#ff9800' }} /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
                
                {/* 태그들 */}
                {card.tags.length > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    {card.tags.slice(0, 3).map((tag: string, index: number) => (
                      <TagChip
                        key={index}
                        label={tag.length > 8 ? tag.substring(0, 8) + '...' : tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {card.tags.length > 3 && (
                      <TagChip
                        label={`+${card.tags.length - 3}`}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
                
                {/* 액션 버튼들 */}
                <ActionBox>
                  <ActionButton
                    onClick={(event) => handleEditCard(card.id, event)}
                    startIcon={<EditIcon fontSize="small" />}
                  >
                    수정
                  </ActionButton>
                  <ActionButton
                    onClick={(event) => handleDeleteCard(card.id, event)}
                    startIcon={<DeleteIcon fontSize="small" />}
                  >
                    삭제
                  </ActionButton>
                </ActionBox>
              </Box>
            </Box>
          </CardContent>
        </FlashCard>
      ))}

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
              태그 (쉼표로 구분)
            </Typography>
            <TextField
              fullWidth
              placeholder="예: #React, #JavaScript, #Frontend"
              value={editCardTags}
              onChange={(e) => setEditCardTags(e.target.value)}
              sx={{ mb: 1 }}
            />
            
            <Typography variant="caption" color="text.secondary">
              태그는 쉼표(,)로 구분하여 입력하세요
            </Typography>
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
