import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  TextField,
} from '@mui/material';
import CircularProgress from '../components/ui/CircularProgress';
import {
  Star,
  CreditCard,
  History,
  CheckCircle,
  Cancel,
  Warning,
  Upgrade,
  Storage,
  Psychology,
} from '@mui/icons-material';
import { useMembership, useMembershipFeatures, usePaymentProcess } from '../hooks/useMembership';

const MembershipUsageExample: React.FC = () => {
  const {
    // 상태
    currentMembership,
    plans,
    benefits,
    paymentHistory,
    
    // 로딩 및 에러
    loading,
    errors,
    
    // UI 상태
    selectedPlan,
    selectedPaymentMethod,
    showCancelDialog,
    
    // 복합 상태
    hasPremiumMembership,
    selectedPlanInfo,
    // premiumFeatures,
    
    // 액션들
    loadCurrentMembership,
    loadMembershipPlans,
    loadMembershipBenefits,
    loadPaymentHistory,
    choosePlan,
    choosePaymentMethod,
    toggleCancelConfirm,
    clearAllMembershipErrors,
    cancelMembership,
    updateUsage,
    
    // 헬퍼 함수들
    getMembershipDisplayName,
    getPaymentStatusDisplayName,
    getPaymentMethodDisplayName,
    
    // 고수준 함수들
    initialize,
    purchasePlan,
    refreshMembershipData,
  } = useMembership();

  const membershipFeatures = useMembershipFeatures();
  
  const {
    //startPayment,
    //checkStatus,
    resetProcess,
    isPaymentComplete,
    isPaymentFailed,
    isPaymentPending,
  } = usePaymentProcess();

  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 결제 완료 시 데이터 새로고침
  useEffect(() => {
    if (isPaymentComplete) {
      refreshMembershipData();
      setShowPaymentDialog(false);
      resetProcess();
    }
  }, [isPaymentComplete, refreshMembershipData, resetProcess]);

  const handlePlanSelect = (planId: string) => {
    choosePlan(planId);
    setShowPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      alert('플랜과 결제 방법을 선택해주세요.');
      return;
    }

    try {
      await purchasePlan(selectedPlan, selectedPaymentMethod);
      alert('결제가 시작되었습니다.');
    } catch (error) {
      console.error('결제 실패:', error);
      alert('결제에 실패했습니다.');
    }
  };

  const handleCancelMembership = async () => {
    try {
      await cancelMembership({ reason: cancelReason });
      alert('멤버십이 취소되었습니다.');
      await refreshMembershipData();
    } catch (error) {
      console.error('멤버십 취소 실패:', error);
      alert('멤버십 취소에 실패했습니다.');
    }
  };

  const simulateUsage = () => {
    updateUsage({
      aiUsageUsed: Math.min((benefits?.aiUsageUsed || 0) + 10, benefits?.aiUsageLimit || 100),
      storageUsed: Math.min((benefits?.storageUsed || 0) + 50, benefits?.storageLimit || 1000),
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        🎯 Membership Slice 사용 예제
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        멤버십 관리, 결제 처리, 혜택 관리 등 모든 기능을 시연합니다.
      </Typography>

      {/* 에러 표시 */}
      {Object.values(errors).some(error => error) && (
        <Alert 
          severity="error" 
          onClose={clearAllMembershipErrors}
          sx={{ mb: 3 }}
        >
          오류가 발생했습니다: {Object.values(errors).filter(Boolean).join(', ')}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* 현재 멤버십 상태 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                현재 멤버십 상태
              </Typography>
              {loading.currentMembership ? (
                <CircularProgress size={24} />
              ) : currentMembership ? (
                <Box>
                  <Chip 
                    label={getMembershipDisplayName(currentMembership.membershipType)}
                    color={hasPremiumMembership ? 'primary' : 'default'}
                    icon={hasPremiumMembership ? <Star /> : undefined}
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    가입일: {new Date(currentMembership.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    최종 수정: {new Date(currentMembership.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  멤버십 정보가 없습니다.
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={loadCurrentMembership}
                  disabled={loading.currentMembership}
                >
                  새로고침
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 멤버십 혜택 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                멤버십 혜택
              </Typography>
              {loading.benefits ? (
                <CircularProgress size={24} />
              ) : benefits ? (
                <Box>
                  {/* AI 사용량 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Psychology fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        AI 사용량: {benefits.aiUsageUsed} / {benefits.aiUsageLimit}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={membershipFeatures.aiUsagePercent}
                      color={membershipFeatures.isAIUsageFull ? 'error' : 'primary'}
                    />
                  </Box>
                  
                  {/* 스토리지 사용량 */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Storage fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        스토리지: {benefits.storageUsed}MB / {benefits.storageLimit}MB
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={membershipFeatures.storagePercent}
                      color={membershipFeatures.isStorageFull ? 'error' : 'primary'}
                    />
                  </Box>

                  {/* 기능들 */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    사용 가능한 기능:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {benefits.features.map((feature, index) => (
                      <Chip key={index} label={feature} size="small" />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  혜택 정보가 없습니다.
                </Typography>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={loadMembershipBenefits}
                  disabled={loading.benefits}
                >
                  새로고침
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={simulateUsage}
                  disabled={!benefits}
                >
                  사용량 시뮬레이션
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 멤버십 플랜 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                멤버십 플랜
              </Typography>
              {loading.plans ? (
                <CircularProgress size={24} />
              ) : (
                <Grid container spacing={2}>
                  {plans.map((plan) => (
                    <Grid item xs={12} sm={6} md={3} key={plan.planId}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          ...(plan.isPopular && {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          })
                        }}
                        onClick={() => handlePlanSelect(plan.planId)}
                      >
                        {plan.isPopular && (
                          <Chip 
                            label="인기" 
                            color="primary" 
                            size="small"
                            sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: 8 
                            }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6">{plan.planName}</Typography>
                          <Typography variant="h4" color="primary">
                            ₩{plan.price.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {plan.duration}개월
                          </Typography>
                          <List dense>
                            {plan.features.map((feature, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <CheckCircle color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={feature}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={loadMembershipPlans}
                  disabled={loading.plans}
                >
                  플랜 새로고침
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 결제 히스토리 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                결제 히스토리
              </Typography>
              {loading.history ? (
                <CircularProgress size={24} />
              ) : paymentHistory.length > 0 ? (
                <List>
                  {paymentHistory.map((payment, index) => (
                    <React.Fragment key={payment.id}>
                      <ListItem>
                        <ListItemIcon>
                          <History />
                        </ListItemIcon>
                        <ListItemText
                          primary={getMembershipDisplayName(payment.membershipType)}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                {new Date(payment.startDate).toLocaleDateString()} ~ 
                                {new Date(payment.endDate).toLocaleDateString()}
                              </Typography>
                              <Typography variant="body2">
                                ₩{payment.paymentAmount.toLocaleString()} · 
                                {getPaymentStatusDisplayName(payment.status)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < paymentHistory.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  결제 히스토리가 없습니다.
                </Typography>
              )}
              
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={loadPaymentHistory}
                  disabled={loading.history}
                >
                  히스토리 새로고침
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 멤버십 관리 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                멤버십 관리
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {hasPremiumMembership ? (
                  <>
                    <Alert severity="success" icon={<CheckCircle />}>
                      프리미엄 멤버십이 활성화되어 있습니다.
                    </Alert>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={toggleCancelConfirm}
                      disabled={loading.cancel}
                      startIcon={<Cancel />}
                    >
                      멤버십 취소
                    </Button>
                  </>
                ) : (
                  <>
                    <Alert severity="info" icon={<Warning />}>
                      무료 플랜을 사용 중입니다. 프리미엄 혜택을 누려보세요!
                    </Alert>
                    <Button 
                      variant="contained" 
                      onClick={() => setShowBenefitsDialog(true)}
                      startIcon={<Upgrade />}
                    >
                      업그레이드 혜택 보기
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outlined"
                  onClick={refreshMembershipData}
                  disabled={Object.values(loading).some(l => l)}
                >
                  전체 데이터 새로고침
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 결제 다이얼로그 */}
      <Dialog 
        open={showPaymentDialog} 
        onClose={() => setShowPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>멤버십 결제</DialogTitle>
        <DialogContent>
          {selectedPlanInfo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">{selectedPlanInfo.planName}</Typography>
              <Typography variant="h4" color="primary">
                ₩{selectedPlanInfo.price.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedPlanInfo.duration}개월간 이용
              </Typography>
            </Box>
          )}
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>결제 방법</InputLabel>
            <Select
              value={selectedPaymentMethod || ''}
              onChange={(e) => choosePaymentMethod(e.target.value as any)}
            >
              <MenuItem value="CARD">
                {getPaymentMethodDisplayName('CARD')}
              </MenuItem>
              <MenuItem value="KAKAOPAY">
                {getPaymentMethodDisplayName('KAKAOPAY')}
              </MenuItem>
              <MenuItem value="TOSS">
                {getPaymentMethodDisplayName('TOSS')}
              </MenuItem>
            </Select>
          </FormControl>

          {isPaymentPending && (
            <Alert severity="info">결제가 진행 중입니다...</Alert>
          )}
          
          {isPaymentFailed && (
            <Alert severity="error">결제에 실패했습니다. 다시 시도해주세요.</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPaymentDialog(false)}>
            취소
          </Button>
          <Button 
            onClick={handlePayment}
            variant="contained"
            disabled={!selectedPaymentMethod || loading.payment}
            startIcon={loading.payment ? <CircularProgress size={16} /> : <CreditCard />}
          >
            {loading.payment ? '처리 중...' : '결제하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 멤버십 취소 다이얼로그 */}
      <Dialog 
        open={showCancelDialog} 
        onClose={toggleCancelConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>멤버십 취소</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            정말로 멤버십을 취소하시겠습니까?
          </Typography>
          <TextField
            fullWidth
            label="취소 사유 (선택사항)"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleCancelConfirm}>
            돌아가기
          </Button>
          <Button 
            onClick={handleCancelMembership}
            color="error"
            variant="contained"
            disabled={loading.cancel}
          >
            {loading.cancel ? '처리 중...' : '취소하기'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 혜택 다이얼로그 */}
      <Dialog 
        open={showBenefitsDialog} 
        onClose={() => setShowBenefitsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>프리미엄 혜택</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            🎯 프리미엄 멤버십 기능들
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText primary="AI 기능 무제한 사용" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText primary="대용량 스토리지 제공" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText primary="노트 내보내기 기능" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText primary="무제한 덱 생성" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" /></ListItemIcon>
              <ListItemText primary="커스텀 테마 사용" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBenefitsDialog(false)}>
            닫기
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              setShowBenefitsDialog(false);
              loadMembershipPlans();
            }}
          >
            플랜 보기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 사용법 가이드 */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📚 Membership Slice 사용법
        </Typography>
        
        <Typography variant="body2" component="pre" sx={{ 
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          color: 'text.secondary',
        }}>
{`// 1. 기본 사용법
const { currentMembership, loadCurrentMembership } = useMembership();

// 2. 결제 처리
const { purchasePlan } = useMembership();
await purchasePlan('premium-plan', 'CARD');

// 3. 혜택 확인
const { canUseAI, aiUsagePercent } = useMembershipFeatures();

// 4. 결제 프로세스 관리
const { startPayment, isPaymentComplete } = usePaymentProcess();

// 5. 멤버십 취소
const { cancelMembership } = useMembership();
await cancelMembership({ reason: '서비스 불만족' });

// 6. 사용량 업데이트
const { updateUsage } = useMembership();
updateUsage({ aiUsageUsed: 50, storageUsed: 200 });`}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MembershipUsageExample; 