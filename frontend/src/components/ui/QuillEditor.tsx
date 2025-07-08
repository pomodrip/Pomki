import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditorWrapper = styled(Box)<{ 
  minHeight?: string;
  maxHeight?: string;
}>(({ theme, minHeight = '300px', maxHeight = '500px' }) => ({
  width: '100%',
  
  '& .ql-container': {
    minHeight,
    maxHeight,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
    borderRadius: '0 0 8px 8px',
    fontFamily: "'Pretendard', sans-serif",
    fontSize: '14px',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
    color: theme.palette.text.primary,
    
    '&:hover': {
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'}`,
    },
  },
  
  '& .ql-toolbar': {
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
    borderRadius: '8px 8px 0 0',
    borderBottom: 'none',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
    
    '&:hover': {
      border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'}`,
      borderBottom: 'none',
    },
  },
  
  '& .quill:focus-within': {
    '& .ql-toolbar': {
      border: `2px solid ${theme.palette.primary.main}`,
      borderBottom: 'none',
      margin: '-1px -1px 0 -1px',
    },
    '& .ql-container': {
      border: `2px solid ${theme.palette.primary.main}`,
      borderTop: 'none',
      margin: '0 -1px -1px -1px',
    },
  },
  
  '& .ql-editor': {
    padding: '16px',
    minHeight: `calc(${minHeight} - 42px)`,
    maxHeight: `calc(${maxHeight} - 42px)`,
    overflowY: 'auto',
    color: theme.palette.text.primary,
    
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    
    '&.ql-blank::before': {
      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)',
      fontStyle: 'normal',
    },
  },
  
  '& .ql-toolbar .ql-formats': {
    marginRight: '8px',
  },
  
  '& .ql-toolbar .ql-picker-label': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  },
  
  '& .ql-toolbar .ql-stroke': {
    stroke: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  },
  
  '& .ql-toolbar .ql-fill': {
    fill: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  },
  
  '& .ql-toolbar button:hover': {
    color: theme.palette.primary.main,
  },
  
  '& .ql-toolbar button:hover .ql-stroke': {
    stroke: theme.palette.primary.main,
  },
  
  '& .ql-toolbar button:hover .ql-fill': {
    fill: theme.palette.primary.main,
  },
  
  '& .ql-toolbar button.ql-active': {
    color: theme.palette.primary.main,
  },
  
  '& .ql-toolbar button.ql-active .ql-stroke': {
    stroke: theme.palette.primary.main,
  },
  
  '& .ql-toolbar button.ql-active .ql-fill': {
    fill: theme.palette.primary.main,
  },
  
  '& .ql-toolbar .ql-picker.ql-expanded .ql-picker-label': {
    color: theme.palette.primary.main,
  },
  
  '& .ql-toolbar .ql-picker.ql-expanded .ql-picker-label .ql-stroke': {
    stroke: theme.palette.primary.main,
  },
}));

interface QuillEditorProps extends Omit<ReactQuillProps, 'theme'> {
  minHeight?: string;
  maxHeight?: string;
}

const QuillEditor: React.FC<QuillEditorProps> = ({ 
  minHeight = '300px',
  maxHeight = '500px',
  modules,
  formats,
  ...quillProps 
}) => {
  const defaultModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    ...modules,
  };

  const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
    ...(formats || [])
  ];

  return (
    <QuillEditorWrapper
      minHeight={minHeight}
      maxHeight={maxHeight}
    >
      <ReactQuill 
        theme="snow"
        modules={defaultModules}
        formats={defaultFormats}
        {...quillProps}
      />
    </QuillEditorWrapper>
  );
};

export default QuillEditor; 