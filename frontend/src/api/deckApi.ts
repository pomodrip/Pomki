import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  CardDeck,
  Card,
  CreateDeckRequest,
  UpdateDeckRequest,
  SearchCard,
} from '../types/card';

/**
 * 덱 생성
 * @param data 덱 생성 데이터
 */
export const createDeck = async (data: CreateDeckRequest): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.post('/api/decks', data);
  return response.data;
};

/**
 * 내 덱 목록 조회
 */
export const getMyDecks = async (): Promise<CardDeck[]> => {
  const response: AxiosResponse<CardDeck[]> = await api.get('/api/decks/members/my-decks');
  return response.data;
};

/**
 * 덱 내 모든 카드 조회
 * @param deckId 덱 ID
 */
export const getCardsInDeck = async (deckId: string): Promise<Card[]> => {
  const response: AxiosResponse<Card[]> = await api.get(`/api/decks/${deckId}/cards`);
  return response.data;
};

/**
 * 덱 정보 수정
 * @param deckId 덱 ID
 * @param data 수정할 덱 데이터
 */
export const updateDeck = async (deckId: string, data: UpdateDeckRequest): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.put(`/api/decks/${deckId}`, data);
  return response.data;
};

/**
 * 덱 삭제
 * @param deckId 덱 ID
 */
export const deleteDeck = async (deckId: string): Promise<void> => {
  await api.delete(`/api/decks/${deckId}`);
};

/**
 * 덱 내 카드 검색
 * @param keyword 검색 키워드
 * @param deckId 덱 ID
 */
export const searchCardsInDeck = async (keyword: string, deckId: string): Promise<SearchCard[]> => {
  const response: AxiosResponse<SearchCard[]> = await api.get(`/api/decks/search/${keyword}?deckId=${deckId}`);
  return response.data;
}; 