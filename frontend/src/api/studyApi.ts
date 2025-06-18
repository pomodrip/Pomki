import api from './index';
import { FlashcardGenerationSession, GenerationResult, QuestionFeedback } from '../types/card';

export interface CreateFlashcardsRequest {
  sessionId: string;
  answers: Record<string, number>;
  globalFeedback: string;
  questionFeedbacks: QuestionFeedback[];
}

export const studyApi = {
  // 플래시카드 생성
  createFlashcardsFromQuiz: async (data: CreateFlashcardsRequest): Promise<GenerationResult> => {
    try {
      const response = await api.post('/study/flashcards/generate', data);
      return response.data;
    } catch (error) {
      console.error('플래시카드 생성 실패:', error);
      return {
        success: false,
        error: '플래시카드 생성에 실패했습니다.'
      };
    }
  },

  // 퀴즈 세션 저장
  saveQuizSession: async (session: FlashcardGenerationSession): Promise<void> => {
    try {
      await api.post('/study/quiz-sessions', session);
    } catch (error) {
      console.error('퀴즈 세션 저장 실패:', error);
    }
  },

  // 퀴즈 세션 불러오기
  loadQuizSession: async (sessionId: string): Promise<FlashcardGenerationSession | null> => {
    try {
      const response = await api.get(`/study/quiz-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('퀴즈 세션 불러오기 실패:', error);
      return null;
    }
  }
};
