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

// 예시 데이터
const decks = [
  {
    id: 1,
    category: '코딩',
    title: 'React 이해도',
    // description: 'React는 Facebook에서 개발한 JavaScript 라이브러리...',
    isBookmarked: true,
    tags: ['코딩', 'Frontend'],
    flashcards: [
      { id: 1, front: 'React란 무엇인가?', back: 'Facebook에서 개발한 JavaScript 라이브러리' },
      { id: 2, front: 'JSX란?', back: 'JavaScript XML의 줄임말로 React에서 사용하는 문법' },
      { id: 3, front: 'useState란?', back: 'React에서 상태를 관리하기 위한 Hook' },
      { id: 4, front: 'useEffect란?', back: '컴포넌트의 생명주기와 부수 효과를 관리하는 Hook' },
      { id: 5, front: 'Virtual DOM이란?', back: 'React에서 실제 DOM을 추상화한 가상 DOM' }
    ]
  },
  {
    id: 2,
    category: '회계',
    title: '손익계산서',
    // description: '정의: 일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표...',
    isBookmarked: false,
    tags: ['회계', '재무'],
    flashcards: [
      { id: 6, front: '손익계산서란?', back: '일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표' },
      { id: 7, front: '매출액이란?', back: '기업이 상품이나 서비스를 판매하여 얻은 총 수입' }
    ]
  },
  {
    id: 3,
    category: '정보처리기사',
    title: '1.시스템 개발 생명주기(SDLC)',
    // description: '암기 팁: 써-분-설-구-테-유 (계분설구테유)...',
    isBookmarked: true,
    tags: ['정보처리기사', '자격증'],
    flashcards: [
      { id: 8, front: 'SDLC란?', back: '시스템 개발 생명주기(System Development Life Cycle)' },
      { id: 9, front: '요구사항 분석 단계에서 하는 일은?', back: '사용자의 요구사항을 수집하고 분석하는 단계' }
    ]
  },
];

const FlashcardDeckListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);
  const [deckBookmarks, setDeckBookmarks] = useState<{[key: number]: boolean}>({
    1: true,
    2: false,
    3: true,
  });

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
    if (searchQuery.trim()) return []; // 검색 중일 때는 덱 목록 숨김
    
    return decks.filter((deck) => {
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some((tag: string) => deck.tags.includes(tag));
      
      const matchesBookmark = !showBookmarked || deckBookmarks[deck.id];

      return matchesTags && matchesBookmark;
    });
  }, [searchQuery, selectedTags, showBookmarked, deckBookmarks]);

  // 검색된 플래시카드 목록
  const searchedCards = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const cards: any[] = [];
    decks.forEach((deck) => {
      // 태그 및 북마크 필터링도 적용
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some((tag: string) => deck.tags.includes(tag));
      const matchesBookmark = !showBookmarked || deckBookmarks[deck.id];
      
      if (matchesTags && matchesBookmark) {
        deck.flashcards.forEach((card: any) => {
          if (card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
              card.back.toLowerCase().includes(searchQuery.toLowerCase())) {
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
  }, [searchQuery, selectedTags, showBookmarked, deckBookmarks]);



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTagSelect = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t: string) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    setTagMenuAnchor(null);
  };

  const handleBookmarkFilter = (showBookmarkedValue: boolean) => {
    setShowBookmarked(showBookmarkedValue);
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
    setDeckBookmarks(prev => ({
      ...prev,
      [deckId]: !prev[deckId]
    }));
  };

  return (
    <Box sx={{ pb: '64px', minHeight: '100vh' }}>
      <StyledContainer maxWidth="md">
        {/* 헤더 */}
        <HeaderBox>
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
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
            value={searchQuery}
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
            Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
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
          {selectedTags.map((tag: string) => (
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
              selected={selectedTags.includes(tag)}
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
        {!searchQuery.trim() && filteredDecks.map((deck) => (
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
                  {deckBookmarks[deck.id] ? <Bookmark color="primary" /> : <BookmarkBorder />}
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
        {searchQuery.trim() && searchedCards.map((card) => (
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
                  {deckBookmarks[card.deckId] ? <Bookmark color="primary" /> : <BookmarkBorder />}
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
        {!searchQuery.trim() && filteredDecks.length === 0 && (
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
        {searchQuery.trim() && searchedCards.length === 0 && (
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