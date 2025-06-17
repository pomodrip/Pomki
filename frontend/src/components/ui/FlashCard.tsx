import React from 'react';
import { Box, Typography, IconButton, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from './Card';
import Tag from './Tag';

interface FlashCardProps {
  id: number;
  title: string;
  content: string;
  tags: string[];
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  id,
  title,
  content,
  tags,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
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
          {/* 제목 */}
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          
          {/* 태그들 */}
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
              {tags.map((tag: string, index: number) => (
                <Tag key={index} label={tag} size="small" />
              ))}
            </Box>
          )}
          
          {/* 내용 */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {content}
          </Typography>
        </Box>
        
        {/* 액션 버튼들 */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

export default FlashCard; 