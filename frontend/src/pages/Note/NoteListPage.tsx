import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Fab,
  CircularProgress,
} from '@mui/material';
import { Text, IconButton, Tag, Button, Card } from '../../components/ui';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  BookmarkBorder,
  Bookmark,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
// import { fetchNotes, deleteNote, setFilters, toggleBookmark } from '../../store/slices/noteSlice';
import { deleteNote, setFilters, toggleBookmark } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';
import { useNotifications, useUI } from '../../hooks/useUI';
// import type { Note, Tag } from '../../types/note';

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

const NoteCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const TagTag = styled(Tag)(({ theme }) => ({
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

const NoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, filters } = useAppSelector((state) => state.note);
  const { showConfirmDialog } = useDialog();
  const { success, error } = useNotifications();
  const { globalLoading, showGlobalLoading, hideGlobalLoading } = useUI();

  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  // 모든 태그 목록 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tagSet.add(tag.tagName));
    });
    return Array.from(tagSet);
  }, [notes]);

  // 필터링된 노트 목록
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = note.noteTitle.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           note.noteContent.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => note.tags?.some(t => t.tagName === tag));
      
      const matchesBookmark = !filters.showBookmarked || note.isBookmarked;

      return matchesSearch && matchesTags && matchesBookmark;
    });
  }, [notes, filters]);

  useEffect(() => {
    // dispatch(fetchNotes()); // 주석 처리: 재??mock ??용
  }, [dispatch]);

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

  const handleBookmarkFilter = (showBookmarked: boolean) => {
    dispatch(setFilters({ showBookmarked }));
    setBookmarkMenuAnchor(null);
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
    
    const confirmed = await showConfirmDialog({
      title: '노트 삭제',
      message: '이 노트를 정말 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
    });

    if (confirmed) {
      try {
        showGlobalLoading('노트를 삭제하는 중...');
        await dispatch(deleteNote(noteId)).unwrap();
        success('노트 삭제 완료', '노트가 성공적으로 삭제되었습니다.');
      } catch {
        error('삭제 실패', '노트 삭제 중 오류가 발생했습니다.');
      } finally {
        hideGlobalLoading();
      }
    }
  };

  const handleCreateQuiz = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    success('퀴즈 생성', '플래시카드 생성 페이지로 이동합니다.');
    navigate(`/study/${noteId}/flashcard-generation`);
  };

  const handleToggleBookmark = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(toggleBookmark(noteId));
    const note = notes.find(n => n.noteId === noteId);
    if (note) {
      if (note.isBookmarked) {
        success('북마크 해제', '북마크가 해제되었습니다.');
      } else {
        success('북마크 추가', '북마크에 추가되었습니다.');
      }
    }
  };

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Text variant="h5" fontWeight="bold">
          My Notes
        </Text>
        <IconButton onClick={() => navigate('/note/create')}>
          <AddIcon />
        </IconButton>
      </HeaderBox>

      {/* 검색창 */}
      <SearchBox>
        <TextField
          fullWidth
          placeholder="Search notes"
          value={filters.searchQuery}
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
          Tags {filters.selectedTags.length > 0 && `(${filters.selectedTags.length})`}
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
        {filters.selectedTags.map((tag: string) => (
          <TagTag
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
        {allTags.map((tag) => (
          <MenuItem
            key={tag}
            selected={filters.selectedTags.includes(tag)}
            onClick={() => handleTagSelect(tag)}
          >
            {tag}
          </MenuItem>
        ))}
      </Menu>

      {/* 북마크 필터 메뉴 */}
      <Menu
        anchorEl={bookmarkMenuAnchor}
        open={Boolean(bookmarkMenuAnchor)}
        onClose={() => setBookmarkMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleBookmarkFilter(true)}>Bookmarked Only</MenuItem>
        <MenuItem onClick={() => handleBookmarkFilter(false)}>Show All</MenuItem>
      </Menu>

      {/* 노트 목록 */}
      <Box>
        {loading || globalLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={5}>
            <CircularProgress />
            <Text sx={{ ml: 2 }}>Loading...</Text>
          </Box>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard key={note.noteId} onClick={() => handleNoteClick(note.noteId)}>
              <div style={{ padding: '16px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Text variant="h6" fontWeight="bold" gutterBottom>
                    {note.noteTitle}
                  </Text>
                  <IconButton onClick={(e) => handleToggleBookmark(note.noteId, e)} size="small">
                    {note.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                </Box>
                
                <Text variant="body2" color="textSecondary">
                  {note.noteContent}
                </Text>
                <Box mt={1.5} display="flex" flexWrap="wrap">
                  {note.tags?.map((tag) => (
                    <TagTag key={tag.tagId} label={tag.tagName} />
                  ))}
                </Box>

                <ActionBox>
                  <ActionButton startIcon={<EditIcon />} onClick={(e) => handleEditNote(note.noteId, e)}>
                    Edit
                  </ActionButton>
                  <ActionButton startIcon={<DeleteIcon />} onClick={(e) => handleDeleteNote(note.noteId, e)}>
                    Delete
                  </ActionButton>
                  <ActionButton startIcon={<QuizIcon />} onClick={(e) => handleCreateQuiz(note.noteId, e)}>
                    Create Quiz
                  </ActionButton>
                </ActionBox>

                <Text variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </Text>
              </div>
            </NoteCard>
          ))
        ) : (
          <Box textAlign="center" py={5}>
            <Text variant="h6" color="textSecondary">
              No notes found
            </Text>
            <Text variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Create your first note!
            </Text>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/note/create')}
            >
              노트 생성
            </Button>
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add note"
        onClick={() => navigate('/note/create')}
        sx={{
          position: 'fixed',
          bottom: (theme) => theme.spacing(10), // BottomNav height + margin
          right: (theme) => theme.spacing(2),
        }}
      >
        <AddIcon />
      </Fab>
    </StyledContainer>
  );
};

export default NoteListPage;
