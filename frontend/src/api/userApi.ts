import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  UpdateMemberRequest,
  UpdateMemberResponse,
  ChangeEmailRequest,
  MyInfoResponse,
} from '../types/user';
import type { ApiResponse } from '../types/api';

// 내 정보 조회
export const getMyInfo = async (): Promise<MyInfoResponse> => {
  const response: AxiosResponse<MyInfoResponse> = await api.get('/api/members/my');
  return response.data;
};

// 멤버 정보 수정
export const updateMember = async (data: UpdateMemberRequest): Promise<UpdateMemberResponse> => {
  const response: AxiosResponse<UpdateMemberResponse> = await api.put('/api/members', data);
  return response.data;
};

// 멤버 삭제 (탈퇴)
export const deleteMember = async (): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete('/api/members');
  return response.data;
};

// 이메일 변경
export const changeEmail = async (data: ChangeEmailRequest): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.put('/api/members/my/email', data);
  return response.data;
};

// 이메일 인증 (변경된 이메일)
export const verifyChangedEmail = async (data: { newEmail: string; token: string }): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.put('/api/members/my/email/verification', data);
  return response.data;
};
