import type { AxiosResponse } from 'axios';
import api from './index';
import type { Card, CreateCardRequest, UpdateCardRequest } from '../types/card';

/**
 * 카드 생성
 * @param deckId 카드를 추가할 덱 ID
 * @param data 생성할 카드 데이터
 */
export const createCard = async (
  deckId: string,
  data: CreateCardRequest,
): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.post('/api/card', data, {
    params: { deckId },
  });
  return response.data;
};

/**
 * 카드 상세 조회
 * @param cardId 카드 ID
 */
export const getCard = async (cardId: number): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.get(`/api/card/${cardId}`);
  return response.data;
};

/**
 * 카드 수정
 * @param cardId 카드 ID
 * @param data 수정할 카드 데이터
 */
export const updateCard = async (
  cardId: number,
  data: UpdateCardRequest,
): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.put(`/api/card/${cardId}`, data);
  return response.data;
};

/**
 * 카드 삭제
 * @param cardId 카드 ID
 */
export const deleteCard = async (cardId: number): Promise<void> => {
  await api.delete(`/api/card/${cardId}`);
}; 