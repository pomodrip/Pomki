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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterListIcon,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import FlashCard from '../../components/ui/FlashCard';
import BottomNav from '../../components/common/BottomNav';

// 예시 데이터 - FlashcardDeckListPage와 동일한 구조로 변경
const flashCards = [
  {
    id: 1,
    front: 'React란 무엇인가?',
    back: 'Facebook에서 개발한 JavaScript 라이브러리',
    tags: ['React', '컴포넌트', 'Frontend'],
  },
  {
    id: 2,
    front: 'JSX란?',
    back: 'JavaScript XML의 줄임말로 React에서 사용하는 문법',
    tags: ['React', 'JSX', 'Frontend'],
  },
  {
    id: 3,
    front: 'React 컴포넌트란?',
    back: '사용자 인터페이스를 구성하는 독립적이고 재사용 가능한 코드 블록',
    tags: ['React', '컴포넌트', 'Frontend'],
  },
  {
    id: 4,
    front: 'Props란 무엇인가?',
    back: '부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법',
    tags: ['React', 'Props', 'Frontend'],
  },
  {
    id: 5,
    front: 'State란?',
    back: '컴포넌트 내부에서 관리되는 동적인 데이터',
    tags: ['React', 'State', 'Frontend'],
  },
];

const FlashCardListPage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  // const [showTagsFilter, setShowTagsFilter] = useState(false);
  // const [showBookmarkedFilter, setShowBookmarkedFilter] = useState(false);
  
  // FlashcardDeckListPage와 동일한 필터링 상태 추가
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);
  const [cardBookmarks, setCardBookmarks] = useState<{[key: number]: boolean}>({
    1: false,
    2: true,
    3: false,
    4: true,
    5: false,
  });

  // 모든 태그 목록 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashCards.forEach((card) => {
      card.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, []);

  // 필터링된 카드 목록
  const filteredCards = useMemo(() => {
    return flashCards.filter((card) => {
      const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.back.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some((tag: string) => card.tags.includes(tag));
      
      const matchesBookmark = !showBookmarked || cardBookmarks[card.id];

      return matchesSearch && matchesTags && matchesBookmark;
    });
  }, [searchQuery, selectedTags, showBookmarked, cardBookmarks]);

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

  return (
    <Box sx={{ pb: '64px', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ px: 2 }}>
        {/* 헤더 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              React 이해도
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
        </Box>

        {/* 필터 버튼들 - FlashcardDeckListPage와 동일한 스타일로 변경 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
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
            모든 카드
          </MenuItem>
          <MenuItem onClick={() => handleBookmarkFilter(true)}>
            북마크된 카드만
          </MenuItem>
        </Menu>

        {/* 기존 필터 버튼들 - 주석처리
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant="outlined"
            endIcon={<ExpandMoreIcon />}
            onClick={() => setShowTagsFilter(!showTagsFilter)}
            sx={{ borderRadius: 2 }}
          >
            Tags
          </Button>
          
          <Button
            variant="outlined"
            endIcon={<ExpandMoreIcon />}
            onClick={() => setShowBookmarkedFilter(!showBookmarkedFilter)}
            sx={{ borderRadius: 2 }}
          >
            Bookmarked
          </Button>
        </Box>
        */}

        {/* 카드 리스트 */}
        <Stack spacing={0}>
          {filteredCards.map((card) => (
            <FlashCard
              key={card.id}
              id={card.id}
              title={card.front}
              content=""
              tags={card.tags}
              isSelected={selectedCards.includes(card.id)}
              isBookmarked={cardBookmarks[card.id]}
              onSelect={handleCardSelect}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
              onToggleBookmark={handleToggleBookmark}
            />
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
              첫 번째 카드를 만들어보세요!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddCard}
            >
              카드 만들기
            </Button>
          </Box>
        )}
      </Container>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </Box>
  );
};

export default FlashCardListPage;
