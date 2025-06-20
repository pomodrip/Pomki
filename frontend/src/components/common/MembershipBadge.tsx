import React from 'react';
import { Box, Chip, styled } from '@mui/material';
import { WorkspacePremium, Star } from '@mui/icons-material';

const BadgeContainer = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
});

const PremiumBadge = styled(Chip)({
  backgroundColor: '#FFD700',
  color: '#000',
  fontWeight: 600,
  '& .MuiSvgIcon-root': {
    color: '#000',
  },
});

const FreeBadge = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
  '& .MuiSvgIcon-root': {
    color: theme.palette.text.secondary,
  },
}));

export interface MembershipBadgeProps {
  membership: 'free' | 'premium' | 'pro';
  size?: 'small' | 'medium';
  showText?: boolean;
}

const MembershipBadge: React.FC<MembershipBadgeProps> = ({
  membership,
  size = 'small',
  showText = true,
}) => {
  const getBadgeContent = () => {
    switch (membership) {
      case 'premium':
        return {
          icon: <WorkspacePremium />,
          label: 'Premium',
          component: PremiumBadge,
        };
      case 'pro':
        return {
          icon: <Star />,
          label: 'Pro',
          component: PremiumBadge,
        };
      default:
        return {
          icon: undefined,
          label: 'Free',
          component: FreeBadge,
        };
    }
  };

  const { icon, label, component: BadgeComponent } = getBadgeContent();

  if (!showText && membership === 'free') {
    return null;
  }

  return (
    <BadgeContainer>
      <BadgeComponent
        icon={icon}
        label={showText ? label : undefined}
        size={size}
        variant="filled"
      />
    </BadgeContainer>
  );
};

export default MembershipBadge;