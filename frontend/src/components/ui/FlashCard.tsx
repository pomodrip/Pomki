import React from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Typography,
  IconButton,
  Card as MuiCard,
  CardContent,
  Chip,
} from '@mui/material';
import {
  BookmarkBorder,
  Bookmark,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Button from './Button';

// 타입 정의
export interface FlashCardData {
  id: number;
  front: string;
  back: string;
  tags?: string[];
  deckName?: string;
}

export interface FlashCardProps {
  card: FlashCardData;
  isBookmarked?: boolean;
  onToggleBookmark?: (cardId: number, event: React.MouseEvent) => void;
  onEdit?: (cardId: number, event: React.MouseEvent) => void;
  onDelete?: (cardId: number, event: React.MouseEvent) => void;
  onClick?: (card: FlashCardData) => void;
  maxTagsDisplay?: number;
  showActions?: boolean;
}

// 스타일링된 컴포넌트들
const StyledFlashCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const TagChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
  marginRight: theme.spacing(0.5),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  flex: 1,
  whiteSpace: 'nowrap',
  minWidth: 'auto',
  padding: theme.spacing(0.5, 1),
  fontSize: '0.8rem',
}));

const FlashCard: React.FC<FlashCardProps> = ({
  card,
  isBookmarked = false,
  onToggleBookmark,
  onEdit,
  onDelete,
  onClick,
  maxTagsDisplay = 3,
  showActions = true,
}) => {
  const handleCardClick = () => {
    if (onClick) {
      onClick(card);
    }
  };

  const handleToggleBookmark = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(card.id, event);
    }
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(card.id, event);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(card.id, event);
    }
  };

  return (
    <StyledFlashCard onClick={handleCardClick}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* 제목(질문)과 북마크 */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" noWrap sx={{ maxWidth: 'calc(100% - 32px)' }}>
            {card.front}
          </Typography>
          {onToggleBookmark && (
            <IconButton size="small" onClick={handleToggleBookmark}>
              {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          )}
        </Box>
        
        {/* 태그들 */}
        {card.tags && card.tags.length > 0 && (
          <Box 
            mt={1.5} 
            sx={{ 
              minHeight: 24,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {card.tags.slice(0, maxTagsDisplay).map((tag: string, index: number) => (
              <TagChip 
                key={index} 
                label={tag} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            ))}
            {card.tags.length > maxTagsDisplay && (
              <TagChip 
                label={`+${card.tags.length - maxTagsDisplay}`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            )}
          </Box>
        )}

        
        {/* 카드 정보 */}
        {card.deckName && (
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1,mt: 0.5, textAlign: 'right' }}>
          '{card.deckName}'로 이동
        </Typography>
        )}

      </CardContent>
      
      {/* 액션 버튼들 */}
      {showActions && (onEdit || onDelete) && (
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          marginTop: '8px',
          paddingLeft: 1,
          paddingRight: 1,
          paddingBottom: 1,
        }}>
          {onEdit && (
            <ActionButton 
              size="small" 
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />} 
              onClick={handleEdit}
            >
              수정
            </ActionButton>
          )}
          {onDelete && (
            <ActionButton 
              size="small" 
              variant="outlined"
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleDelete}
            >
              삭제
            </ActionButton>
          )}
        </Box>
      )}
    </StyledFlashCard>
  );
};

export default FlashCard; 