import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  TextField, 
  InputAdornment,
  Button,
  Stack,
  Container
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
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
  const [showTagsFilter, setShowTagsFilter] = useState(false);
  const [showBookmarkedFilter, setShowBookmarkedFilter] = useState(false);

  // 필터링된 카드 목록
  const filteredCards = useMemo(() => {
    return flashCards.filter((card) => {
      const matchesSearch = card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           card.back.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
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

        {/* 필터 버튼들 */}
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
              onSelect={handleCardSelect}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
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
