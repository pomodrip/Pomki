import type { AxiosResponse } from 'axios';
import api from './index';
import type { Note } from '../types/note';
import type { Card, CardDeck } from '../types/card';
import type { ApiResponse, PaginationResponse } from '../types/api';

// 휴지통 아이템 타입
export interface TrashItem {
  trashId: string;
  memberId: number;
  deletedAt: string;
  itemType: 'NOTE' | 'CARD' | 'DECK';
  itemId: string;
  itemData: Note | Card | CardDeck;
}

// 휴지통 리스트 조회
export const getTrashItems = async (params: {
  page?: number;
  size?: number;
  type?: 'NOTE' | 'CARD' | 'DECK';
} = {}): Promise<PaginationResponse<TrashItem>> => {
  const response: AxiosResponse<PaginationResponse<TrashItem>> = await api.get('/api/trash', { params });
  return response.data;
};

// 휴지통에서 복원
export const restoreTrashItem = async (trashId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/trash/${trashId}/restore`);
  return response.data;
};

// 휴지통에서 영구 삭제
export const permanentDeleteTrashItem = async (trashId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/trash/${trashId}`);
  return response.data;
};

// 휴지통 전체 비우기
export const emptyTrash = async (): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete('/api/trash/all');
  return response.data;
};

// 자동 삭제 설정 조회
export const getAutoDeleteSettings = async (): Promise<{
  autoDeleteEnabled: boolean;
  autoDeleteDays: number;
}> => {
  const response = await api.get('/api/trash/settings');
  return response.data;
};

// 자동 삭제 설정 업데이트
export const updateAutoDeleteSettings = async (settings: {
  autoDeleteEnabled: boolean;
  autoDeleteDays: number;
}): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.put('/api/trash/settings', settings);
  return response.data;
}; 