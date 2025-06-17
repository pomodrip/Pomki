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

// 예시 데이터
const decks = [
  {
    id: 1,
    category: '코딩',
    title: 'React 이해도',
    description: 'React는 Facebook에서 개발한 JavaScript 라이브러리...',
    cardCount: 2,
    isBookmarked: true,
    tags: ['코딩', 'Frontend'],
  },
  {
    id: 2,
    category: '회계',
    title: '손익계산서',
    description: '정의: 일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표...',
    cardCount: 12,
    isBookmarked: false,
    tags: ['회계', '재무'],
  },
  {
    id: 3,
    category: '정보처리기사',
    title: '1.시스템 개발 생명주기(SDLC)',
    description: '암기 팁: 써-분-설-구-테-유 (계분설구테유)...',
    cardCount: 9,
    isBookmarked: true,
    tags: ['정보처리기사', '자격증'],
  },
];

const FlashcardDeckListPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
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

  // 필터링된 덱 목록
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch = deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           deck.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some((tag: string) => deck.tags.includes(tag));
      
      const matchesBookmark = !showBookmarked || deck.isBookmarked;

      return matchesSearch && matchesTags && matchesBookmark;
    });
  }, [searchQuery, selectedTags, showBookmarked]);

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
    navigate(`/flashcards/${deckId}`);
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
    navigate(`/flashcards/${deckId}/study`);
  };

  const handleToggleBookmark = (deckId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Toggle bookmark for deck:', deckId);
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

        {/* 덱 목록 */}
        {filteredDecks.map((deck) => (
          <DeckCard key={deck.id} onClick={() => handleDeckClick(deck.id)}>
            <CardContent>
              {/* 태그와 북마크 */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Stack direction="row" spacing={0.5}>
                  {deck.tags.map((tag: string) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                <IconButton
                  size="small"
                  onClick={(e) => handleToggleBookmark(deck.id, e)}
                >
                  {deck.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                </IconButton>
              </Box>

              {/* 제목 */}
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {deck.title}
              </Typography>

              {/* 내용 미리보기 */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: 1
                }}
              >
                {deck.description}
              </Typography>

              {/* 카드 개수 */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {deck.cardCount} cards
              </Typography>

              {/* 액션 버튼들 */}
              <ActionBox>
                <ActionButton
                  onClick={(e) => handleEditDeck(deck.id, e)}
                  startIcon={<span>✏️</span>}
                >
                  수정
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleDeleteDeck(deck.id, e)}
                  startIcon={<span>🗑️</span>}
                >
                  삭제
                </ActionButton>
                <ActionButton
                  onClick={(e) => handleCreateQuiz(deck.id, e)}
                  startIcon={<span>📚</span>}
                >
                  학습하기
                </ActionButton>
              </ActionBox>
            </CardContent>
          </DeckCard>
        ))}

        {/* 빈 상태 */}
        {filteredDecks.length === 0 && (
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