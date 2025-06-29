import React, { useEffect, useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Fab, 
  CircularProgress, 
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Typography
} from '@mui/material';
import { Text } from '../../components/ui';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Quiz as QuizIcon,
  Search as SearchIcon,
  BookmarkBorder,
  Bookmark,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteNoteAsync, fetchNotes } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';
import { showToast, hideToast } from '../../store/slices/toastSlice';
import { setFilters } from '../../store/slices/studySlice';
import type { Note } from '../../types/note';
import { useResponsive } from '../../hooks/useResponsive';
import Toast from '../../components/common/Toast';
import {
  adjustFabForScreenSize,
  setFabVisible,
  selectFab,
} from '../../store/slices/uiSlice';

// 🎯 클라이언트 측에서만 관리할 추가 정보 (isBookmarked, tags)
interface ClientSideNoteInfo {
  isBookmarked: boolean;
  tags: string[];
}

// 🎯 API 데이터와 클라이언트 측 데이터를 합친 타입
type EnrichedNote = Note & ClientSideNoteInfo;

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

const NoteCard = styled(Box)(({ theme }) => ({
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
  marginTop: '24px',
});

const SelectedTagsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  minHeight: theme.spacing(4),
  flexWrap: 'wrap',
}));

// FAB 반응형 위치 스타일
const FloatingFab = styled(Fab)<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  position: isMobile ? 'fixed' : 'absolute',
  zIndex: theme.zIndex.fab || 1201,
  right: theme.spacing(4),
  ...(isMobile
    ? { bottom: 80 } // 바텀네비 위
    : { top: theme.spacing(2) }), // 컨테이너 상단
  boxShadow: theme.shadows[4],
}));

const NoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector(state => state.note);
  const { filters } = useAppSelector((state) => state.study);
  const { showConfirmDialog } = useDialog();
  const { isMobile } = useResponsive();
  const fab = useAppSelector(selectFab);
  const { bottomNavVisible } = useAppSelector((state) => state.ui);

  // 🎯 클라이언트 측 상태 (북마크, 태그)
  const [clientSideInfo, setClientSideInfo] = useState<{ [noteId: string]: ClientSideNoteInfo }>({});
  
  // 🎯 메뉴 상태
  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  // 🎯 Mock 데이터로 클라이언트 측 정보 초기화
  useEffect(() => {
    if (notes.length > 0) {
      setClientSideInfo(prevInfo => {
        const newInfo = { ...prevInfo };
        notes.forEach((note, index) => {
          if (!newInfo[note.noteId]) {
            // 노트별로 다양한 태그 생성
            const tagSets = [
              ['#학습', '#중요', '#복습'],
              ['#아이디어', '#창의', '#영감'],
              ['#업무', '#회의', '#계획'],
              ['#개발', '#코딩', '#기술'],
              ['#독서', '#책', '#요약'],
              ['#일기', '#개인', '#감정'],
              ['#목표', '#성장', '#동기'],
              ['#정보', '#자료', '#참고'],
            ];
            
            newInfo[note.noteId] = {
              isBookmarked: Math.random() > 0.5,
              tags: tagSets[index % tagSets.length],
            };
          }
        });
        return newInfo;
      });
    }
  }, [notes]);

  // 🎯 필터링 및 UI 렌더링을 위한 데이터 합치기
  const enrichedNotes: EnrichedNote[] = useMemo(() => {
    return notes.map(note => ({
      ...note,
      ...(clientSideInfo[note.noteId] || { isBookmarked: false, tags: [] }),
    } as EnrichedNote));
  }, [notes, clientSideInfo]);
  
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

  const filteredNotes = useMemo(() => {
    return enrichedNotes.filter((note) => {
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => note.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || note.isBookmarked;

      const matchesSearch = filters.searchQuery.trim() === '' || 
                            note.noteTitle.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return matchesTags && matchesBookmark && matchesSearch;
    });
  }, [filters, enrichedNotes]);

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

  const handleToggleBookmark = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const currentBookmarkStatus = clientSideInfo[noteId]?.isBookmarked;
    const newBookmarkStatus = !currentBookmarkStatus;
    
    setClientSideInfo(prev => ({
      ...prev,
      [noteId]: {
        ...(prev[noteId] || { tags: [] }),
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

  // 날짜 포맷팅 함수 개선 - UX 향상
  const formatDate = (createdAt: string, updatedAt: string) => {
    // 유효하지 않은 날짜 처리
    const getValidDate = (dateString: string) => {
      if (!dateString || dateString === '1970-01-01T00:00:00.000Z') {
        return null;
      }
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };

    const createdDate = getValidDate(createdAt);
    const updatedDate = getValidDate(updatedAt);
    
    // 둘 다 유효하지 않은 경우
    if (!createdDate && !updatedDate) {
      return '작성됨: 방금 전';
    }
    
    // 생성일만 유효한 경우 (처음 생성)
    if (createdDate && !updatedDate) {
      return `작성됨: ${createdDate.toLocaleDateString()}`;
    }
    
    // 수정일만 유효한 경우 (생성일 불명)
    if (!createdDate && updatedDate) {
      return `수정됨: ${updatedDate.toLocaleDateString()}`;
    }
    
    // 둘 다 유효한 경우
    if (createdDate && updatedDate) {
      // 디버깅을 위한 로그
      console.log('Date comparison:', {
        createdAt: createdDate.toISOString(),
        updatedAt: updatedDate.toISOString(),
        createdTime: createdDate.getTime(),
        updatedTime: updatedDate.getTime(),
        timeDiff: Math.abs(updatedDate.getTime() - createdDate.getTime()) / 1000
      });
      
      const now = new Date();
      const isCreatedToday = createdDate.toDateString() === now.toDateString();
      const isUpdatedToday = updatedDate.toDateString() === now.toDateString();
      
      // 실제 수정 여부 판단 (시간까지 비교, 1초 이상 차이나면 수정된 것으로 간주)
      const timeDifferenceInSeconds = Math.abs(updatedDate.getTime() - createdDate.getTime()) / 1000;
      const wasActuallyUpdated = timeDifferenceInSeconds > 1;
      
      // 수정되지 않은 경우 (생성일과 수정일이 거의 같음)
      if (!wasActuallyUpdated) {
        if (isCreatedToday) {
          return '작성됨: 방금 전';
        } else {
          return `작성됨: ${createdDate.toLocaleDateString()}`;
        }
      } 
      // 실제로 수정된 경우
      else {
        const updatedText = isUpdatedToday ? '방금 전' : updatedDate.toLocaleDateString();
        const createdText = isCreatedToday ? '오늘' : createdDate.toLocaleDateString();
        return `수정됨: ${updatedText} (작성: ${createdText})`;
      }
    }
    
    return '날짜 정보 없음';
  };

  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}/edit`);
  };

  const handleEditNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/note/${noteId}/edit`);
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const confirmed = await showConfirmDialog({
      title: '노트 삭제',
      message: '정말로 이 노트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    });

    if (confirmed) {
      try {
        await dispatch(deleteNoteAsync(noteId)).unwrap();
        dispatch(showToast({ message: '노트가 삭제되었습니다.', severity: 'success' }));
        // 삭제 후 목록을 다시 불러올 필요 없이 슬라이스에서 처리됩니다.
      } catch (err) {
        dispatch(showToast({ message: '노트 삭제에 실패했습니다.', severity: 'error' }));
        console.error('Failed to delete note: ', err);
      }
    }
  };
  
  const handleGenerateFlashcards = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/study/${noteId}/flashcard-generation`);
  }; 

  // FAB 위치/표시 Redux 관리 (덱과 동일)
  React.useEffect(() => {
    dispatch(setFabVisible(true));
    dispatch(adjustFabForScreenSize({
      isMobile,
      hasBottomNav: bottomNavVisible,
    }));
    return () => {
      dispatch(setFabVisible(false));
    };
  }, [dispatch, isMobile, bottomNavVisible]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box>Error: {error}</Box>;
  }

  return (
    <StyledContainer maxWidth="md">
      {/* Toast 위치: 중앙 상단/바텀네비 위 */}
      <Toast />
      <HeaderBox>
        <Text variant="h4" fontWeight="bold">
          My Notes
        </Text>
      </HeaderBox>
      {/* 반응형 플로팅 FAB */}
      {fab.visible && (
        <FloatingFab
          color="primary"
          aria-label="add"
          isMobile={isMobile}
          onClick={() => navigate('/note/create')}
          size={fab.size}
          disabled={fab.disabled}
        >
          <AddIcon />
        </FloatingFab>
      )}

      <SearchBox>
        <TextField
          variant="outlined"
          placeholder="노트 제목으로 검색..."
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
        {filteredNotes.map(note => (
          <NoteCard key={note.noteId} onClick={() => handleNoteClick(note.noteId)}>
            {/* 노트 이름과 북마크 버튼 */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 32px)' }}>{note.noteTitle}</Typography>
              <IconButton size="small" onClick={(e) => handleToggleBookmark(note.noteId, e)}>
                {note.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>
            
            {/* 날짜 정보 */}
            <Text variant="body2" color="textSecondary">
              {formatDate(note.createdAt, note.updatedAt)}
            </Text>
            
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
              {(isMobile ? note.tags.slice(0, 5) : note.tags).map(tag => (
                <TagChip key={tag} label={tag} size="small" color="primary" variant="outlined" />
              ))}
              {isMobile && note.tags.length > 5 && (
                <TagChip label={`+${note.tags.length - 5}`} size="small" color="primary" variant="outlined" />
              )}
            </Box>
            
            {/* 액션 버튼들 */}
            <ActionBox>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDeleteNote(note.noteId, e);
                }}
                sx={{ whiteSpace: 'nowrap' }}
              >
                삭제
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={(e: React.MouseEvent) => handleEditNote(note.noteId, e)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                수정
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<QuizIcon />}
                onClick={(e: React.MouseEvent) => handleGenerateFlashcards(note.noteId, e)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                퀴즈 생성
              </Button>
            </ActionBox>
          </NoteCard>
        ))}
      </Box>
    </StyledContainer>
  );
};

export default NoteListPage;
