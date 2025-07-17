import api from './index';
import type { Card } from '../types/card';
import type { ReviewResult } from '../types/study';

/**
 * 학습 세션을 위한 카드 목록을 조회합니다.
 * 복습 기한이 오늘이거나 이미 지난 모든 카드를 한 번에 조회합니다.
 */
export const getSessionCards = async (): Promise<Card[]> => {
  const response = await api.get<Card[]>('/api/review/session-cards');
  return response.data;
};

/**
 * 오늘 학습할 카드 목록을 상세 조회합니다.
 */
export const getTodayReviewCards = async (): Promise<Card[]> => {
  const response = await api.get<Card[]>('/api/review/today');
  return response.data;
};

/**
 * 3일 내 학습할 카드 목록을 상세 조회합니다.
 */
export const getUpcomingReviewCards = async (): Promise<Card[]> => {
  const response = await api.get<Card[]>('/api/review/upcoming');
  return response.data;
};

/**
 * 밀린 카드 목록을 상세 조회합니다.
 */
export const getOverdueReviewCards = async (): Promise<Card[]> => {
  const response = await api.get<Card[]>('/api/review/overdue');
  return response.data;
};

/**
 * 카드 복습 결과를 일괄 처리합니다.
 * @param results 카드별 평가 결과 목록
 */
export const batchCompleteReview = async (results: ReviewResult[]): Promise<void> => {
  await api.post('/api/review/batch-complete', results);
}; 