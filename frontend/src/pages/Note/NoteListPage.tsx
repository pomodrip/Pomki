import React, { useEffect, useState, useMemo, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Fab, 
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography
} from '@mui/material';
import CircularProgress from '../../components/ui/CircularProgress';
import { Text, Button, Modal } from '../../components/ui';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorder from '@mui/icons-material/BookmarkBorder';
import Bookmark from '@mui/icons-material/Bookmark';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteNoteAsync, fetchNotes, fetchNote, toggleNoteBookmark } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';
import { showToast } from '../../store/slices/toastSlice';
import { setFilters } from '../../store/slices/studySlice';
import {
  adjustFabForScreenSize,
  setFabVisible,
  selectFab,
} from '../../store/slices/uiSlice';
import type { Note } from '../../types/note';
import { useResponsive } from '../../hooks/useResponsive';
import Toast from '../../components/common/Toast';
import { generateQuizPreview } from '../../api/quizApi';
import { formatDateToLocalDateString } from '@/utils/formatDate';

// 🎯 클라이언트 측에서만 관리할 추가 정보 (isBookmarked, tags)
interface ClientSideNoteInfo {
  isBookmarked: boolean;
  tags?: string[]; // 🏷️ 클라이언트 측 임시 태그 (노트 자체 태그 우선)
}

// 🎯 API 데이터와 클라이언트 측 데이터를 합친 타입
type EnrichedNote = Note & ClientSideNoteInfo;

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
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

const NoteCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
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

const ActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '8px',
  marginTop: '24px',
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  '& .MuiButton-root': {
    flex: 1,
    whiteSpace: 'nowrap',
    minWidth: 'auto',
    padding: theme.spacing(0.5, 1),
    fontSize: '0.8rem',
    '&.MuiButton-containedPrimary': {
      color: theme.palette.common.white,
    },
    '&.MuiButton-outlinedError': {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
  },
}));

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
  right: theme.spacing(2),
  ...(isMobile
    ? { bottom: 80 }
    : { top: theme.spacing(2) }),
  boxShadow: theme.shadows[4],
}));

const NoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, error, noteTags, bookmarkedNoteIds } = useAppSelector(state => state.note);
  const { filters } = useAppSelector((state) => state.study);
  const { showConfirmDialog } = useDialog();
  const { isMobile } = useResponsive();
  const fab = useAppSelector(selectFab);
  const { bottomNavVisible } = useAppSelector((state) => state.ui);

  const tagFilterButtonRef = useRef<HTMLButtonElement>(null);
  const bookmarkFilterButtonRef = useRef<HTMLButtonElement>(null);

  // 🎯 클라이언트 측 상태 (북마크, 태그) 및 퀴즈 생성 로딩 상태
  
  const [generatingQuizId, setGeneratingQuizId] = useState<string | null>(null);
  
  // 🎯 메뉴 상태
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);
  
  // 🎯 카드 생성 확인 다이얼로그 상태
  const [cardGenerationDialog, setCardGenerationDialog] = useState<{
    open: boolean;
    note: EnrichedNote | null;
  }>({ open: false, note: null });

  // 🔍 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EnrichedNote[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

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

  // 🎯 필터링 및 UI 렌더링을 위한 데이터 합치기
  const enrichedNotes: EnrichedNote[] = useMemo(() => {
    return notes.map(note => ({
      ...note,
      tags: noteTags[note.noteId] || [], // 🏷️ Redux에서 가져온 태그 정보 사용
      isBookmarked: bookmarkedNoteIds.includes(note.noteId),
    })) as EnrichedNote[];
  }, [notes, noteTags, bookmarkedNoteIds]);
  
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    if (Array.isArray(enrichedNotes)) {
      enrichedNotes.forEach((note) => {
        if (Array.isArray(note.tags)) {
          note.tags.forEach((tag: string) => tagSet.add(tag));
        }
      });
    }
    return Array.from(tagSet);
  }, [enrichedNotes]);

  // 🔍 검색/필터 조합 메모이제이션
  const filteredNotes = useMemo(() => {
    const notesToFilter = searchResults.length > 0 ? searchResults : enrichedNotes;

    return notesToFilter.filter(note => {
      const noteTagsSafe = note.tags || [];
      const matchesTags = filters.selectedTags.length === 0 ||
                         filters.selectedTags.some((tag: string) => noteTagsSafe.includes(tag));

      const matchesBookmark = !filters.showBookmarked || note.isBookmarked;

      return matchesTags && matchesBookmark;
    });
  }, [filters.selectedTags, filters.showBookmarked, searchResults, enrichedNotes]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // 🔍 검색 실행
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const queryLower = searchQuery.trim().toLowerCase();
    const results = enrichedNotes.filter(note =>
      note.noteTitle.toLowerCase().includes(queryLower) ||
      (note.noteContent ? note.noteContent.toLowerCase().includes(queryLower) : false)
    );

    setSearchResults(results);
    setIsSearching(false);

    dispatch(showToast({
      message: `${results.length}개의 노트를 찾았습니다.`,
      severity: 'info',
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTagSelect = (tag: string) => {
    const newSelectedTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter((t: string) => t !== tag)
      : [...filters.selectedTags, tag];
    
    dispatch(setFilters({ selectedTags: newSelectedTags }));
    // 메뉴를 닫지 않고 여러 태그를 선택할 수 있도록 setTagMenuAnchor(null) 제거
  };

  const handleCloseTagMenu = () => {
    setTagMenuAnchor(null);
    tagFilterButtonRef.current?.focus();
  };

  const handleClearTags = () => {
    dispatch(setFilters({ selectedTags: [] }));
  };

  const handleBookmarkFilter = (showBookmarkedValue: boolean) => {
    dispatch(setFilters({ showBookmarked: showBookmarkedValue }));
    setBookmarkMenuAnchor(null);
    bookmarkFilterButtonRef.current?.focus();
  };

  const handleToggleBookmark = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const isBookmarked = bookmarkedNoteIds.includes(noteId);
    try {
      await dispatch(toggleNoteBookmark(noteId)).unwrap();
      dispatch(
        showToast({
          message: isBookmarked ? '북마크에서 제거했습니다.' : '북마크에 추가했습니다.',
          severity: 'success',
        }),
      );
    } catch (err) {
      const error = err as Error;
      dispatch(showToast({ message: error.message || '북마크 변경에 실패했습니다.', severity: 'error' }));
    }
  };

  const formatDate = (createdAt: string, updatedAt: string) => {
    const getValidDate = (dateString: string) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const createdDate = getValidDate(createdAt);
    const updatedDate = getValidDate(updatedAt);

    if (!createdDate) {
      return '날짜 정보 없음';
    }

    if (updatedDate && updatedDate.getTime() > createdDate.getTime() + 60000) { // 1분 이상 차이
      return `${formatDateToLocalDateString(updatedAt)} 수정됨`;
    }
    return `${formatDateToLocalDateString(createdAt)} 작성됨`;
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  const handleEditNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/note/${noteId}/edit`);
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // 📌 기본 confirm 다이얼로그 사용 (Deck 삭제 방식과 동일)
    if (window.confirm('정말로 이 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        await dispatch(deleteNoteAsync(noteId)).unwrap();
        dispatch(showToast({ message: '노트가 성공적으로 삭제되었습니다.', severity: 'success' }));
      } catch (err) {
        const error = err as Error;
        dispatch(showToast({ message: error.message || '노트 삭제에 실패했습니다.', severity: 'error' }));
      }
    }
  };
  
  const handleGenerateFlashcards = async (note: EnrichedNote, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // 사용 횟수 확인 (localStorage 사용)
    const usageCount = parseInt(localStorage.getItem('cardGenerationUsageCount') || '0', 10);
    
    // 모바일에서는 3번 이하일 때만 바텀시트 표시
    if (isMobile && usageCount < 3) {
      setCardGenerationDialog({ open: true, note });
      return;
    }
    
    // 3번 이상 사용했거나 데스크톱에서는 바로 실행
    executeCardGeneration(note);
  };
  
  const executeCardGeneration = async (note: EnrichedNote) => {
    setGeneratingQuizId(note.noteId);
    setCardGenerationDialog({ open: false, note: null });
    
    // 사용 횟수 증가
    const currentCount = parseInt(localStorage.getItem('cardGenerationUsageCount') || '0', 10);
    localStorage.setItem('cardGenerationUsageCount', (currentCount + 1).toString());
    
    try {
      // 1. 노트의 상세 정보 (noteContent 포함) 가져오기
      const fullNote = await dispatch(fetchNote(note.noteId)).unwrap();

      if (!fullNote.noteContent || fullNote.noteContent.trim() === '') {
        dispatch(showToast({
          message: '노트 내용이 비어있어 퀴즈를 생성할 수 없습니다.',
          severity: 'warning',
        }));
        setGeneratingQuizId(null);
        return;
      }

      // 2. API를 호출하여 퀴즈 생성
      const quizzes = await generateQuizPreview({
        noteTitle: fullNote.noteTitle,
        noteContent: fullNote.noteContent,
      });

      // 3. 퀴즈 생성 페이지로 이동 (생성된 퀴즈 데이터와 함께)
      navigate(`/study/${note.noteId}/flashcard-generation`, {
        state: { quizzes, noteTitle: fullNote.noteTitle },
      });

    } catch (err) {
      const error = err as Error;
      console.error('퀴즈 생성 실패:', error);
      dispatch(showToast({
        message: error.message || '퀴즈 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
        severity: 'error',
      }));
    } finally {
      setGeneratingQuizId(null);
    }
  };

  return (
    <StyledContainer maxWidth="md">
      {/* Toast 위치: 중앙 상단/바텀네비 위 */}
      <Toast />
      {/* 🔹 헤더 영역 */}
      <HeaderBox>
        <Typography variant="h4" fontWeight="bold">
          My Notes
        </Typography>
      </HeaderBox>
      {/* 🔹 반응형 플로팅 FAB */}
      {fab.visible && (
        <FloatingFab
          color="primary"
          aria-label="노트 생성"
          isMobile={isMobile}
          onClick={() => navigate('/note/create')}
          size={fab.size}
          disabled={fab.disabled}
        >
          <AddIcon />
        </FloatingFab>
      )}

      {/* 검색 */}
      <SearchBox>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="노트 검색..."
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
            🔍 검색 결과: "{searchQuery}" 키워드로 {searchResults.length}개의 노트를 찾았습니다.
          </Typography>
        </Box>
      )}

      {/* 🔹 필터 영역 */}
      <FilterBox>
        <Button
          id="tags-button"
          ref={tagFilterButtonRef}
          variant="outlined"
          onClick={(e) => setTagMenuAnchor(e.currentTarget)}
          aria-controls={tagMenuAnchor ? 'tags-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={tagMenuAnchor ? 'true' : undefined}
        >
          태그 필터
        </Button>
        <Button
          id="bookmark-button"
          ref={bookmarkFilterButtonRef}
          variant="outlined"
          onClick={(e) => setBookmarkMenuAnchor(e.currentTarget)}
          aria-controls={bookmarkMenuAnchor ? 'bookmark-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={bookmarkMenuAnchor ? 'true' : undefined}
        >
          북마크만 보기 ({filters.showBookmarked ? 'ON' : 'OFF'})
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
        id="tags-menu"
        anchorEl={tagMenuAnchor}
        open={Boolean(tagMenuAnchor)}
        onClose={handleCloseTagMenu}
        MenuListProps={{
          'aria-labelledby': 'tags-button',
        }}
      >
        {allTags.map(tag => (
          <MenuItem key={tag} onClick={() => handleTagSelect(tag)}>
            {tag}
          </MenuItem>
        ))}
      </Menu>

      {/* 북마크 메뉴 */}
      <Menu
        id="bookmark-menu"
        anchorEl={bookmarkMenuAnchor}
        open={Boolean(bookmarkMenuAnchor)}
        onClose={() => {
          setBookmarkMenuAnchor(null);
          bookmarkFilterButtonRef.current?.focus();
        }}
        MenuListProps={{
          'aria-labelledby': 'bookmark-button',
        }}
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
      
      {/* 🔹 노트 목록 그리드 렌더링 */}
      {!loading && !error && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(280px, 1fr))',
              md: 'repeat(auto-fit, minmax(300px, 1fr))',
            },
            gap: { xs: 1, sm: 2 },
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {filteredNotes.map(note => (
            <NoteCard key={note.noteId} onClick={() => handleNoteClick(note.noteId)}>
              {/* 노트 이름과 북마크 버튼 */}
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ minHeight: 40 }}>
                <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 32px)' }}>{note.noteTitle}</Typography>
                <IconButton size="small" onClick={(e) => handleToggleBookmark(note.noteId, e)} aria-label={note.isBookmarked ? '북마크 제거' : '북마크 추가'}>
                  {note.isBookmarked ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Box>
              
              {/* 날짜 정보 */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(note.createdAt, note.updatedAt)}
              </Typography>
              
              {/* 태그들 */}
              <Box 
                mt={1.5}
                mb={1}
                sx={{ 
                  minHeight: 24,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                }}
              >
                {(isMobile ? (note.tags || []).slice(0, 5) : (note.tags || [])).map(tag => (
                  <TagChip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                ))}
                {isMobile && (note.tags && note.tags.length > 5) && (
                  <TagChip label={`+${(note.tags || []).length - 5}`} size="small" color="primary" variant="outlined" />
                )}
              </Box>
              
              {/* 액션 버튼들 */}
              <ActionBox>
                <Button variant="outlined" startIcon={<EditIcon />} onClick={(e) => handleEditNote(note.noteId, e)}>수정</Button>
                <Button 
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={(e) => handleDeleteNote(note.noteId, e)}
                  color="error"
                >
                  삭제
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={generatingQuizId === note.noteId ? <CircularProgress size={20} color="inherit" /> : <QuizIcon />}
                  onClick={(e) => handleGenerateFlashcards(note, e)}
                  disabled={generatingQuizId === note.noteId}
                  title="AI가 노트를 분석해 카드 후보를 제안합니다"
                >
                  {generatingQuizId === note.noteId ? '생성중...' : '카드 생성'}
                </Button>
              </ActionBox>
            </NoteCard>
          ))}
        </Box>
      )}
      
      {/* 🔹 빈 상태 안내 */}
      {!loading && !error && filteredNotes.length === 0 && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          py={8}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            노트가 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            첫 번째 노트를 만들어보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/note/create')}
          >
            노트 만들기
          </Button>
        </Box>
      )}

      {/* 🎯 카드 생성 확인 다이얼로그 (모바일용) */}
      <Modal
        open={cardGenerationDialog.open}
        onClose={() => setCardGenerationDialog({ open: false, note: null })}
        title="AI 카드 생성"
        variant={isMobile ? 'bottomSheet' : 'dialog'}
        actions={
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto'
          }}>
            <Button
              onClick={() => setCardGenerationDialog({ open: false, note: null })}
              variant="outlined"
              fullWidth={isMobile}
            >
              취소
            </Button>
            <Button
              onClick={() => cardGenerationDialog.note && executeCardGeneration(cardGenerationDialog.note)}
              variant="contained"
              fullWidth={isMobile}
            >
              생성하기
            </Button>
          </Box>
        }
      >
        <Text variant="body1" color="text.secondary">
          노트 내용을 분석해 학습용 카드를 자동으로 만들어드립니다.
        </Text>
      </Modal>
    </StyledContainer>
  );
};

export default NoteListPage;
