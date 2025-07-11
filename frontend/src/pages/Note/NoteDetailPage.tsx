import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Button, Container, TextField, Chip } from '@mui/material';
import CircularProgress from '../../components/ui/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNote, clearCurrentNote } from '../../store/slices/noteSlice';
import Alert from '../../components/ui/Alert';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ListIcon from '@mui/icons-material/List';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import theme from '../../theme/theme';

const NoteDetailPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentNote, loading, error } = useAppSelector(state => state.note);

  useEffect(() => {
    if (noteId) {
      dispatch(fetchNote(noteId));
    }

    return () => {
      // 페이지 떠날 때 currentNote 정리
      dispatch(clearCurrentNote());
    };
  }, [dispatch, noteId]);

  const handleBack = () => {
    navigate('/note');
  };

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

  const ContentBox = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    minHeight: '300px',
    lineHeight: 1.6,
    '& img': { maxWidth: '100%' },
  }));

  const FormBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  }));

  const sanitizedContent = useMemo(() => {
    if (!currentNote) return '';
    const rawMarkup = marked(currentNote.noteContent);
    return DOMPurify.sanitize(rawMarkup);
  }, [currentNote]);

  return (
    <StyledContainer maxWidth="md">
      <HeaderBox>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
          노트 상세
        </Typography>
        {noteId && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ListIcon />}
              onClick={() => navigate('/note')}
            >
              목록
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/note/${noteId}/edit`)}
            >
              편집
            </Button>
          </Box>
        )}
      </HeaderBox>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {currentNote && (
        <Box>
          {/* 메타 정보 및 폼 */}
          <FormBox>
            <TextField
              label="제목"
              fullWidth
              value={currentNote.noteTitle}
              InputProps={{ readOnly: true }}
              variant="outlined"
            />

            {/* 메타 정보 */}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              생성: {new Date(currentNote.createdAt).toLocaleString()}
              {currentNote.updatedAt && currentNote.updatedAt !== currentNote.createdAt && (
                <> / 수정: {new Date(currentNote.updatedAt).toLocaleString()}</>
              )}
            </Typography>

            {/* 태그 표시 */}
            {currentNote.tags && currentNote.tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                {currentNote.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            )}

            {currentNote.noteContent ? (
              <Box
                sx={{
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: '8px',
                  padding: theme => theme.spacing(5),
                  minHeight: '150px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  backgroundColor: theme => theme.palette.background.paper,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-all',
                  '& img': { maxWidth: '100%' },
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            ) : (
              <Typography variant="body1" color="text.secondary">
                내용이 없습니다.
              </Typography>
            )}
          </FormBox>
        </Box>
      )}
    </StyledContainer>
  );
};

export default NoteDetailPage;
