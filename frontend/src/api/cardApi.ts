import type { AxiosResponse } from 'axios';
import api from './index';
import type { Card, CreateCardRequest, SearchCard, UpdateCardRequest, AddCardTagRequest } from '../types/card';

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
 * 카드 검색
 * @param keyword 검색 키워드
 */
export const searchCards = async (keyword: string): Promise<SearchCard[]> => {
  const response: AxiosResponse<SearchCard[]> = await api.get(`/api/card/search/${keyword}`);
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

/**
 * 카드에 태그 추가
 * @param data 카드 ID와 추가할 태그 이름들
 */
export const addCardTags = async (data: AddCardTagRequest): Promise<void> => {
  await api.post('/api/card-tag', data);
};

/**
 * 카드에서 태그 삭제
 * @param cardId 카드 ID
 * @param tagName 삭제할 태그 이름
 */
export const removeCardTag = async (cardId: number, tagName: string): Promise<void> => {
  await api.delete('/api/card-tag', {
    params: {
      cardId,
      tagName,
    },
  });
};

/**
 * 카드 북마크 추가
 * @param cardId 카드 ID
 */
export const addCardBookmark = async (cardId: number): Promise<void> => {
  await api.post(`/api/card-bookmarks/${cardId}`);
};

/**
 * 카드 북마크 삭제
 * @param cardId 카드 ID
 */
export const removeCardBookmark = async (cardId: number): Promise<void> => {
  await api.delete(`/api/card-bookmarks/${cardId}`);
};