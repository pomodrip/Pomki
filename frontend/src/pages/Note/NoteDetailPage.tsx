import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNote, clearCurrentNote } from '../../store/slices/noteSlice';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Button,
  Paper,
} from '@mui/material';
import { Text, IconButton, Tag } from '../../components/ui';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
}));

const NoteDetailPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentNote, loading } = useAppSelector((state) => state.note);

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
      <StyledContainer maxWidth="md">
        <Text>로딩 중...</Text>
      </StyledContainer>
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
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentNote.title}
          </Text>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/note/${currentNote.id}/edit`)}
        >
          수정
        </Button>
      </HeaderBox>
      
      <Box mb={2}>
        {(currentNote.tags || []).map((tag) => (
          <Tag key={tag.id} label={tag.tagName} sx={{ mr: 1 }} />
        ))}
      </Box>

      <ContentPaper variant="outlined">
        <Text variant="body1">
            {currentNote.content}
        </Text>
      </ContentPaper>
      
      <Box mt={2}>
        <Text variant="caption" color="textSecondary">
          마지막 수정: {new Date(currentNote.updatedAt).toLocaleString()}
        </Text>
      </Box>

    </StyledContainer>
  );
};

export default NoteDetailPage;
