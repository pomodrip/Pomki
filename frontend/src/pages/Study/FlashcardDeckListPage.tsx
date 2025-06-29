// =========================
// 플래시카드 덱 목록 페이지
// =========================

// 🔹 라이브러리 및 훅 import
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
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
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
import {
  adjustFabForScreenSize,
  setFabVisible,
  selectFab,
} from '../../store/slices/uiSlice';
import type { CardDeck } from '../../types/card';
import { useResponsive } from '../../hooks/useResponsive';
import Toast from '../../components/common/Toast';
// 🎯 API Fallback 비활성화
// import { deckApiWithFallback } from '../../api/apiWithFallback';

// 🔹 스타일 컴포넌트 정의 (NoteListPage와 통일)
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  position: 'relative', // FAB 기준점
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const SearchBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  maxWidth: '100%',
}));

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

//덱 카드 컨테이너 스타일
const DeckCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'white',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

//태그 칩 스타일
const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));

const ActionBox = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '8px',
});

const SelectedTagsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  minHeight: theme.spacing(4),
  flexWrap: 'wrap',
}));

// 🔹 반응형 플로팅 FAB 스타일
const FloatingFab = styled(Fab)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: isMobile ? 'fixed' : 'absolute',
  zIndex: theme.zIndex.fab || 1201,
  right: theme.spacing(4),
  ...(isMobile
    ? { bottom: 80 }
    : { top: theme.spacing(2) }),
  boxShadow: theme.shadows[4],
}));

// 🔹 타입 정의 (클라이언트 전용 정보)
interface ClientSideDeckInfo {
  isBookmarked: boolean;
  tags: string[];
}

// 🎯 API 데이터와 클라이언트 측 데이터를 합친 타입 
type EnrichedDeck = CardDeck & ClientSideDeckInfo;

// =========================
// 메인 컴포넌트
// =========================
const FlashcardDeckListPage: React.FC = () => {
  // 🔹 라우팅, Redux, 반응형 훅
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isMobile } = useResponsive();
  const { decks = [], loading, error } = useAppSelector((state) => state.deck);
  const { filters } = useAppSelector((state) => state.study);
  const { user } = useAppSelector((state) => state.auth);
  const fab = useAppSelector(selectFab);
  const { bottomNavVisible } = useAppSelector((state) => state.ui);

  // 🔹 클라이언트 전용 상태 (북마크, 태그)
  const [clientSideInfo, setClientSideInfo] = useState<{ [deckId: string]: ClientSideDeckInfo }>({});

  // 🔹 덱 생성/수정 다이얼로그 상태
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckTags, setNewDeckTags] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  
  // 🔹 메뉴(태그, 북마크) 상태
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  // 🎯 API Fallback 비활성화 - Redux만 사용
  // const [fallbackDecks, setFallbackDecks] = useState<CardDeck[]>([]);
  // const [fallbackLoading, setFallbackLoading] = useState(false);

  // 🔹 컴포넌트 마운트 시 덱 목록 로드 - Redux만 사용
  useEffect(() => {
    console.log("유저 이메일", user?.email);
    dispatch(fetchDecks());
    console.log("유저", user);
    
    // 🎯 API Fallback 비활성화
    // const loadDecksWithFallback = async () => {
    //   setFallbackLoading(true);
    //   try {
    //     const fallbackData = await deckApiWithFallback.getMyDecks();
    //     setFallbackDecks(fallbackData);
    //     console.log('✅ API Fallback으로 덱 목록 로드:', fallbackData);
    //   } catch (error) {
    //     console.error('❌ API Fallback 덱 로드 실패:', error);
    //   } finally {
    //     setFallbackLoading(false);
    //   }
    // };
    // loadDecksWithFallback();
  }, [dispatch, user?.memberId]);

  // 🔹 반응형 FAB 위치 관리
  useEffect(() => {
    dispatch(setFabVisible(true));
    dispatch(adjustFabForScreenSize({
      isMobile,
      hasBottomNav: bottomNavVisible,
    }));
    return () => {
      dispatch(setFabVisible(false));
    };
  }, [dispatch, isMobile, bottomNavVisible]);

  // 🔹 클라이언트 전용 정보 초기화 (북마크, 태그)
  useEffect(() => {
    if (decks.length > 0) {
      setClientSideInfo(prevInfo => {
        const newInfo = { ...prevInfo };
        decks.forEach((deck, index) => {
          if (!newInfo[deck.deckId]) {
            const tagSets = [
              ['#영어', '#단어', '#기초'],
              ['#일본어', '#회화', '#중급'],
              ['#프로그래밍', '#개발', '#CS'],
              ['#수학', '#문제', '#풀이'],
              ['#역사', '#세계사', '#한국사'],
              ['#과학', '#실험', '#이론'],
              ['#예술', '#음악', '#미술'],
              ['#기타', '#잡학', '#상식'],
            ];
            newInfo[deck.deckId] = {
              isBookmarked: Math.random() > 0.5,
              tags: tagSets[index % tagSets.length],
            };
          }
        });
        return newInfo;
      });
    }
  }, [decks]);

  // 🎯 Redux 덱만 사용 (Fallback 비활성화)
  const combinedDecks = useMemo(() => {
    // Redux 덱만 사용 (배열인지 확인)
    if (Array.isArray(decks)) {
      return decks;
    } else {
      console.warn('⚠️ decks가 배열이 아닙니다:', decks);
      return [];
    }
    
    // 🎯 Fallback 로직 비활성화
    // const deckMap = new Map<string, CardDeck>();
    // Redux 덱을 먼저 추가 (배열인지 확인)
    // if (Array.isArray(decks)) {
    //   decks.forEach(deck => {
    //     deckMap.set(deck.deckId, deck);
    //   });
    // } else {
    //   console.warn('⚠️ decks가 배열이 아닙니다:', decks);
    // }
    
    // Fallback 덱 추가 (덮어쓰기로 우선순위 적용, 배열인지 확인)
    // if (Array.isArray(fallbackDecks)) {
    //   fallbackDecks.forEach(deck => {
    //     deckMap.set(deck.deckId, deck);
    //   });
    // } else {
    //   console.warn('⚠️ fallbackDecks가 배열이 아닙니다:', fallbackDecks);
    // }
    
    // const result = Array.from(deckMap.values());
    // return result;
  }, [decks]);

  // 🎯 필터링 및 UI 렌더링을 위한 데이터 합치기
  const enrichedDecks: EnrichedDeck[] = useMemo(() => {
    return combinedDecks.map(deck => ({
      ...deck,
      ...(clientSideInfo[deck.deckId] || { isBookmarked: false, tags: [] }),
    }));
  }, [combinedDecks, clientSideInfo]);
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    if (Array.isArray(enrichedDecks)) {
      enrichedDecks.forEach((deck) => {
        if (Array.isArray(deck.tags)) {
          deck.tags.forEach((tag: string) => tagSet.add(tag));
        }
      });
    }
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

  // =========================
  // 주요 핸들러 함수들
  // =========================
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
    setNewDeckTags(deck.tags.join(', ').replace(/#/g, ''));
    setShowCreateDialog(true);
  };

  const handleDeleteDeck = async (deck: EnrichedDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`'${deck.deckName}' 덱을 정말 삭제하시겠습니까?`)) {
      // 🎯 Redux만 사용하도록 단순화
      try {
        const result = await dispatch(deleteDeck(deck.deckId));
        if (result.meta.requestStatus === 'fulfilled') {
          // 클라이언트 측 정보 삭제
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
        console.error('❌ Redux 덱 삭제 실패:', error);
        dispatch(showToast({
          message: '덱 삭제에 실패했습니다.',
          severity: 'error'
        }));
      }
      
      // 🎯 Fallback 관련 로직 비활성화
      // let deletedFromFallback = false;
      // let deletedFromRedux = false;
      
      // 1. fallback 덱에서 삭제 시도 (배열인지 확인)
      // const fallbackDeckIndex = Array.isArray(fallbackDecks) 
      //   ? fallbackDecks.findIndex(fallbackDeck => fallbackDeck.deckId === deck.deckId)
      //   : -1;
      // if (fallbackDeckIndex !== -1) {
      //   setFallbackDecks(prev => Array.isArray(prev) ? prev.filter(fallbackDeck => fallbackDeck.deckId !== deck.deckId) : []);
      //   deletedFromFallback = true;
      //   console.log('✅ Fallback 덱에서 삭제 완료');
      // }
      
      // 2. Redux 덱에서도 삭제 시도 (fallback과 별개로, 배열인지 확인)
      // const reduxDeckExists = Array.isArray(decks) && decks.some(reduxDeck => reduxDeck.deckId === deck.deckId);
      // if (reduxDeckExists) {
      //   try {
      //     const result = await dispatch(deleteDeck(deck.deckId));
      //     if (result.meta.requestStatus === 'fulfilled') {
      //       deletedFromRedux = true;
      //       console.log('✅ Redux 덱에서 삭제 완료');
      //       // 덱 목록 다시 불러오기 (Redux 상태 동기화)
      //       dispatch(fetchDecks());
      //     } else {
      //       throw new Error('Redux 덱 삭제 실패');
      //     }
      //   } catch (error) {
      //     console.error('❌ Redux 덱 삭제 실패:', error);
      //   }
      // }
      
      // 3. 최종 결과 처리
      // if (deletedFromFallback || deletedFromRedux) {
      //   // 클라이언트 측 정보 삭제
      //   setClientSideInfo(prev => {
      //     const newInfo = { ...prev };
      //     delete newInfo[deck.deckId];
      //     return newInfo;
      //   });
        
      //   const sourceInfo = deletedFromFallback && deletedFromRedux ? '(Fallback + Redux)' :
      //                     deletedFromFallback ? '(Fallback)' :
      //                     '(Redux)';
        
      //   dispatch(showToast({
      //     message: `덱이 성공적으로 삭제되었습니다. ${sourceInfo}`,
      //     severity: 'success'
      //   }));
      // } else {
      //   dispatch(showToast({
      //     message: '덱 삭제에 실패했습니다.',
      //     severity: 'error'
      //   }));
      // }
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
      let updateSuccess = false;
      let updateSource = '';
      
      // 1. 실제 API를 통한 덱 수정 시도 (Redux)
      try {
        const result = await dispatch(updateDeck({ 
          deckId: editingDeckId, 
          data: { 
            deckName: newDeckTitle.trim()
          } 
        }));
        
        if (result.meta.requestStatus === 'fulfilled') {
          updateSuccess = true;
          updateSource = 'Redux API';
          console.log('✅ Redux API를 통한 덱 수정 성공');
          
          // 덱 목록 다시 불러오기 (Redux 상태 동기화)
          dispatch(fetchDecks());
        } else {
          throw new Error('Redux 덱 수정 실패');
        }
      } catch (error) {
        console.error('❌ Redux API 덱 수정 실패, API Fallback 시도...', error);
        
                 // 🎯 API Fallback 비활성화
         // 2. Redux 실패시 API Fallback으로 시도
         // try {
         //   await deckApiWithFallback.updateDeck(editingDeckId, {
         //     deckName: newDeckTitle.trim(),
         //     memberId: user?.memberId || 1
         //   });
         //   updateSuccess = true;
         //   updateSource = 'API Fallback';
         //   console.log('✅ API Fallback을 통한 덱 수정 성공');
         // } catch (fallbackError) {
         //   console.error('❌ API Fallback 덱 수정도 실패:', fallbackError);
         // }
      }
      
             // 3. 어떤 방식으로든 수정이 성공했다면 로컬 상태 업데이트
       if (updateSuccess) {
         // 🎯 Fallback 덱 업데이트 로직 비활성화
         // const fallbackDeckIndex = Array.isArray(fallbackDecks) 
         //   ? fallbackDecks.findIndex(deck => deck.deckId === editingDeckId)
         //   : -1;
         // if (fallbackDeckIndex !== -1) {
         //   setFallbackDecks(prev => Array.isArray(prev) ? prev.map(deck => 
         //     deck.deckId === editingDeckId 
         //       ? { ...deck, deckName: newDeckTitle.trim() }
         //       : deck
         //   ) : []);
         // }
        
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
        
        dispatch(showToast({
          message: '덱이 성공적으로 수정되었습니다.',
          severity: 'success'
        }));
      } else {
        dispatch(showToast({
          message: '덱 수정에 실패했습니다.',
          severity: 'error'
        }));
      }
    } else {
      try {
        // Redux를 통한 덱 생성
        const result = await dispatch(createDeck({ 
          deckName: newDeckTitle.trim()
        }));
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
        console.error('Redux 덱 생성 실패:', error);
        dispatch(showToast({
          message: '덱 생성에 실패했습니다.',
          severity: 'error'
        }));
        
        // 🎯 API Fallback 로직 비활성화
        // console.log('Redux 덱 생성 실패, API Fallback 사용 시도...');
        // // Redux 실패시 API Fallback 사용
        // try {
        //   const newDeck = await deckApiWithFallback.createDeck({
        //     deckName: newDeckTitle.trim(),
        //     memberId: user?.memberId || 1
        //   });
          
        //   // fallbackDecks 상태에 추가 (배열인지 확인)
        //   setFallbackDecks(prev => Array.isArray(prev) ? [...prev, newDeck] : [newDeck]);
          
        //   // 클라이언트 측 정보 추가
        //   setClientSideInfo(prev => ({
        //     ...prev,
        //     [newDeck.deckId]: {
        //       isBookmarked: false,
        //       tags: newDeckTags.split(',').map(t => {
        //         const trimmed = t.trim();
        //         return trimmed && !trimmed.startsWith('#') ? `#${trimmed}` : trimmed;
        //       }).filter(Boolean),
        //     }
        //   }));
          
        //   dispatch(showToast({
        //     message: '✅ API Fallback으로 덱이 생성되었습니다!',
        //     severity: 'success'
        //   }));
        // } catch (fallbackError) {
        //   console.error('API Fallback 덱 생성도 실패:', fallbackError);
        //   dispatch(showToast({
        //     message: '덱 생성에 실패했습니다.',
        //     severity: 'error'
        //   }));
        // }
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

  // =========================
  // 렌더링
  // =========================
  return (
    <StyledContainer maxWidth="md">
      {/* Toast 위치: 중앙 상단/바텀네비 위 */}
      <Toast />
      {/* 🔹 헤더 영역 */}
      <HeaderBox>
        <Typography variant="h4" fontWeight="bold">
          나의 덱
        </Typography>
      </HeaderBox>
      {/* 🔹 반응형 플로팅 FAB */}
      {fab.visible && (
        <FloatingFab
          color="primary"
          aria-label="덱 생성"
          isMobile={isMobile}
          onClick={() => setShowCreateDialog(true)}
          size={fab.size}
          disabled={fab.disabled}
        >
          <AddIcon />
        </FloatingFab>
      )}
      {/* 🔹 검색창 */}
      <SearchBox>
        <TextField
          variant="outlined"
          placeholder="덱 이름으로 검색..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          sx={{ width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </SearchBox>
      {/* 🔹 필터 버튼 영역 */}
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
      {/* 🔹 선택된 태그들 표시 */}
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
      {/* 🔹 태그 메뉴 */}
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
      {/* 🔹 북마크 메뉴 */}
      <Menu
        anchorEl={bookmarkMenuAnchor}
        open={Boolean(bookmarkMenuAnchor)}
        onClose={() => setBookmarkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBookmarkFilter(true)}>북마크된 항목만 보기</MenuItem>
        <MenuItem onClick={() => handleBookmarkFilter(false)}>모든 항목 보기</MenuItem>
      </Menu>
      {/* 🔹 로딩/에러 상태 */}
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Typography color="error" align="center" py={5}>오류: {error}</Typography>}
      {/* 🔹 덱 목록 그리드 렌더링 */}
      {!loading && !error && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.deckId} onClick={() => handleDeckClick(deck.deckId)}>
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
              {/* 액션 버튼들 */}
              <ActionBox>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => handleDeleteDeck(deck, e)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  삭제
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={(e) => handleEditDeck(deck, e)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  수정
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SchoolIcon />}
                  onClick={(e) => { e.stopPropagation(); navigate(`/flashcards/${deck.deckId}/practice`); }}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  학습하기
                </Button>
              </ActionBox>
            </DeckCard>
          ))}
        </Box>
      )}
      {/* 🔹 빈 상태 안내 */}
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
      {/* 🔹 덱 생성/수정 다이얼로그 */}
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
    </StyledContainer>
  );
};

export default FlashcardDeckListPage;