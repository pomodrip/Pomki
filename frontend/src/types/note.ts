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
}

// 노트 목록의 아이템 (NoteListResponseDto 기반)
export interface NoteListItem {
  noteId: string;
  noteTitle: string;
  aiEnhanced: boolean;
  createdAt: string;
  updatedAt: string;
}

// 노트 생성 요청 (NoteCreateRequestDto 기반)
export interface NoteCreateRequest {
  noteTitle: string;
  noteContent: string;
  aiEnhanced?: boolean;
  originalContent?: string;
}

// 노트 수정 요청 (NoteUpdateRequestDto 기반)
export interface NoteUpdateRequest {
  noteTitle: string;
  noteContent: string;
  aiEnhanced: boolean;
}

// Redux 슬라이스에서 사용될 노트 상태
export interface NoteState {
  notes: NoteListItem[]; // 목록은 가벼운 타입 사용
  currentNote: Note | null; // 상세 정보는 전체 타입 사용
  loading: boolean;
  error: string | null;
}
