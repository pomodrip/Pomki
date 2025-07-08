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
  // 우선 새로운 AI 검색 엔드포인트를 시도합니다.
  try {
    const response = await api.get(`/api/decks/${deckId}/ai-search/${encodeURIComponent(keyword)}`);
    const data = response.data;

    // 백엔드가 객체 형태로 감싸서 응답할 수도 있으므로 방어적 처리
    if (Array.isArray(data)) {
      return data as SearchCard[];
    }

    // 흔한 패턴: { results: [...] } 혹은 { data: [...] }
    if (Array.isArray(data?.results)) return data.results as SearchCard[];
    if (Array.isArray(data?.data)) return data.data as SearchCard[];

    // 예상과 다른 구조라면 예외를 발생시켜 폴백 로직으로 이동
    throw new Error('Unexpected AI search response structure');
  } catch (error) {
    console.warn('[searchCardsInDeck] AI 검색 실패, 기존 검색으로 폴백', error);
    const fallbackResponse = await api.get(`/api/decks/search/${encodeURIComponent(keyword)}?deckId=${deckId}`);
    return fallbackResponse.data as SearchCard[];
  }
};

/**
 * (선택) AI 기반 덱 검색 – 복잡한 프롬프트나 여러 덱을 동시에 검색할 때 사용
 * @param payload 검색 요청 페이로드 (백엔드 명세에 맞춰 확장 가능)
 */
export const aiSearchDecks = async <T = unknown, R = SearchCard[]>(payload: T): Promise<R> => {
  const response: AxiosResponse<R> = await api.post('/api/decks/ai-search', payload);
  return response.data;
}; 