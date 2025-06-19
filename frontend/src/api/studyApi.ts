import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  CardDeck,
  Card,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateCardRequest,
  UpdateCardRequest,
  GetCardsRequest,
  GetDecksRequest,
  StudyResult,
  StudySessionRequest,
  GenerateCardsRequest,
} from '../types/card';
import type { ApiResponse, PaginationResponse } from '../types/api';

// 카드 덱 리스트 조회
export const getDecks = async (params: GetDecksRequest = {}): Promise<PaginationResponse<CardDeck>> => {
  const response: AxiosResponse<PaginationResponse<CardDeck>> = await api.get('/api/decks', { params });
  return response.data;
};

// 카드 덱 상세 조회
export const getDeck = async (deckId: string): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.get(`/api/decks/${deckId}`);
  return response.data;
};

// 카드 덱 생성
export const createDeck = async (data: CreateDeckRequest): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.post('/api/decks', data);
  return response.data;
};

// 카드 덱 수정
export const updateDeck = async (deckId: string, data: UpdateDeckRequest): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.put(`/api/decks/${deckId}`, data);
  return response.data;
};

// 카드 덱 삭제
export const deleteDeck = async (deckId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/decks/${deckId}`);
  return response.data;
};

// 카드 리스트 조회
export const getCards = async (params: GetCardsRequest): Promise<PaginationResponse<Card>> => {
  const response: AxiosResponse<PaginationResponse<Card>> = await api.get(`/api/decks/${params.deckId}/cards`, { 
    params: { ...params, deckId: undefined } 
  });
  return response.data;
};

// 카드 상세 조회
export const getCard = async (cardId: number): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.get(`/api/cards/${cardId}`);
  return response.data;
};

// 카드 생성
export const createCard = async (data: CreateCardRequest): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.post('/api/cards', data);
  return response.data;
};

// 카드 수정
export const updateCard = async (cardId: number, data: UpdateCardRequest): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.put(`/api/cards/${cardId}`, data);
  return response.data;
};

// 카드 삭제
export const deleteCard = async (cardId: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/cards/${cardId}`);
  return response.data;
};

// 카드 북마크 추가/제거
export const toggleCardBookmark = async (cardId: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/cards/${cardId}/bookmark`);
  return response.data;
};

// 학습 세션 시작
export const startStudySession = async (data: StudySessionRequest): Promise<Card[]> => {
  const response: AxiosResponse<Card[]> = await api.post('/api/study/session', data);
  return response.data;
};

// 학습 결과 제출
export const submitStudyResults = async (sessionId: string, results: StudyResult[]): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/study/session/${sessionId}/results`, { results });
  return response.data;
};

// AI로 카드 생성
export const generateCards = async (data: GenerateCardsRequest): Promise<Card[]> => {
  const response: AxiosResponse<Card[]> = await api.post('/api/cards/generate', data);
  return response.data;
};

// 학습 통계 조회
export const getStudyStats = async (deckId?: string): Promise<{
  totalCards: number;
  studiedCards: number;
  correctRate: number;
  streakDays: number;
  totalStudyTime: number;
}> => {
  const params = deckId ? { deckId } : {};
  const response = await api.get('/api/study/stats', { params });
  return response.data;
};

// 복습 필요한 카드 조회
export const getReviewCards = async (deckId?: string): Promise<Card[]> => {
  const params = deckId ? { deckId } : {};
  const response: AxiosResponse<Card[]> = await api.get('/api/study/review', { params });
  return response.data;
};
