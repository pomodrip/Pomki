// 멤버십 정보
export interface Membership {
  key: number;
  memberId: number;
  membershipType: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// 멤버십 플랜
export interface MembershipPlan {
  planId: string;
  planName: string;
  price: number;
  duration: number; // 개월 수
  features: string[];
  isPopular?: boolean;
}

// 결제 요청
export interface PaymentRequest {
  planId: string;
  paymentMethod: 'CARD' | 'KAKAOPAY' | 'TOSS';
}

// 결제 응답
export interface PaymentResponse {
  paymentId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  paymentUrl?: string;
}

// 멤버십 취소 요청
export interface CancelMembershipRequest {
  reason?: string;
}
