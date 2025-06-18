import React, { useState, useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Stack,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
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
import { fetchNotes, deleteNote, setFilters, toggleBookmark } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';

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

const TagChip = styled(Chip)(({ theme }) => ({
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

  const [tagMenuAnchor, setTagMenuAnchor] = useState<HTMLElement | null>(null);
  const [bookmarkMenuAnchor, setBookmarkMenuAnchor] = useState<HTMLElement | null>(null);

  // 모든 태그 목록 추출
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [notes]);

  // 필터링된 노트 목록
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           note.content.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesTags = filters.selectedTags.length === 0 || 
                         filters.selectedTags.some((tag: string) => note.tags.includes(tag));
      
      const matchesBookmark = !filters.showBookmarked || note.isBookmarked;

      return matchesSearch && matchesTags && matchesBookmark;
    });
  }, [notes, filters]);

  useEffect(() => {
    dispatch(fetchNotes());
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
    navigate(`/notes/${noteId}`);
  };

  const handleEditNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigate(`/notes/${noteId}/edit`);
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
      dispatch(deleteNote(noteId));
    }
  };

  const handleCreateQuiz = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    // navigate(`/notes/${noteId}/quiz`);
    navigate(`/study/${noteId}/flashcard-generation`);
  };

  const handleToggleBookmark = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(toggleBookmark(noteId));
  };

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            My Notes
          </Typography>
        </Box>
        <IconButton onClick={() => navigate('/notes/create')}>
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
          <TagChip
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
        {allTags.map((tag: string) => (
          <MenuItem 
            key={tag} 
            onClick={() => handleTagSelect(tag)}
            selected={filters.selectedTags.includes(tag)}
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
          모든 노트
        </MenuItem>
        <MenuItem onClick={() => handleBookmarkFilter(true)}>
          북마크된 노트만
        </MenuItem>
      </Menu>

      {/* 노트 목록 */}
      {filteredNotes.map((note) => (
        <NoteCard key={note.id} onClick={() => handleNoteClick(note.id)}>
          <CardContent>
            {/* 태그와 북마크 */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Stack direction="row" spacing={0.5}>
                {note.tags.map((tag: string) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
              <IconButton
                size="small"
                onClick={(e) => handleToggleBookmark(note.id, e)}
              >
                {note.isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            </Box>

            {/* 제목 */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {note.title}
            </Typography>

            {/* 내용 미리보기 */}
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 2
              }}
            >
              {note.content}
            </Typography>

            {/* 액션 버튼들 */}
            <ActionBox>
              <ActionButton
                onClick={(e) => handleEditNote(note.id, e)}
                startIcon={<EditIcon fontSize="small" />}
              >
                수정
              </ActionButton>
              <ActionButton
                onClick={(e) => handleDeleteNote(note.id, e)}
                startIcon={<DeleteIcon fontSize="small" />}
              >
                삭제
              </ActionButton>
              <ActionButton
                onClick={(e) => handleCreateQuiz(note.id, e)}
                startIcon={<QuizIcon fontSize="small" />}
              >
                문제 생성
              </ActionButton>
            </ActionBox>
          </CardContent>
        </NoteCard>
      ))}

      {/* 빈 상태 */}
      {filteredNotes.length === 0 && !loading && (
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
          <Typography variant="body2" color="text.secondary" mb={3}>
            첫 번째 노트를 작성해보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/notes/create')}
          >
            노트 작성
          </Button>
        </Box>
      )}

      {/* 플로팅 액션 버튼 */}
      <Fab
        color="primary"
        aria-label="add note"
        onClick={() => navigate('/notes/create')}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </StyledContainer>
  );
};

export default NoteListPage;
