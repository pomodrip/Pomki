import type { AxiosResponse } from 'axios';
import api from './index';
import type { ApiResponse } from '../types/api';

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

// 활성 광고 조회
export const getActiveAds = async (position?: string): Promise<Ad[]> => {
  const params = position ? { position } : {};
  const response: AxiosResponse<Ad[]> = await api.get('/api/ads/active', { params });
  return response.data;
};

// 특정 위치의 광고 조회
export const getAdsByPosition = async (position: string): Promise<Ad[]> => {
  const response: AxiosResponse<Ad[]> = await api.get(`/api/ads/position/${position}`);
  return response.data;
};

// 광고 클릭 이벤트 기록
export const recordAdClick = async (adId: string, data: Omit<AdClickEvent, 'adId'>): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/ads/${adId}/click`, data);
  return response.data;
};

// 광고 노출 이벤트 기록
export const recordAdImpression = async (adId: string, data: Omit<AdImpressionEvent, 'adId'>): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/ads/${adId}/impression`, data);
  return response.data;
};

// 사용자 광고 설정 조회
export const getAdPreferences = async (): Promise<AdPreferences> => {
  const response: AxiosResponse<AdPreferences> = await api.get('/api/ads/preferences');
  return response.data;
};

// 사용자 광고 설정 업데이트
export const updateAdPreferences = async (preferences: Partial<AdPreferences>): Promise<AdPreferences> => {
  const response: AxiosResponse<AdPreferences> = await api.put('/api/ads/preferences', preferences);
  return response.data;
};

// 광고 차단
export const blockAd = async (adId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/ads/${adId}/block`);
  return response.data;
};

// 차단된 광고 목록 조회
export const getBlockedAds = async (): Promise<string[]> => {
  const response: AxiosResponse<string[]> = await api.get('/api/ads/blocked');
  return response.data;
};

// 광고 차단 해제
export const unblockAd = async (adId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/ads/${adId}/block`);
  return response.data;
};
