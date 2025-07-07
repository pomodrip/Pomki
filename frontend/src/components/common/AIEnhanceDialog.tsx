import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ContentCopy from '@mui/icons-material/ContentCopy';
import { AIEnhanceResponse } from '../../api/noteApi';

interface AIEnhanceDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (content: string) => void;
  aiResponse: AIEnhanceResponse | null;
  loading: boolean;
}

export const AIEnhanceDialog: React.FC<AIEnhanceDialogProps> = ({
  open,
  onClose,
  onApply,
  aiResponse,
  loading,
}) => {
  const handleApply = () => {
    if (aiResponse) {
      onApply(aiResponse.polishedContent);
      onClose();
    }
  };

  const handleCopyContent = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse.polishedContent);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingBottom: '16px',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1F2937' }}>
          🤖 AI 노트 생성 결과
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '40px 0',
            gap: '16px',
          }}>
                         <Box sx={{ 
               width: '40px', 
               height: '40px', 
               border: '3px solid #E5E7EB',
               borderTopColor: '#3B82F6',
               borderRadius: '50%',
               '@keyframes spin': {
                 '0%': { transform: 'rotate(0deg)' },
                 '100%': { transform: 'rotate(360deg)' },
               },
               animation: 'spin 1s linear infinite',
             }} />
            <Typography variant="body1" color="text.secondary">
              AI가 노트를 생성하고 있습니다...
            </Typography>
          </Box>
        ) : aiResponse ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 생성된 내용 */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
                  ✨ 개선된 노트 내용
                </Typography>
                <IconButton onClick={handleCopyContent} size="small" title="내용 복사">
                  <ContentCopy />
                </IconButton>
              </Box>
              <Paper sx={{ 
                padding: '16px', 
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                maxHeight: '300px',
                overflow: 'auto',
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    color: '#374151',
                  }}
                >
                  {aiResponse.polishedContent}
                </Typography>
              </Paper>
            </Box>

            {/* 키워드  */}
            {aiResponse.keywords && aiResponse.keywords.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>
                  🏷️ 핵심 키워드
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {aiResponse.keywords.map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor: '#EBF8FF',
                        borderColor: '#3B82F6',
                        color: '#1E40AF',
                        '&:hover': {
                          backgroundColor: '#DBEAFE',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 학습 가이드 */}
            {aiResponse.learningGuide && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>
                  📚 학습 가이드
                </Typography>
                <Paper sx={{ 
                  padding: '16px', 
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                }}>
                  {aiResponse.learningGuide.summary && (
                    <Box sx={{ marginBottom: '16px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#065F46', marginBottom: '8px' }}>
                        📝 요약
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#047857', lineHeight: 1.6 }}>
                        {aiResponse.learningGuide.summary}
                      </Typography>
                    </Box>
                  )}
                  
                  {aiResponse.learningGuide.nextSteps && aiResponse.learningGuide.nextSteps.length > 0 && (
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#065F46', marginBottom: '8px' }}>
                        🎯 다음 단계
                      </Typography>
                      <List dense sx={{ padding: 0 }}>
                        {aiResponse.learningGuide.nextSteps.map((step, index) => (
                          <ListItem key={index} sx={{ padding: '4px 0' }}>
                            <ListItemIcon sx={{ minWidth: '24px' }}>
                              <CheckCircle sx={{ color: '#059669', fontSize: '16px' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={step}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { color: '#047857' },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}

            {/* 추론 과정 */}
            {aiResponse.reasoning && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', marginBottom: '12px' }}>
                  🧠 AI 추론 과정
                </Typography>
                <Paper sx={{ 
                  padding: '16px', 
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#92400E',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    {aiResponse.reasoning}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', padding: '40px 0' }}>
            <Typography variant="body1" color="text.secondary">
              AI 생성 결과를 불러오는 중 오류가 발생했습니다.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: '#D1D5DB',
            color: '#6B7280',
            '&:hover': {
              borderColor: '#9CA3AF',
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={loading || !aiResponse}
          sx={{
            backgroundColor: '#3B82F6',
            '&:hover': {
              backgroundColor: '#2563EB',
            },
            '&:disabled': {
              backgroundColor: '#D1D5DB',
            },
          }}
        >
          노트에 적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 