import React from 'react';
import { Box, Typography, IconButton, Paper, styled } from '@mui/material';
import { Close } from '@mui/icons-material';

const BannerContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: theme.spacing(2, 0),
  position: 'relative',
}));

const ContentContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const AdImage = styled('img')({
  width: '48px',
  height: '48px',
  borderRadius: '8px',
  objectFit: 'cover',
});

export interface AdBannerProps {
  title: string;
  description?: string;
  imageUrl?: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  closeable?: boolean;
}

const AdBanner: React.FC<AdBannerProps> = ({
  title,
  description,
  imageUrl,
  actionText = '자세히 보기',
  onAction,
  onClose,
  closeable = true,
}) => {
  return (
    <BannerContainer elevation={0}>
      <ContentContainer>
        {imageUrl && (
          <AdImage src={imageUrl} alt="Advertisement" />
        )}
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        
        {onAction && (
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
            onClick={onAction}
          >
            {actionText}
          </Typography>
        )}
      </ContentContainer>
      
      {closeable && onClose && (
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: 'text.secondary',
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
    </BannerContainer>
  );
};

export default AdBanner;
