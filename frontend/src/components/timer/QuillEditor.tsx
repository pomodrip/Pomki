import React from 'react';
import { styled } from '@mui/material';
import ReactQuill from 'react-quill';

export const QuillEditor = styled(ReactQuill, {
  shouldForwardProp: (prop) => !['expanded', 'disabled', 'animate'].includes(prop as string),
})<{ 
  expanded: boolean; 
  disabled?: boolean; 
  animate?: boolean 
}>(({ expanded, disabled, animate }) => ({
  width: '100%',
  flex: expanded ? 1 : 'none',
  transition: 'all 0.3s ease, box-shadow 0.6s ease',
  transform: animate ? 'translateY(-2px)' : 'translateY(0)',
  
  '& .ql-container': {
    minHeight: expanded ? '60vh' : '120px',
    border: `1px solid ${disabled ? '#E5E7EB' : '#E5E7EB'}`,
    borderRadius: '0 0 8px 8px',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: animate ? '0 0 0 4px rgba(37, 99, 235, 0.2), 0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
  },
  
  '& .ql-toolbar': {
    border: `1px solid ${disabled ? '#E5E7EB' : '#E5E7EB'}`,
    borderRadius: '8px 8px 0 0',
    borderBottom: 'none',
  },
  
  '& .ql-editor': {
    padding: '16px',
    minHeight: expanded ? 'calc(60vh - 42px)' : '88px',
    
    '&.ql-blank::before': {
      color: disabled ? '#D1D5DB' : '#9CA3AF',
      fontStyle: disabled ? 'italic' : 'normal',
    },
  },
  
  '& .ql-toolbar .ql-formats': {
    marginRight: '8px',
  },
  
  '& .ql-toolbar .ql-picker-label': {
    color: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar .ql-stroke': {
    stroke: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar .ql-fill': {
    fill: disabled ? '#9CA3AF' : '#374151',
  },
  
  '& .ql-toolbar button:hover': {
    color: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button:hover .ql-stroke': {
    stroke: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button:hover .ql-fill': {
    fill: disabled ? '#9CA3AF' : '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active': {
    color: '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-stroke': {
    stroke: '#2563EB',
  },
  
  '& .ql-toolbar button.ql-active .ql-fill': {
    fill: '#2563EB',
  },
}));

export default QuillEditor; 