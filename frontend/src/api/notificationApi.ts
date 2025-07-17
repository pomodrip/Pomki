import type { AxiosResponse } from 'axios';
import api from './index';
import type { ApiResponse } from '../types/api';

// FCM 토큰 전송
export const sendFcmToken = async (fcmToken: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post('/api/notification/tokens', { token:fcmToken, platform:"WEB" });
  return response.data;
};

// FCM 토큰 삭제
export const deleteFcmToken = async (): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete('/api/notification/tokens');
  return response.data;
};