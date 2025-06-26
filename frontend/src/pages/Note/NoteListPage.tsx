import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Container, Box, Fab, CircularProgress, Grid, Button } from '@mui/material';
import { Text } from '../../components/ui';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Quiz as QuizIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { deleteNoteAsync, fetchNotes } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';
import { showToast } from '../../store/slices/toastSlice';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(10),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const NoteCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ActionBox = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  marginTop: '8px',
});

const NoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { notes, loading, error } = useAppSelector(state => state.note);
  const { showConfirmDialog } = useDialog();

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

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
      <HeaderBox>
        <Text variant="h4" fontWeight="bold">
          My Notes
        </Text>
        <Fab color="primary" aria-label="add" onClick={() => navigate('/note/create')}>
          <AddIcon />
        </Fab>
      </HeaderBox>

      <Grid container spacing={2}>
        {notes.map(note => (
          <Grid item xs={12} sm={6} md={4} key={note.noteId}>
            <NoteCard onClick={() => handleNoteClick(note.noteId)}>
              <Text variant="h6">{note.noteTitle}</Text>
              <Text variant="body2" color="textSecondary">
                마지막 수정: {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
              <ActionBox>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QuizIcon />}
                  onClick={(e: React.MouseEvent) => handleGenerateFlashcards(note.noteId, e)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  퀴즈 생성
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
              </ActionBox>
            </NoteCard>
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default NoteListPage;
