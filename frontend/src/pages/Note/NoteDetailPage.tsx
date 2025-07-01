import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchNote, clearCurrentNote } from '../../store/slices/noteSlice';
import Alert from '../../components/ui/Alert';

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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '800px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          노트 상세
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {currentNote && (
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>{currentNote.noteTitle}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
            생성: {new Date(currentNote.createdAt).toLocaleString()} / 수정: {new Date(currentNote.updatedAt).toLocaleString()}
          </Typography>

          {/* 노트 내용: HTML 저장된 경우 render, 아니면 그대로 표시 */}
          {currentNote.noteContent ? (
            <Box
              sx={{
                lineHeight: 1.6,
                '& img': { maxWidth: '100%' },
              }}
              dangerouslySetInnerHTML={{ __html: currentNote.noteContent }}
            />
          ) : (
            <Typography variant="body1" color="text.secondary">
              내용이 없습니다.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default NoteDetailPage;
