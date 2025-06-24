import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { Text, IconButton, Tag } from '../../components/ui';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useRedux';
import { createNote } from '../../store/slices/noteSlice';
import { useNotifications, useUI } from '../../hooks/useUI';

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

const TagInputBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const NoteCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { success, error } = useNotifications();
  const { showGlobalLoading, hideGlobalLoading } = useUI();

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag: string) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      error('입력 오류', '제목을 입력해주세요.');
      return;
    }

    if (!noteContent.trim()) {
      error('입력 오류', '내용을 입력해주세요.');
      return;
    }

    try {
      showGlobalLoading('노트를 저장하는 중...');
      
      await dispatch(createNote({
        noteTitle: noteTitle.trim(),
        noteContent: noteContent.trim(),
        // tags: tags, // TODO: tag string[]을 tagId: number[]로 변환 필요
      })).unwrap();
      
      success('노트 저장 완료', '노트가 성공적으로 저장되었습니다.');
      navigate('/note');
    } catch {
      error('저장 실패', '노트 저장에 실패했습니다.');
    } finally {
      hideGlobalLoading();
    }
  };

  return (
    <StyledContainer maxWidth="md">
      {/* 헤더 */}
      <HeaderBox>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Text variant="h5" fontWeight="bold">
            새 노트 작성
          </Text>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          저장
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

        {/* 태그 입력 */}
        <Box>
          <Text variant="subtitle1" gutterBottom>
            태그
          </Text>
          <TagInputBox>
            <TextField
              size="small"
              label="새 태그"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="태그를 입력하고 Enter 또는 + 버튼을 눌러주세요"
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={handleAddTag} color="primary">
              <AddIcon />
            </IconButton>
          </TagInputBox>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {tags.map((tag: string) => (
              <Tag
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>

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
