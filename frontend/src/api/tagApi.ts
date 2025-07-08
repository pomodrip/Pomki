import type { AxiosResponse } from 'axios';
import api from './index';

export interface TagRecommendRequest {
  cardId?: number;
  cardContent: string;
  cardAnswer: string;
}

interface TagRecommendResponse {
  recommendedTags?: string[];
  tags?: string[];
  data?: string[];
  results?: string[];
  success?: boolean;
  errorMessage?: string;
}

const extractTagArray = (data: TagRecommendResponse): string[] => {
  if (data.success === false) {
    throw new Error(data.errorMessage || 'AI 태그 추천 실패');
  }
  if (Array.isArray(data.recommendedTags)) return data.recommendedTags;
  if (Array.isArray(data.tags)) return data.tags;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data as unknown as string[])) return data as unknown as string[];
  return [];
};

/**
 * AI 기반 태그 추천 (카드 내용·답변 기반)
 * @param payload { cardId?, cardContent, cardAnswer }
 */
export const recommendTags = async (payload: TagRecommendRequest): Promise<string[]> => {
  const response = await api.post('/api/tags/ai-recommend', payload);
  return extractTagArray(response.data);
};

/**
 * AI 기반 태그 추천 (기존 카드 ID 기반)
 * @param cardId 태그를 추천받을 카드 ID
 * @returns 추천 태그 목록 (문자열 배열)
 */
export const recommendTagsByCardId = async (cardId: number): Promise<string[]> => {
  // 백엔드에서 별도의 요청 바디 없이 cardId 경로 변수만으로 추천해줍니다.
  const response = await api.post(`/api/tags/ai-recommend/${cardId}`);
  return extractTagArray(response.data);
}; 