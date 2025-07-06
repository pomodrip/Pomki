import type { AxiosResponse, AxiosError } from 'axios';
import api from './index';
import type {
  Note,
  NoteListItem,
  NoteCreateRequest,
  NoteUpdateRequest,
  AddNoteTagRequest,
} from '../types/note';

// AI 노트 생성 요청 타입
export interface AIEnhanceRequest {
  noteTitle: string;
  noteContent: string;
}

// AI 노트 생성 응답 타입
export interface AIEnhanceResponse {
  polishedContent: string;
  keywords: string[];
  reasoning: string;
  learningGuide: {
    summary: string;
    nextSteps: string[];
  };
}

// 노트 리스트 조회
export const getNotes = async (): Promise<NoteListItem[]> => {
  const response: AxiosResponse<NoteListItem[]> = await api.get('/api/notes');
  return response.data;
};

// 노트 상세 조회
export const getNote = async (noteId: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get(`/api/notes/${noteId}`);
  return response.data;
};

// 노트 생성
export const createNote = async (data: NoteCreateRequest): Promise<Note> => {
  console.log('=== API 요청 시작 ===');
  console.log('URL: /api/notes');
  console.log('Method: POST');
  console.log('Request Data:', data);

  try {
    const response: AxiosResponse<Note> = await api.post('/api/notes', data);
    console.log('=== API 응답 성공 ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('=== API 요청 실패 ===');
    if (err.response) {
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Request setup error:', err.message);
    }
    throw err;
  }
};

// AI 노트 생성
export const enhanceNoteWithAI = async (data: AIEnhanceRequest): Promise<AIEnhanceResponse> => {
  console.log('=== AI 노트 생성 요청 시작 ===');
  console.log('URL: /api/ai/notes/enhance');
  console.log('Method: POST');
  console.log('Request Data:', data);

  try {
    const response: AxiosResponse<AIEnhanceResponse> = await api.post('/api/ai/notes/enhance', data);
    console.log('=== AI 노트 생성 응답 성공 ===');
    console.log('Response Status:', response.status);
    console.log('Response Data:', response.data);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('=== AI 노트 생성 요청 실패 ===');
    if (err.response) {
      console.error('Error Status:', err.response.status);
      console.error('Error Data:', err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Request setup error:', err.message);
    }
    throw err;
  }
};

// 노트 수정
export const updateNote = async (
  noteId: string,
  data: NoteUpdateRequest,
): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.put(
    `/api/notes/${noteId}`,
    data,
  );
  return response.data;
};

// 노트 삭제
export const deleteNote = async (noteId: string): Promise<void> => {
  await api.delete(`/api/notes/${noteId}`);
};

// 노트에 태그 추가
export const addNoteTags = async (data: AddNoteTagRequest): Promise<void> => {
  await api.post('/api/note-tag', data);
};

// 노트에서 태그 제거
export const removeNoteTag = async (noteId: string, tagName: string): Promise<void> => {
  await api.delete('/api/note-tag', {
    params: {
      noteId,
      tagName,
    },
  });
};
