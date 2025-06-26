import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NoteDetailPage: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/note');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">노트 상세</Typography>
      </Box>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        노트 ID: {noteId}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        노트 상세 페이지입니다. 추후 실제 노트 내용을 표시할 예정입니다.
      </Typography>
    </Box>
  );
};

export default NoteDetailPage;
