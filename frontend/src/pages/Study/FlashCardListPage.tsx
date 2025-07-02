import React, { useState, useMemo, useEffect } from 'react';
import { styled } from '@mui/material/styles'; // alpha
import { 
  Box, 
  Typography, 
  InputAdornment,
  Container,
  Menu,
  MenuItem,
  Chip,
  TextField,
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
  setCurrentDeck,
  addCardTags 
} from '../../store/slices/deckSlice';
import { deckApiWithFallback } from '../../api/apiWithFallback';
import * as cardApi from '../../api/cardApi';
import type { Card, CreateCardRequest, SearchCard } from '../../types/card';
import { showToast } from '../../store/slices/toastSlice';
import { FlashCard, type FlashCardData } from '../../components/ui';
import { deckService } from '../../services/deckService';
import { cardService } from '../../services/cardService';
import Button from '../../components/ui/Button';



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
  const { 
    currentDeckCards = [], 
    selectedDeck,
    loading 
  } = useAppSelector((state) => state.deck);
  
  // 🎯 API Fallback을 위한 상태 (초기값 빈 배열 보장)
  const [fallbackCards, setFallbackCards] = useState<Card[]>([]);
  
  // 🔍 검색 관련 상태
  const [searchResults, setSearchResults] = useState<SearchCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // 🎯 Redux 데이터와 Fallback 데이터를 합치기 (중복 제거)
  const allCards = useMemo(() => {
    const combinedCards = new Map<string, Card>();
    
    // 1. Redux에서 가져온 카드들 추가 (배열인지 확인)
    if (Array.isArray(currentDeckCards)) {
      currentDeckCards.forEach(card => {
        combinedCards.set(card.cardId.toString(), card);
      });
    } else {
      console.warn('⚠️ currentDeckCards가 배열이 아닙니다:', currentDeckCards);
    }
    
    // 2. Fallback 카드들 추가 (중복 아닌 것만)
    if (Array.isArray(fallbackCards)) {
      fallbackCards.forEach(card => {
        if (!combinedCards.has(card.cardId.toString())) {
          combinedCards.set(card.cardId.toString(), card);
        }
      });
    } else {
      console.warn('⚠️ fallbackCards가 배열이 아닙니다:', fallbackCards);
    }
    
    const result = Array.from(combinedCards.values());
    return result;
  }, [currentDeckCards, fallbackCards]);



  // 🎯 컴포넌트 마운트 시 카드 데이터 로드
  useEffect(() => {
    if (deckId) {
      // Redux를 통한 기존 로드 (deckId를 그대로 사용)
      dispatch(setCurrentDeck(deckId));
      dispatch(fetchCardsInDeck(deckId));
      
              // API Fallback으로 카드 데이터 로드
        const loadCardsWithFallback = async () => {
          //setFallbackLoading(true);
          console.log("setFallbackLoading(true); 주석처리함.");
          try {
            const fallbackData = await deckApiWithFallback.getCardsInDeck(deckId);
          setFallbackCards(fallbackData);
        } catch (error) {
          console.error('❌ FlashCardListPage API Fallback 카드 로드 실패:', error);
        }
      };

      loadCardsWithFallback();
    }
  }, [dispatch, deckId]);

  // 🎯 플래시카드 목록 (Redux 데이터에서 직접 생성)
  const flashCards = useMemo(() => {
    return allCards
      .filter(card => card.deckId === deckId)
      .map(card => {
        const cardId = parseInt(card.cardId.toString());
        return {
          id: cardId,
          front: card.content || 'No content',
          back: card.answer || 'No answer',
          tags: card.tags ? card.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`) : [],
        };
      });
  }, [allCards, deckId]);

  // 모든 태그 목록 추출 (기존 로직 유지)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    flashCards.forEach((card) => {
      card.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [flashCards]);

  // 🔍 검색 결과를 FlashCard 형태로 변환
  const convertSearchResultsToFlashCards = useMemo(() => {
    return searchResults.map(searchCard => ({
      id: searchCard.cardId,
      front: searchCard.content,
      back: searchCard.answer,
      tags: searchCard.tags ? searchCard.tags.map(tag => tag.startsWith('#') ? tag : `#${tag}`) : [],
    }));
  }, [searchResults]);

  // 필터링된 카드 목록 - 검색 결과가 있으면 검색 결과 사용, 없으면 전체 카드 사용
  const filteredCards = useMemo(() => {
    const cardsToFilter = searchResults.length > 0 ? convertSearchResultsToFlashCards : flashCards;
    
    return cardsToFilter.filter((card) => {
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => card.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || cardBookmarks[card.id];

      return matchesTags && matchesBookmark;
    });
  }, [filters.selectedTags, filters.showBookmarked, flashCards, cardBookmarks, convertSearchResultsToFlashCards, searchResults]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 🔍 검색 함수
  const handleSearch = async () => {
    if (!deckId || !searchQuery.trim()) {
      // 검색어가 없으면 검색 결과 초기화
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      console.log('🔍 카드 검색 시작:', { keyword: searchQuery, deckId });
      const results = await deckService.searchCardsInDeck(searchQuery.trim(), deckId);
      setSearchResults(results);
      console.log('✅ 카드 검색 완료:', results);
      
      dispatch(showToast({
        message: `${results.length}개의 카드를 찾았습니다.`,
        severity: 'info'
      }));
    } catch (error) {
      console.error('❌ 카드 검색 실패:', error);
      dispatch(showToast({
        message: '검색에 실패했습니다.',
        severity: 'error'
      }));
    } finally {
      setIsSearching(false);
    }
  };

  // 🔄 검색 초기화
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
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
        // Redux 카드 삭제 시도
        try {
          const result = await dispatch(deleteCard(id));
          if (result.meta.requestStatus === 'fulfilled') {
            // 카드 목록 다시 로드
            if (deckId) {
              dispatch(fetchCardsInDeck(deckId));
              
              // API Fallback으로도 카드 데이터 다시 로드
              const loadCardsWithFallback = async () => {
                try {
                  const fallbackData = await deckApiWithFallback.getCardsInDeck(deckId);
                  setFallbackCards(fallbackData);
                  console.log('✅ 카드 삭제 후 API Fallback으로 카드 목록 재로드:', fallbackData);
                } catch (error) {
                  console.error('❌ 카드 삭제 후 API Fallback 카드 재로드 실패:', error);
                }
              };
              
              loadCardsWithFallback();
            }
            
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
      // 🎯 Redux로 실제 API 호출 시도 (우선순위)
      const result = await dispatch(updateCard({ 
        cardId: editingCardId, 
        data: { 
          content: editCardFront.trim(), 
          answer: editCardBack.trim() 
        } 
      }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        console.log('✅ Redux API 호출 성공');

        // 🏷️ 태그 처리: 기존 태그와 새로운 태그 비교하여 추가/삭제
        const currentCard = flashCards.find(c => c.id === editingCardId);
        const existingTags = currentCard?.tags?.map(tag => tag.startsWith('#') ? tag.slice(1) : tag) || [];
        
        // 새로운 태그 목록 처리
        const newTagNames = editCardTags.trim() 
          ? editCardTags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
              .map(tag => tag.startsWith('#') ? tag.slice(1) : tag) // # 제거
              .filter(tag => tag.length > 0) // 빈 태그 제거
          : [];

        console.log('🏷️ 태그 처리:', { existingTags, newTagNames });

        // 삭제할 태그들 (기존에 있었지만 새로운 목록에는 없는 태그들)
        const tagsToRemove = existingTags.filter(tag => !newTagNames.includes(tag));
        
        // 추가할 태그들 (새로운 목록에는 있지만 기존에 없는 태그들)
        const tagsToAdd = newTagNames.filter(tag => !existingTags.includes(tag));

        console.log('🏷️ 삭제할 태그:', tagsToRemove);
        console.log('🏷️ 추가할 태그:', tagsToAdd);

        // 🗑️ 태그 삭제 (순차적으로 하나씩)
        for (const tagToRemove of tagsToRemove) {
          try {
            // cardService를 사용하여 Mock/Real API 간 일관성 보장
            await cardService.removeCardTag(editingCardId, tagToRemove);
            console.log(`✅ 태그 삭제 성공: ${tagToRemove}`);
          } catch (error) {
            console.error(`❌ 태그 삭제 실패 (${tagToRemove}):`, error);
          }
        }

        // ➕ 태그 추가
        if (tagsToAdd.length > 0) {
          try {
            await dispatch(addCardTags({
              cardId: editingCardId,
              tagNames: tagsToAdd
            }));
            console.log('✅ 태그 추가 성공:', tagsToAdd);
          } catch (error) {
            console.error('❌ 태그 추가 실패:', error);
          }
        }

        // 카드 목록 다시 로드
        if (deckId) {
          dispatch(fetchCardsInDeck(deckId));
          
          // API Fallback으로도 카드 데이터 다시 로드
          const loadCardsWithFallback = async () => {
            try {
              const fallbackData = await deckApiWithFallback.getCardsInDeck(deckId);
              setFallbackCards(fallbackData);
              console.log('✅ 카드 삭제 후 API Fallback으로 카드 목록 재로드:', fallbackData);
            } catch (error) {
              console.error('❌ 카드 삭제 후 API Fallback 카드 재로드 실패:', error);
            }
          };
          
          loadCardsWithFallback();
        }

        dispatch(showToast({
          message: '카드가 성공적으로 수정되었습니다.',
          severity: 'success'
        }));
        
      } else {
        throw new Error('API 호출 실패');
      }
      
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

  // 🎯 임시 카드 5개 생성 함수
  const handleCreateSampleCards = async () => {
    if (!deckId) return;
    
    // API 요청에 사용할 실제 덱 ID (URL 파라미터를 그대로 사용)
    // 사용자 제공 예시: deckId = "ea42d25e-e197-41bd-8eb0-f6572b1d4cdd"
    const apiDeckId = deckId;
    
    const sampleCards: CreateCardRequest[] = [
      {
        deckId: apiDeckId,
        content: "React란 무엇인가요?",
        answer: "React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다."
      },
      {
        deckId: apiDeckId,
        content: "JSX는 무엇의 줄임말인가요?",
        answer: "JSX는 JavaScript XML의 줄임말입니다."
      },
      {
        deckId: apiDeckId,
        content: "useState Hook의 역할은?",
        answer: "함수형 컴포넌트에서 상태를 관리할 수 있게 해주는 Hook입니다."
      },
      {
        deckId: apiDeckId,
        content: "useEffect Hook은 언제 사용하나요?",
        answer: "컴포넌트가 렌더링될 때 특정 작업(side effect)을 수행할 때 사용합니다."
      },
      {
        deckId: apiDeckId,
        content: "Props란 무엇인가요?",
        answer: "부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 방법입니다."
      }
    ];

    try {
      dispatch(showToast({
        message: '카드 5개를 생성하는 중...',
        severity: 'info'
      }));

      // 순차적으로 카드 생성
      const createdCards = [];
      for (const cardData of sampleCards) {
        const createdCard = await cardApi.createCard(apiDeckId, cardData);
        createdCards.push(createdCard);
      }

      dispatch(showToast({
        message: `총 ${createdCards.length}개의 카드가 생성되었습니다!`,
        severity: 'success'
      }));

      // 카드 목록 다시 로드
      dispatch(fetchCardsInDeck(deckId));
      
    } catch (error) {
      console.error('카드 생성 실패:', error);
      dispatch(showToast({
        message: '카드 생성에 실패했습니다.',
        severity: 'error'
      }));
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

  // 덱이 없는 경우
  if (!selectedDeck || !deckId) {
    return (
      <StyledContainer maxWidth="md">
        <Box
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={8}
          gap={2}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            덱을 찾을 수 없습니다
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/study')}
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
          {selectedDeck?.deckName || '덱 이름 없음'}
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
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="카드 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={isSearching}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={isSearching}
            sx={{ minWidth: 80, height: 56 }}
          >
            검색
          </Button>
          {searchResults.length > 0 && (
            <Button
              variant="outlined"
              onClick={handleClearSearch}
              disabled={isSearching}
              sx={{ minWidth: 80, height: 56 }}
            >
              초기화
            </Button>
          )}
        </Box>
        {isSearching && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              검색 중...
            </Typography>
          </Box>
        )}
      </SearchBox>

      {/* 필터 */}
      <FilterBox>
        <Button
          startIcon={<FilterListIcon />}
          onClick={(e) => setTagMenuAnchor(e.currentTarget)}
        >
          태그 필터
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

      {/* 검색 결과 정보 */}
      {searchResults.length > 0 && (
        <Box
          sx={{
            bgcolor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: 1,
            p: 2,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="#2e7d32">
            🔍 검색 결과: "{searchQuery}" 키워드로 {searchResults.length}개의 카드를 찾았습니다.
          </Typography>
        </Box>
      )}

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
            <FlashCard
              key={card.id}
              card={card}
              isBookmarked={cardBookmarks[card.id]}
              onToggleBookmark={handleToggleBookmark}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
              maxTagsDisplay={3}
              showActions={true}
            />
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
          {import.meta.env.DEV === true && <Button 
            variant="outlined" 
            color="primary"
            onClick={handleCreateSampleCards}
            sx={{ mt: 1 }}
          >
            임시 카드 5개 생성하기 (DEV 환경)
          </Button>}
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
