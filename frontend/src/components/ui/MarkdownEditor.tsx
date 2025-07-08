import React, { useState, useCallback, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useDebounce } from '../../hooks/useDebounce';
import { 
  uploadImage, 
  validateImageFile, 
  extractImageFromClipboard, 
  extractImagesFromDrop 
} from '../../api/imageApi';

// 아이콘들 임포트 (MUI icons)
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import TitleIcon from '@mui/icons-material/Title';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SplitScreenIcon from '@mui/icons-material/SplitScreen';

const MarkdownEditorWrapper = styled(Box)<{ 
  minHeight?: string;
  maxHeight?: string;
}>(({ theme, minHeight = '300px', maxHeight = '500px' }) => ({
  width: '100%',
  position: 'relative',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : 'white',
  
  '&:hover': {
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'}`,
  },
  
  '&:focus-within': {
    border: `2px solid ${theme.palette.primary.main}`,
    margin: '-1px',
  },
}));

const EditorToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '48px !important',
  padding: '0 8px',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#f5f5f5',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
  borderRadius: '8px 8px 0 0',
  
  '& .MuiIconButton-root': {
    padding: '6px',
    margin: '0 2px',
    borderRadius: '4px',
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
}));

const EditorContainer = styled(Box)<{ 
  mode: 'split' | 'edit' | 'preview';
  minHeight?: string;
  maxHeight?: string;
}>(({ theme, mode, minHeight = '300px', maxHeight = '500px' }) => ({
  display: 'flex',
  height: mode === 'split' ? 'auto' : minHeight,
  maxHeight,
  
  [theme.breakpoints.down('md')]: {
    flexDirection: mode === 'split' ? 'column' : 'row',
    height: 'auto',
  },
}));

const EditPane = styled(Box)<{ visible: boolean }>(({ theme, visible }) => ({
  flex: 1,
  display: visible ? 'block' : 'none',
  position: 'relative',
  
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: 0,
      border: 'none',
      
      '& fieldset': {
        border: 'none',
      },
      
      '&:hover fieldset': {
        border: 'none',
      },
      
      '&.Mui-focused fieldset': {
        border: 'none',
      },
    },
  },
  
  '& textarea': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '14px',
    lineHeight: 1.6,
    resize: 'none',
  },
}));

const PreviewPane = styled(Box)<{ visible: boolean }>(({ theme, visible }) => ({
  flex: 1,
  display: visible ? 'block' : 'none',
  borderLeft: visible ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}` : 'none',
  padding: '16px',
  overflow: 'auto',
  backgroundColor: theme.palette.background.default,
  
  [theme.breakpoints.down('md')]: {
    borderLeft: 'none',
    borderTop: visible ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}` : 'none',
  },
  
  // 마크다운 콘텐츠 스타일링
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: '1.5em',
    marginBottom: '0.5em',
    fontWeight: 'bold',
  },
  
  '& h1': { fontSize: '2em' },
  '& h2': { fontSize: '1.5em' },
  '& h3': { fontSize: '1.25em' },
  
  '& p': {
    marginBottom: '1em',
    lineHeight: 1.6,
  },
  
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: '1em 0',
    paddingLeft: '1em',
    fontStyle: 'italic',
    backgroundColor: theme.palette.action.hover,
    borderRadius: '4px',
    padding: '0.5em 1em',
  },
  
  '& code': {
    backgroundColor: theme.palette.action.hover,
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '0.9em',
  },
  
  '& pre': {
    backgroundColor: theme.palette.action.hover,
    padding: '1em',
    borderRadius: '8px',
    overflow: 'auto',
    
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
  
  '& ul, & ol': {
    paddingLeft: '2em',
    marginBottom: '1em',
  },
  
  '& li': {
    marginBottom: '0.25em',
  },
  
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginTop: '0.5em',
    marginBottom: '0.5em',
  },
  
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const ModeToggle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  padding: '4px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
  zIndex: 10,
  
  '& .MuiIconButton-root': {
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  // QuillEditor 호환을 위한 추가 props
  modules?: any;
  formats?: string[];
  theme?: string;
  // TimerPage용 props
  expanded?: boolean;
  disabled?: boolean;
  animate?: boolean;
  // 이미지 업로드를 위한 props
  onImageUpload?: (imageUrl: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value = '',
  onChange,
  placeholder = '마크다운으로 작성해보세요...',
  readOnly = false,
  minHeight = '300px',
  maxHeight = '500px',
  disabled = false,
  expanded = false,
  animate = false,
  onImageUpload,
  ...props
}) => {
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [markdown, setMarkdown] = useState(value);
  const [htmlContent, setHtmlContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 디바운스된 마크다운 업데이트
  const debouncedMarkdown = useDebounce(markdown, 300);
  
  // HTML 변환 (보안 처리) - 비동기 대응
  useEffect(() => {
    if (!debouncedMarkdown.trim()) {
      setHtmlContent('');
      return;
    }
    
    const parseMarkdown = async () => {
      try {
        const rawHtml = await marked.parse(debouncedMarkdown);
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        setHtmlContent(sanitizedHtml);
      } catch (error) {
        console.error('Markdown parsing error:', error);
        setHtmlContent('<p>마크다운 파싱 오류가 발생했습니다.</p>');
      }
    };
    
    parseMarkdown();
  }, [debouncedMarkdown]);
  
  // 값이 외부에서 변경될 때 동기화
  useEffect(() => {
    if (value !== markdown) {
      setMarkdown(value);
    }
  }, [value]);
  
  // 마크다운 변경 처리
  const handleMarkdownChange = useCallback((newValue: string) => {
    setMarkdown(newValue);
    onChange?.(newValue);
  }, [onChange]);
  
  // 툴바 버튼 클릭 처리
  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = markdown.substring(0, start) + before + textToInsert + after + markdown.substring(end);
    
    handleMarkdownChange(newText);
    
    // 포커스 및 커서 위치 조정
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [markdown, handleMarkdownChange]);
  
  // 이미지 업로드 처리
  const handleImageUpload = useCallback(async (file: File) => {
    // 파일 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '이미지 업로드 중 오류가 발생했습니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 실제 업로드 진행률 사용
      const response = await uploadImage(file, (progress: number) => {
        setUploadProgress(progress);
      });
      
      // 이미지 URL을 마크다운 문법으로 삽입
      const imageMarkdown = `![${response.oriFileName || file.name}](${response.imageUrl})`;
      insertMarkdown('', '', imageMarkdown);
      
      // 콜백 호출
      onImageUpload?.(response.imageUrl);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      setError('이미지 업로드 중 오류가 발생했습니다.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onImageUpload, insertMarkdown]);

  // 파일 선택 처리
  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
    // 같은 파일을 다시 선택할 수 있도록 value 초기화
    event.target.value = '';
  }, [handleImageUpload]);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);

    const files = extractImagesFromDrop(event.dataTransfer);
    if (files.length > 0) {
      handleImageUpload(files[0]); // 첫 번째 이미지만 업로드
    }
  }, [handleImageUpload]);

  // 키보드 단축키 처리 (클립보드 이미지 포함)
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          insertMarkdown('**', '**', '굵은 텍스트');
          break;
        case 'i':
          event.preventDefault();
          insertMarkdown('*', '*', '기울임 텍스트');
          break;
        case 'k':
          event.preventDefault();
          insertMarkdown('[', '](url)', '링크 텍스트');
          break;
        case 'v':
          // Ctrl+V는 클립보드 이미지 처리를 위해 막지 않음
          break;
      }
    }
  }, [insertMarkdown]);

  // 클립보드 이미지 붙여넣기 처리
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const clipboardData = event.clipboardData;
    const imageFile = extractImageFromClipboard(clipboardData);
    
    if (imageFile) {
      event.preventDefault();
      handleImageUpload(imageFile);
    }
  }, [handleImageUpload]);

  const actualMinHeight = expanded ? '60vh' : minHeight;
  const actualMaxHeight = expanded ? '80vh' : maxHeight;

  return (
    <MarkdownEditorWrapper 
      minHeight={actualMinHeight}
      maxHeight={actualMaxHeight}
      sx={{ 
        opacity: disabled ? 0.6 : 1,
        transform: animate ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.3s ease, box-shadow 0.6s ease',
        boxShadow: animate ? 2 : 0,
      }}
    >
      {/* 툴바 */}
      <EditorToolbar>
        <Tooltip title="굵게 (Ctrl+B)">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('**', '**', '굵은 텍스트')}
            disabled={disabled}
          >
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="기울임 (Ctrl+I)">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('*', '*', '기울임 텍스트')}
            disabled={disabled}
          >
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <Tooltip title="제목">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('## ', '', '제목')}
            disabled={disabled}
          >
            <TitleIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="인용구">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('> ', '', '인용 텍스트')}
            disabled={disabled}
          >
            <FormatQuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <Tooltip title="순서 없는 목록">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('- ', '', '목록 항목')}
            disabled={disabled}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="순서 있는 목록">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('1. ', '', '목록 항목')}
            disabled={disabled}
          >
            <FormatListNumberedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        <Tooltip title="링크 (Ctrl+K)">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('[', '](url)', '링크 텍스트')}
            disabled={disabled}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="이미지 업로드">
          <IconButton 
            size="small" 
            onClick={handleFileSelect}
            disabled={disabled || isUploading}
          >
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="코드">
          <IconButton 
            size="small" 
            onClick={() => insertMarkdown('`', '`', '코드')}
            disabled={disabled}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
      </EditorToolbar>
      
      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* 업로드 진행률 */}
      {isUploading && (
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
      
      {/* 에디터 영역 */}
      <EditorContainer 
        mode={mode} 
        minHeight={actualMinHeight}
        maxHeight={actualMaxHeight}
        sx={{
          border: dragOver ? '2px dashed #1976d2' : 'none',
          backgroundColor: dragOver ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
          position: 'relative', // 부동 토글 버튼을 위한 relative 포지션
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 부동 뷰 모드 토글 */}
        <ModeToggle>
          <Tooltip title="나란히 보기 (편집 + 미리보기)">
            <IconButton 
              size="small" 
              className={mode === 'split' ? 'active' : ''}
              onClick={() => setMode('split')}
            >
              <SplitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="편집만 보기">
            <IconButton 
              size="small" 
              className={mode === 'edit' ? 'active' : ''}
              onClick={() => setMode('edit')}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="미리보기만 보기">
            <IconButton 
              size="small" 
              className={mode === 'preview' ? 'active' : ''}
              onClick={() => setMode('preview')}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ModeToggle>
        {/* 편집 창 */}
        <EditPane visible={mode === 'split' || mode === 'edit'}>
          <TextField
            inputRef={textareaRef}
            multiline
            fullWidth
            value={markdown}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            InputProps={{
              readOnly: readOnly,
              style: {
                minHeight: actualMinHeight,
                maxHeight: actualMaxHeight,
                alignItems: 'flex-start',
              },
            }}
            inputProps={{
              style: {
                minHeight: `calc(${actualMinHeight} - 32px)`,
                maxHeight: `calc(${actualMaxHeight} - 32px)`,
              },
            }}
          />
        </EditPane>
        
        {/* 미리보기 창 */}
        <PreviewPane visible={mode === 'split' || mode === 'preview'}>
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <Box sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              마크다운을 입력하면 여기에 미리보기가 표시됩니다.
            </Box>
          )}
        </PreviewPane>
      </EditorContainer>
      
      {/* 에러 메시지 스낵바 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </MarkdownEditorWrapper>
  );
};

export default MarkdownEditor; 