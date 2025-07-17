import { api } from './index';
import type { QuizGenerationRequest, QuizItem } from '../types/quiz';

/**
 * 노트 내용을 기반으로 퀴즈 미리보기를 생성합니다.
 * @param data 노트 제목과 내용을 포함하는 객체
 * @returns 생성된 퀴즈 목록
 */
export const generateQuizPreview = async (
  data: QuizGenerationRequest,
): Promise<QuizItem[]> => {
  const response = await api.post<QuizItem[]>('/api/ai/quizzes/preview', data);
  return response.data;
}; 