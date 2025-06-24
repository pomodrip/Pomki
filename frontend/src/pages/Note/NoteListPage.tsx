import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Container, Box, Fab, CircularProgress, Grid } from '@mui/material';
import { Text, IconButton } from '../../components/ui';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Quiz as QuizIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNotes, deleteNoteAsync } from '../../store/slices/noteSlice';
import { useDialog } from '../../hooks/useDialog';
import { useNotifications } from '../../hooks/useUI';

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
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  transition: 'box-shadow 0.3s',
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
  const { success: showSuccess, error: showError } = useNotifications();

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError('오류', error);
    }
  }, [error, showError]);

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
    });

    if (confirmed) {
      try {
        await dispatch(deleteNoteAsync(noteId)).unwrap();
        showSuccess('성공', '노트가 성공적으로 삭제되었습니다.');
      } catch (e: unknown) {
        const error = e as { message?: string };
        showError('삭제 실패', error.message || '노트 삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  const handleCreateQuiz = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    showSuccess('퀴즈 생성', '플래시카드 생성 페이지로 이동합니다.');
    navigate(`/study/${noteId}/flashcard-generation`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
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
              <Text
                variant="h6"
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {note.noteTitle}
              </Text>
              <Text variant="body2" color="textSecondary">
                Updated: {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
              <ActionBox>
                <IconButton size="small" onClick={e => handleCreateQuiz(note.noteId, e)}>
                  <QuizIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={e => handleEditNote(note.noteId, e)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={e => handleDeleteNote(note.noteId, e)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ActionBox>
            </NoteCard>
          </Grid>
        ))}
      </Grid>
    </StyledContainer>
  );
};

export default NoteListPage;
