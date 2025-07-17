import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';

// 두 에디터 import
import { QuillEditor, MarkdownEditor } from '../../components/ui';

const TestPageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const EditorSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
}));

const ControlPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  alignItems: 'center',
}));

const ContentDisplay = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  '& pre': {
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
    color: theme.palette.text.secondary,
  },
}));

const EditorWrapper = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  
  '& > div': {
    flex: 1,
  },
});

const EditorComparisonPage: React.FC = () => {
  // 에디터 상태
  const [quillContent, setQuillContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');
  
  // 테스트 옵션
  const [disabled, setDisabled] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [animate, setAnimate] = useState(false);
  
  // 샘플 콘텐츠
  const sampleMarkdown = `# 마크다운 에디터 테스트

## 기본 기능 테스트

**굵은 텍스트**와 *기울임 텍스트*를 지원합니다.

### 목록 테스트
- 순서 없는 목록 1
- 순서 없는 목록 2
  - 중첩된 목록

1. 순서 있는 목록 1
2. 순서 있는 목록 2

### 인용구 테스트
> 이것은 인용구입니다.
> 여러 줄로도 작성할 수 있습니다.

### 코드 테스트
인라인 \`코드\`와 코드 블록을 지원합니다.

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### 링크 테스트
[Google](https://google.com)로 이동할 수 있습니다.

### 이미지 테스트
![이미지 설명](https://via.placeholder.com/300x200)
`;

  const sampleQuillContent = `<h1>Quill 에디터 테스트</h1>
<h2>기본 기능 테스트</h2>
<p><strong>굵은 텍스트</strong>와 <em>기울임 텍스트</em>를 지원합니다.</p>
<h3>목록 테스트</h3>
<ul>
<li>순서 없는 목록 1</li>
<li>순서 없는 목록 2</li>
</ul>
<ol>
<li>순서 있는 목록 1</li>
<li>순서 있는 목록 2</li>
</ol>
<h3>인용구 테스트</h3>
<blockquote>이것은 인용구입니다.</blockquote>
<h3>링크 테스트</h3>
<p><a href="https://google.com">Google</a>로 이동할 수 있습니다.</p>
<h3>이미지 테스트</h3>
<p><img src="https://via.placeholder.com/300x200" alt="이미지 설명"></p>`;

  const loadSampleContent = () => {
    setMarkdownContent(sampleMarkdown);
    setQuillContent(sampleQuillContent);
  };

  const clearContent = () => {
    setMarkdownContent('');
    setQuillContent('');
  };

  const copyMarkdownToQuill = () => {
    // 간단한 마크다운 → HTML 변환 (실제로는 marked 라이브러리 사용)
    setQuillContent(markdownContent);
  };

  return (
    <TestPageContainer maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        📝 에디터 비교 테스트
      </Typography>
      
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
        QuillEditor와 MarkdownEditor를 나란히 비교해보세요
      </Typography>

      {/* 컨트롤 패널 */}
      <ControlPanel elevation={2}>
        <Typography variant="h6">테스트 옵션:</Typography>
        
        <FormControlLabel
          control={<Switch checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />}
          label="비활성화"
        />
        
        <FormControlLabel
          control={<Switch checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />}
          label="읽기 전용"
        />
        
        <FormControlLabel
          control={<Switch checked={expanded} onChange={(e) => setExpanded(e.target.checked)} />}
          label="확장 모드"
        />
        
        <FormControlLabel
          control={<Switch checked={animate} onChange={(e) => setAnimate(e.target.checked)} />}
          label="애니메이션"
        />
        
        <Divider orientation="vertical" flexItem />
        
        <Button variant="contained" onClick={loadSampleContent}>
          샘플 로드
        </Button>
        
        <Button variant="outlined" onClick={clearContent}>
          내용 지우기
        </Button>
        
        <Button variant="outlined" onClick={copyMarkdownToQuill}>
          MD → Quill
        </Button>
      </ControlPanel>

      {/* 에디터 비교 영역 */}
      <Grid container spacing={3}>
        {/* QuillEditor */}
        <Grid item xs={12} lg={6}>
          <EditorSection elevation={3}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6">
                🖋️ QuillEditor (기존)
              </Typography>
              <Chip label="WYSIWYG" color="primary" size="small" />
              <Chip label="React-Quill" color="secondary" size="small" />
            </Box>
            
            <EditorWrapper>
              <QuillEditor
                value={quillContent}
                onChange={setQuillContent}
                placeholder="QuillEditor로 작성해보세요..."
                readOnly={readOnly}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['blockquote', 'code-block'],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
                formats={[
                  'header',
                  'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet',
                  'blockquote', 'code-block',
                  'link', 'image'
                ]}
              />
            </EditorWrapper>
            
            <ContentDisplay>
              <Typography variant="caption" color="text.secondary">
                QuillEditor 내용 (HTML):
              </Typography>
              <pre>{quillContent || '내용이 없습니다.'}</pre>
            </ContentDisplay>
          </EditorSection>
        </Grid>

        {/* MarkdownEditor */}
        <Grid item xs={12} lg={6}>
          <EditorSection elevation={3}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6">
                🔖 MarkdownEditor (신규)
              </Typography>
              <Chip label="Markdown" color="primary" size="small" />
              <Chip label="Marked.js" color="secondary" size="small" />
            </Box>
            
            <EditorWrapper>
              <MarkdownEditor
                value={markdownContent}
                onChange={setMarkdownContent}
                placeholder="마크다운으로 작성해보세요..."
                disabled={disabled}
                readOnly={readOnly}
                expanded={expanded}
                animate={animate}
                onImageUpload={(imageUrl) => {
                  console.log('이미지 업로드 완료:', imageUrl);
                  alert(`이미지 업로드 완료!\nURL: ${imageUrl}`);
                }}
              />
            </EditorWrapper>
            
            <ContentDisplay>
              <Typography variant="caption" color="text.secondary">
                MarkdownEditor 내용 (Markdown):
              </Typography>
              <pre>{markdownContent || '내용이 없습니다.'}</pre>
            </ContentDisplay>
          </EditorSection>
        </Grid>
      </Grid>

      {/* 비교 정보 */}
      <Paper sx={{ p: 3, mt: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          📊 기능 비교
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              QuillEditor 특징
            </Typography>
            <ul>
              <li>WYSIWYG 방식 (직관적)</li>
              <li>React-Quill 기반</li>
              <li>풍부한 포맷팅 기능</li>
              <li>이미지 drag & drop</li>
              <li>HTML 출력</li>
              <li>기존 사용자 익숙함</li>
            </ul>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="secondary" gutterBottom>
              MarkdownEditor 특징
            </Typography>
            <ul>
              <li>마크다운 문법 기반</li>
              <li>Marked.js + DOMPurify</li>
              <li>실시간 미리보기</li>
              <li>키보드 단축키 지원</li>
              <li>경량화된 구조</li>
              <li>개발자 친화적</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {/* 성능 정보 */}
      <Paper sx={{ p: 3, mt: 3 }} elevation={1}>
        <Typography variant="body2" color="text.secondary" align="center">
          💡 <strong>테스트 팁:</strong> 각 에디터에서 동일한 내용을 작성해보고, 
          툴바 기능, 키보드 단축키, 반응형 디자인을 비교해보세요.
          모바일에서는 MarkdownEditor가 편집/미리보기 탭으로 전환됩니다.
        </Typography>
      </Paper>
    </TestPageContainer>
  );
};

export default EditorComparisonPage; 