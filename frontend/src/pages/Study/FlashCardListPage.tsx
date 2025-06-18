import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  InputAdornment,
  Button,
  Stack,
  Container,
  Menu,
  MenuItem,
  Chip,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  BookmarkBorder,
  Bookmark,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Tag from '../../components/ui/Tag';
import BottomNav from '../../components/common/BottomNav';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { setFilters, toggleDeckBookmark } from '../../store/slices/studySlice';

const FlashCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const dispatch = useAppDispatch();
  const { decks, filters, deckBookmarks } = useAppSelector((state) => state.study);
  
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);
  const [cardBookmarks, setCardBookmarks] = useState<{[key: number]: boolean}>({
    1: false,
    2: true,
    3: false,
    4: true,
    5: false,
  });

  // 현재 덱 찾기
  const currentDeck = useMemo(() => {
    return decks.find(deck => deck.id === parseInt(deckId || '0'));
  }, [decks, deckId]);

  // 플래시카드 목록 (Redux에서 가져옴)
  const flashCards = useMemo(() => {
    if (!currentDeck) return [];
    return currentDeck.flashcards.map(card => ({
      ...card,
      tags: currentDeck.tags, // 덱의 태그를 카드 태그로 사용
    }));
  }, [currentDeck]);

  // 모든 태그 목록 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashCards.forEach((card) => {
      card.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [flashCards]);

  // 필터링된 카드 목록
  const filteredCards = useMemo(() => {
    return flashCards.filter((card) => {
      const matchesSearch = card.front.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           card.back.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => card.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || cardBookmarks[card.id];

      return matchesSearch && matchesTags && matchesBookmark;
    });
  }, [flashCards, filters.searchQuery, filters.selectedTags, filters.showBookmarked, cardBookmarks]);

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

  const handleEditCard = (id: number) => {
    navigate(`/flashcards/${deckId}/cards/${id}/edit`);
  };

  const handleDeleteCard = (id: number) => {
    const confirmed = window.confirm('이 카드를 정말 삭제하시겠습니까?');
    if (confirmed) {
      console.log('Delete card:', id);
    }
  };

  const handleToggleBookmark = (cardId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setCardBookmarks(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleAddCard = () => {
    navigate(`/flashcards/${deckId}/cards/create`);
  };

  // 덱이 없는 경우
  if (!currentDeck) {
    return (
      <Box sx={{ pb: '64px', minHeight: '100vh' }}>
        <Container maxWidth="md" sx={{ px: 2 }}>
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
        </Container>
        <BottomNav />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: '64px', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ px: 2 }}>
        {/* 헤더 - 화살표 제거 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              {currentDeck.title}
            </Typography>
          </Box>
          <IconButton onClick={handleAddCard}>
            <AddIcon />
          </IconButton>
        </Box>

        {/* 검색창 */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search cards"
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
        </Box>

        {/* 필터 버튼들 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
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
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagSelect(tag)}
              color="primary"
              variant="filled"
              sx={{
                fontSize: '0.75rem',
                height: 24,
                marginRight: 0.5,
              }}
            />
          ))}
        </Box>

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
            모든 카드
          </MenuItem>
          <MenuItem onClick={() => handleBookmarkFilter(true)}>
            북마크된 카드만
          </MenuItem>
        </Menu>

        {/* 카드 리스트 */}
        <Stack spacing={0}>
          {filteredCards.map((card) => (
            <Card key={card.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* 체크박스 */}
                <Checkbox
                  checked={selectedCards.includes(card.id)}
                  onChange={(event) => handleCardSelect(card.id, event.target.checked)}
                  sx={{ mt: -1 }}
                />
                
                {/* 카드 내용 */}
                <Box sx={{ flex: 1 }}>
                  {/* 태그와 북마크 */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    {card.tags.length > 0 && (
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.3, 
                        flex: 1,
                        marginRight: 1,
                        overflow: 'hidden',
                        // 작은 화면에서 태그 간격 더 줄이기
                        '@media (max-width: 600px)': {
                          gap: 0.2,
                        },
                      }}>
                        {card.tags.slice(0, 3).map((tag: string, index: number) => (
                          <Tag key={index} label={`#${tag.length > 5 ? tag.substring(0, 5) + '...' : tag}`} size="small" selected />
                        ))}
                        {card.tags.length > 3 && (
                          <Tag label={`+${card.tags.length - 3}`} size="small" />
                        )}
                      </Box>
                    )}
                    <IconButton
                      size="small"
                      onClick={(event) => handleToggleBookmark(card.id, event)}
                      sx={{ flexShrink: 0 }}
                    >
                      {cardBookmarks[card.id] ? <Bookmark sx={{ color: '#ff9800' }} /> : <BookmarkBorder />}
                    </IconButton>
                  </Box>
                  
                  {/* 제목 */}
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {card.front}
                  </Typography>
                  
                  {/* 액션 버튼들 */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Box
                      component="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditCard(card.id);
                      }}
                      sx={(theme) => ({
                        minWidth: 'auto',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0.8,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        // 작은 화면에서 더 컴팩트하게
                        [theme.breakpoints.down('sm')]: {
                          padding: '1px 4px',
                          fontSize: '0.65rem',
                          gap: 0.2,
                        },
                      })}
                    >
                      <EditIcon sx={(theme) => ({ 
                        fontSize: '0.9rem',
                        [theme.breakpoints.down('sm')]: {
                          fontSize: '0.8rem',
                        },
                      })} />
                      수정
                    </Box>
                    <Box
                      component="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteCard(card.id);
                      }}
                      sx={(theme) => ({
                        minWidth: 'auto',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                        color: 'text.secondary',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 0.8,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.3,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        // 작은 화면에서 더 컴팩트하게
                        [theme.breakpoints.down('sm')]: {
                          padding: '1px 4px',
                          fontSize: '0.65rem',
                          gap: 0.2,
                        },
                      })}
                    >
                      <DeleteIcon sx={(theme) => ({ 
                        fontSize: '0.9rem',
                        [theme.breakpoints.down('sm')]: {
                          fontSize: '0.8rem',
                        },
                      })} />
                      삭제
                    </Box>
                  </Box>
                  
                  {/* 내용 */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mt: 1,
                    }}
                  >
                    {card.back}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>

        {/* 빈 상태 */}
        {filteredCards.length === 0 && (
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
            {!filters.searchQuery.trim() && filters.selectedTags.length === 0 && !filters.showBookmarked && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCard}
              >
                카드 만들기
              </Button>
            )}
          </Box>
        )}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </Box>
  );
};

export default FlashCardListPage;
