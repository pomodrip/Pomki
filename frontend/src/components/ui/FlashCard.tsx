import React from 'react';
import { Box, Typography, IconButton, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BookmarkBorder, Bookmark } from '@mui/icons-material';
import Card from './Card';
import Tag from './Tag';

interface FlashCardProps {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isSelected?: boolean;
  isBookmarked?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onToggleBookmark?: (id: number, event: React.MouseEvent) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  id,
  title,
  content,
  tags,
  isSelected = false,
  isBookmarked = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleBookmark,
}: FlashCardProps) => {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(id, event.target.checked);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit?.(id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete?.(id);
  };

  const handleToggleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggleBookmark?.(id, event);
  };

  return (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {/* 체크박스 */}
        <Checkbox
          checked={isSelected}
          onChange={handleCheckboxChange}
          sx={{ mt: -1 }}
        />
        
        {/* 카드 내용 */}
        <Box sx={{ flex: 1 }}>
          {/* 태그와 북마크 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            {tags.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                gap: 0.3, 
                flex: 1,
                marginRight: 1,
                overflow: 'hidden',
                // 작은 화면에서 태그 간격 더 줄이기
                '@media (max-width: 600px)': {
                  gap: 0.2,
                },
              }}>
                {tags.slice(0, 3).map((tag: string, index: number) => (
                  <Tag key={index} label={`#${tag.length > 5 ? tag.substring(0, 5) + '...' : tag}`} size="small" selected />
                ))}
                {tags.length > 3 && (
                  <Tag label={`+${tags.length - 3}`} size="small" />
                )}
              </Box>
            )}
            <IconButton
              size="small"
              onClick={handleToggleBookmark}
              sx={{ flexShrink: 0 }}
            >
              {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          </Box>
          
          {/* 제목 */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          
          {/* 액션 버튼들 */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Box
              component="button"
              onClick={handleEdit}
              sx={(theme) => ({
                minWidth: 'auto',
                padding: '2px 6px',
                fontSize: '0.7rem',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.8,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                // 작은 화면에서 더 컴팩트하게
                [theme.breakpoints.down('sm')]: {
                  padding: '1px 4px',
                  fontSize: '0.65rem',
                  gap: 0.2,
                },
              })}
            >
              <EditIcon sx={(theme) => ({ 
                fontSize: '0.9rem',
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.8rem',
                },
              })} />
              수정
            </Box>
            <Box
              component="button"
              onClick={handleDelete}
              sx={(theme) => ({
                minWidth: 'auto',
                padding: '2px 6px',
                fontSize: '0.7rem',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 0.8,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.3,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                // 작은 화면에서 더 컴팩트하게
                [theme.breakpoints.down('sm')]: {
                  padding: '1px 4px',
                  fontSize: '0.65rem',
                  gap: 0.2,
                },
              })}
            >
              <DeleteIcon sx={(theme) => ({ 
                fontSize: '0.9rem',
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.8rem',
                },
              })} />
              삭제
            </Box>
          </Box>
          
          {/* 내용 */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mt: 1,
            }}
          >
            {content}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default FlashCard; 