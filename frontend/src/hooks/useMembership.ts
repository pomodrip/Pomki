import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { PaymentRequest, CancelMembershipRequest } from '../types/membership';
import {
  // Async thunks
  fetchCurrentMembership,
  fetchMembershipPlans,
  processMembershipPayment,
  verifyPaymentStatus,
  cancelMembershipSubscription,
  fetchMembershipBenefits,
  fetchPaymentHistory,
  
  // Sync actions
  setSelectedPlan,
  setPaymentMethod,
  toggleCancelDialog,
  setCancelDialog,
  clearError,
  clearAllErrors,
  resetPaymentState,
  updateBenefitUsage,
  
  // Selectors
  selectMembership,
  selectCurrentMembership,
  selectMembershipPlans,
  selectMembershipBenefits,
  selectPaymentHistory,
  selectPaymentInProgress,
  selectCurrentPayment,
  selectMembershipLoading,
  selectIsLoading,
  selectMembershipErrors,
  selectHasError,
  selectMembershipUI,
  selectSelectedPlan,
  selectPaymentMethod,
  selectShowCancelDialog,
  selectHasPremiumMembership,
  selectSelectedPlanInfo,
  selectCanUsePremiumFeatures,
  
  // Helper functions
  getMembershipDisplayName,
  getPaymentStatusDisplayName,
  getPaymentMethodDisplayName,
} from '../store/slices/membershipSlice';
import { useAppDispatch } from './useRedux';

/**
 * 멤버십 관리를 위한 커스텀 훅
 */
export const useMembership = () => {
  const dispatch = useAppDispatch();
  
  // 기본 상태 셀렉터들
  const membership = useSelector(selectMembership);
  const currentMembership = useSelector(selectCurrentMembership);
  const plans = useSelector(selectMembershipPlans);
  const benefits = useSelector(selectMembershipBenefits);
  const paymentHistory = useSelector(selectPaymentHistory);
  const paymentInProgress = useSelector(selectPaymentInProgress);
  const currentPayment = useSelector(selectCurrentPayment);
  
  // 로딩 및 에러 상태
  const loading = useSelector(selectMembershipLoading);
  const isLoading = useSelector(selectIsLoading);
  const errors = useSelector(selectMembershipErrors);
  const hasError = useSelector(selectHasError);
  
  // UI 상태
  const ui = useSelector(selectMembershipUI);
  const selectedPlan = useSelector(selectSelectedPlan);
  const selectedPaymentMethod = useSelector(selectPaymentMethod);
  const showCancelDialog = useSelector(selectShowCancelDialog);
  
  // 복합 셀렉터들
  const hasPremiumMembership = useSelector(selectHasPremiumMembership);
  const selectedPlanInfo = useSelector(selectSelectedPlanInfo);
  const premiumFeatures = useSelector(selectCanUsePremiumFeatures);
  
  // 비동기 액션들
  const loadCurrentMembership = useCallback(() => {
    return dispatch(fetchCurrentMembership());
  }, [dispatch]);
  
  const loadMembershipPlans = useCallback(() => {
    return dispatch(fetchMembershipPlans());
  }, [dispatch]);
  
  const processPayment = useCallback((paymentData: PaymentRequest) => {
    return dispatch(processMembershipPayment(paymentData));
  }, [dispatch]);
  
  const checkPaymentStatus = useCallback((paymentId: string) => {
    return dispatch(verifyPaymentStatus(paymentId));
  }, [dispatch]);
  
  const cancelMembership = useCallback((cancelData?: CancelMembershipRequest) => {
    return dispatch(cancelMembershipSubscription(cancelData || {}));
  }, [dispatch]);
  
  const loadMembershipBenefits = useCallback(() => {
    return dispatch(fetchMembershipBenefits());
  }, [dispatch]);
  
  const loadPaymentHistory = useCallback(() => {
    return dispatch(fetchPaymentHistory());
  }, [dispatch]);
  
  // 동기 액션들
  const choosePlan = useCallback((planId: string | null) => {
    dispatch(setSelectedPlan(planId));
  }, [dispatch]);
  
  const choosePaymentMethod = useCallback((method: 'CARD' | 'KAKAOPAY' | 'TOSS' | null) => {
    dispatch(setPaymentMethod(method));
  }, [dispatch]);
  
  const toggleCancelConfirm = useCallback(() => {
    dispatch(toggleCancelDialog());
  }, [dispatch]);
  
  const setCancelConfirm = useCallback((show: boolean) => {
    dispatch(setCancelDialog(show));
  }, [dispatch]);
  
  const clearMembershipError = useCallback((errorType: keyof typeof errors) => {
    dispatch(clearError(errorType));
  }, [dispatch]);
  
  const clearAllMembershipErrors = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);
  
  const resetPayment = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);
  
  const updateUsage = useCallback((usage: { aiUsageUsed?: number; storageUsed?: number }) => {
    dispatch(updateBenefitUsage(usage));
  }, [dispatch]);
  
  // 초기화 함수
  const initialize = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCurrentMembership()),
        dispatch(fetchMembershipPlans()),
        dispatch(fetchMembershipBenefits()),
      ]);
    } catch (error) {
      console.error('멤버십 초기화 실패:', error);
    }
  }, [dispatch]);
  
  // 완전한 결제 프로세스
  const purchasePlan = useCallback(async (planId: string, method: 'CARD' | 'KAKAOPAY' | 'TOSS') => {
    try {
      // 플랜과 결제 방법 선택
      dispatch(setSelectedPlan(planId));
      dispatch(setPaymentMethod(method));
      
      // 결제 처리
      const result = await dispatch(processMembershipPayment({ planId, paymentMethod: method }));
      
      if (result.meta.requestStatus === 'fulfilled') {
        return result.payload;
      } else {
        throw new Error('결제 처리 실패');
      }
    } catch (error) {
      console.error('결제 실패:', error);
      throw error;
    }
  }, [dispatch]);
  
  // 멤버십 상태 새로고침
  const refreshMembershipData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCurrentMembership()),
        dispatch(fetchMembershipBenefits()),
        dispatch(fetchPaymentHistory()),
      ]);
    } catch (error) {
      console.error('멤버십 데이터 새로고침 실패:', error);
    }
  }, [dispatch]);
  
  return {
    // 상태
    membership,
    currentMembership,
    plans,
    benefits,
    paymentHistory,
    paymentInProgress,
    currentPayment,
    
    // 로딩 및 에러
    loading,
    isLoading,
    errors,
    hasError,
    
    // UI 상태
    ui,
    selectedPlan,
    selectedPaymentMethod,
    showCancelDialog,
    
    // 복합 상태
    hasPremiumMembership,
    selectedPlanInfo,
    premiumFeatures,
    
    // 비동기 액션들
    loadCurrentMembership,
    loadMembershipPlans,
    processPayment,
    checkPaymentStatus,
    cancelMembership,
    loadMembershipBenefits,
    loadPaymentHistory,
    
    // 동기 액션들
    choosePlan,
    choosePaymentMethod,
    toggleCancelConfirm,
    setCancelConfirm,
    clearMembershipError,
    clearAllMembershipErrors,
    resetPayment,
    updateUsage,
    
    // 헬퍼 함수들
    getMembershipDisplayName,
    getPaymentStatusDisplayName,
    getPaymentMethodDisplayName,
    
    // 고수준 함수들
    initialize,
    purchasePlan,
    refreshMembershipData,
  };
};

/**
 * 멤버십 혜택 사용 가능 여부를 확인하는 훅
 */
export const useMembershipFeatures = () => {
  const features = useSelector(selectCanUsePremiumFeatures);
  const benefits = useSelector(selectMembershipBenefits);
  
  return {
    ...features,
    
    // AI 사용량 관련
    aiUsageRemaining: benefits ? benefits.aiUsageLimit - benefits.aiUsageUsed : 0,
    aiUsagePercent: features.aiUsagePercent,
    isAIUsageFull: features.aiUsagePercent >= 100,
    
    // 스토리지 관련
    storageRemaining: benefits ? benefits.storageLimit - benefits.storageUsed : 0,
    storagePercent: features.storagePercent,
    isStorageFull: features.storagePercent >= 100,
    
    // 기능 사용 가능 여부
    canUseAdvancedFeatures: features.hasPremium,
    canExportNotes: features.hasPremium,
    canCreateUnlimitedDecks: features.hasPremium,
    canUseCustomThemes: features.hasPremium,
  };
};

/**
 * 멤버십 결제 프로세스를 관리하는 훅
 */
export const usePaymentProcess = () => {
  const dispatch = useAppDispatch();
  const paymentInProgress = useSelector(selectPaymentInProgress);
  const currentPayment = useSelector(selectCurrentPayment);
  const selectedPlan = useSelector(selectSelectedPlan);
  const paymentMethod = useSelector(selectPaymentMethod);
  const loading = useSelector(selectMembershipLoading);
  
  const startPayment = useCallback(async (planId: string, method: 'CARD' | 'KAKAOPAY' | 'TOSS') => {
    try {
      dispatch(setSelectedPlan(planId));
      dispatch(setPaymentMethod(method));
      
      const result = await dispatch(processMembershipPayment({ planId, paymentMethod: method }));
      return result.payload;
    } catch (error) {
      console.error('결제 시작 실패:', error);
      throw error;
    }
  }, [dispatch]);
  
  const checkStatus = useCallback(async (paymentId: string) => {
    try {
      const result = await dispatch(verifyPaymentStatus(paymentId));
      return result.payload;
    } catch (error) {
      console.error('결제 상태 확인 실패:', error);
      throw error;
    }
  }, [dispatch]);
  
  const resetProcess = useCallback(() => {
    dispatch(resetPaymentState());
  }, [dispatch]);
  
  return {
    // 상태
    paymentInProgress,
    currentPayment,
    selectedPlan,
    paymentMethod,
    isProcessing: loading.payment,
    
    // 액션들
    startPayment,
    checkStatus,
    resetProcess,
    
    // 헬퍼
    isPaymentComplete: currentPayment?.status === 'SUCCESS',
    isPaymentFailed: currentPayment?.status === 'FAILED',
    isPaymentPending: currentPayment?.status === 'PENDING',
  };
}; 