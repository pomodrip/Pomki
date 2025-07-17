import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type {
  Membership,
  MembershipPlan,
  PaymentRequest,
  PaymentResponse,
  CancelMembershipRequest,
} from '../../types/membership';
import {
  getCurrentMembership,
  getMembershipPlans,
  purchaseMembership,
  checkPaymentStatus,
  cancelMembership,
  getMembershipHistory,
  getMembershipBenefits,
} from '../../api/membershipApi';

// ==========================================
// 1. 타입 정의
// ==========================================

export interface PaymentHistory {
  id: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  paymentAmount: number;
}

export interface MembershipBenefits {
  aiUsageLimit: number;
  aiUsageUsed: number;
  storageLimit: number;
  storageUsed: number;
  features: string[];
}

export interface MembershipState {
  // 현재 멤버십
  currentMembership: Membership | null;
  
  // 플랜 정보
  plans: MembershipPlan[];
  
  // 결제 관련
  paymentInProgress: boolean;
  currentPayment: PaymentResponse | null;
  
  // 혜택 및 사용량
  benefits: MembershipBenefits | null;
  
  // 히스토리
  paymentHistory: PaymentHistory[];
  
  // 로딩 상태
  loading: {
    currentMembership: boolean;
    plans: boolean;
    payment: boolean;
    benefits: boolean;
    history: boolean;
    cancel: boolean;
  };
  
  // 에러 상태
  error: {
    currentMembership: string | null;
    plans: string | null;
    payment: string | null;
    benefits: string | null;
    history: string | null;
    cancel: string | null;
  };
  
  // UI 상태
  ui: {
    selectedPlan: string | null;
    paymentMethod: 'CARD' | 'KAKAOPAY' | 'TOSS' | null;
    showCancelDialog: boolean;
  };
}

// ==========================================
// 2. 초기 상태
// ==========================================

const initialState: MembershipState = {
  currentMembership: null,
  plans: [],
  paymentInProgress: false,
  currentPayment: null,
  benefits: null,
  paymentHistory: [],
  
  loading: {
    currentMembership: false,
    plans: false,
    payment: false,
    benefits: false,
    history: false,
    cancel: false,
  },
  
  error: {
    currentMembership: null,
    plans: null,
    payment: null,
    benefits: null,
    history: null,
    cancel: null,
  },
  
  ui: {
    selectedPlan: null,
    paymentMethod: null,
    showCancelDialog: false,
  },
};

// ==========================================
// 3. 비동기 Thunk 액션들
// ==========================================

// 현재 멤버십 조회
export const fetchCurrentMembership = createAsyncThunk(
  'membership/fetchCurrentMembership',
  async (_, { rejectWithValue }) => {
    try {
      const membership = await getCurrentMembership();
      return membership;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '멤버십 정보를 불러오는데 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 멤버십 플랜 목록 조회
export const fetchMembershipPlans = createAsyncThunk(
  'membership/fetchMembershipPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await getMembershipPlans();
      return plans;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '플랜 정보를 불러오는데 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 멤버십 결제
export const processMembershipPayment = createAsyncThunk(
  'membership/processMembershipPayment',
  async (paymentData: PaymentRequest, { rejectWithValue }) => {
    try {
      const result = await purchaseMembership(paymentData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '결제 처리에 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 결제 상태 확인
export const verifyPaymentStatus = createAsyncThunk(
  'membership/verifyPaymentStatus',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const status = await checkPaymentStatus(paymentId);
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '결제 상태 확인에 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 멤버십 취소
export const cancelMembershipSubscription = createAsyncThunk(
  'membership/cancelMembershipSubscription',
  async (cancelData: CancelMembershipRequest = {}, { rejectWithValue }) => {
    try {
      await cancelMembership(cancelData);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '멤버십 취소에 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 멤버십 혜택 조회
export const fetchMembershipBenefits = createAsyncThunk(
  'membership/fetchMembershipBenefits',
  async (_, { rejectWithValue }) => {
    try {
      const benefits = await getMembershipBenefits();
      return benefits;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '혜택 정보를 불러오는데 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// 결제 히스토리 조회
export const fetchPaymentHistory = createAsyncThunk(
  'membership/fetchPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { history } = await getMembershipHistory();
      return history;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '결제 히스토리를 불러오는데 실패했습니다.';
      return rejectWithValue(errorMessage);
    }
  }
);

// ==========================================
// 4. Slice 정의
// ==========================================

const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    // UI 상태 관리
    setSelectedPlan: (state, action: PayloadAction<string | null>) => {
      state.ui.selectedPlan = action.payload;
    },

    setPaymentMethod: (state, action: PayloadAction<'CARD' | 'KAKAOPAY' | 'TOSS' | null>) => {
      state.ui.paymentMethod = action.payload;
    },

    toggleCancelDialog: (state) => {
      state.ui.showCancelDialog = !state.ui.showCancelDialog;
    },

    setCancelDialog: (state, action: PayloadAction<boolean>) => {
      state.ui.showCancelDialog = action.payload;
    },

    // 에러 클리어
    clearError: (state, action: PayloadAction<keyof MembershipState['error']>) => {
      state.error[action.payload] = null;
    },

    clearAllErrors: (state) => {
      Object.keys(state.error).forEach(key => {
        state.error[key as keyof MembershipState['error']] = null;
      });
    },

    // 결제 상태 리셋
    resetPaymentState: (state) => {
      state.paymentInProgress = false;
      state.currentPayment = null;
      state.ui.selectedPlan = null;
      state.ui.paymentMethod = null;
      state.error.payment = null;
    },

    // 혜택 사용량 업데이트 (로컬)
    updateBenefitUsage: (state, action: PayloadAction<{
      aiUsageUsed?: number;
      storageUsed?: number;
    }>) => {
      if (state.benefits) {
        if (action.payload.aiUsageUsed !== undefined) {
          state.benefits.aiUsageUsed = action.payload.aiUsageUsed;
        }
        if (action.payload.storageUsed !== undefined) {
          state.benefits.storageUsed = action.payload.storageUsed;
        }
      }
    },
  },

  extraReducers: (builder) => {
    // ===== 현재 멤버십 조회 =====
    builder
      .addCase(fetchCurrentMembership.pending, (state) => {
        state.loading.currentMembership = true;
        state.error.currentMembership = null;
      })
      .addCase(fetchCurrentMembership.fulfilled, (state, action) => {
        state.loading.currentMembership = false;
        state.currentMembership = action.payload;
      })
      .addCase(fetchCurrentMembership.rejected, (state, action) => {
        state.loading.currentMembership = false;
        state.error.currentMembership = action.payload as string;
      });

    // ===== 멤버십 플랜 조회 =====
    builder
      .addCase(fetchMembershipPlans.pending, (state) => {
        state.loading.plans = true;
        state.error.plans = null;
      })
      .addCase(fetchMembershipPlans.fulfilled, (state, action) => {
        state.loading.plans = false;
        state.plans = action.payload;
      })
      .addCase(fetchMembershipPlans.rejected, (state, action) => {
        state.loading.plans = false;
        state.error.plans = action.payload as string;
      });

    // ===== 멤버십 결제 =====
    builder
      .addCase(processMembershipPayment.pending, (state) => {
        state.loading.payment = true;
        state.paymentInProgress = true;
        state.error.payment = null;
      })
      .addCase(processMembershipPayment.fulfilled, (state, action) => {
        state.loading.payment = false;
        state.currentPayment = action.payload;
        // 결제 성공 시 paymentInProgress는 유지 (상태 확인 필요)
      })
      .addCase(processMembershipPayment.rejected, (state, action) => {
        state.loading.payment = false;
        state.paymentInProgress = false;
        state.error.payment = action.payload as string;
      });

    // ===== 결제 상태 확인 =====
    builder
      .addCase(verifyPaymentStatus.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
        if (action.payload.status === 'SUCCESS') {
          state.paymentInProgress = false;
          // 성공 시 현재 멤버십 정보도 새로고침 필요
        } else if (action.payload.status === 'FAILED') {
          state.paymentInProgress = false;
        }
      });

    // ===== 멤버십 취소 =====
    builder
      .addCase(cancelMembershipSubscription.pending, (state) => {
        state.loading.cancel = true;
        state.error.cancel = null;
      })
      .addCase(cancelMembershipSubscription.fulfilled, (state) => {
        state.loading.cancel = false;
        state.ui.showCancelDialog = false;
        // 취소 성공 시 현재 멤버십 정보 리셋
        state.currentMembership = null;
      })
      .addCase(cancelMembershipSubscription.rejected, (state, action) => {
        state.loading.cancel = false;
        state.error.cancel = action.payload as string;
      });

    // ===== 멤버십 혜택 조회 =====
    builder
      .addCase(fetchMembershipBenefits.pending, (state) => {
        state.loading.benefits = true;
        state.error.benefits = null;
      })
      .addCase(fetchMembershipBenefits.fulfilled, (state, action) => {
        state.loading.benefits = false;
        state.benefits = action.payload;
      })
      .addCase(fetchMembershipBenefits.rejected, (state, action) => {
        state.loading.benefits = false;
        state.error.benefits = action.payload as string;
      });

    // ===== 결제 히스토리 조회 =====
    builder
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading.history = true;
        state.error.history = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.error.history = action.payload as string;
      });
  },
});

// ==========================================
// 5. 액션 및 리듀서 내보내기
// ==========================================

export const {
  setSelectedPlan,
  setPaymentMethod,
  toggleCancelDialog,
  setCancelDialog,
  clearError,
  clearAllErrors,
  resetPaymentState,
  updateBenefitUsage,
} = membershipSlice.actions;

export default membershipSlice.reducer;

// ==========================================
// 6. 셀렉터들
// ==========================================

export const selectMembership = (state: RootState) => state.membership;
export const selectCurrentMembership = (state: RootState) => state.membership.currentMembership;
export const selectMembershipPlans = (state: RootState) => state.membership.plans;
export const selectMembershipBenefits = (state: RootState) => state.membership.benefits;
export const selectPaymentHistory = (state: RootState) => state.membership.paymentHistory;
export const selectPaymentInProgress = (state: RootState) => state.membership.paymentInProgress;
export const selectCurrentPayment = (state: RootState) => state.membership.currentPayment;

// 로딩 상태 셀렉터들
export const selectMembershipLoading = (state: RootState) => state.membership.loading;
export const selectIsLoading = (state: RootState) => 
  Object.values(state.membership.loading).some(loading => loading);

// 에러 상태 셀렉터들
export const selectMembershipErrors = (state: RootState) => state.membership.error;
export const selectHasError = (state: RootState) => 
  Object.values(state.membership.error).some(error => error !== null);

// UI 상태 셀렉터들
export const selectMembershipUI = (state: RootState) => state.membership.ui;
export const selectSelectedPlan = (state: RootState) => state.membership.ui.selectedPlan;
export const selectPaymentMethod = (state: RootState) => state.membership.ui.paymentMethod;
export const selectShowCancelDialog = (state: RootState) => state.membership.ui.showCancelDialog;

// 복합 셀렉터들
export const selectHasPremiumMembership = (state: RootState) => {
  const membership = state.membership.currentMembership;
  return membership && membership.membershipType !== 'FREE' && !membership.isDeleted;
};

export const selectSelectedPlanInfo = (state: RootState) => {
  const { plans, ui } = state.membership;
  return ui.selectedPlan ? plans.find(plan => plan.planId === ui.selectedPlan) : null;
};

export const selectCanUsePremiumFeatures = (state: RootState) => {
  const benefits = state.membership.benefits;
  const hasPremium = selectHasPremiumMembership(state);
  
  return {
    hasPremium,
    canUseAI: hasPremium && benefits && benefits.aiUsageUsed < benefits.aiUsageLimit,
    aiUsagePercent: benefits ? (benefits.aiUsageUsed / benefits.aiUsageLimit) * 100 : 0,
    storagePercent: benefits ? (benefits.storageUsed / benefits.storageLimit) * 100 : 0,
  };
};

// ==========================================
// 7. 헬퍼 함수들
// ==========================================

/**
 * 멤버십 타입에 따른 한글 이름 반환
 */
export const getMembershipDisplayName = (membershipType: string): string => {
  const typeMap: Record<string, string> = {
    'FREE': '무료',
    'BASIC': '베이직',
    'PREMIUM': '프리미엄',
    'PRO': '프로',
  };
  return typeMap[membershipType] || membershipType;
};

/**
 * 결제 상태에 따른 한글 이름 반환
 */
export const getPaymentStatusDisplayName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'SUCCESS': '성공',
    'FAILED': '실패',
    'PENDING': '처리중',
    'ACTIVE': '활성',
    'EXPIRED': '만료',
    'CANCELLED': '취소됨',
  };
  return statusMap[status] || status;
};

/**
 * 결제 방법에 따른 한글 이름 반환
 */
export const getPaymentMethodDisplayName = (method: string): string => {
  const methodMap: Record<string, string> = {
    'CARD': '신용카드',
    'KAKAOPAY': '카카오페이',
    'TOSS': '토스',
  };
  return methodMap[method] || method;
};
