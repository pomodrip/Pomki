import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  Membership,
  MembershipPlan,
  PaymentRequest,
  PaymentResponse,
  CancelMembershipRequest,
} from '../types/membership';
import type { ApiResponse } from '../types/api';

// 현재 멤버십 정보 조회
export const getCurrentMembership = async (): Promise<Membership | null> => {
  const response: AxiosResponse<Membership | null> = await api.get('/api/membership/current');
  return response.data;
};

// 멤버십 플랜 리스트 조회
export const getMembershipPlans = async (): Promise<MembershipPlan[]> => {
  const response: AxiosResponse<MembershipPlan[]> = await api.get('/api/membership/plans');
  return response.data;
};

// 멤버십 결제
export const purchaseMembership = async (data: PaymentRequest): Promise<PaymentResponse> => {
  const response: AxiosResponse<PaymentResponse> = await api.post('/api/membership/purchase', data);
  return response.data;
};

// 결제 상태 확인
export const checkPaymentStatus = async (paymentId: string): Promise<PaymentResponse> => {
  const response: AxiosResponse<PaymentResponse> = await api.get(`/api/membership/payment/${paymentId}/status`);
  return response.data;
};

// 멤버십 취소
export const cancelMembership = async (data: CancelMembershipRequest = {}): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post('/api/membership/cancel', data);
  return response.data;
};

// 멤버십 사용 내역 조회
export const getMembershipHistory = async (): Promise<{
  history: Array<{
    id: string;
    membershipType: string;
    startDate: string;
    endDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    paymentAmount: number;
  }>;
}> => {
  const response = await api.get('/api/membership/history');
  return response.data;
};

// 멤버십 혜택 조회
export const getMembershipBenefits = async (): Promise<{
  aiUsageLimit: number;
  aiUsageUsed: number;
  storageLimit: number;
  storageUsed: number;
  features: string[];
}> => {
  const response = await api.get('/api/membership/benefits');
  return response.data;
};
