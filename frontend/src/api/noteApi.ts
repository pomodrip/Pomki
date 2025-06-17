import api from './index';

export interface GenerateNoteRequest {
  content: string;
  style: 'concept' | 'detail' | 'summary';
  subject?: string;
}

export interface GenerateNoteResponse {
  generatedContent: string;
  success: boolean;
  message?: string;
}

export const noteApi = {
  // AI 노트 생성
  generateNote: async (data: GenerateNoteRequest): Promise<GenerateNoteResponse> => {
    try {
      const response = await api.post('/notes/generate', data);
      return response.data;
    } catch (error) {
      console.error('AI 노트 생성 오류:', error);
      throw error;
    }
  },

  // 노트 저장
  saveNote: async (noteData: { content: string; subject?: string; sessionId?: string }) => {
    try {
      const response = await api.post('/notes', noteData);
      return response.data;
    } catch (error) {
      console.error('노트 저장 오류:', error);
      throw error;
    }
  },

  // 노트 목록 조회
  getNotes: async (page: number = 1, limit: number = 10) => {
    try {
      const response = await api.get(`/notes?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('노트 목록 조회 오류:', error);
      throw error;
    }
  },

  // 노트 상세 조회
  getNote: async (noteId: string) => {
    try {
      const response = await api.get(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('노트 상세 조회 오류:', error);
      throw error;
    }
  },

  // 노트 삭제
  deleteNote: async (noteId: string) => {
    try {
      const response = await api.delete(`/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('노트 삭제 오류:', error);
      throw error;
    }
  },
};

export default noteApi;
