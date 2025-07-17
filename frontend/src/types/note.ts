/**
 * 백엔드 Note DTO와 동기화된 타입 정의
 */

// 노트 상세 정보 (NoteResponseDto 기반)
export interface Note {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  aiEnhanced: boolean;
  originalContent: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // 🏷️ 노트 태그 (선택)
}

// 노트 목록의 아이템 (NoteListResponseDto 기반)
export interface NoteListItem {
  noteId: string;
  noteTitle: string;
  aiEnhanced: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[]; // 🏷️ 노트 태그 (선택)
}

// 노트 생성 요청 (NoteCreateRequestDto 기반)
export interface NoteCreateRequest {
  noteTitle: string;
  noteContent: string;
  aiEnhanced?: boolean;
  originalContent?: string;
  tags?: string[]; // 🏷️ 노트 태그 (선택)
}

// 노트 수정 요청 (NoteUpdateRequestDto 기반)
export interface NoteUpdateRequest {
  noteTitle: string;
  noteContent: string;
  aiEnhanced: boolean;
  tags?: string[]; // 🏷️ 노트 태그 (선택)
}

/**
 * 노트 태그 추가 요청 DTO
 * API: POST /api/note-tag
 */
export interface AddNoteTagRequest {
  noteId: string;
  tagNames: string[];
}

// Redux 슬라이스에서 사용될 노트 상태
export interface NoteState {
  notes: NoteListItem[]; // 목록은 가벼운 타입 사용
  currentNote: Note | null; // 상세 정보는 전체 타입 사용
  loading: boolean;
  error: string | null;
  noteTags: { [noteId: string]: string[] }; // 노트별 태그 목록
  bookmarkedNoteIds: string[]; // 북마크된 노트 ID 목록
}
