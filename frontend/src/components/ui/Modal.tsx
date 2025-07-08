import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps,
  IconButton,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// 62-67번 디자인 가이드 적용 
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '16px', // 62. Modal Border Radius
    minWidth: '300px', // 63. Modal Min Width
    maxWidth: '400px', // 64. Modal Max Width
    margin: theme.spacing(2), // 65. Modal Margin
    padding: theme.spacing(3), // 66. Modal Padding
    
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      minWidth: 'calc(100vw - 32px)',
      maxWidth: 'calc(100vw - 32px)',
    },
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(2),
  fontSize: '1.25rem',
  fontWeight: 600,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: 0,
  gap: theme.spacing(1),
  justifyContent: 'flex-end',
  
  '& > :not(:first-of-type)': {
    marginLeft: 0,
  },
}));

// Bottom Sheet 스타일
const BottomSheetDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'flex-end',
  },
  '& .MuiDialog-paper': {
    margin: 0,
    width: '100%',
    maxWidth: 'none',
    borderTopLeftRadius: '20px', // 63. Bottom Sheet borderTopLeftRadius
    borderTopRightRadius: '20px', // 64. Bottom Sheet borderTopRightRadius
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: theme.spacing(3),
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
}));

export interface ModalProps extends Omit<DialogProps, 'title'> {
  title?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  showCloseButton?: boolean;
  variant?: 'dialog' | 'bottomSheet';
  hideTitle?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  actions,
  showCloseButton = true,
  children,
  variant = 'dialog',
  hideTitle = false,
  ...props
}) => {
  const DialogComponent = variant === 'bottomSheet' ? BottomSheetDialog : StyledDialog;

  return (
    <DialogComponent
      onClose={onClose}
      {...props}
    >
      {!hideTitle && title && (
        <StyledDialogTitle>
          {title}
          {showCloseButton && onClose && (
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ p: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </StyledDialogTitle>
      )}
      
      <StyledDialogContent>
        {children}
      </StyledDialogContent>
      
      {actions && (
        <StyledDialogActions>
          {actions}
        </StyledDialogActions>
      )}
    </DialogComponent>
  );
};

export default Modal;
