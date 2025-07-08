import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ReactQuill, { ReactQuillProps } from 'react-quill';

const QuillEditorWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['expanded', 'disabled', 'animate'].includes(prop as string),
})<{ 
  expanded: boolean; 
  disabled?: boolean; 
  animate?: boolean 
}>(({ theme, expanded, disabled, animate }) => ({
  width: '100%',
  flex: expanded ? 1 : 'none',
  transition: 'all 0.3s ease, box-shadow 0.6s ease',
  transform: animate ? 'translateY(-2px)' : 'translateY(0)',
  
  '& .ql-container': {
    minHeight: expanded ? '60vh' : '120px',
    border: `1px solid ${disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB') : 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : '#E5E7EB')
    }`,
    borderRadius: '0 0 8px 8px',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: animate ? 
      `0 0 0 4px ${theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(37, 99, 235, 0.2)'}, 
       0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.15)' : 'rgba(37, 99, 235, 0.15)'}` : 
      'none',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
    color: theme.palette.text.primary,
  },
  
  '& .ql-toolbar': {
    border: `1px solid ${disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB') : 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : '#E5E7EB')
    }`,
    borderRadius: '8px 8px 0 0',
    borderBottom: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
  },
  
  '& .ql-editor': {
    padding: '16px',
    minHeight: expanded ? 'calc(60vh - 42px)' : '88px',
    color: theme.palette.text.primary,
    
    '&.ql-blank::before': {
      color: disabled ? 
        (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#D1D5DB') : 
        (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : '#9CA3AF'),
      fontStyle: disabled ? 'italic' : 'normal',
    },
  },
  
  '& .ql-toolbar .ql-formats': {
    marginRight: '8px',
  },
  
  '& .ql-toolbar .ql-picker-label': {
    color: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#374151'),
  },
  
  '& .ql-toolbar .ql-stroke': {
    stroke: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#374151'),
  },
  
  '& .ql-toolbar .ql-fill': {
    fill: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : '#374151'),
  },
  
  '& .ql-toolbar button:hover': {
    color: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB'),
  },
  
  '& .ql-toolbar button:hover .ql-stroke': {
    stroke: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB'),
  },
  
  '& .ql-toolbar button:hover .ql-fill': {
    fill: disabled ? 
      (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9CA3AF') : 
      (theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB'),
  },
  
  '& .ql-toolbar button.ql-active': {
    color: theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-stroke': {
    stroke: theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-fill': {
    fill: theme.palette.mode === 'dark' ? '#90caf9' : '#2563EB',
  },
}));

interface QuillEditorProps extends ReactQuillProps {
    expanded: boolean;
    disabled?: boolean;
    animate?: boolean;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
    expanded, 
    disabled, 
    animate,
    ...quillProps 
  }) => {
    return (
      <QuillEditorWrapper
        expanded={expanded}
        disabled={disabled}
        animate={animate}
      >
        <ReactQuill 
          {...quillProps}
          readOnly={disabled}
        />
      </QuillEditorWrapper>
    );
  };
  
export default QuillEditor; 