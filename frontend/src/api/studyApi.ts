import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  CardDeck,
  Card,
  CreateDeckRequest,
  UpdateDeckRequest,
  CreateCardRequest,
  UpdateCardRequest,
} from '../types/card';
import type { ApiResponse } from '../types/api';

// 🔥 현재 로그인한 사용자의 덱 리스트 조회 (백엔드 API에 맞게 수정)
export const getDecks = async (): Promise<CardDeck[]> => {
  // 먼저 현재 사용자 정보를 가져와서 memberId를 얻어야 함
  // const userResponse = await api.get('/api/members/my');
  // const memberId = userResponse.data.memberId || userResponse.data.id;
  
  const response: AxiosResponse<CardDeck[]> = await api.get(`/api/decks/members/my-decks`);
  return response.data;
};

// 카드 덱 상세 조회 (변경 없음 - 백엔드에 해당 엔드포인트 없음)
export const getDeck = async (deckId: string): Promise<CardDeck> => {
  const response: AxiosResponse<CardDeck> = await api.get(`/api/decks/${deckId}`);
  return response.data;
};

// 🔥 카드 덱 생성 (백엔드 API에 맞게 수정)
export const createDeck = async (data: CreateDeckRequest): Promise<CardDeck> => {
  const requestData = {
    deckName: data.deckName
  };
  const response: AxiosResponse<CardDeck> = await api.post('/api/decks', requestData);
  return response.data;
};

// 🔥 카드 덱 수정 (백엔드 API에 맞게 수정)
export const updateDeck = async (deckId: string, data: UpdateDeckRequest): Promise<CardDeck> => {
  const requestData = {
    deckName: data.deckName
  };
  const response: AxiosResponse<CardDeck> = await api.put(`/api/decks/${deckId}`, requestData);
  return response.data;
};

// 🔥 카드 덱 삭제 (백엔드에서 204 응답)
export const deleteDeck = async (deckId: string): Promise<void> => {
  await api.delete(`/api/decks/${deckId}`);
};

// 🔥 카드 리스트 조회 (백엔드 API에 맞게 수정)
export const getCards = async (deckId: string): Promise<Card[]> => {
  const response: AxiosResponse<Card[]> = await api.get(`/api/decks/${deckId}/cards`);
  return response.data;
};

// 🔥 카드 상세 조회 (백엔드 API에 맞게 수정)
export const getCard = async (cardId: number): Promise<Card> => {
  const response: AxiosResponse<Card> = await api.get(`/api/card/${cardId}`);
  return response.data;
};

// 🔥 카드 생성 (백엔드 API에 맞게 수정)
export const createCard = async (data: CreateCardRequest): Promise<Card> => {
  const requestData = {
    content: data.content,
    answer: data.answer
  };
  const response: AxiosResponse<Card> = await api.post(`/api/card?deckId=${data.deckId}`, requestData);
  return response.data;
};

// 🔥 카드 수정 (백엔드 API에 맞게 수정)
export const updateCard = async (cardId: number, data: UpdateCardRequest): Promise<Card> => {
  const requestData = {
    content: data.content,
    answer: data.answer
  };
  const response: AxiosResponse<Card> = await api.put(`/api/card/${cardId}`, requestData);
  return response.data;
};

// 🔥 카드 삭제 (백엔드에서 204 응답)
export const deleteCard = async (cardId: number): Promise<void> => {
  await api.delete(`/api/card/${cardId}`);
};

// ⚠️ 북마크 기능은 백엔드에 미구현 상태
export const toggleCardBookmark = async (): Promise<ApiResponse> => {
  // 임시로 빈 응답 반환 (백엔드 구현 대기)
  console.warn('북마크 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return { success: true, message: '북마크 기능 준비 중' };
};

// ⚠️ 학습 관련 기능들은 백엔드에 미구현 상태
export const startStudySession = async (): Promise<Card[]> => {
  console.warn('학습 세션 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return [];
};

export const submitStudyResults = async (): Promise<ApiResponse> => {
  console.warn('학습 결과 제출 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return { success: true, message: '학습 결과 제출 기능 준비 중' };
};

export const generateCards = async (): Promise<Card[]> => {
  console.warn('AI 카드 생성 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return [];
};

export const getStudyStats = async (): Promise<{
  totalCards: number;
  studiedCards: number;
  correctRate: number;
  streakDays: number;
  totalStudyTime: number;
}> => {
  console.warn('학습 통계 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return {
    totalCards: 0,
    studiedCards: 0,
    correctRate: 0,
    streakDays: 0,
    totalStudyTime: 0
  };
};

export const getReviewCards = async (): Promise<Card[]> => {
  console.warn('복습 카드 조회 기능은 백엔드에서 아직 구현되지 않았습니다.');
  return [];
};
