import type { AxiosResponse } from 'axios';
import api from './index';

// 북마크된 노트 목록 아이템 타입 (API 응답에 맞춰 정의)
export interface BookmarkedNote {
  noteId: string;
  // API 응답에 따라 다른 필드가 있다면 추가
}

/**
 * 모든 북마크된 노트 목록을 가져옵니다.
 * @returns {Promise<BookmarkedNote[]>}
 */
export const getBookmarkedNotes = async (): Promise<BookmarkedNote[]> => {
  const response: AxiosResponse<BookmarkedNote[]> = await api.get('/api/note-bookmarks/notes');
  return response.data;
};

/**
 * 특정 노트의 북마크 상태를 확인합니다.
 * @param {string} noteId - 확인할 노트의 ID
 * @returns {Promise<{ isBookmarked: boolean }>}
 */
export const getBookmarkStatus = async (noteId: string): Promise<{ isBookmarked: boolean }> => {
  const response: AxiosResponse<{ isBookmarked: boolean }> = await api.get(`/api/note-bookmarks/notes/${noteId}/status`);
  return response.data;
};

/**
 * 노트에 북마크를 추가합니다.
 * @param {string} noteId - 북마크할 노트의 ID
 * @returns {Promise<void>}
 */
export const addBookmark = async (noteId: string): Promise<void> => {
  await api.post(`/api/note-bookmarks/notes/${noteId}`);
};

/**
 * 노트에서 북마크를 제거합니다.
 * @param {string} noteId - 북마크를 제거할 노트의 ID
 * @returns {Promise<void>}
 */
export const removeBookmark = async (noteId: string): Promise<void> => {
  await api.delete(`/api/note-bookmarks/notes/${noteId}`);
};
