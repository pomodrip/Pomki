import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNote, clearCurrentNote } from '../../store/slices/noteSlice';
import { styled } from '@mui/material/styles';
import { Container, Box, Button, TextField, CircularProgress } from '@mui/material';
import { Text, IconButton } from '../../components/ui';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const NoteDetailPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentNote, loading } = useAppSelector(state => state.note);

  useEffect(() => {
    if (noteId) {
      dispatch(fetchNote(noteId));
    }

    return () => {
      dispatch(clearCurrentNote());
    };
  }, [noteId, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentNote) {
    return (
      <StyledContainer maxWidth="md">
        <Text>노트를 찾을 수 없습니다.</Text>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="md">
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold">
            노트 상세 정보
          </Text>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/note/${currentNote.noteId}/edit`)}
        >
          수정
        </Button>
      </HeaderBox>

      <FormBox>
        <TextField
          label="제목"
          value={currentNote.noteTitle}
          variant="filled"
          fullWidth
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField
          label="내용"
          value={currentNote.noteContent}
          variant="filled"
          fullWidth
          multiline
          rows={15}
          InputProps={{
            readOnly: true,
          }}
        />
      </FormBox>
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Text variant="caption" color="textSecondary">
          최종 수정일: {new Date(currentNote.updatedAt).toLocaleString()}
        </Text>
      </Box>
    </StyledContainer>
  );
};

export default NoteDetailPage;
