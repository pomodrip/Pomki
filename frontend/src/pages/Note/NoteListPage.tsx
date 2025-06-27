import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Container, Box, Fab, CircularProgress, Button } from '@mui/material';
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
  justifyContent: 'flex-start',
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
        {notes.map(note => (
          <NoteCard key={note.noteId} onClick={() => handleNoteClick(note.noteId)}>
            <Text variant="h6">{note.noteTitle}</Text>
            <Text variant="body2" color="textSecondary">
              {formatDate(note.createdAt, note.updatedAt)}
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
        ))}
      </Box>
    </StyledContainer>
  );
};

export default NoteListPage;
