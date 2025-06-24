import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { Text, IconButton } from '../../components/ui';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createNoteAsync, updateNoteAsync, fetchNote, clearCurrentNote } from '../../store/slices/noteSlice';
import { useNotifications, useUI } from '../../hooks/useUI';
import type { NoteUpdateRequest } from '../../types/note';

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

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const NoteCreatePage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentNote, loading: noteLoading } = useAppSelector(state => state.note);
  const { success, error } = useNotifications();
  const { showGlobalLoading, hideGlobalLoading } = useUI();

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const isEditMode = Boolean(noteId);

  useEffect(() => {
    if (isEditMode && noteId) {
      dispatch(fetchNote(noteId));
    }
    // 컴포넌트가 언마운트될 때 현재 노트 정보 정리
    return () => {
      dispatch(clearCurrentNote());
    };
  }, [dispatch, noteId, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentNote) {
      setNoteTitle(currentNote.noteTitle);
      setNoteContent(currentNote.noteContent);
    }
  }, [currentNote, isEditMode]);

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      error('입력 오류', '제목을 입력해주세요.');
      return;
    }

    if (!noteContent.trim()) {
      error('입력 오류', '내용을 입력해주세요.');
      return;
    }

    showGlobalLoading(isEditMode ? '노트를 수정하는 중...' : '노트를 저장하는 중...');

    try {
      if (isEditMode && noteId) {
        const updateData: NoteUpdateRequest = {
          noteTitle: noteTitle.trim(),
          noteContent: noteContent.trim(),
          aiEnhanced: currentNote?.aiEnhanced ?? false,
        };
        await dispatch(updateNoteAsync({ noteId, data: updateData })).unwrap();
        success('노트 수정 완료', '노트가 성공적으로 수정되었습니다.');
      } else {
        await dispatch(
          createNoteAsync({
            noteTitle: noteTitle.trim(),
            noteContent: noteContent.trim(),
          }),
        ).unwrap();
        success('노트 저장 완료', '노트가 성공적으로 저장되었습니다.');
      }
      navigate('/note');
    } catch (e: unknown) {
      const caughtError = e as { message?: string };
      error(
        isEditMode ? '수정 실패' : '저장 실패',
        caughtError.message || '작업 중 오류가 발생했습니다.',
      );
    } finally {
      hideGlobalLoading();
    }
  };

  if (noteLoading && isEditMode) {
    return <Box>Loading...</Box>; // Or a spinner
  }

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold">
            {isEditMode ? '노트 수정' : '새 노트 작성'}
          </Text>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
          {isEditMode ? '수정' : '저장'}
        </Button>
      </HeaderBox>

      {/* 폼 */}
      <FormBox>
        {/* 제목 입력 */}
        <TextField
          fullWidth
          label="제목"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          variant="outlined"
          placeholder="노트 제목을 입력하세요"
        />

        {/* 내용 입력 */}
        <TextField
          fullWidth
          label="내용"
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          variant="outlined"
          multiline
          rows={12}
          placeholder="노트 내용을 입력하세요"
        />
      </FormBox>
    </StyledContainer>
  );
};

export default NoteCreatePage;
