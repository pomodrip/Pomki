import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

// 전역 Quill 등록 (이미지 삭제 기능에 필요)
if (typeof window !== 'undefined' && !(window as any).Quill) {
  (window as any).Quill = Quill;
}

const QuillEditorWrapper = styled(Box)<{ 
  minHeight?: string;
  maxHeight?: string;
}>(({ theme, minHeight = '300px', maxHeight = '500px' }) => ({
  width: '100%',
  position: 'relative',
  
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
  
  '& .ql-editor img': {
    // Prevent img selection outline
    maxWidth: '100%',
  }
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

  const quillRef = useRef<ReactQuill | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentImgRef = useRef<HTMLImageElement | null>(null);

  // 이미지 hover 시 삭제 오버레이 표시
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const editorRoot = quill.root as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.textContent = '×';
    Object.assign(overlay.style, {
      position: 'absolute',
      width: '20px',
      height: '20px',
      lineHeight: '20px',
      textAlign: 'center',
      borderRadius: '50%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      color: '#fff',
      fontWeight: '700',
      fontSize: '12px',
      cursor: 'pointer',
      display: 'none',
      zIndex: '10',
      userSelect: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
    } as CSSStyleDeclaration);

    container.appendChild(overlay);

    const positionOverlay = (img: HTMLImageElement) => {
      const imgRect = img.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      overlay.style.top = `${imgRect.top - contRect.top + 4}px`;
      overlay.style.left = `${imgRect.left - contRect.left + imgRect.width - 24}px`;
    };

    const show = (img: HTMLImageElement) => {
      currentImgRef.current = img;
      positionOverlay(img);
      overlay.style.display = 'flex';
    };

    const hide = () => {
      overlay.style.display = 'none';
      currentImgRef.current = null;
    };

    const deleteImage = (img: HTMLImageElement) => {
      const qi = quillRef.current?.getEditor?.();
      if (!qi) return;
      try {
        const blot = (Quill as any).find(img);
        if (blot) {
          const index = qi.getIndex(blot);
          qi.deleteText(index, 1, 'user');
          qi.setSelection(index, 0, 'user');
        } else {
          img.remove();
        }
      } catch (err) {
        console.error(err);
        img.remove();
      }
    };

    const handleEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'IMG') show(target as HTMLImageElement);
    };

    const handleLeave = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || (related !== overlay && related.tagName !== 'IMG' && !container.contains(related))) hide();
    };

    const handleScroll = () => {
      if (currentImgRef.current) positionOverlay(currentImgRef.current);
    };

    const handleDelete = () => {
      const img = currentImgRef.current;
      if (img) deleteImage(img);
      hide();
    };

    editorRoot.addEventListener('mouseenter', handleEnter, true);
    editorRoot.addEventListener('mouseleave', handleLeave, true);
    editorRoot.addEventListener('scroll', handleScroll);
    overlay.addEventListener('mouseenter', () => {});
    overlay.addEventListener('mouseleave', handleLeave);
    overlay.addEventListener('click', handleDelete);

    return () => {
      editorRoot.removeEventListener('mouseenter', handleEnter, true);
      editorRoot.removeEventListener('mouseleave', handleLeave, true);
      editorRoot.removeEventListener('scroll', handleScroll);
      overlay.removeEventListener('mouseleave', handleLeave);
      overlay.removeEventListener('click', handleDelete);
      container.removeChild(overlay);
    };
  }, []);

  return (
    <QuillEditorWrapper
      ref={containerRef}
      minHeight={minHeight}
      maxHeight={maxHeight}
    >
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        modules={defaultModules}
        formats={defaultFormats}
        {...quillProps}
      />
    </QuillEditorWrapper>
  );
};

export default QuillEditor; 