// 광고 타입
export interface Ad {
  adId: string;
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  type: 'BANNER' | 'POPUP' | 'NATIVE';
  position: 'TOP' | 'BOTTOM' | 'SIDEBAR' | 'MODAL';
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetAudience?: {
    membership?: 'FREE' | 'PREMIUM';
    ageRange?: string;
    interests?: string[];
  };
}

// 광고 클릭 이벤트
export interface AdClickEvent {
  adId: string;
  clickedAt: string;
  userAgent?: string;
  referrer?: string;
}

// 광고 노출 이벤트
export interface AdImpressionEvent {
  adId: string;
  viewedAt: string;
  duration?: number; // 초 단위
  position: string;
}

// 광고 설정
export interface AdPreferences {
  showPersonalizedAds: boolean;
  allowVideoAds: boolean;
  allowPopupAds: boolean;
  interests: string[];
}

// 광고 위치 타입
export type AdPosition = 'TOP' | 'BOTTOM' | 'SIDEBAR' | 'MODAL';

// 광고 타입
export type AdType = 'BANNER' | 'POPUP' | 'NATIVE';

// 회원 타입 (광고 타겟팅용)
export type MembershipType = 'FREE' | 'PREMIUM';
