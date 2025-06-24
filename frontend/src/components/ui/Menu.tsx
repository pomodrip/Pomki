import React from 'react';
import { styled } from '@mui/material/styles';

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  sx?: any;
}

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  disabled?: boolean;
  sx?: any;
}

const MenuContainer = styled('div')<{ open: boolean }>(({ theme, open }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: theme.zIndex.modal,
  display: open ? 'block' : 'none',
}));

const MenuBackdrop = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
});

const MenuPaper = styled('div')<{ sx?: any }>(({ theme, sx }) => ({
  position: 'absolute',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[8],
  minWidth: '120px',
  maxWidth: '280px',
  maxHeight: 'calc(100vh - 96px)',
  overflowY: 'auto',
  outline: 0,
  border: `1px solid ${theme.palette.divider}`,
  ...sx,
}));

const StyledMenuItem = styled('div')<MenuItemProps>(({ theme, selected, disabled, sx }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  minHeight: '48px',
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
  cursor: disabled ? 'default' : 'pointer',
  userSelect: 'none',
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  '&:hover': {
    backgroundColor: disabled ? 'transparent' : theme.palette.action.hover,
  },
  '&:focus': {
    backgroundColor: theme.palette.action.focus,
    outline: 0,
  },
  ...sx,
}));

const Menu: React.FC<MenuProps> = ({ 
  anchorEl, 
  open, 
  onClose, 
  children, 
  sx,
  ...props 
}) => {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (anchorEl && open) {
      const rect = anchorEl.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [anchorEl, open]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <MenuContainer open={open}>
      <MenuBackdrop onClick={onClose} />
      <MenuPaper
        style={{
          top: position.top,
          left: position.left,
        }}
        sx={sx}
        {...props}
      >
        {children}
      </MenuPaper>
    </MenuContainer>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({ 
  children, 
  onClick,
  selected = false,
  disabled = false,
  ...props 
}) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(event);
  };

  return (
    <StyledMenuItem
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      selected={selected}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          handleClick(event as any);
        }
      }}
      {...props}
    >
      {children}
    </StyledMenuItem>
  );
};

export { Menu, MenuItem };
export default Menu; 