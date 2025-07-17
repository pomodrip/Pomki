import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import Quill from 'quill';

// 전역 등록 (이미지 삭제 시 모듈 참조 위해)
if (typeof window !== 'undefined' && !(window as any).Quill) {
  (window as any).Quill = Quill;
}

const QuillEditorWrapper = styled(Box, {
  shouldForwardProp: (prop) => !['expanded', 'disabled', 'animate'].includes(prop as string),
})<{ 
  expanded: boolean; 
  disabled?: boolean; 
  animate?: boolean 
}>(({ theme, expanded, disabled, animate }) => ({
  width: '100%',
  position: 'relative',
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
    const quillRef = useRef<ReactQuill | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const currentImgRef = useRef<HTMLImageElement | null>(null);

    // 이미지 hover 시 우상단에 삭제 오버레이 표시
    useEffect(() => {
      const quill = quillRef.current?.getEditor?.();
      if (!quill) return;

      const editorRoot = quill.root as HTMLElement;
      const container = containerRef.current;
      if (!container) return;

      // 오버레이 엘리먼트 생성
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

      const showOverlay = (img: HTMLImageElement) => {
        currentImgRef.current = img;
        positionOverlay(img);
        overlay.style.display = 'flex';
      };

      const hideOverlay = () => {
        overlay.style.display = 'none';
        currentImgRef.current = null;
      };

      const deleteImage = (img: HTMLImageElement) => {
        const quillInstance = quillRef.current?.getEditor?.();
        if (!quillInstance) return;

        try {
          const wasDisabled = disabled;
          if (wasDisabled) quillInstance.enable(true);

          const blot = (Quill as any).find(img);
          if (blot) {
            const index = quillInstance.getIndex(blot);
            quillInstance.deleteText(index, 1, 'user');
            quillInstance.setSelection(index, 0, 'user');
          } else {
            img.remove();
          }

          if (wasDisabled) quillInstance.enable(false);
        } catch (err) {
          console.error('이미지 삭제 오류:', err);
          img.remove();
        }
      };

      const handleMouseEnter = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'IMG') {
          showOverlay(target as HTMLImageElement);
        }
      };

      const handleMouseLeave = (e: MouseEvent) => {
        const related = e.relatedTarget as HTMLElement | null;
        // overlay를 벗어나거나 이미지 영역을 벗어나면 숨김
        if (!related || (related !== overlay && related.tagName !== 'IMG')) {
          hideOverlay();
        }
      };

      const handleScroll = () => {
        if (currentImgRef.current) positionOverlay(currentImgRef.current);
      };

      const handleDelete = () => {
        const img = currentImgRef.current;
        if (img) deleteImage(img);
        hideOverlay();
      };

      // 이벤트 등록 (캡처링 사용)
      editorRoot.addEventListener('mouseenter', handleMouseEnter, true);
      editorRoot.addEventListener('mouseleave', handleMouseLeave, true);
      editorRoot.addEventListener('scroll', handleScroll);
      overlay.addEventListener('mouseenter', () => { /* overlay 유지 */ });
      overlay.addEventListener('mouseleave', handleMouseLeave);
      overlay.addEventListener('click', handleDelete);

      return () => {
        editorRoot.removeEventListener('mouseenter', handleMouseEnter, true);
        editorRoot.removeEventListener('mouseleave', handleMouseLeave, true);
        editorRoot.removeEventListener('scroll', handleScroll);
        overlay.removeEventListener('mouseleave', handleMouseLeave);
        overlay.removeEventListener('click', handleDelete);
        container.removeChild(overlay);
      };
    }, [disabled]);

    return (
      <QuillEditorWrapper
        ref={containerRef}
        expanded={expanded}
        disabled={disabled}
        animate={animate}
      >
        <ReactQuill 
          ref={quillRef}
          {...quillProps}
          readOnly={disabled}
        />
      </QuillEditorWrapper>
    );
  };
  
export default QuillEditor; 