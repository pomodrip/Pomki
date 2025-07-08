import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  Button,
} from '@mui/material';
import { Text, IconButton, MarkdownEditor } from '../../components/ui';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createNoteAsync, updateNoteAsync, fetchNote, clearCurrentNote, addNoteTags, removeNoteTagAsync } from '../../store/slices/noteSlice';
import { useNotifications, useUI } from '../../hooks/useUI';
import { useFormSaveKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import type { NoteUpdateRequest } from '../../types/note';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2)
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
  const [noteTagsInput, setNoteTagsInput] = useState('');

  // 폼 요소들의 참조
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

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
      // 태그를 쉼표로 연결하여 입력 필드에 표시 (# 제거)
      const joinedTags = (currentNote.tags || [])
        .map(tag => tag.startsWith('#') ? tag.slice(1) : tag)
        .join(', ');
      setNoteTagsInput(joinedTags);
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
        // 🏷️ 태그 파싱: 쉼표로 구분, 자동으로 # 추가
        const parsedTags = noteTagsInput.trim()
          ? noteTagsInput.split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0)
              .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
          : [];

        const updateData: NoteUpdateRequest = {
          noteTitle: noteTitle.trim(),
          noteContent: noteContent.trim(),
          aiEnhanced: currentNote?.aiEnhanced ?? false,
          // 백엔드 노트 업데이트 API에서 태그 파라미터를 무시할 수도 있으므로 일단 제외하거나 사용하지 않음
        };
        await dispatch(updateNoteAsync({ noteId, data: updateData })).unwrap();

        // 🏷️ 태그 추가/삭제 동기화 (Redux & API)
        const existingTags = currentNote?.tags || [];

        const tagsToRemove = existingTags.filter(tag => !parsedTags.includes(tag));
        const tagsToAdd = parsedTags.filter(tag => !existingTags.includes(tag));

        // 삭제 태그
        for (const tagName of tagsToRemove) {
          await dispatch(removeNoteTagAsync({ noteId, tagName }));
        }

        // 추가 태그들 한 번에
        if (tagsToAdd.length > 0) {
          await dispatch(addNoteTags({ noteId, tagNames: tagsToAdd }));
        }

        success('노트 수정 완료', '노트가 성공적으로 수정되었습니다.');
        navigate(`/note/${noteId}`);
      } else {
        await dispatch(
          createNoteAsync({
            noteTitle: noteTitle.trim(),
            noteContent: noteContent.trim(),
          }),
        ).unwrap();
        success('노트 저장 완료', '노트가 성공적으로 저장되었습니다.');
        navigate('/note');
      }
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

  // 🟡 React Hooks 활용 - 키보드 단축키 설정
  useFormSaveKeyboardShortcuts(handleSave, {
    saveButtonRef,
    ctrlEnterAnywhere: true // Ctrl+Enter는 어디서든 저장
  });

  // 🟡 React Hooks 활용 - 순환 Tab 네비게이션
  useKeyboardShortcuts({
    onTab: () => {
      const activeElement = document.activeElement;
      
      // 현재 포커스된 요소에 따라 다음 요소로 이동 (순환)
      if (activeElement === titleInputRef.current) {
        contentInputRef.current?.focus();
      } else if (activeElement === contentInputRef.current) {
        saveButtonRef.current?.focus();
      } else if (activeElement === saveButtonRef.current) {
        titleInputRef.current?.focus(); // 순환: 저장 버튼 -> 제목
      } else {
        // 다른 요소에 포커스가 있을 때는 제목부터 시작
        titleInputRef.current?.focus();
      }
    },
    onShiftTab: () => {
      const activeElement = document.activeElement;
      
      // Shift+Tab으로 역순 이동 (순환)
      if (activeElement === titleInputRef.current) {
        saveButtonRef.current?.focus(); // 역순 순환: 제목 -> 저장 버튼
      } else if (activeElement === contentInputRef.current) {
        titleInputRef.current?.focus();
      } else if (activeElement === saveButtonRef.current) {
        contentInputRef.current?.focus();
      } else {
        // 다른 요소에 포커스가 있을 때는 저장 버튼부터 시작
        saveButtonRef.current?.focus();
      }
    },
    onEnter: () => {
      const activeElement = document.activeElement;
      
      // 저장 버튼에 포커스가 있을 때 엔터 키로 저장 실행
      if (activeElement === saveButtonRef.current) {
        handleSave();
      }
    },
    enabled: true,
    allowTabInInputs: true, // 입력 필드에서도 탭 키 사용자 정의 처리 허용
    isActive: () => {
      // 관리 대상 요소 중 하나에 포커스가 있을 때만 작동
      const activeElement = document.activeElement;
      return activeElement === titleInputRef.current || 
             activeElement === contentInputRef.current || 
             activeElement === saveButtonRef.current;
    }
  });

  if (noteLoading && isEditMode) {
    return <Box>Loading...</Box>; // Or a spinner
  }

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ mr: 1 }}
            tabIndex={-1} // Tab 순서에서 제외
          >
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold" tabIndex={-1}>
            {isEditMode ? '노트 수정' : '새 노트 작성'}
          </Text>
        </Box>
        <Button 
          ref={saveButtonRef}
          variant="contained" 
          startIcon={<SaveIcon />} 
          onClick={handleSave}
          data-save-button // 키보드 단축키를 위한 식별자
        >
          {isEditMode ? '수정' : '저장'}
        </Button>
      </HeaderBox>

      {/* 폼 */}
      <FormBox>
        {/* 제목 입력 */}
        <TextField
          inputRef={titleInputRef}
          fullWidth
          label="제목"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          variant="outlined"
          placeholder="노트 제목을 입력하세요"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            }
          }}
        />

        {/* 내용 입력 */}
        <Box>
          <Box sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>내용</Box>
          <MarkdownEditor
            value={noteContent}
            onChange={setNoteContent}
            placeholder="노트 내용을 마크다운으로 입력하세요"
            minHeight="300px"
            maxHeight="500px"
            onImageUpload={(imageUrl) => {
              console.log('노트 페이지 이미지 업로드:', imageUrl);
            }}
          />
        </Box>

        {/* 태그 입력 (편집 모드에서만 표시) */}
        {isEditMode && (
          <Box>
            <Box sx={{ fontWeight: 500, color: 'text.secondary', mb: 1 }}>태그 (쉼표로 구분, 자동으로 # 추가)</Box>
            <TextField
              fullWidth
              placeholder="React, JavaScript, Frontend"
              value={noteTagsInput}
              onChange={(e) => setNoteTagsInput(e.target.value)}
            />
          </Box>
        )}
      </FormBox>
    </StyledContainer>
  );
};

export default NoteCreatePage;
