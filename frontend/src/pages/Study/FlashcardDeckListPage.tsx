import React, { useState } from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
// import BottomNav from '@/components/common/BottomNav';
import BottomNav from '../../components/common/BottomNav';
import { useTheme } from '@mui/material/styles';
import Tag from '../../components/ui/Tag';
import Select, { SelectMenuItem } from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// 예시 데이터
const decks = [
  {
    id: 1,
    category: '코딩',
    title: 'Reach 이해도',
    description: 'React는 Facebook에서 개발한 JavaScript 라이브러리...',
    cardCount: 2,
  },
  {
    id: 2,
    category: '회계',
    title: '손익계산서',
    description: '정의: 일정 기간 동안 기업의 수익과 비용을 보여주는 재무제표...',
    cardCount: 12,
  },
  {
    id: 3,
    category: '정보처리기사',
    title: '1.시스템 개발 생명주기(SDLC)',
    description: '암기 팁: 써-분-설-구-테-유 (계분설구테유)...',
    cardCount: 9,
  },
];

// 태그 예시 데이터
const tags = [
  { label: '전체', selected: true },
  { label: '코딩', selected: false },
  { label: '회계', selected: false },
  { label: '정보처리기사', selected: false },
];

// 태그 목록
const tagList = ['전체', '코딩', '회계', '정보처리기사'];

const FlashcardDeckListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState('전체');

  // 태그에 따라 덱 필터링
  const filteredDecks = selectedTag === '전체'
    ? decks
    : decks.filter(deck => deck.category === selectedTag);

  return (
    <Box sx={{ pb: '64px', minHeight: '100vh', background: theme.palette.background.default }}>
      {/* 상단 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          px: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700}>
          Flash Deck
        </Typography>
        <IconButton>
          <AddIcon />
        </IconButton>
      </Box>

      {/* 태그 드롭다운 */}
      <Box sx={{ px: 2, py: 2 }}>
        <Select
          label="Tags"
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value as string)}
        >
          {tagList.map(tag => (
            <SelectMenuItem key={tag} value={tag}>
              {tag}
            </SelectMenuItem>
          ))}
        </Select>
      </Box>

      {/* 카드 리스트 */}
      <Stack spacing={2} sx={{ px: 2 }}>
        {filteredDecks.map((deck) => (
          <Card
            key={deck.id}
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: theme.shadows[1],
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tag label={deck.category} size="small" selected />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                {deck.cardCount} cards
              </Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {deck.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {deck.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="outlined" size="small" fullWidth>
                수정
              </Button>
              <Button variant="outlined" size="small" color="error" fullWidth>
                삭제
              </Button>
              <Button variant="contained" size="small" fullWidth>
                학습하기
              </Button>
            </Box>
          </Card>
        ))}
      </Stack>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </Box>
  );
};

export default FlashcardDeckListPage;