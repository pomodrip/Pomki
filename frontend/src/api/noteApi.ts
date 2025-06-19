import type { AxiosResponse } from 'axios';
import api from './index';
import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  GetNotesRequest,
  Tag,
  EnhanceNoteRequest,
} from '../types/note';
import type { ApiResponse, PaginationResponse } from '../types/api';

// 노트 리스트 조회
export const getNotes = async (params: GetNotesRequest = {}): Promise<PaginationResponse<Note>> => {
  const response: AxiosResponse<PaginationResponse<Note>> = await api.get('/api/notes', { params });
  return response.data;
};

// 노트 상세 조회
export const getNote = async (noteId: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get(`/api/notes/${noteId}`);
  return response.data;
};

// 노트 생성
export const createNote = async (data: CreateNoteRequest): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.post('/api/notes', data);
  return response.data;
};

// 노트 수정
export const updateNote = async (noteId: string, data: UpdateNoteRequest): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.put(`/api/notes/${noteId}`, data);
  return response.data;
};

// 노트 삭제 (휴지통으로 이동)
export const deleteNote = async (noteId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/notes/${noteId}`);
  return response.data;
};

// 노트 AI 향상
export const enhanceNote = async (data: EnhanceNoteRequest): Promise<{ enhancedContent: string }> => {
  const response: AxiosResponse<{ enhancedContent: string }> = await api.post('/api/notes/enhance', data);
  return response.data;
};

// 노트 북마크 추가/제거
export const toggleNoteBookmark = async (noteId: string): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.post(`/api/notes/${noteId}/bookmark`);
  return response.data;
};

// 노트 북마크 리스트 조회
export const getBookmarkedNotes = async (params: GetNotesRequest = {}): Promise<PaginationResponse<Note>> => {
  const response: AxiosResponse<PaginationResponse<Note>> = await api.get('/api/notes/bookmarks', { params });
  return response.data;
};

// 태그 리스트 조회
export const getTags = async (): Promise<Tag[]> => {
  const response: AxiosResponse<Tag[]> = await api.get('/api/tags');
  return response.data;
};

// 태그 생성
export const createTag = async (tagName: string): Promise<Tag> => {
  const response: AxiosResponse<Tag> = await api.post('/api/tags', { tagName });
  return response.data;
};

// 태그 수정
export const updateTag = async (tagId: number, tagName: string): Promise<Tag> => {
  const response: AxiosResponse<Tag> = await api.put(`/api/tags/${tagId}`, { tagName });
  return response.data;
};

// 태그 삭제
export const deleteTag = async (tagId: number): Promise<ApiResponse> => {
  const response: AxiosResponse<ApiResponse> = await api.delete(`/api/tags/${tagId}`);
  return response.data;
};

// 이미지 업로드
export const uploadNoteImage = async (noteId: string, file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response: AxiosResponse<{ imageUrl: string }> = await api.post(
    `/api/notes/${noteId}/images`, 
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
