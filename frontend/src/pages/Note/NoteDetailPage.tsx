import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Paper,
} from '@mui/material';
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
  
  const note = useAppSelector((state) => 
    state.note.notes.find((n) => n.noteId === noteId)
  );

  if (!note) {
    return (
      <StyledContainer maxWidth="md">
        <Typography>Note not found.</Typography>
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
          <Typography variant="h5" fontWeight="bold" noWrap>
            {note.noteTitle}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/note/${note.noteId}/edit`)}
        >
          Edit
        </Button>
      </HeaderBox>
      
      <Box mb={2}>
        {note.tags?.map((tag) => (
          <Chip key={tag.tagId} label={tag.tagName} sx={{ mr: 1 }} />
        ))}
      </Box>

      <ContentPaper variant="outlined">
        <Typography variant="body1">
            {note.noteContent}
        </Typography>
      </ContentPaper>
      
      <Box mt={2}>
        <Typography variant="caption" color="textSecondary">
          Last updated: {new Date(note.updatedAt).toLocaleString()}
        </Typography>
      </Box>

    </StyledContainer>
  );
};

export default NoteDetailPage;
