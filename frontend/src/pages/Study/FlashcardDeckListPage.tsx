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
  CardActions,
  CardContent,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { useDialogKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { setFilters } from '../../store/slices/studySlice';
import { showToast, hideToast } from '../../store/slices/toastSlice';
import {
  fetchDecks,
  createDeck,
  updateDeck,
  deleteDeck,
} from '../../store/slices/deckSlice';
import type { CardDeck } from '../../types/card';
import { useResponsive } from '../../hooks/useResponsive';
import Card from '../../components/ui/Card';
import { deckApiWithFallback } from '../../api/apiWithFallback';

// 🎯 클라이언트 측에서만 관리할 추가 정보 (isBookmarked, tags)
interface ClientSideDeckInfo {
  isBookmarked: boolean;
  tags: string[];
}

// 🎯 API 데이터와 클라이언트 측 데이터를 합친 타입 
type EnrichedDeck = CardDeck & ClientSideDeckInfo;

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

//덱 카드 컨테이너 스타일
const DeckCard = styled(Card)(({ theme }) => ({
  height: '100%',
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

//태그 칩 스타일
const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));

//액션 버튼 스타일
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

const FlashcardDeckListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isMobile } = useResponsive();

  // 🎯 Redux 상태 선택
  const { decks, loading, error } = useAppSelector((state) => state.deck);
  const { filters } = useAppSelector((state) => state.study);
  const { user } = useAppSelector((state) => state.auth);

  // 🎯 클라이언트 측 상태 (북마크, 태그)
  const [clientSideInfo, setClientSideInfo] = useState<{ [deckId: string]: ClientSideDeckInfo }>({});

  // 🎯 다이얼로그 상태
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckTags, setNewDeckTags] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  
  // 🎯 메뉴 상태
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  // 🎯 API Fallback을 사용한 덱 목록 로드
  const [fallbackDecks, setFallbackDecks] = useState<CardDeck[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  // 🎯 컴포넌트 마운트 시 덱 목록 로드
  useEffect(() => {
    // Redux를 통한 기존 로드
    if (user?.memberId) {
      dispatch(fetchDecks());
    }
    
    // API Fallback을 통한 추가 로드
    const loadDecksWithFallback = async () => {
      setFallbackLoading(true);
      try {
        const fallbackData = await deckApiWithFallback.getDecksByMemberId(user?.memberId || 1);
        setFallbackDecks(fallbackData);
        console.log('✅ API Fallback으로 덱 목록 로드:', fallbackData);
      } catch (error) {
        console.error('❌ API Fallback 덱 로드 실패:', error);
      } finally {
        setFallbackLoading(false);
      }
    };

    loadDecksWithFallback();
  }, [dispatch, user?.memberId]);

  // 🎯 API로부터 덱 데이터를 받으면 클라이언트 측 정보 초기화 (Mock 데이터 기반)
  useEffect(() => {
    if (decks.length > 0) {
      setClientSideInfo(prevInfo => {
        const newInfo = { ...prevInfo };
        decks.forEach((deck, index) => {
          if (!newInfo[deck.deckId]) { // 기존 정보가 없을 때만 초기화
            // 덱별로 다양한 태그 생성
            const tagSets = [
              ['#영어', '#단어', '#기초'],
              ['#일본어', '#회화', '#중급'],
              ['#프로그래밍', '#개발', '#CS'],
              ['#수학', '#공식', '#고등'],
              ['#과학', '#물리', '#화학'],
              ['#역사', '#한국사', '#근현대'],
              ['#문학', '#고전', '#현대'],
              ['#경제', '#금융', '#투자'],
            ];
            
            newInfo[deck.deckId] = {
              isBookmarked: Math.random() > 0.5, // Mock 데이터
              tags: tagSets[index % tagSets.length], // Mock 데이터
            };
          }
        });
        return newInfo;
      });
    }
  }, [decks]);

  // 🎯 Fallback 덱이 로드될 때도 클라이언트 측 정보 초기화
  useEffect(() => {
    if (fallbackDecks.length > 0) {
      setClientSideInfo(prevInfo => {
        const newInfo = { ...prevInfo };
        fallbackDecks.forEach((deck, index) => {
          if (!newInfo[deck.deckId]) { // 기존 정보가 없을 때만 초기화
            // 덱별로 다양한 태그 생성
            const tagSets = [
              ['#영어', '#단어', '#기초'],
              ['#일본어', '#회화', '#중급'],
              ['#프로그래밍', '#개발', '#CS'],
              ['#수학', '#공식', '#고등'],
              ['#과학', '#물리', '#화학'],
              ['#역사', '#한국사', '#근현대'],
              ['#문학', '#고전', '#현대'],
              ['#경제', '#금융', '#투자'],
            ];
            
            newInfo[deck.deckId] = {
              isBookmarked: Math.random() > 0.5, // Mock 데이터
              tags: tagSets[index % tagSets.length], // Mock 데이터
            };
          }
        });
        return newInfo;
      });
    }
  }, [fallbackDecks]);

  // 🎯 Redux 덱과 Fallback 덱을 합치기 (Fallback 덱 우선순위)
  const combinedDecks = useMemo(() => {
    // Redux 덱과 Fallback 덱을 합치고 중복 제거 (Fallback 덱 우선)
    const deckMap = new Map<string, CardDeck>();
    
    // Redux 덱을 먼저 추가
    decks.forEach(deck => {
      deckMap.set(deck.deckId, deck);
    });
    
    // Fallback 덱 추가 (덮어쓰기로 우선순위 적용)
    fallbackDecks.forEach(deck => {
      deckMap.set(deck.deckId, deck);
    });
    
    return Array.from(deckMap.values());
  }, [decks, fallbackDecks]);

  // 🎯 필터링 및 UI 렌더링을 위한 데이터 합치기
  const enrichedDecks: EnrichedDeck[] = useMemo(() => {
    return combinedDecks.map(deck => ({
      ...deck,
      ...(clientSideInfo[deck.deckId] || { isBookmarked: false, tags: [] }),
    }));
  }, [combinedDecks, clientSideInfo]);
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    enrichedDecks.forEach((deck) => {
      deck.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [enrichedDecks]);

  const filteredDecks = useMemo(() => {
    return enrichedDecks.filter((deck) => {
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => deck.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || deck.isBookmarked;

      const matchesSearch = filters.searchQuery.trim() === '' || 
                            deck.deckName.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return matchesTags && matchesBookmark && matchesSearch;
    });
  }, [filters, enrichedDecks]);

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
  
  const handleDeckClick = (deckId: string) => {
    // 덱 ID 매핑 처리
    let routeId = deckId;
    
    // fallback 덱 ID (deck_1, deck_2, deck_3) -> 1, 2, 3
    if (deckId.startsWith('deck_')) {
      routeId = deckId.replace('deck_', '');
    }
    // Redux 덱 ID (deck-uuid-1) -> 1
    else if (deckId.startsWith('deck-uuid-')) {
      routeId = deckId.replace('deck-uuid-', '');
    }
    
    console.log('🎯 덱 클릭:', deckId, '→ 라우팅 ID:', routeId);
    navigate(`/flashcards/${routeId}/cards`);
  };

  const handleEditDeck = (deck: EnrichedDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditMode(true);
    setEditingDeckId(deck.deckId);
    setNewDeckTitle(deck.deckName);
    // 태그에서 # 기호를 제거하여 표시
    setNewDeckTags(deck.tags.map(tag => tag.startsWith('#') ? tag.slice(1) : tag).join(', '));
    setShowCreateDialog(true);
  };

  const handleDeleteDeck = async (deck: EnrichedDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`'${deck.deckName}' 덱을 정말 삭제하시겠습니까?`)) {
      // 먼저 fallback 덱에서 해당 덱을 찾아 삭제
      const fallbackDeckIndex = fallbackDecks.findIndex(fallbackDeck => fallbackDeck.deckId === deck.deckId);
      if (fallbackDeckIndex !== -1) {
        // fallback 덱에서 삭제
        setFallbackDecks(prev => prev.filter(fallbackDeck => fallbackDeck.deckId !== deck.deckId));
        
        // 클라이언트 측 정보도 삭제
        setClientSideInfo(prev => {
          const newInfo = { ...prev };
          delete newInfo[deck.deckId];
          return newInfo;
        });
        
        dispatch(showToast({
          message: '덱이 성공적으로 삭제되었습니다.',
          severity: 'success'
        }));
      } else {
        // Redux 덱 삭제 시도
        try {
          const result = await dispatch(deleteDeck(deck.deckId));
          if (result.meta.requestStatus === 'fulfilled') {
            // 클라이언트 측 정보도 삭제
            setClientSideInfo(prev => {
              const newInfo = { ...prev };
              delete newInfo[deck.deckId];
              return newInfo;
            });
            
            // 덱 목록 다시 불러오기 (Redux 상태 동기화)
            dispatch(fetchDecks());
            
            dispatch(showToast({
              message: '덱이 성공적으로 삭제되었습니다.',
              severity: 'success'
            }));
          } else {
            throw new Error('Redux 덱 삭제 실패');
          }
        } catch (error) {
          console.error('덱 삭제 실패:', error);
          dispatch(showToast({
            message: '덱 삭제에 실패했습니다.',
            severity: 'error'
          }));
        }
      }
    }
  };
  
  const handleToggleBookmark = (deckId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const currentBookmarkStatus = clientSideInfo[deckId]?.isBookmarked;
    const newBookmarkStatus = !currentBookmarkStatus;
    
    setClientSideInfo(prev => ({
      ...prev,
      [deckId]: {
        ...(prev[deckId] || { tags: [] }), // 기존 태그 정보 유지
        isBookmarked: newBookmarkStatus,
      }
    }));

    // 기존 토스트 숨기고 새 토스트 표시
    dispatch(hideToast());
    setTimeout(() => {
      dispatch(showToast({
        message: newBookmarkStatus ? '북마크가 추가되었습니다.' : '북마크가 해제되었습니다.',
        severity: 'success',
        duration: 1500
      }));
    }, 100);
  };

  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
    setIsEditMode(false);
    setEditingDeckId(null);
    setNewDeckTitle('');
    setNewDeckTags('');
  };

  const handleCreateDialogConfirm = async () => {
    if (!newDeckTitle.trim()) return;

    if (isEditMode && editingDeckId) {
      // 먼저 fallback 덱에서 해당 덱을 찾아 수정
      const fallbackDeckIndex = fallbackDecks.findIndex(deck => deck.deckId === editingDeckId);
      if (fallbackDeckIndex !== -1) {
        // fallback 덱 업데이트
        setFallbackDecks(prev => prev.map(deck => 
          deck.deckId === editingDeckId 
            ? { ...deck, deckName: newDeckTitle.trim() }
            : deck
        ));
        
        // 클라이언트 측 태그 수정
        setClientSideInfo(prev => ({
          ...prev,
          [editingDeckId]: {
            ...(prev[editingDeckId] || { isBookmarked: false }),
            tags: newDeckTags.split(',').map(t => {
              const trimmed = t.trim();
              return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
            }).filter(Boolean),
          }
        }));
        
        // 덱 목록 다시 불러오기 (Redux 상태 동기화)
        dispatch(fetchDecks());
        
        dispatch(showToast({
          message: '덱이 성공적으로 수정되었습니다.',
          severity: 'success'
        }));
      } else {
        // Redux 덱 수정 시도
        try {
          const result = await dispatch(updateDeck({ deckId: editingDeckId, data: { deckName: newDeckTitle.trim() } }));
          
          if (result.meta.requestStatus === 'fulfilled') {
            // 성공 시 클라이언트 측 태그 수정
            setClientSideInfo(prev => ({
              ...prev,
              [editingDeckId]: {
                ...(prev[editingDeckId] || { isBookmarked: false }),
                tags: newDeckTags.split(',').map(t => {
                  const trimmed = t.trim();
                  return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
                }).filter(Boolean),
              }
            }));
            
            // 덱 목록 다시 불러오기 (Redux 상태 동기화)
            dispatch(fetchDecks());
            
            dispatch(showToast({
              message: '덱이 성공적으로 수정되었습니다.',
              severity: 'success'
            }));
          } else {
            throw new Error('Redux 덱 수정 실패');
          }
        } catch (error) {
          console.error('덱 수정 실패:', error);
          dispatch(showToast({
            message: '덱 수정에 실패했습니다.',
            severity: 'error'
          }));
        }
      }
    } else {
      try {
        // Redux를 통한 덱 생성
        const result = await dispatch(createDeck({ deckName: newDeckTitle.trim() }));
        if (result.meta.requestStatus === 'fulfilled' && result.payload) {
          const newDeck = result.payload as CardDeck;
          // 새 덱에 대한 클라이언트 측 정보 추가
          setClientSideInfo(prev => ({
            ...prev,
            [newDeck.deckId]: {
              isBookmarked: false,
              tags: newDeckTags.split(',').map(t => {
                const trimmed = t.trim();
                return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
              }).filter(Boolean),
            }
          }));
          
          // 덱 목록 다시 불러오기 (Redux 상태 동기화)
          dispatch(fetchDecks());
          
          dispatch(showToast({
            message: '덱이 성공적으로 생성되었습니다.',
            severity: 'success'
          }));
        }
      } catch (error) {
        console.log('Redux 덱 생성 실패, API Fallback 사용 시도...');
        // Redux 실패시 API Fallback 사용
        try {
          const newDeck = await deckApiWithFallback.createDeck({
            deckName: newDeckTitle.trim(),
            memberId: user?.memberId || 1
          });
          
          // fallbackDecks 상태에 추가
          setFallbackDecks(prev => [...prev, newDeck]);
          
          // 클라이언트 측 정보 추가
          setClientSideInfo(prev => ({
            ...prev,
            [newDeck.deckId]: {
              isBookmarked: false,
              tags: newDeckTags.split(',').map(t => {
                const trimmed = t.trim();
                return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
              }).filter(Boolean),
            }
          }));
          
          dispatch(showToast({
            message: '✅ API Fallback으로 덱이 생성되었습니다!',
            severity: 'success'
          }));
        } catch (fallbackError) {
          console.error('API Fallback 덱 생성도 실패:', fallbackError);
          dispatch(showToast({
            message: '덱 생성에 실패했습니다.',
            severity: 'error'
          }));
        }
      }
    }
    handleCreateDialogClose();
  };

  // 🎯 덱 생성/수정 다이얼로그 키보드 단축키
  useDialogKeyboardShortcuts(
    handleCreateDialogConfirm,
    handleCreateDialogClose,
    {
      enabled: showCreateDialog
    }
  );

  return (
    <StyledContainer>
      <HeaderBox>
        <Typography variant="h4" component="h1">플래시카드 덱</Typography>
        {/* 덱 생성 버튼 - 데스크탑에서만 표시 */}
        <Fab 
          color="primary" 
          aria-label="add" 
          onClick={() => setShowCreateDialog(true)} 
          size="medium"
          sx={{
            display: { xs: 'none', md: 'flex' } // 모바일에서는 숨김, 데스크탑에서만 표시
          }}
        >
          <AddIcon />
        </Fab>
      </HeaderBox>

      {/* API Fallback 정보 표시 */}
      {fallbackDecks.length > 0 && (
        <Box 
          sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: '#e3f2fd', 
            border: '1px solid #2196f3',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <InfoIcon color="primary" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              🎉 API Fallback 시스템 작동 중!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              실제 API 호출 실패시 자동으로 Mock 데이터({fallbackDecks.length}개 덱)를 표시하고 있습니다.
            </Typography>
          </Box>
        </Box>
      )}

      <SearchBox>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="덱 이름으로 검색..."
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

      {(loading || fallbackLoading) && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Typography color="error" align="center" py={5}>오류: {error}</Typography>}
      
      {!loading && !error && (
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
                {/*  덱 이름과 북마크 버튼 */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 32px)' }}>{deck.deckName}</Typography>
                  <IconButton size="small" onClick={(e) => handleToggleBookmark(deck.deckId, e)}>
                    {deck.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
                {/* 카드 개수 */}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  카드 {deck.cardCnt}개
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
                  {(isMobile ? deck.tags.slice(0, 5) : deck.tags).map(tag => (
                    <TagChip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                  ))}
                  {isMobile && deck.tags.length > 5 && (
                    <TagChip label={`+${deck.tags.length - 5}`} size="small" color="primary" variant="outlined" />
                  )}
                </Box>
              </CardContent>
              {/* 액션 버튼들 */}
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <ActionButton size="small" startIcon={<EditIcon />} onClick={(e) => handleEditDeck(deck, e)}>
                  수정
                </ActionButton>
                <ActionButton size="small" startIcon={<DeleteIcon />} color="error" onClick={(e) => handleDeleteDeck(deck, e)}>
                  삭제
                </ActionButton>
                <ActionButton size="small" startIcon={<SchoolIcon />} onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${deck.deckId}/practice`); }}>
                  학습하기
                </ActionButton>
              </CardActions>
            </DeckCard>
          ))}
        </Box>
              )}

      {/* 빈 상태 */}
      {!loading && !error && filteredDecks.length === 0 && (
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            첫 번째 덱을 만들어보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
          >
            덱 만들기
          </Button>
        </Box>
      )}

      {/* 덱 생성/수정 다이얼로그 */}
      <Dialog open={showCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditMode ? '덱 수정' : '덱 생성'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="덱 이름"
            fullWidth
            variant="outlined"
            value={newDeckTitle}
            onChange={(e) => setNewDeckTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="태그 (쉼표로 구분, 자동으로 # 추가)"
            fullWidth
            variant="outlined"
            value={newDeckTags}
            onChange={(e) => setNewDeckTags(e.target.value)}
            placeholder="예: React, 자바스크립트"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>취소</Button>
          <Button onClick={handleCreateDialogConfirm} variant="contained" disabled={!newDeckTitle.trim()}>
            {isEditMode ? '수정' : '생성'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 덱 생성 버튼 - 모바일에서만 하단 플로팅 */}
      <Fab 
        color="primary" 
        aria-label="새로운 플래시카드 덱 만들기" 
        onClick={() => setShowCreateDialog(true)} 
        size={isMobile ? "small" : "medium"} 
        sx={{ 
          display: { xs: 'flex', md: 'none' }, // 모바일에서만 표시, 데스크탑에서는 숨김
          position: 'fixed', 
          bottom: isMobile ? 80 : 16, 
          right: 16, 
          zIndex: 1000,
          // 📱 접근성 및 UX 개선
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          },
          // 🎯 포커스 가시성 향상
          '&:focus': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
          // 📱 터치 디바이스 최적화
          '@media (hover: none)': {
            '&:hover': {
              transform: 'none',
            }
          }
        }}
      >
        <AddIcon />
      </Fab>
    </StyledContainer>
  );
};

export default FlashcardDeckListPage;