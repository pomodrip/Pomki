import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Stack,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  BookmarkBorder,
  Bookmark,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setFilters, toggleDeckBookmark } from '../../store/slices/studySlice';

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

const DeckCard = styled(Card)(({ theme }) => ({
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
  // Z Fold 5와 같은 작은 화면에서 태그 크기 조정
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.65rem',
    height: 20,
    marginRight: theme.spacing(0.3),
    '& .MuiChip-label': {
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
    },
  },
}));

const ActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  //액션버튼들 사이 간격
  gap: theme.spacing(3),
  marginTop: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(0.3, 0.6),
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.8),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(0.3),
    fontSize: '0.9rem',
  },
  // 작은 화면에서 더 컴팩트하게
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.2, 0.4),
    fontSize: '0.65rem',
    '& .MuiButton-startIcon': {
      marginRight: theme.spacing(0.2),
      fontSize: '0.8rem',
    },
  },
}));



const FlashcardDeckListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { decks, filters, deckBookmarks } = useAppSelector((state) => state.study);
  
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  // 모든 태그 목록 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    decks.forEach((deck) => {
      deck.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);

  // 필터링된 덱 목록 (검색어가 없을 때만 사용)
  const filteredDecks = useMemo(() => {
    if (filters.searchQuery.trim()) return []; // 검색 중일 때는 덱 목록 숨김
    
    return decks.filter((deck) => {
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => deck.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || deckBookmarks[deck.id];

      return matchesTags && matchesBookmark;
    });
  }, [filters.searchQuery, filters.selectedTags, filters.showBookmarked, deckBookmarks, decks]);

  // 검색된 플래시카드 목록
  const searchedCards = useMemo(() => {
    if (!filters.searchQuery.trim()) return [];
    
    const cards: any[] = [];
    decks.forEach((deck) => {
      // 태그 및 북마크 필터링도 적용
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => deck.tags.includes(tag));
      const matchesBookmark = !filters.showBookmarked || deckBookmarks[deck.id];
      
      if (matchesTags && matchesBookmark) {
        deck.flashcards.forEach((card: any) => {
          if (card.front.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
              card.back.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
            cards.push({
              ...card,
              deckId: deck.id,
              deckTitle: deck.title,
              deckTags: deck.tags
            });
          }
        });
      }
    });
    
    return cards;
  }, [filters.searchQuery, filters.selectedTags, filters.showBookmarked, deckBookmarks, decks]);



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

  const handleDeckClick = (deckId: number) => {
    navigate(`/flashcards/${deckId}/cards`);
  };

  const handleEditDeck = (deckId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/flashcards/${deckId}/edit`);
  };

  const handleDeleteDeck = async (deckId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = window.confirm('이 덱을 정말 삭제하시겠습니까?');

    if (confirmed) {
      console.log('Delete deck:', deckId);
    }
  };

  const handleCreateQuiz = (deckId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/flashcards/${deckId}/practice`);
  };

  const handleToggleBookmark = (deckId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(toggleDeckBookmark(deckId));
  };

  return (
    <Box sx={{ pb: '64px', minHeight: '100vh' }}>
      <StyledContainer maxWidth="md">
        {/* 헤더 */}
        <HeaderBox>
          <Box display="flex" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Flash Deck
            </Typography>
          </Box>
          <IconButton onClick={() => navigate('/flashcards/create')}>
            <AddIcon />
          </IconButton>
        </HeaderBox>

        {/* 검색창 */}
        <SearchBox>
          <TextField
            fullWidth
            placeholder="Search flashcards"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderRadius: 2,
              },
            }}
          />
        </SearchBox>

        {/* 필터 버튼들 */}
        <FilterBox>
          <Button
            variant="outlined"
            onClick={(e) => setTagMenuAnchor(e.currentTarget)}
            endIcon={<FilterListIcon />}
            sx={{ borderRadius: 2 }}
          >
            Tags {filters.selectedTags.length > 0 && `(${filters.selectedTags.length})`}
          </Button>
          
          <Button
            variant="outlined"
            onClick={(e) => setBookmarkMenuAnchor(e.currentTarget)}
            endIcon={<FilterListIcon />}
            sx={{ borderRadius: 2 }}
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
          {allTags.map((tag: string) => (
            <MenuItem 
              key={tag} 
              onClick={() => handleTagSelect(tag)}
              selected={filters.selectedTags.includes(tag)}
            >
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
            모든 덱
          </MenuItem>
          <MenuItem onClick={() => handleBookmarkFilter(true)}>
            북마크된 덱만
          </MenuItem>
        </Menu>

        {/* 덱 목록 (검색어가 없을 때) */}
        {!filters.searchQuery.trim() && filteredDecks.map((deck) => (
          <DeckCard key={deck.id} onClick={() => handleDeckClick(deck.id)}>
            <CardContent>
              {/* 태그와 북마크 */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 0.5,
                    flex: 1,
                    marginRight: 1,
                    overflow: 'hidden'
                  }}
                >
                  {deck.tags.slice(0, 3).map((tag: string) => (
                    <TagChip
                      key={tag}
                      label={`#${tag.length > 5 ? tag.substring(0, 5) + '...' : tag}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {deck.tags.length > 3 && (
                    <TagChip
                      label={`+${deck.tags.length - 3}`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleToggleBookmark(deck.id, e)}
                  sx={{ flexShrink: 0 }}
                >
                  {deckBookmarks[deck.id] ? <Bookmark sx={{ color: '#ff9800' }} /> : <BookmarkBorder />}
                </IconButton>
              </Box>
              
              {/* 제목 */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {deck.title}
              </Typography>

              {/* 카드 개수 */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {deck.flashcards.length} cards
              </Typography>

              {/* 액션 버튼들 */}
              <ActionBox>
                <ActionButton
                  onClick={(e) => handleEditDeck(deck.id, e)}
                  startIcon={<EditIcon fontSize="small" />}
                >
                  수정
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleDeleteDeck(deck.id, e)}
                  startIcon={<DeleteIcon fontSize="small" />}
                >
                  삭제
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleCreateQuiz(deck.id, e)}
                  startIcon={<QuizIcon fontSize="small" />}
                >
                  학습하기
                </ActionButton>
              </ActionBox>
            </CardContent>
          </DeckCard>
        ))}

        {/* 검색된 플래시카드 목록 */}
        {filters.searchQuery.trim() && searchedCards.map((card) => (
          <DeckCard key={`${card.deckId}-${card.id}`} onClick={() => handleDeckClick(card.deckId)}>
            <CardContent>
              {/* 덱 정보 */}
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  from: {card.deckTitle}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => handleToggleBookmark(card.deckId, e)}
                >
                  {deckBookmarks[card.deckId] ? <Bookmark sx={{ color: '#ff9800' }} /> : <BookmarkBorder />}
                </IconButton>
              </Box>

              {/* 플래시카드 내용 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  질문:
                </Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ mb: 2 }}>
                  {card.front}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  답변:
                </Typography>
                <Typography variant="body1">
                  {card.back}
                </Typography>
              </Box>

              {/* 태그들 */}
              <Box mt={2}>
                <Box sx={{ display: 'flex', gap: 0.5, overflow: 'hidden' }}>
                  {card.deckTags.slice(0, 3).map((tag: string) => (
                    <TagChip
                      key={tag}
                      label={`#${tag.length > 5 ? tag.substring(0, 5) + '...' : tag}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {card.deckTags.length > 3 && (
                    <TagChip
                      label={`+${card.deckTags.length - 3}`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </DeckCard>
        ))}

        {/* 빈 상태 */}
        {!filters.searchQuery.trim() && filteredDecks.length === 0 && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={8}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              플래시카드 덱이 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              첫 번째 덱을 만들어보세요!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/flashcards/create')}
            >
              덱 만들기
            </Button>
          </Box>
        )}

        {/* 검색 결과 없음 */}
        {filters.searchQuery.trim() && searchedCards.length === 0 && (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={8}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              다른 키워드로 검색해보세요.
            </Typography>
          </Box>
        )}

        {/* 플로팅 액션 버튼 */}
        <Fab
          color="primary"
          aria-label="add deck"
          onClick={() => navigate('/flashcards/create')}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
      </StyledContainer>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </Box>
  );
};

export default FlashcardDeckListPage;