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
// interface ClientSideDeckInfo {
//   isBookmarked: boolean;
//   tags: string[];
// }
// type EnrichedDeck = CardDeck & ClientSideDeckInfo;
// 덱에서는 태그/북마크 미사용

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

  // 🔹 덱 생성/수정 다이얼로그 상태
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  // const [newDeckTags, setNewDeckTags] = useState(''); // 덱에서는 태그 미사용
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  
  // // 🔹 클라이언트 전용 상태 (북마크, 태그)
  // const [clientSideInfo, setClientSideInfo] = useState<{ [deckId: string]: ClientSideDeckInfo }>({});
  // 덱에서는 태그/북마크 미사용

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

  // // 🔹 클라이언트 전용 정보 초기화 (북마크, 태그)
  // useEffect(() => {
  //   if (decks.length > 0) {
  //     setClientSideInfo(prevInfo => {
  //       const newInfo = { ...prevInfo };
  //       decks.forEach((deck, index) => {
  //         if (!newInfo[deck.deckId]) {
  //           const tagSets = [
  //             ['#영어', '#단어', '#기초'],
  //             ['#일본어', '#회화', '#중급'],
  //             ['#프로그래밍', '#개발', '#CS'],
  //             ['#수학', '#문제', '#풀이'],
  //             ['#역사', '#세계사', '#한국사'],
  //             ['#과학', '#실험', '#이론'],
  //             ['#예술', '#음악', '#미술'],
  //             ['#기타', '#잡학', '#상식'],
  //           ];
  //           newInfo[deck.deckId] = {
  //             isBookmarked: Math.random() > 0.5,
  //             tags: tagSets[index % tagSets.length],
  //           };
  //         }
  //       });
  //       return newInfo;
  //     });
  //   }
  // }, [decks]);
  // 덱에서는 태그/북마크 미사용

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

  // // 🎯 필터링 및 UI 렌더링을 위한 데이터 합치기
  // const enrichedDecks: EnrichedDeck[] = useMemo(() => {
  //   return combinedDecks.map(deck => ({
  //     ...deck,
  //     ...(clientSideInfo[deck.deckId] || { isBookmarked: false, tags: [] }),
  //   }));
  // }, [combinedDecks, clientSideInfo]);
  // 덱에서는 태그/북마크 미사용
  
  // // const allTags = useMemo(() => { ... });
  // // const filteredDecks = useMemo(() => { ... });
  // // 덱에서는 태그/북마크 미사용

  // =========================
  // 주요 핸들러 함수들
  // =========================
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilters({ searchQuery: event.target.value }));
  };

  // // 🎯 핸들러: handleTagSelect, handleBookmarkFilter, handleToggleBookmark 등
  // // 덱에서는 태그/북마크 미사용

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

  const handleEditDeck = (deck: CardDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditMode(true);
    setEditingDeckId(deck.deckId);
    setNewDeckTitle(deck.deckName);
    // setNewDeckTags(''); // 덱에서는 태그 미사용
    setShowCreateDialog(true);
  };

  const handleDeleteDeck = async (deck: CardDeck, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm(`'${deck.deckName}' 덱을 정말 삭제하시겠습니까?`)) {
      // 🎯 Redux만 사용하도록 단순화
      try {
        const result = await dispatch(deleteDeck(deck.deckId));
        if (result.meta.requestStatus === 'fulfilled') {
          // 클라이언트 측 정보 삭제
          // setClientSideInfo(prev => {
          //   const newInfo = { ...prev };
          //   delete newInfo[deck.deckId];
          //   return newInfo;
          // });
          
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
  
  // // 🎯 핸들러: handleToggleBookmark 등
  // // 덱에서는 태그/북마크 미사용

  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
    setIsEditMode(false);
    setEditingDeckId(null);
    setNewDeckTitle('');
    // setNewDeckTags(''); // 덱에서는 태그 미사용
  };

  const handleCreateDialogConfirm = async () => {
    if (!newDeckTitle.trim()) return;
    // const tags = newDeckTags
    //   .split(',')
    //   .map((tag) => tag.trim())
    //   .filter((tag) => tag.length > 0)
    //   .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
    try {
      if (isEditMode && editingDeckId) {
        await dispatch(updateDeck({ deckId: editingDeckId, data: { deckName: newDeckTitle } /*, tags*/ })).unwrap();
        dispatch(showToast({ message: '덱이 수정되었습니다.', severity: 'success' }));
      } else {
        await dispatch(createDeck({ deckName: newDeckTitle /*, tags*/ })).unwrap();
        dispatch(showToast({ message: '덱이 성공적으로 생성되었습니다.', severity: 'success' }));
      }
      handleCreateDialogClose();
    } catch (err) {
      dispatch(showToast({ message: '덱 생성에 실패했습니다.', severity: 'error' }));
    }
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
      {/* 🔹 필터 버튼, 태그, 북마크 UI 모두 주석 처리 (덱에서는 미사용) */}
      {/**
      <FilterBox> ... </FilterBox>
      <SelectedTagsBox> ... </SelectedTagsBox>
      <Menu ...> ... </Menu>
      */}
      {/* 🔹 로딩/에러 상태 */}
      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}
      {!loading && error && <Typography color="error" align="center" py={5}>오류: {error}</Typography>}
      {/* 🔹 덱 목록 그리드 렌더링 (태그/북마크 UI 제거) */}
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
          {decks.map((deck) => (
            <DeckCard key={deck.deckId} onClick={() => handleDeckClick(deck.deckId)}>
              {/*  덱 이름 */}
              <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                <Typography variant="h6" noWrap sx={{ maxWidth: '100%' }}>{deck.deckName}</Typography>
              </Box>
              {/* 카드 개수 */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                카드 {deck.cardCnt}개
              </Typography>
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
      {!loading && !error && decks.length === 0 && (
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
          {/**
          <TextField
            margin="dense"
            label="태그 (쉼표로 구분, 자동으로 # 추가)"
            fullWidth
            variant="outlined"
            value={newDeckTags}
            onChange={(e) => setNewDeckTags(e.target.value)}
            placeholder="예: React, 자바스크립트"
          />
          덱에서는 태그 미사용
          */}
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