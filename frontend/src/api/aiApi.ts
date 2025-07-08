import type { AxiosResponse } from 'axios';
import api from './index';
import type { AskAIRequest, AskAIResponse } from '../types/ai';

/**
 * AI에게 질문을 전송합니다.
 * @param data - 질문과 컨텍스트를 포함하는 객체
 * @returns AI의 답변을 포함하는 Promise
 */
export const askAI = async (data: AskAIRequest): Promise<AskAIResponse> => {
  const response: AxiosResponse<AskAIResponse> = await api.post('/api/ai/ask', data);
  return response.data;
}; 